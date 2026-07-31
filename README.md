# Ops Command Center

[![Angular](https://img.shields.io/badge/Angular-22.1.0-dd0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://img.shields.io/badge/CI-format%20%7C%20test%20%7C%20build-176b52)](#quality-gates)

An accessible Angular operations client for the
[OrderFlow API](https://github.com/leo8190/orderflow-api). It turns the backend case
study into a product workflow that non-technical reviewers can explore: create an
order exactly once, inspect the queue, and run only the state transitions allowed by
the API.

> [!IMPORTANT]
> This is a self-directed portfolio case study, not a production client system. When
> the API cannot be reached, the UI switches to a prominently labelled local demo.
> Fallback orders and fallback mutations never reach a backend.

## Product walkthrough

1. The client requests the first 100 orders from `GET /api/v1/orders/`.
2. Create an order with an `Idempotency-Key`. Repeat the same body and key to see the
   original order returned instead of a duplicate.
3. Inspect an order. A received order can start or be cancelled; a processing order
   can complete or be cancelled; terminal orders expose no invalid actions.
4. Validation and `409 Conflict` problem details are shown in an accessible alert.
5. Stop the API and refresh to see the honest offline/demo states instead of a broken
   page or fabricated “live” connection.

## What it demonstrates

- Angular standalone components, strict TypeScript, signals, computed state, and
  reactive forms.
- A typed `HttpClient` boundary for list, create, start, complete, and cancel routes.
- Runtime API configuration without rebuilding application code.
- Idempotency-key handling and replay feedback from `Idempotency-Replayed`.
- UI actions derived from the backend state machine:
  `Received → Processing → Completed`, plus valid cancellation.
- Loading, API error, disconnected snapshot, and local demo fallback states.
- Accessible landmarks, native controls, visible focus, live regions, and
  reduced-motion support.
- Automated service and component tests plus production build verification.

## Run the full-stack case study

Requirements: .NET 10 SDK, Node.js 22.22.3+ and npm 11+.

From the sibling repositories, start the API first:

```bash
cd ../orderflow-api
dotnet run --project src/OrderFlow.Api --urls http://localhost:5099
```

In another terminal, start this Angular client:

```bash
cd ../ops-dashboard
npm ci
npm start
```

Open <http://localhost:4200>. The API allows the Angular development origins through
its configurable CORS policy.

## Runtime API configuration

The browser reads [`public/orderflow-config.js`](public/orderflow-config.js) before
Angular starts:

```js
globalThis.ORDERFLOW_CONFIG = {
  apiBaseUrl: 'http://localhost:5099',
};
```

Change that URL to a deployed HTTPS API without recompiling the TypeScript app. The
GitHub Pages workflow also reads the optional repository variable
`ORDERFLOW_API_URL` and writes the runtime file before building. If the configured
endpoint is unavailable, Pages remains usable through the clearly labelled local
demo fallback.

## Architecture

```text
src/app/
├── components/
│   ├── app-header/          connection and refresh state
│   ├── metric-card/         derived queue metrics
│   ├── status-badge/        API order states
│   ├── work-item-detail/    valid transitions and cancellation
│   ├── work-item-table/     typed order queue
│   └── workload-chart/      seven-day activity derived from orders
├── core/
│   ├── api-config.ts        runtime endpoint injection token
│   ├── operations.models.ts API contracts and state rules
│   └── operations.service.ts HTTP state, errors, and demo fallback
├── data/
│   └── demo-orders.ts       explicit offline-only fixtures
├── app.ts                   filters, forms, and derived presentation state
└── app.html
```

`OperationsService` is the integration boundary. Successful HTTP responses replace
or update the signal-backed queue. An initial network failure loads isolated demo
fixtures; a failure after a live connection preserves the last server snapshot and
marks it offline rather than silently mixing real and simulated data.

## Quality gates

```bash
npm run check
```

This runs formatting verification, the Vitest suite, and a production Angular build.
Tests cover live loading, network fallback, the idempotency header and replay, valid
transition routes, local demo idempotency, status filtering, and action visibility.

## GitHub Pages

[`pages.yml`](.github/workflows/pages.yml) builds with
`--base-href /ops-dashboard/` and prepares the standard GitHub Pages artifact. The
workflow is intentionally only configuration in this repository: publishing still
requires enabling **Settings → Pages → GitHub Actions** in the repository.

## Engineering boundaries

- The API uses an in-memory repository, so live data resets when that process restarts.
- Authentication, authorization, durable persistence, telemetry export, and
  production hosting remain outside this portfolio scope.
- The fallback is for product exploration, not offline synchronization; it never
  queues mutations for later upload.

## License

[MIT](LICENSE) © [Leonardo Apollonio](https://leonardo-apollonio-engineer.leon2845.chatgpt.site)
