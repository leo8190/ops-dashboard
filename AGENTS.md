# Ops Command Center

Accessible Angular client for the [OrderFlow API](https://github.com/leo8190/orderflow-api). This repository is the Cursor home for the frontend. It is a self-directed portfolio case study, not a production client system.

Pages: https://leo8190.github.io/ops-dashboard/

## Commands

Requires Node.js 22+ and npm 11+.

```bash
npm ci
npm start
npm run check
```

`npm run check` runs Prettier, the Vitest suite, and a production Angular build.

## Full-stack local run

Start the sibling API first:

```bash
cd ../orderflow-api
dotnet run --project src/OrderFlow.Api --urls http://localhost:5099
```

Then start this client. The browser reads `public/orderflow-config.js` before Angular boots. Change `apiBaseUrl` there without rebuilding TypeScript.

## Product rules

- Create an order exactly once with an `Idempotency-Key`.
- Expose only the transitions the API allows for the current state.
- When the API cannot be reached, switch to a prominently labelled local demo.
- Fallback orders and fallback mutations must never reach a backend.
- After a live connection fails, keep the last server snapshot and mark it offline. Do not mix live and demo rows.

## Constraints

- Do not add authentication, durable persistence, or telemetry export.
- Do not commit `.env*` files, tokens, or secrets.
- Keep actions, errors, and connection state visible as text, not color alone.
