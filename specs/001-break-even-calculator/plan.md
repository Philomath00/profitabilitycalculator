# Implementation Plan: Startup Profitability & Break-Even Calculator

**Branch**: `001-break-even-calculator` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-break-even-calculator/spec.md`

## Summary

Build a single-page, client-only web application that lets a founder build a month-by-month
financial model (revenue streams, costs, funding), see operating and cumulative break-even,
compare scenarios, and download an investor-ready summary — with no user accounts and no
server-side persistence (per the 2026-09-24 clarification session). All financial calculations
run as pure, synchronous, unit-testable functions in the browser; the Investor Summary is
generated and downloaded entirely client-side. This keeps the architecture as simple as the
constitution's Architecture Principles (XI) require while still satisfying every functional
requirement in the spec — no requirement in spec.md needs a backend to be met.

## Technical Context

**Language/Version**: TypeScript 5.x, running in the browser; Node.js 20 LTS used only for
build tooling (no Node runtime is shipped or required in production)

**Primary Dependencies**: React 18 (UI), Vite (build/dev tooling), Recharts (SVG-based charting
— chosen over canvas-based alternatives for easier accessible/tabular-fallback support), a
client-side PDF generation library for the Investor Summary export (see research.md)

**Storage**: N/A — no server-side storage and no persistent client-side storage (e.g. no
localStorage) is used for model data; the model lives in in-memory application state for the
duration of the browser session only, per FR-045 (clarified 2026-09-24)

**Testing**: Vitest (unit tests for the financial calculation engine and components — the
primary correctness gate for constitution Principle X), Playwright (E2E, mandated by
constitution Principle IX)

**Target Platform**: Modern desktop and mobile web browsers; deployable as a static site (no
server runtime required)

**Project Type**: web — single frontend application, no backend service (see Constitution Check
below; this is an Infrastructure Architecture decision under Human Decision Gates)

**Performance Goals**: Recalculation of every dependent output (projection, break-even, charts,
investor summary) within 1 second of an assumption change (SC-005 / FR-034, clarified
2026-09-24), for a model of up to 60 monthly periods across multiple revenue streams, cost
items, and up to several scenarios

**Constraints**: No user accounts or authentication (clarified 2026-09-24); WCAG 2.1 AA;
no chart may rely on color alone to convey financial meaning (FR-031/042); every financial
formula must be independently unit-testable against hand-calculated reference cases
(constitution Principle X); pre-tax/operating figures only, no tax modeling (FR-047, clarified
2026-09-24)

**Scale/Scope**: Single founder, single working session, single model at a time; at minimum 3
scenarios per model (FR-023), multiple concurrent revenue streams (FR-007), a 12–60 month
projection horizon (FR-003) — no multi-tenant, multi-user, or concurrent-editing scale
requirements for this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design (see below).*

| Principle | Status | Notes |
|---|---|---|
| I. Privacy and Security by Design | PASS | No accounts, no server-side storage, no third-party data transmission required (FR-038–040); removing the backend removes an entire class of attack surface (auth, cross-user isolation) rather than requiring it to be secured. |
| II. Research Before Implementation | PASS | This plan's Phase 0 (research.md) performs and documents that research before any implementation. |
| VI. Specification-Driven Development | PASS | Plan derives directly from spec.md; no requirement is invented. |
| VII/VIII/IX. TDD / Testing Strategy / Playwright | PASS | Vitest for the calculation engine (test-first per Principle VII) and components; Playwright for E2E per Principle IX (mandatory, not optional here). |
| X. Financial Calculation Correctness and Investor Trust | PASS | Calculation engine is isolated as pure functions (see contracts/calculation-engine.md) specifically so every formula can be unit-tested against documented, hand-calculated reference cases (see quickstart.md). |
| XI. Architecture Principles | PASS | Client-only SPA is the simplest architecture that satisfies every FR in spec.md; no backend, database, or auth layer is introduced merely because it's conventional for "web apps." |
| XIV/XV/XVI. Data Viz / UX & Accessibility / Mobile | PASS (tracked) | Recharts (SVG) chosen to support accessible, non-color-only, tabular-fallback charts; responsive layout required by FR-041/042; enforced at task/implementation level, not a plan-level violation. |
| XIX. MVP Discipline | PASS | Scope is exactly User Stories 1–5 from spec.md; no speculative features added. |
| XXIII. Human Decision Gates | **FLAGGED** | "Infrastructure architecture" (client-only, no backend/database/hosting model) is an explicit Human Decision Gate item. A recommendation with rationale is documented in research.md; **this plan is presented for the founder's explicit confirmation before `/speckit-tasks` turns it into buildable work** — see Completion Report below. |
| XXIV. Dependency Discipline | PASS | Every dependency (React, Vite, Recharts, one PDF library, Vitest, Playwright) is individually justified in research.md; no state-management library or backend framework added without a concrete requirement driving it. |

No unjustified violations. One item (Infrastructure Architecture) requires explicit human
confirmation per Principle XXIII before proceeding past planning — this is a gate, not a
violation, and does not block generating the design artifacts below for review.

### Post-Design Re-check

Re-evaluated after Phase 1 (data-model.md, contracts/, quickstart.md): no new violations were
introduced. The calculation-engine contract reinforces Principle X by design (pure, unit-testable
functions); the data model introduces no server-side entity or auth concept, keeping the
Infrastructure Architecture decision unchanged. The Human Decision Gate flag stands as the only
open item before `/speckit-tasks`.

## Project Structure

### Documentation (this feature)

```text
specs/001-break-even-calculator/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   ├── calculation-engine.md
│   └── investor-summary-export.md
└── tasks.md              # Phase 2 output (/speckit-tasks command — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── domain/               # Pure calculation engine (constitution Principle X boundary)
│   ├── businessProfile.ts
│   ├── projection.ts     # computeMonthlyProjection()
│   ├── breakEven.ts      # computeBreakEven()
│   └── validation.ts     # input validation rules (FR-035–037)
├── components/            # React UI components (forms, dashboard, charts)
├── pages/                 # Guided-flow steps (FR-043: Business → Revenue → Expenses →
│                           # Funding → Growth → Projection → Break-Even → Scenarios → Investor)
├── export/                 # Client-side Investor Summary PDF generation (FR-046)
└── state/                  # In-memory application/session state (no persistence, FR-045)

tests/
├── unit/                   # Vitest — domain/ calculation reference cases (Principle X)
├── component/               # Vitest + component testing for UI
└── e2e/                     # Playwright — critical user journeys (Principle IX)
```

**Structure Decision**: Single frontend project (no `backend/` directory) — Option 1 (single
project), narrowed to a frontend-only layout since this feature has no backend responsibilities.
The `domain/` directory is deliberately isolated from `components/`/`pages/` so the
calculation engine can be unit-tested independently of any UI framework, per constitution
Principle X.

## Complexity Tracking

*No Constitution Check violations requiring justification. The Human Decision Gate flag above
is a required approval step, not a violation — no complexity/exception table entry is needed.*
