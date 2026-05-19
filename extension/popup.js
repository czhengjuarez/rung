const RUNG_BASE = 'https://rung.coscient.workers.dev';

// ── View management ──────────────────────────────────────────────────────────

function show(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function api(path, options = {}) {
  const res = await fetch(`${RUNG_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 401) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Scrape current tab ────────────────────────────────────────────────────────

async function scrapeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return { title: '', company: '', location: '', description: '', url: tab?.url || '' };

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, { type: 'RUNG_SCRAPE' }, (response) => {
      if (chrome.runtime.lastError || !response?.ok) {
        // Content script not available (e.g. chrome:// page) — just use URL
        resolve({ title: '', company: '', location: '', description: '', url: tab.url || '' });
      } else {
        resolve(response);
      }
    });
  });
}

// ── Populate form ─────────────────────────────────────────────────────────────

function fillForm(data) {
  document.getElementById('f-title').value   = data.title    || '';
  document.getElementById('f-company').value = data.company  || '';
  document.getElementById('f-location').value = data.location || '';
  document.getElementById('f-url').value     = data.url      || '';
}

// ── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  show('view-loading');

  // Check auth
  let user;
  try {
    const res = await api('/api/me');
    user = res?.user;
  } catch {
    user = null;
  }

  if (!user) {
    show('view-login');
    document.getElementById('btn-open-rung').addEventListener('click', () => {
      chrome.tabs.create({ url: RUNG_BASE });
      window.close();
    });
    return;
  }

  // Scrape current page
  const data = await scrapeTab();
  fillForm(data);
  show('view-form');

  // ── Form submit ────────────────────────────────────────────────────────────
  document.getElementById('clip-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('btn-save');
    const iconAdd  = document.getElementById('icon-add');
    const iconSpin = document.getElementById('icon-spin');

    btn.disabled = true;
    iconAdd.classList.add('hidden');
    iconSpin.classList.remove('hidden');

    const fd = new FormData(e.target);
    const body = {
      title:       fd.get('title')?.toString().trim()      || '',
      company:     fd.get('company')?.toString().trim()    || '',
      location:    fd.get('location')?.toString().trim()   || '',
      salary_hint: fd.get('salary_hint')?.toString().trim()|| '',
      external_url: fd.get('url')?.toString().trim()       || data.url,
      description: data.description || '',
    };

    try {
      await api('/api/leads/clip', { method: 'POST', body: JSON.stringify(body) });

      document.getElementById('success-label').textContent =
        `${body.title}${body.company ? ` at ${body.company}` : ''}`;
      show('view-success');
    } catch (err) {
      document.getElementById('error-msg').textContent =
        err.message || 'Something went wrong. Please try again.';
      show('view-error');
    }
  });
}

// ── Success / error buttons ───────────────────────────────────────────────────

document.getElementById('btn-view-leads').addEventListener('click', () => {
  chrome.tabs.create({ url: `${RUNG_BASE}/leads` });
  window.close();
});

document.getElementById('btn-add-another').addEventListener('click', () => {
  show('view-form');
});

document.getElementById('btn-retry').addEventListener('click', () => {
  show('view-form');
});

// ── Boot ─────────────────────────────────────────────────────────────────────
init();
