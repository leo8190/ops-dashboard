# Ops Command Center

[![Angular](https://img.shields.io/badge/Angular-22.1.0-dd0031?logo=angular&logoColor=white)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://img.shields.io/badge/CI-format%20%7C%20test%20%7C%20build-176b52)](#quality-gates)

A responsive operations dashboard that helps a fictional team spot SLA risk, inspect
work queues, and acknowledge incidents. It is a product-focused frontend case study
built for my software engineering portfolio.

> [!IMPORTANT]
> This is a portfolio demonstration, not a production client system. Every company,
> person, metric, workflow, and incident is fictional.

## What it demonstrates

- A polished, responsive dashboard built with Angular standalone components.
- Signal-based state, derived filters, and immutable local updates.
- Search, team and status filtering, workflow inspection, and status controls.
- Acknowledgement states for operational incidents.
- Accessible landmarks, native controls, visible focus, reduced-motion support, and
  meaningful live regions.
- Strict TypeScript, component boundaries, automated tests, formatting, and CI.

## Product walkthrough

1. Scan weekly throughput, SLA compliance, incident count, and median cycle time.
2. Compare seven-day workload with completed volume and team capacity.
3. Acknowledge simulated incidents from the attention panel.
4. Filter the execution queue by status or team, or search across key fields.
5. Inspect a workflow and try a local status update.

All interactions are deliberately client-side. Refreshing the browser restores the
original fixture data.

## Stack

| Area       | Choice                                      |
| ---------- | ------------------------------------------- |
| Framework  | Angular 22.1, standalone components         |
| Language   | TypeScript 6 in strict mode                 |
| State      | Angular signals and computed state          |
| Styling    | Component-scoped SCSS and CSS custom props  |
| Tests      | Angular test builder with Vitest and jsdom  |
| Automation | GitHub Actions and Dependabot               |
| Data       | Typed, realistic fixtures; no external APIs |

No UI kit or charting dependency is used. The chart and interaction states are built
with semantic HTML, Angular, and CSS to keep the bundle and architecture easy to
audit.

## Architecture

```text
src/app/
├── components/
│   ├── app-header/
│   ├── incident-panel/
│   ├── metric-card/
│   ├── status-badge/
│   ├── work-item-detail/
│   ├── work-item-table/
│   └── workload-chart/
├── core/
│   ├── operations.models.ts
│   ├── operations.service.ts
│   └── operations.service.spec.ts
├── data/
│   └── mock-operations.ts
├── app.ts
├── app.html
└── app.scss
```

`OperationsService` owns the editable in-memory state. `App` derives filtered and
selected views, while presentation components communicate through typed inputs and
outputs.

## Run locally

Requirements: Node.js 22.22.3+ (Node 22 LTS recommended) and npm 11+.

```bash
npm ci
npm start
```

Open `http://localhost:4200`.

## Quality gates

```bash
npm run format:check
npm run test:ci
npm run build
```

Run everything with:

```bash
npm run check
```

CI executes the same clean-install quality gate for every pull request and push to
`main`.

## Engineering decisions

- **Signals over a larger state library:** this scope benefits from explicit local
  state without introducing store ceremony.
- **Typed fixture boundary:** mock data is isolated so a future HTTP repository can
  replace it without rewriting presentation components.
- **Native controls first:** buttons, labels, search, select, progress semantics, and
  headings provide useful keyboard and assistive-technology behavior by default.
- **Honest demo states:** every mutation is visibly described as simulated and
  session-local.

## Possible next steps

- Replace the fixture service with an ASP.NET Core API.
- Add role-aware routing and authentication.
- Persist filters in query parameters.
- Add component-level visual regression checks.
- Instrument Web Vitals and error telemetry.

## License

[MIT](LICENSE) © [Leonardo Apollonio](https://leonardo-apollonio-engineer.leon2845.chatgpt.site)
