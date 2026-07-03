# Changelog

## 2026-07-02

- **Interview Prep — 64 questions total** — expanded the public library from 22 to 64 questions across all categories:
  - **Search** — filter questions in real time by keyword, tag, or source
  - **DesignOps category** — 19 new questions tailored to Design Program Manager interviews (capacity planning, dependency management, exec communication, QA, process design, stakeholder landscapes, and more)
  - **General additions** — 18 new Behavioral, Leadership, Situational, and Other questions (team success, most challenging project, salary expectations, leadership style, persuasion, and others from Glassdoor and AcademyUX)
- **AI model upgrade** — all AI features (interview coaching, lead scoring, resume tailoring) now use `llama-3.3-70b-instruct-fp8-fast` (~9× more parameters than the previous model)
- **AI coach fix** — resolved internal server error caused by Cloudflare returning a parsed JSON object instead of a string when `response_format: json_object` is set
- **Interview Prep UI** — removed colored left border and set border-radius to 0 on the "Why employers ask this" hint block and the AI coach question card

## 2026-06-29

- **Clear all leads** — dismiss your entire leads list in one click from the Leads toolbar. A confirmation modal shows how many leads will be dismissed before anything is removed.
- **Closed status** — added "Closed" as a new application status (for when a position is filled or no longer available). It routes automatically to the Closed section alongside Rejected, Withdrawn, Skip, and Ghosted.
- **Status list sorted alphabetically** — the status dropdown in the application editor is now in alphabetical order.

## 2026-06-15

- Edit job leads directly — fix typos, fill in missing details, or update salary/location/description on any lead before deciding whether to add it to your applications.

## 2026-06-08

### 🧹 Rung update — cleaner tracking page

- Closed section — applications you've been rejected from, withdrawn, skipped, or ghosted on (3m+) now live in a separate collapsed section below your active pipeline. Your working list stays focused on live opportunities; closed ones are still there if you need them.
- Stats strip is now collapsible — the four stat cards (total, this week, in process, follow-up) and the follow-up alert can be hidden in one click. If you have pending follow-ups, the count stays visible in the toggle so nothing slips past you.
- Stats only count active applications — the numbers in the stat strip now exclude closed applications, so "Total" and "In process" reflect your real active pipeline, not your graveyard.

## 2026-05-26

### 🔗 Downloadable browser extension

- Added a new section to include a browser extension download option and instructions.

## 2026-05-20

### 🗂️ Stack ranking for applications

- Drag and drop to manually arrange your applications in any order you want.
- Sort by column (company, status, date, etc.) and drag to lock that in as your new order — last action always wins.
- Your ranking is saved and persists across sessions.

## 2026-05-19

### 🧩 Browser extension (Chrome & Edge)

- Clip any job posting to your leads list without leaving the page.
- Auto-fills title, company, location, and salary from the page DOM.
- Works on LinkedIn, Indeed, Greenhouse, Lever, Workday, and most other job sites.
- Falls back to a server-side scrape if the page can't be read directly.
- Uses your existing Rung login — no separate sign-in.

### 🔗 Clip URL in the main app

- Paste any job posting URL directly in the Leads page.
- Rung scrapes and pre-fills the fields for you — edit and save in seconds.

### 💰 Salary auto-detection

- Salary ranges are now picked up automatically when clipping a job (e.g. "$140k–$180k").
- Salary maps to low/high fields when you convert a lead to a tracked application.

### 🔄 Leads refresh

- Leads list now updates automatically when you switch back to the app after clipping from the extension.

### ♻️ Re-clip previously dismissed leads

- Adding a job you'd already dismissed or converted no longer throws an error — it restores it to your active leads list.
