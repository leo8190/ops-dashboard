# Ops Command Center — Cursor agents

Public portfolio client for [orderflow-api](https://github.com/leo8190/orderflow-api). Work only in this repository unless the task also names the API repo.

## Product

Accessible Angular operations UI: list/create orders, idempotent retries, and only the transitions the API allows. If the API is down, show the labelled local demo. Never mix live and demo data silently.

Pages: https://leo8190.github.io/ops-dashboard/
Repo: https://github.com/leo8190/ops-dashboard

## Stack

Angular 22, TypeScript, Vitest. Node 22.22.3+ / npm 11+. Runtime API URL is `public/orderflow-config.js` (`ORDERFLOW_CONFIG.apiBaseUrl`).

## Commands

```bash
npm ci
npm start
npm run check
```

Full-stack local: start `../orderflow-api` on `http://localhost:5099`, then this app on `http://localhost:4200`.

## Boundaries

- Do not add auth, durable sync, or telemetry export.
- Do not treat the demo fallback as offline queueing.
- Do not commit API keys or secrets.
- GitHub Pages still needs Settings → Pages → GitHub Actions if publishing is requested.
- Open Dependabot PRs (#5, #6, #7) are Pages action bumps; do not merge them from here without running `npm run check`.
