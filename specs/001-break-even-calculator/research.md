# Phase 0 Research: Startup Profitability & Break-Even Calculator

All Technical Context items below were unknowns going into planning; each is resolved here with
a decision, rationale, and alternatives considered. No `NEEDS CLARIFICATION` markers remain
after this document.

## 1. Overall architecture: client-only vs. client + backend

**Decision**: Client-only single-page application. No backend service, no database, for this
feature.

**Rationale**: The 2026-09-24 clarification session settled that this feature has no user
accounts/login and no server-side persistence (FR-045) — a founder's model lives in the working
session and is retained by downloading it (FR-046). Every functional requirement in spec.md
(revenue/cost/funding modeling, projection, break-even, scenarios, sensitivity, dashboard,
investor summary, validation) is a pure function of founder-supplied inputs plus arithmetic —
none of them requires a server to be fulfilled. Constitution Principle XI (Architecture
Principles) requires avoiding complexity "merely because they are fashionable" and starting
simple; Principle I (Privacy and Security by Design) favors the architecture that "exposes less
data and grants less privilege" when uncertainty exists — a server that stores no data and
authenticates no one has nothing to protect, so removing it removes risk rather than deferring
it.

**Alternatives considered**:
- *Full-stack app with backend API + database, anticipating future accounts.* Rejected: builds
  auth, authorization, and data-isolation infrastructure that no current requirement calls for,
  violating MVP Discipline (Principle XIX) and Architecture Principles (XI). If accounts become
  a future requirement, this is an additive change, not a rewrite, because the calculation
  engine (see `contracts/calculation-engine.md`) is UI/backend-agnostic pure functions.
- *Serverless functions for PDF export only.* Rejected: adds a deployment/hosting dependency and
  a network round-trip for something the browser can do natively; also would need to receive the
  founder's financial data over the network, in tension with the "expose less data" default in
  Principle I. Client-side PDF generation avoids this entirely.

**Human Decision Gate**: This is an Infrastructure Architecture decision per constitution
Principle XXIII and requires explicit founder confirmation before `/speckit-tasks` proceeds (see
plan.md Constitution Check and the completion report).

## 2. UI framework

**Decision**: React 18 + TypeScript.

**Rationale**: Largest ecosystem of accessible component primitives and chart libraries reduces
the risk of getting WCAG 2.1 AA (FR-041) wrong from scratch; TypeScript's static typing catches
a class of errors (wrong units, mismatched types between currency/percentage/count fields) before
they reach the financial calculation engine, directly supporting constitution Principle X
(correctness).

**Alternatives considered**: Vue (smaller ecosystem of finance-dashboard-relevant examples and
accessible chart integrations); Svelte (smaller a11y tooling ecosystem); vanilla
TypeScript/DOM (would require hand-building form state management, routing between guided-flow
steps, and re-render logic that React provides — under-tooled relative to FR-043's multi-step
guided flow).

## 3. Build tooling

**Decision**: Vite.

**Rationale**: Zero-config TypeScript + React support, fast local dev feedback loop, minimal
configuration surface (constitution Principle XXIV, Dependency Discipline — prefer minimal,
well-maintained tooling).

**Alternatives considered**: Create React App (effectively unmaintained); raw Webpack config
(more configuration overhead than this project's scope justifies).

## 4. State management

**Decision**: React component state + Context API; no external state-management library.

**Rationale**: Scope is one Business Profile with a handful of Scenarios, each holding a modest
number of revenue streams / cost items / funding entries, all in-memory for one session. This is
well within what built-in state primitives handle cleanly, per Dependency Discipline
(Principle XXIV) — no dependency is added without a concrete need driving it.

**Alternatives considered**: Redux, Zustand, Jotai — rejected as unjustified complexity for this
scale; revisit only if a future feature (e.g., persistence/accounts) materially increases state
complexity.

## 5. Charting library

**Decision**: Recharts.

**Rationale**: SVG-based (not canvas), which makes it practical to pair each chart with an
accessible, labeled DOM structure and a numerical/tabular alternative (FR-042), and to avoid
color-only encoding (FR-031) by combining SVG patterns/labels with color. Actively maintained,
React-native API.

**Alternatives considered**: Chart.js (canvas-based — harder to expose accessible per-point
information and tabular fallbacks); D3 directly (far more implementation effort than justified
for the standard line/area/bar charts this feature needs — would violate Architecture
Principles' "avoid premature complexity").

## 6. Investor Summary export (download) mechanism

**Decision**: Client-side PDF generation, triggered by a "Download" action, producing the
Investor Summary as a file the browser saves locally. No server involvement.

**Rationale**: Directly satisfies FR-046 ("download... without the founder or the recipient
needing an account") with a discrete, testable user action, keeping the no-backend decision
intact.

**Alternatives considered**: Browser print-to-PDF via a CSS print stylesheet only — rejected as
the *primary* mechanism because it depends on the founder manually choosing "Save as PDF" in the
browser's print dialog rather than a first-class "Download" affordance, which is harder to test
and less discoverable; may still be offered as a secondary path (e.g., a print-friendly view) at
implementation time without changing this plan.

## 7. Testing stack

**Decision**: Vitest for unit and component tests; Playwright for end-to-end tests.

**Rationale**: Constitution Principle IX makes Playwright mandatory for critical user journeys.
Vitest is the natural pairing for a Vite-built TypeScript project (shared config/transform
pipeline) and is fast enough to support TDD (Principle VII) on the calculation engine, which is
this feature's highest-risk code per Principle X.

**Alternatives considered**: Jest — works but needs extra configuration to share Vite's
transform pipeline; no material benefit over Vitest for this project.

## 8. Recalculation performance approach

**Decision**: Pure, synchronous TypeScript functions over typed input objects, recomputed
directly on every input change (no memoization framework, no web workers).

**Rationale**: The performance target (≤1 second, SC-005) is generous relative to the actual
computation: at most 60 monthly periods × a handful of revenue streams and cost items × a
handful of scenarios is a trivial amount of arithmetic for a browser to perform synchronously,
almost certainly completing in low single-digit milliseconds. Introducing memoization
infrastructure or worker-thread offloading before evidence of a performance problem would
violate Architecture Principles' "avoid premature complexity."

**Alternatives considered**: Web Worker–based calculation — rejected for now as unnecessary
given the scale in Technical Context; revisit only if implementation-time profiling shows the
1-second budget is at risk.

## 9. Deployment target

**Decision**: Not committed in this plan. The application is a static site (HTML/CSS/JS bundle)
with no server runtime dependency, so it can be deployed to any static hosting target; the
specific host is a release-time decision (constitution Principle XXVI, Release Discipline), out
of scope for this feature-level plan.

**Rationale**: Avoids over-specifying infrastructure decisions that don't affect this feature's
design or testability.
