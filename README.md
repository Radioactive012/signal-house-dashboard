# Signal House — n8n Mastery Field Manual

A private, local-first dashboard for mastering n8n through high-value automation projects. It is a learning system, not a course platform and not a real automation service.

## Open it

Open [index.html](index.html) in a browser. No installation, sign-in, API key, tracking, or backend is required.

Progress is saved only in the current browser with `localStorage`. Use **Reset progress** in the header to clear it.

## What it contains

- One focused current mission, based on the first unfinished project.
- Nine production-shaped projects, from webhook intake through self-hosted n8n and a multi-tenant control tower.
- Daily micro-builds, failure tests, and a gate that cannot be passed until the tests are checked.
- Fundamental maps for JavaScript, APIs, SQL, reliability, security, and operations.
- High-value automation categories and a focused “not yet” list.

## Files

- `roadmap-data.js` is the single source of truth for roadmap content.
- `app.js` renders the dashboard and handles local progress state.
- `styles.css` contains the responsive industrial field-manual design.

## Safety boundary

The dashboard never calls a CRM, n8n instance, API, or payment provider. It does not contain credentials or client data. The listed failure tests are the standard you should meet while building the real projects yourself.
