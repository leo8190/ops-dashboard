# Ops Command Center — Cursor / agent notes

Public portfolio demo: an Angular client for [OrderFlow API](https://github.com/leo8190/orderflow-api). When the API is unreachable, the UI must switch to a clearly labelled local demo. Fallback orders never reach a backend.

This is an original demo by Leonardo Apollonio (`leo8190/ops-dashboard`). It is not client work.

## Stack

- Angular 22 + TypeScript 6
- Node 22.22.3+ and npm 11+
- Sibling API: `../orderflow-api` on `http://localhost:5099`

## Commands

```bash
npm ci
npm start
npm run check
```

`npm run check` runs format verification, Vitest, and a production build.

## Full-stack local run

```bash
cd ../orderflow-api
dotnet run --project src/OrderFlow.Api --urls http://localhost:5099
```

```bash
cd ../ops-dashboard
npm start
```

Open http://localhost:4200. Runtime API URL lives in `public/orderflow-config.js` (`ORDERFLOW_CONFIG.apiBaseUrl`).

## Boundaries

- Do not mix live API data with demo fixtures after a successful connection.
- Do not add authentication, durable persistence, or silent offline sync.
- Do not commit `.env*` files or secrets.
- Keep UI actions derived from the API state machine: `Received → Processing → Completed`, plus valid cancellation.

## Live demo

https://leo8190.github.io/ops-dashboard/
