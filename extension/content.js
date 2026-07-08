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
// LinkedIn's class names are utility classes (t-24, tvm__text etc.) and
// change frequently — we try many patterns and use structural fallbacks.

function scrapeLinkedIn() {
  // ── Canonical URL (do this first so we always return a clean URL) ──
  let jobUrl = window.location.href;
  const jobIdFromSearch = new URLSearchParams(window.location.search).get('currentJobId');
  if (jobIdFromSearch) {
    jobUrl = `https://www.linkedin.com/jobs/view/${jobIdFromSearch}/`;
  }
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical?.href) jobUrl = canonical.href;

  // ── Job detail panel — scope queries here on search pages to avoid
  //    picking up data from other jobs in the sidebar ──
  const panel =
    document.querySelector('.job-details-jobs-unified-top-card') ||
    document.querySelector('.jobs-search__job-details') ||
    document.body;

  // ── Title ──
  const title =
    text(
      'h1.job-details-jobs-unified-top-card__job-title',
      'h1[class*="job-title"]',
      'h1[class*="top-card__title"]',
      'h1.topcard__title',
      '.jobs-search__job-details h1',
      '.jobs-search__job-details h2.t-24',
    ) ||
    (() => {
      const h1 = panel.querySelector('h1') || document.querySelector('h1');
      return h1?.innerText.trim() || null;
    })();

  // ── Company ──
  // LinkedIn always links to /company/SLUG — that anchor text is the company name.
  // Scope to the detail panel to avoid picking up sidebar job company links.
  const companyFromLink = (() => {
    const root = panel !== document.body ? panel : document;
    const anchors = [...root.querySelectorAll('a[href*="linkedin.com/company/"], a[href^="/company/"]')];
    for (const a of anchors) {
      const t = a.innerText.trim().replace(/\s+/g, ' ');
      // Skip short UI labels ("Follow", "Connect") and logo-only anchors
      if (t && t.length > 1 && t.length < 80 && !/^(follow|connect|see all jobs)$/i.test(t)) return t;
    }
    return null;
  })();
  const company =
    companyFromLink ||
    text(
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      'a[class*="company-name"]',
      '.topcard__org-name-link',
    );

  // ── Location ──
  const location = text(
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.tvm__text--positive',
    '.jobs-search__job-details .tvm__text',
    '.topcard__flavor--bullet',
    '[class*="primary-description"] span:first-child',
  );

  // ── Salary ──
  // LinkedIn shows salary in a "compensation" insight chip when available.
  // Use querySelectorAll — the first insight chip is often not the salary one.
  const salary_hint = (() => {
    for (const sel of [
      '.job-details-jobs-unified-top-card__job-insight',
      '.jobs-unified-top-card__job-insight',
      '[class*="job-insight"]',
      '[class*="compensation"]',
      '[class*="salary"]',
      '[class*="pay-range"]',
    ]) {
      for (const el of document.querySelectorAll(sel)) {
        const t = el.innerText.trim();
        if (/\$|£|€/.test(t)) return t.split('\n')[0].trim();
      }
    }
    // Scan all visible text for a salary pattern
    const allText = document.body?.innerText || '';
    const m = allText.match(/(?:\$|£|€)\s*\d[\d,]*(?:k|K)?(?:\s*[-–—]\s*(?:\$|£|€)?\s*\d[\d,]*(?:k|K)?)?(?:\s*(?:\/yr|\/year|per year|annually))?/);
    return m ? m[0].trim() : null;
  })();

  // ── Description ──
  const description = text(
    '.jobs-description__content',
    '.jobs-search__job-details .jobs-description__content',
    '#job-details',
    '.jobs-box__html-content',
  );

  return { title, company, location, salary_hint, description, url: jobUrl };
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

// ── Scrape entry point ────────────────────────────────────────────────────────
function runScrape() {
  try {
    const scraper = detectScraper();
    const data = scraper();
    return {
      ok:          true,
      title:       data.title       || '',
      company:     data.company     || '',
      location:    data.location    || '',
      salary_hint: data.salary_hint || '',
      description: (data.description || '').slice(0, 3000),
      url:         data.url || window.location.href,
    };
  } catch (err) {
    return { ok: false, error: String(err), url: window.location.href };
  }
}

// Exposed for popup.js, which injects this file then calls the function
// directly via chrome.scripting.executeScript — more reliable than messaging.
window.__rungScrapeNow = runScrape;

// ── Message listener (legacy path, kept as fallback) ─────────────────────────
// Guard against double registration when popup.js re-injects this script
// (e.g. after an extension update orphans the original copy).
if (window.__rungScrapeListener) {
  chrome.runtime.onMessage.removeListener(window.__rungScrapeListener);
}
window.__rungScrapeListener = (msg, _sender, sendResponse) => {
  if (msg.type !== 'RUNG_SCRAPE') return;
  sendResponse(runScrape());
  return false;
};
chrome.runtime.onMessage.addListener(window.__rungScrapeListener);
