/**
 * Rung content script — scrapes job info from the current page.
 * Supports LinkedIn, Indeed, Greenhouse, Lever, Workday, and generic fallback.
 */

function text(selector) {
  const el = document.querySelector(selector);
  return el ? el.innerText.trim() : null;
}

function attr(selector, attribute) {
  const el = document.querySelector(selector);
  return el ? (el.getAttribute(attribute) || '').trim() : null;
}

function scrapeLinkedIn() {
  const title =
    text('h1.job-details-jobs-unified-top-card__job-title') ||
    text('h1[class*="top-card__title"]') ||
    text('.job-details-jobs-unified-top-card__job-title-link') ||
    text('h1.topcard__title');
  const company =
    text('a[class*="company-name"]') ||
    text('.job-details-jobs-unified-top-card__company-name a') ||
    text('.topcard__org-name-link') ||
    text('.job-details-jobs-unified-top-card__primary-description-without-tagline a');
  const location =
    text('.job-details-jobs-unified-top-card__primary-description-container .t-black--light:last-child') ||
    text('.topcard__flavor--bullet');
  const description = text('.jobs-description__content') || text('#job-details');
  return { title, company, location, description };
}

function scrapeIndeed() {
  const title =
    text('h1[class*="jobTitle"] span:not([class])') ||
    text('h1[class*="jobTitle"]') ||
    text('.jobsearch-JobInfoHeader-title');
  const company =
    text('[data-company-name="true"]') ||
    text('div[class*="companyName"] a') ||
    text('div[class*="companyName"]');
  const location =
    text('div[class*="companyLocation"]') ||
    text('.jobsearch-JobInfoHeader-subtitle > div:last-child');
  const description =
    text('#jobDescriptionText') ||
    text('.jobsearch-JobComponent-description');
  return { title, company, location, description };
}

function scrapeGreenhouse() {
  const title =
    text('h1.app-title') ||
    text('.app-title') ||
    text('h1[class*="greenhouse"]');
  const company =
    text('.company-name') ||
    text('header .company') ||
    // Often in the page title: "Role at Company"
    (() => {
      const t = document.title;
      const m = t.match(/ at (.+?)(\s*[\|\-–]|$)/i);
      return m ? m[1].trim() : null;
    })();
  const location =
    text('.location') ||
    text('.office') ||
    text('[class*="location"]');
  const description =
    text('#content') ||
    text('.content') ||
    text('[class*="description"]');
  return { title, company, location, description };
}

function scrapeLever() {
  const title =
    text('.posting-headline h2') ||
    text('h2[data-qa="posting-name"]');
  const company = (() => {
    // Lever URLs are: jobs.lever.co/COMPANY/...
    const m = location.hostname.match(/^jobs\.lever\.co$/)
      ? location.pathname.match(/^\/([^/]+)/)
      : null;
    return m ? m[1].replace(/-/g, ' ') : text('.main-header-logo img')?.alt || null;
  })();
  const loc =
    text('.posting-headline .sort-by-time') ||
    text('[data-qa="posting-location"]');
  const description =
    text('.content[data-qa="job-description"]') ||
    text('.content');
  return { title, company, location: loc, description };
}

function scrapeWorkday() {
  const title =
    text('[data-automation-id="jobPostingHeader"]') ||
    text('h2[class*="job-title"]');
  const company = (() => {
    const m = location.hostname.match(/^(.+?)\.myworkdayjobs\.com$/);
    return m ? m[1].replace(/-/g, ' ') : null;
  })();
  const loc =
    text('[data-automation-id="locations"]') ||
    text('[class*="location"]');
  const description =
    text('[data-automation-id="jobPostingDescription"]') ||
    text('[class*="job-description"]');
  return { title, company, location: loc, description };
}

function scrapeGeneric() {
  // Try OpenGraph / meta tags first
  const ogTitle = attr('meta[property="og:title"]', 'content');
  const ogSite  = attr('meta[property="og:site_name"]', 'content');
  const ogDesc  = attr('meta[property="og:description"]', 'content') ||
                  attr('meta[name="description"]', 'content');

  // Try to split "Job Title at Company" or "Job Title | Company" from title
  const rawTitle = document.title || ogTitle || '';
  let title = rawTitle;
  let company = ogSite || null;

  const atMatch = rawTitle.match(/^(.+?)\s+(?:at|@)\s+(.+?)(?:\s*[\|\-–].*)?$/i);
  const pipeMatch = rawTitle.match(/^(.+?)\s*[\|\-–]\s*(.+)$/);

  if (atMatch) {
    title = atMatch[1].trim();
    company = company || atMatch[2].trim();
  } else if (pipeMatch) {
    title = pipeMatch[1].trim();
    company = company || pipeMatch[2].trim();
  }

  // If title is still the full page title, try the first h1
  if (title === rawTitle) {
    title = text('h1') || rawTitle;
  }

  return { title, company, location: null, description: ogDesc };
}

function detectScraper() {
  const host = location.hostname;
  if (host.includes('linkedin.com'))           return scrapeLinkedIn;
  if (host.includes('indeed.com'))             return scrapeIndeed;
  if (host.includes('greenhouse.io') ||
      host.includes('boards.greenhouse'))      return scrapeGreenhouse;
  if (host.includes('lever.co'))               return scrapeLever;
  if (host.includes('myworkdayjobs.com'))      return scrapeWorkday;
  return scrapeGeneric;
}

// Listen for scrape request from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'RUNG_SCRAPE') return;
  try {
    const scraper = detectScraper();
    const data = scraper();
    sendResponse({
      ok: true,
      title:       data.title       || '',
      company:     data.company     || '',
      location:    data.location    || '',
      description: (data.description || '').slice(0, 3000),
      url:         location.href,
    });
  } catch (err) {
    sendResponse({ ok: false, error: String(err) });
  }
  return false; // synchronous response
});
