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

let lastScrapedUrl = '';

function fillForm(data, { overwriteEmpty = false } = {}) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (val && (!el.value || overwriteEmpty)) el.value = val;
  };
  set('f-title',    data.title);
  set('f-company',  data.company);
  set('f-location', data.location);
  set('f-salary',   data.salary_hint);
  if (data.url) document.getElementById('f-url').value = data.url;
  lastScrapedUrl = data.url || '';
}

function showAutofillStatus(msg, isError = false) {
  const el = document.getElementById('autofill-status');
  el.textContent = msg;
  el.className = `autofill-status${isError ? ' error' : ' ok'}`;
}

async function doAutofill({ silent = false } = {}) {
  const iconNormal = document.getElementById('icon-autofill');
  const iconSpin   = document.getElementById('icon-autofill-spin');
  const btn        = document.getElementById('btn-autofill');

  btn.disabled = true;
  iconNormal.classList.add('hidden');
  iconSpin.classList.remove('hidden');

  // ── Step 1: try content script (in-page DOM scrape) ──────────────────────
  const data = await scrapeTab();

  // Fill whatever the content script found (company, salary may be partial)
  if (data.title || data.company || data.location || data.salary_hint) {
    fillForm(data, { overwriteEmpty: true });
  }

  // ── Step 2: server-side scrape ────────────────────────────────────────────
  // Always run if title is still missing — title is the proof we read the
  // actual job panel. Company/salary can come from other elements on the page.
  // Server result fills only the fields still blank (overwriteEmpty=true).
  const missingTitle = !document.getElementById('f-title').value.trim();
  const urlToScrape  = data.url || (await getCurrentTabUrl());

  if (missingTitle && urlToScrape) {
    if (!silent) showAutofillStatus('Reading via Rung…');
    try {
      const result = await api('/api/leads/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: urlToScrape }),
      });
      const hasServerData = result.title || result.company;
      if (hasServerData) {
        fillForm({
          title:       result.title       || '',
          company:     result.company     || '',
          location:    result.location    || '',
          salary_hint: result.salary_hint || '',
          url:         urlToScrape,
        }, { overwriteEmpty: true });
        if (!silent) showAutofillStatus('✓ Fields filled from page');
      } else {
        if (!silent) showAutofillStatus('Could not read this page — fill in manually.', true);
      }
    } catch {
      if (!silent) showAutofillStatus('Could not read this page — fill in manually.', true);
    }
  } else if (!missingTitle) {
    if (!silent) showAutofillStatus('✓ Fields filled from page');
  } else {
    if (!silent) showAutofillStatus('Could not read this page — fill in manually.', true);
  }

  btn.disabled = false;
  iconNormal.classList.remove('hidden');
  iconSpin.classList.add('hidden');
  return data;
}

async function getCurrentTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url || '';
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

  show('view-form');

  // Scrape current page silently on open
  const data = await doAutofill({ silent: true });

  // Pre-fill URL even if scrape got no title/company
  if (data.url) document.getElementById('f-url').value = data.url;

  // Wire auto-fill button
  document.getElementById('btn-autofill').addEventListener('click', () => doAutofill());

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
      external_url: fd.get('url')?.toString().trim()       || lastScrapedUrl,
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
