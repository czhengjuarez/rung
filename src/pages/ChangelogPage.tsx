interface ChangelogGroup {
  emoji?: string;
  title?: string;
  items: string[];
}

interface ChangelogEntry {
  date: string; // ISO yyyy-mm-dd
  groups: ChangelogGroup[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-06-15',
    groups: [
      {
        items: [
          'Edit job leads directly — fix typos, fill in missing details, or update salary/location/description on any lead before deciding whether to add it to your applications.',
        ],
      },
    ],
  },
  {
    date: '2026-06-08',
    groups: [
      {
        emoji: '🧹',
        title: 'Rung update — cleaner tracking page',
        items: [
          'Closed section — applications you’ve been rejected from, withdrawn, skipped, or ghosted on (3m+) now live in a separate collapsed section below your active pipeline. Your working list stays focused on live opportunities; closed ones are still there if you need them.',
          'Stats strip is now collapsible — the four stat cards (total, this week, in process, follow-up) and the follow-up alert can be hidden in one click. If you have pending follow-ups, the count stays visible in the toggle so nothing slips past you.',
          'Stats only count active applications — the numbers in the stat strip now exclude closed applications, so "Total" and "In process" reflect your real active pipeline, not your graveyard.',
        ],
      },
    ],
  },
  {
    date: '2026-05-26',
    groups: [
      {
        emoji: '🔗',
        title: 'Downloadable browser extension',
        items: [
          'Added a new section to include a browser extension download option and instructions.',
        ],
      },
    ],
  },
  {
    date: '2026-05-20',
    groups: [
      {
        emoji: '🗂️',
        title: 'Stack ranking for applications',
        items: [
          'Drag and drop to manually arrange your applications in any order you want.',
          'Sort by column (company, status, date, etc.) and drag to lock that in as your new order — last action always wins.',
          'Your ranking is saved and persists across sessions.',
        ],
      },
    ],
  },
  {
    date: '2026-05-19',
    groups: [
      {
        emoji: '🧩',
        title: 'Browser extension (Chrome & Edge)',
        items: [
          'Clip any job posting to your leads list without leaving the page.',
          'Auto-fills title, company, location, and salary from the page DOM.',
          'Works on LinkedIn, Indeed, Greenhouse, Lever, Workday, and most other job sites.',
          'Falls back to a server-side scrape if the page can’t be read directly.',
          'Uses your existing Rung login — no separate sign-in.',
        ],
      },
      {
        emoji: '🔗',
        title: 'Clip URL in the main app',
        items: [
          'Paste any job posting URL directly in the Leads page.',
          'Rung scrapes and pre-fills the fields for you — edit and save in seconds.',
        ],
      },
      {
        emoji: '💰',
        title: 'Salary auto-detection',
        items: [
          'Salary ranges are now picked up automatically when clipping a job (e.g. "$140k–$180k").',
          'Salary maps to low/high fields when you convert a lead to a tracked application.',
        ],
      },
      {
        emoji: '🔄',
        title: 'Leads refresh',
        items: [
          'Leads list now updates automatically when you switch back to the app after clipping from the extension.',
        ],
      },
      {
        emoji: '♻️',
        title: 'Re-clip previously dismissed leads',
        items: [
          'Adding a job you’d already dismissed or converted no longer throws an error — it restores it to your active leads list.',
        ],
      },
    ],
  },
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ChangelogPage() {
  return (
    <div className="rung-changelog-page">
      <div className="rung-page-heading">
        <h1>What's new</h1>
        <p className="rung-page-subheading">Recent updates and improvements to Rung</p>
      </div>

      <div className="rung-changelog-list">
        {CHANGELOG.map(entry => (
          <div key={entry.date} className="rung-changelog-entry">
            <div className="rung-changelog-date">{formatDate(entry.date)}</div>
            {entry.groups.map((group, i) => (
              <div key={i} className="rung-changelog-group">
                {group.title && (
                  <h3 className="rung-changelog-group-title">
                    {group.emoji && <span className="rung-changelog-emoji">{group.emoji}</span>}
                    {group.title}
                  </h3>
                )}
                <ul className="rung-changelog-items">
                  {group.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
