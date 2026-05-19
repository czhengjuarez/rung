/**
 * Rung content script — scrapes job info from the current page.
 * Supports LinkedIn (view + search panel), Indeed, Greenhouse, Lever,
 * Workday, and generic fallback.
 */

function text(...selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) return el.innerText.trim();
  }
  return null;
}

function attr(selector, attribute) {
  const el = document.querySelector(selector);
  return el ? (el.getAttribute(attribute) || '').trim() : null;
}

// ── LinkedIn ─────────────────────────────────────────────────────────────────
// Handles both /jobs/view/ID and /jobs/search/?currentJobId=ID layouts.

function scrapeLinkedIn() {
  // ── Title ──
  const title = text(
    // Search panel (SPA) — the side-panel heading
    '.jobs-search__job-details h2.t-24',
    '.jobs-search__job-details .job-details-jobs-unified-top-card__job-title',
    '.job-details-jobs-unified-top-card__job-title h1',
    // Direct job view (/jobs/view/)
    'h1.job-details-jobs-unified-top-card__job-title',
    'h1[class*="top-card__title"]',
    'h1.topcard__title',
    // Fallback: any prominent h1/h2 in the detail pane
    '.jobs-search__right-rail h1',
    '.jobs-search__right-rail h2',
  );

  // ── Company ──
  const company = text(
    '.jobs-search__job-details .job-details-jobs-unified-top-card__company-name a',
    '.jobs-search__job-details .job-details-jobs-unified-top-card__company-name',
    '.job-details-jobs-unified-top-card__company-name a',
    'a[class*="company-name"]',
    '.topcard__org-name-link',
    '.job-details-jobs-unified-top-card__primary-description-without-tagline a',
  );

  // ── Location ──
  const location = text(
    '.jobs-search__job-details .job-details-jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
    '.job-details-jobs-unified-top-card__workplace-type',
  );

  // ── Description ──
  const description = text(
    '.jobs-search__job-details .jobs-description__content',
    '.jobs-description__content',
    '#job-details',
    '.jobs-box__html-content',
  );

  // ── Canonical URL ──
  // On /jobs/search/?currentJobId=ID, build the canonical /jobs/view/ID URL
  let url = location?.href ?? window.location.href;
  const jobIdFromSearch = new URLSearchParams(window.location.search).get('currentJobId');
  if (jobIdFromSearch) {
    url = `https://www.linkedin.com/jobs/view/${jobIdFromSearch}/`;
  }
  // Also try <link rel="canonical">
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical?.href) url = canonical.href;

  return { title, company, location, description, url };
}

// ── Indeed ───────────────────────────────────────────────────────────────────
function scrapeIndeed() {
  const title = text(
    'h1[class*="jobTitle"] span:not([class])',
    'h1[class*="jobTitle"]',
    '.jobsearch-JobInfoHeader-title',
  );
  const company = text(
    '[data-company-name="true"]',
    'div[class*="companyName"] a',
    'div[class*="companyName"]',
  );
  const location = text(
    'div[class*="companyLocation"]',
    '.jobsearch-JobInfoHeader-subtitle > div:last-child',
  );
  const description = text('#jobDescriptionText', '.jobsearch-JobComponent-description');
  return { title, company, location, description };
}

// ── Greenhouse ────────────────────────────────────────────────────────────────
function scrapeGreenhouse() {
  const title = text('h1.app-title', '.app-title', 'h1[class*="greenhouse"]');
  const company = text('.company-name', 'header .company') || (() => {
    const m = document.title.match(/ at (.+?)(\s*[\|\-–]|$)/i);
    return m ? m[1].trim() : null;
  })();
  const location = text('.location', '.office', '[class*="location"]');
  const description = text('#content', '.content', '[class*="description"]');
  return { title, company, location, description };
}

