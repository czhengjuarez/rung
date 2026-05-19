# Rung Browser Extension

Chrome/Edge extension to clip job postings into your Rung leads list in one click.

## Install (developer mode)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select this `extension/` folder
5. The Rung icon appears in your toolbar — pin it for quick access

## Usage

1. Browse to any job posting (LinkedIn, Indeed, Greenhouse, Lever, Workday, or any site)
2. Click the **Rung** extension icon
3. Job title, company, location, and URL are pre-filled — edit if needed
4. Click **Add to leads**
5. The lead appears instantly in Rung → Job Leads

## Auth

The extension uses your existing Rung session. If you're already logged in to
`rung.coscient.workers.dev` in Chrome, it just works. If not, click
**Open Rung to sign in**, log in, then click the extension icon again.

## Supported job boards (auto-detect)

| Site | Auto-detects |
|---|---|
| LinkedIn Jobs | Title, company, location, description |
| Indeed | Title, company, location, description |
| Greenhouse | Title, company, location |
| Lever | Title, company, location |
| Workday | Title, company, location |
| Any other site | Best-effort from page title / Open Graph tags |
