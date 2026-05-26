import { Chrome, ClipboardList, ExternalLink, Puzzle, Zap } from 'lucide-react';

const STEPS_CHROME = [
  {
    step: 1,
    title: 'Download the extension folder',
    body: (
      <>
        Clone the Rung repo or{' '}
        <a
          href="https://github.com/czhengjuarez/rung/archive/refs/heads/main.zip"
          target="_blank"
          rel="noopener noreferrer"
          className="rung-ext-link"
        >
          download the zip from GitHub <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
        </a>
        {' '}and unzip it. The extension lives in the <code className="rung-ext-code">extension/</code> folder.
      </>
    ),
  },
  {
    step: 2,
    title: 'Open Chrome Extensions',
    body: <>Navigate to <code className="rung-ext-code">chrome://extensions</code> in your browser address bar.</>,
  },
  {
    step: 3,
    title: 'Enable Developer Mode',
    body: <>Toggle <strong>Developer mode</strong> on using the switch in the top-right corner of the Extensions page.</>,
  },
  {
    step: 4,
    title: 'Load the extension',
    body: <>Click <strong>Load unpacked</strong> and select the <code className="rung-ext-code">extension/</code> folder from the Rung repo. The Rung icon will appear in your toolbar.</>,
  },
  {
    step: 5,
    title: 'Pin it to your toolbar',
    body: <>Click the puzzle piece icon in Chrome's toolbar, find <strong>Rung — Clip Job Leads</strong>, and click the pin icon so it's always one click away.</>,
  },
];

const STEPS_EDGE = [
  { step: 1, title: 'Same first step', body: <>Download the <code className="rung-ext-code">extension/</code> folder as above.</> },
  { step: 2, title: 'Open Edge Extensions', body: <>Navigate to <code className="rung-ext-code">edge://extensions</code>.</> },
  { step: 3, title: 'Enable Developer Mode', body: <>Toggle <strong>Developer mode</strong> on in the left sidebar.</> },
  { step: 4, title: 'Load the extension', body: <>Click <strong>Load unpacked</strong> and select the <code className="rung-ext-code">extension/</code> folder.</> },
];

const SUPPORTED = [
  'LinkedIn',
  'Indeed',
  'Greenhouse',
  'Lever',
  'Workday',
  'Any other job site (generic fallback)',
];

export default function ExtensionPage() {
  return (
    <div className="rung-ext-page">
      {/* Hero */}
      <div className="rung-ext-hero">
        <div className="rung-ext-hero-icon">
          <Puzzle size={28} />
        </div>
        <div>
          <h1 className="rung-ext-hero-title">Browser Extension</h1>
          <p className="rung-ext-hero-sub">
            Clip any job posting to your Rung leads list in one click — without leaving the page.
          </p>
        </div>
      </div>

      {/* Feature chips */}
      <div className="rung-ext-chips">
        <div className="rung-ext-chip">
          <Zap size={14} /> Auto-fills title, company, location &amp; salary
        </div>
        <div className="rung-ext-chip">
          <Chrome size={14} /> Chrome &amp; Edge (Manifest V3)
        </div>
        <div className="rung-ext-chip">
          <ClipboardList size={14} /> Uses your existing Rung login
        </div>
      </div>

      <div className="rung-ext-columns">
        {/* Install — Chrome */}
        <section className="rung-ext-section">
          <h2 className="rung-ext-section-title">Install on Chrome</h2>
          <ol className="rung-ext-steps">
            {STEPS_CHROME.map(s => (
              <li key={s.step} className="rung-ext-step">
                <div className="rung-ext-step-num">{s.step}</div>
                <div>
                  <strong>{s.title}</strong>
                  <p className="rung-ext-step-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Install — Edge */}
        <section className="rung-ext-section">
          <h2 className="rung-ext-section-title">Install on Edge</h2>
          <ol className="rung-ext-steps">
            {STEPS_EDGE.map(s => (
              <li key={s.step} className="rung-ext-step">
                <div className="rung-ext-step-num">{s.step}</div>
                <div>
                  <strong>{s.title}</strong>
                  <p className="rung-ext-step-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* How to use */}
      <section className="rung-ext-section">
        <h2 className="rung-ext-section-title">How to use it</h2>
        <ol className="rung-ext-steps">
          <li className="rung-ext-step">
            <div className="rung-ext-step-num">1</div>
            <div>
              <strong>Browse to any job posting</strong>
              <p className="rung-ext-step-body">Navigate to a job listing on LinkedIn, Indeed, Greenhouse, or any other site.</p>
            </div>
          </li>
          <li className="rung-ext-step">
            <div className="rung-ext-step-num">2</div>
            <div>
              <strong>Click the Rung icon</strong>
              <p className="rung-ext-step-body">The extension reads the page and auto-fills the job title, company, location, and salary. Review the fields and edit if needed.</p>
            </div>
          </li>
          <li className="rung-ext-step">
            <div className="rung-ext-step-num">3</div>
            <div>
              <strong>Click Save</strong>
              <p className="rung-ext-step-body">The lead is added to your Rung leads list instantly. Switch back to Rung and it will appear at the top.</p>
            </div>
          </li>
          <li className="rung-ext-step">
            <div className="rung-ext-step-num">4</div>
            <div>
              <strong>Not signed in?</strong>
              <p className="rung-ext-step-body">The extension will prompt you to open Rung and log in first. Once logged in, re-open the extension — it uses your existing session.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Supported sites */}
      <section className="rung-ext-section">
        <h2 className="rung-ext-section-title">Supported sites</h2>
        <ul className="rung-ext-sites">
          {SUPPORTED.map(s => (
            <li key={s} className="rung-ext-site-chip">{s}</li>
          ))}
        </ul>
        <p className="rung-ext-note">
          For sites not listed, the extension falls back to a server-side scrape using the page's OpenGraph metadata.
          If that also fails, fields stay blank and you can fill them in manually before saving.
        </p>
      </section>
    </div>
  );
}
