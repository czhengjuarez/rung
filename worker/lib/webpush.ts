/**
 * Web Push notification sender.
 * Implements RFC 8291 (payload encryption) and RFC 8292 (VAPID) using
 * the Web Crypto API — no Node.js dependencies, runs in Cloudflare Workers.
 */

export interface PushSubscription {
  endpoint: string;
  p256dh: string;  // base64url uncompressed EC public key (65 bytes)
  auth: string;    // base64url auth secret (16 bytes)
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// ── Base64url helpers ──────────────────────────────────────────────────────

function b64uDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

function b64uEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { out.set(a, offset); offset += a.length; }
  return out;
}

// ── HKDF (Extract + Expand via Web Crypto) ────────────────────────────────

async function hkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

// ── Payload encryption (RFC 8291 aes128gcm) ───────────────────────────────

async function encryptPayload(
  plaintext: Uint8Array,
  p256dh: string,
  auth: string,
): Promise<Uint8Array> {
  const receiverPublicKey = b64uDecode(p256dh);
  const authSecret = b64uDecode(auth);

  // Ephemeral sender key pair
  const ephemeralPair = (await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'],
  )) as CryptoKeyPair;
  const ephemeralPublicKey = new Uint8Array(
    (await crypto.subtle.exportKey('raw', ephemeralPair.publicKey)) as ArrayBuffer,
  );

  // ECDH shared secret
  const receiverKey = await crypto.subtle.importKey(
    'raw', receiverPublicKey, { name: 'ECDH', namedCurve: 'P-256' }, false, [],
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ecdhParams: any = { name: 'ECDH', public: receiverKey };
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(ecdhParams, ephemeralPair.privateKey, 256),
  );

  // PRK via HKDF with auth secret as salt and "WebPush: info\0" || ua_pub || as_pub as info
  const keyInfo = concat(
    new TextEncoder().encode('WebPush: info\x00'),
    receiverPublicKey,
    ephemeralPublicKey,
  );
  const ikm = await hkdf(sharedSecret, authSecret, keyInfo, 32);

  // Random content salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive content encryption key and nonce
  const cek = await hkdf(ikm, salt, new TextEncoder().encode('Content-Encoding: aes128gcm\x00'), 16);
  const nonce = await hkdf(ikm, salt, new TextEncoder().encode('Content-Encoding: nonce\x00'), 12);

  // AES-128-GCM encrypt (append 0x02 record delimiter)
  const cekKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      cekKey,
      concat(plaintext, new Uint8Array([2])),
    ),
  );

  // RFC 8291 record header: salt(16) + rs(4, BE uint32) + idlen(1) + keyid(65)
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = 65;
  header.set(ephemeralPublicKey, 21);

  return concat(header, ciphertext);
}

// ── VAPID JWT (RFC 8292) ───────────────────────────────────────────────────

async function vapidJwt(
  pkcs8Base64: string,
  endpoint: string,
  subject: string,
): Promise<string> {
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    b64uDecode(pkcs8Base64),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const { protocol, host } = new URL(endpoint);
  const header = b64uEncode(
    new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })),
  );
  const payload = b64uEncode(new TextEncoder().encode(JSON.stringify({
    aud: `${protocol}//${host}`,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: subject,
  })));

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(`${header}.${payload}`),
  );

  return `${header}.${payload}.${b64uEncode(sig)}`;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Send a push notification to a single subscription.
 * Returns true on success (201), false on any error.
 * Callers should delete subscriptions that return HTTP 404 or 410.
 */
export async function sendPush(
  sub: PushSubscription,
  payload: PushPayload,
  vapidPrivateKey: string,  // PKCS#8 base64url
  vapidPublicKey: string,   // raw uncompressed base64url
  subject = 'mailto:admin@rung.coscient.workers.dev',
): Promise<{ ok: boolean; gone: boolean }> {
  try {
    const body = await encryptPayload(
      new TextEncoder().encode(JSON.stringify(payload)),
      sub.p256dh,
      sub.auth,
    );
    const jwt = await vapidJwt(vapidPrivateKey, sub.endpoint, subject);

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `vapid t=${jwt},k=${vapidPublicKey}`,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        TTL: '86400',
      },
      body,
    });

    return { ok: res.status === 201 || res.status === 200, gone: res.status === 404 || res.status === 410 };
  } catch {
    return { ok: false, gone: false };
  }
}
