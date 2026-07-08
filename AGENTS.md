# Agent notes

Technical context for anyone (human or agent) making changes in this repo. This is not user-facing documentation — see [README.md](README.md) for that.

## Stack

React 18 + Vite + TypeScript frontend, Hono on Cloudflare Workers backend, D1 (SQLite), R2, Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`).

## Deploy

`npm run cf:deploy` runs `build`, zips `extension/` to `/tmp/rung-extension.zip`, uploads it to R2 at `public/rung-extension.zip` (the file served by `/api/public/extension/download`), then `wrangler deploy`. The extension zip and the worker deploy are one step — never edit `extension/` without redeploying, or the downloadable zip will drift from the source.

D1 migrations are applied manually and are not part of `cf:deploy`: `wrangler d1 execute rung --remote --file=./migrations/00NN_x.sql`.

## Workers AI response_format gotcha

When `c.env.AI.run(...)` is called with `response_format: { type: 'json_object' }`, Cloudflare returns `resp.response` as an **already-parsed JS object**, not a JSON string. Code that assumes a string and calls `.match()`/`.parse()` on it will throw `TypeError` and 500. Always check `typeof resp.response` before treating it as text. See `worker/routes/interview.ts` `/coach` handler for the pattern (type-check first, only regex/`JSON.parse` the string case).

## Browser extension architecture

- `extension/manifest.json` — MV3, `content_scripts` auto-injects `content.js` at `document_idle` on `<all_urls>`.
- `extension/content.js` — defines `runScrape()` (site-specific DOM scrapers, routed by hostname) and exposes it as `window.__rungScrapeNow` for direct invocation. Also registers a `chrome.runtime.onMessage` listener as a fallback path, guarded against double-registration via `window.__rungScrapeListener` (needed because the popup re-injects this file on every scrape).
- `extension/popup.js` `scrapeTab()` — **primary path**: `chrome.scripting.executeScript` injects `content.js` fresh, then a second `executeScript` call invokes `window.__rungScrapeNow()` and reads the return value directly. This avoids relying on message-passing to a content script that may be orphaned (e.g. tab was open before an extension update — Chrome doesn't hot-swap already-injected content scripts). Message-passing to the auto-loaded script is kept only as a secondary fallback.
- Server-side fallback: `POST /api/leads/scrape` (`worker/routes/leads.ts`) — tries JSON-LD `JobPosting` → OpenGraph/meta tag parsing → AI extraction, in that order. **LinkedIn cannot be read this way**: LinkedIn blocks datacenter IPs (Cloudflare Workers included) at the network/IP level, independent of user-agent, and serves a login/authwall page instead. Both the extension (`popup.js`) and the server route filter out authwall-looking titles (regex `JUNK_TITLE` matching "sign in", "login", "authwall", etc.) so they don't get pasted into the job title field — but the underlying fix for LinkedIn is always the in-page DOM scraper in `content.js`, not the server fallback.
- Extension version lives in `manifest.json` and is surfaced in the popup header (`chrome.runtime.getManifest().version`) — bump it on any `extension/` change so users can confirm they're on the current build after re-downloading.

## D1 result pattern

Row count from a write is at `result.meta.changes`, not `result.changes`.