// ── Lever ─────────────────────────────────────────────────────────────────────
function scrapeLever() {
  const title = text('.posting-headline h2', 'h2[data-qa="posting-name"]');
  const company = (() => {
    const m = window.location.hostname === 'jobs.lever.co'
      ? window.location.pathname.match(/^\/([^/]+)/)
      : null;
    return m ? m[1].replace(/-/g, ' ') : (document.querySelector('.main-header-logo img')?.alt || null);
  })();
  const location = text('.posting-headline .sort-by-time', '[data-qa="posting-location"]');
  const description = text('.content[data-qa="job-description"]', '.content');
  return { title, company, location, description };
}

// ── Workday ───────────────────────────────────────────────────────────────────
function scrapeWorkday() {
  const title = text('[data-automation-id="jobPostingHeader"]', 'h2[class*="job-title"]');
  const company = (() => {
    const m = window.location.hostname.match(/^(.+?)\.myworkdayjobs\.com$/);
    return m ? m[1].replace(/-/g, ' ') : null;
  })();
  const location = text('[data-automation-id="locations"]', '[class*="location"]');
  const description = text('[data-automation-id="jobPostingDescription"]', '[class*="job-description"]');
  return { title, company, location, description };
}

// ── Generic fallback ──────────────────────────────────────────────────────────
function scrapeGeneric() {
  const PLATFORM_NAMES = ['LinkedIn','Indeed','Glassdoor','Monster','ZipRecruiter',
    'Dice','SimplyHired','CareerBuilder','Handshake','Built In','Wellfound'];
  const ogTitle = attr('meta[property="og:title"]', 'content');
  const ogSite  = attr('meta[property="og:site_name"]', 'content');
  const ogDesc  = attr('meta[property="og:description"]', 'content')
               || attr('meta[name="description"]', 'content');

  const isPlatform = ogSite && PLATFORM_NAMES.some(p => p.toLowerCase() === ogSite.toLowerCase());
  let company = isPlatform ? null : (ogSite || null);

  const rawTitle = (ogTitle || document.title || '').replace(/\s*\|\s*(LinkedIn|Indeed|Glassdoor)\s*$/i, '').trim();
  let title = rawTitle;

  const hiringMatch = rawTitle.match(/^(.+?)\s+(?:is\s+)?hiring\s+(?:a\s+|an\s+)?(.+)$/i);
  const atMatch     = rawTitle.match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[\|\-–].*)?$/i);
  const pipeMatch   = rawTitle.match(/^(.+?)\s*[\|\-–]\s*(.+)$/);

  if (hiringMatch)        { company = hiringMatch[1].trim(); title = hiringMatch[2].trim(); }
  else if (atMatch)       { title = atMatch[1].trim(); company = company || atMatch[2].trim(); }
  else if (pipeMatch && !isPlatform) { title = pipeMatch[1].trim(); company = company || pipeMatch[2].trim(); }

  if (title === rawTitle) title = text('h1') || rawTitle;

  return { title, company, location: null, description: ogDesc };
}

// ── Router ────────────────────────────────────────────────────────────────────
function detectScraper() {
  const host = window.location.hostname;
  if (host.includes('linkedin.com'))          return scrapeLinkedIn;
  if (host.includes('indeed.com'))            return scrapeIndeed;
  if (host.includes('greenhouse.io') ||
      host.includes('boards.greenhouse'))     return scrapeGreenhouse;
  if (host.includes('lever.co'))              return scrapeLever;
  if (host.includes('myworkdayjobs.com'))     return scrapeWorkday;
  return scrapeGeneric;
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'RUNG_SCRAPE') return;
  try {
    const scraper = detectScraper();
    const data = scraper();
    sendResponse({
      ok:          true,
      title:       data.title       || '',
      company:     data.company     || '',
      location:    data.location    || '',
      description: (data.description || '').slice(0, 3000),
      url:         data.url || window.location.href,
    });
  } catch (err) {
    sendResponse({ ok: false, error: String(err) });
  }
  return false;
});
