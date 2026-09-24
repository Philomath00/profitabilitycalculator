---
description: "Task list for feature implementation"
---

# Tasks: Startup Profitability & Break-Even Calculator

**Input**: Design documents from `/specs/001-break-even-calculator/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present)

**Tests**: Included — spec.md §25 (Testing Expectations) and constitution Principles VII (TDD)
and IX (Playwright, mandatory) both require them for this project.

**Organization**: Tasks are grouped by user story (spec.md priorities P1–P5) so each story can be
implemented, tested, and demoed independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story this task belongs to (US1–US5)
- File paths below follow plan.md's Project Structure (single frontend project, no backend)

---

## Phase 1: Setup

**Purpose**: Project initialization per plan.md / research.md decisions.

- [x] T001 Create project directory structure per plan.md Project Structure
      (`src/domain/`, `src/components/`, `src/pages/`, `src/export/`, `src/state/`,
      `tests/unit/`, `tests/component/`, `tests/e2e/`)
- [x] T002 Initialize TypeScript 5.x + React 18 + Vite project (`package.json`,
      `tsconfig.json`, `vite.config.ts`) per research.md §2–3
- [x] T003 [P] Configure Vitest (`vitest.config.ts`) per research.md §7
- [x] T004 [P] Configure Playwright (`playwright.config.ts`) per constitution Principle IX
      and research.md §7
- [x] T005 [P] Configure ESLint + Prettier for linting/formatting
- [x] T006 [P] Add Recharts and a client-side PDF generation library as dependencies per
      research.md §5–6

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared domain types and infrastructure every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Define `BusinessProfile`, `RevenueStream`, `CostItem`, `FundingSource`, `Scenario`
      TypeScript types in `src/domain/types.ts` per data-model.md, quoting constraints
      verbatim: `name` required 1–200 chars; `currency` ISO 4217; `projectionPeriodMonths` ∈
      {12, 24, 36, 60}; `startingCash` ≥ 0; `churnRatePercent`/`commissionRatePercent` ∈
      [0, 100]; `category` ∈ {fixed, variable, one_time_startup, growth, custom};
      `variableBasis` required when `category = variable`
- [x] T008 [P] Implement `validateInputs()` in `src/domain/validation.ts` per
      contracts/calculation-engine.md and data-model.md validation rules (FR-035–037)
- [x] T009 [P] Implement in-memory `AppStateContext` (React Context, no persistence per
      FR-045) in `src/state/AppStateContext.tsx`
- [x] T010 [P] Implement the unsaved-changes warning required by FR-048 in
      `src/state/unsavedChangesGuard.ts`
- [x] T011 [P] Build the guided-flow step scaffold/router (Business → Revenue → Expenses →
      Funding → Growth → Projection → Break-Even → Scenarios → Investor View, FR-043) in
      `src/pages/GuidedFlow.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Build a Break-Even & Profitability Model (Priority: P1) 🎯 MVP

**Goal**: A founder enters business/revenue/cost/funding assumptions and sees a correct
month-by-month projection and operating/cumulative break-even determination.

**Independent Test**: Enter the quickstart.md canonical reference case ($100,000 starting cash,
$10,000 month-1 revenue, 10% growth, $20,000 fixed expenses, 20% variable expenses) and verify
the projection table and break-even months (11 operating, 18 cumulative) match exactly — with
no dashboard, scenario, or export functionality required.

### Tests for User Story 1 ⚠️ Write first; confirm they FAIL before implementing T016–T025

- [x] T012 [P] [US1] Unit tests for `computeMonthlyProjection()` against the quickstart.md
      canonical reference case (revenue and operating profit/loss at months 1, 5, 10, 11, 17,
      18) in `tests/unit/projection.test.ts`
- [x] T013 [P] [US1] Unit tests for `computeBreakEven()` covering three quickstart.md
      reference cases: the canonical case (operating break-even = month 11, cumulative
      break-even = month 18), the never-reaches-break-even case (both `null`), and the
      zero-contribution-margin case (`breakEvenUnits` `null`) in `tests/unit/breakEven.test.ts`
- [x] T014 [P] [US1] Unit tests for `validateInputs()` rejecting negative price, out-of-range
      percentages, malformed numbers, and missing required fields (FR-035–036) in
      `tests/unit/validation.test.ts`
- [x] T015 [US1] Playwright E2E test: founder completes the Business → Revenue → Expenses →
      Funding steps with the canonical reference case and sees operating break-even month 11
      and cumulative break-even month 18 in `tests/e2e/coreModel.spec.ts`

### Implementation for User Story 1

- [x] T016 [US1] Implement `computeMonthlyProjection()` in `src/domain/projection.ts` per
      contracts/calculation-engine.md (exactly `projectionPeriodMonths` rows; no `NaN`/
      `Infinity`; `grossMargin` is `null` when revenue = 0) (depends on T007, T012)
- [x] T017 [US1] Implement `computeBreakEven()` in `src/domain/breakEven.ts` per
      contracts/calculation-engine.md (`operatingBreakEvenMonth`/`cumulativeBreakEvenMonth`
      `null` when not reached; `breakEvenUnits` `null` when contribution margin ≤ 0)
      (depends on T016, T013)
- [x] T018 [P] [US1] Build the Business Setup step in `src/pages/BusinessSetupStep.tsx`
      (`name` required 1–200 chars, `businessModelType` enum, `currency` ISO 4217,
      `projectionStartDate`, `projectionPeriodMonths` ∈ {12, 24, 36, 60}, `startingCash` ≥ 0)
      per FR-001–003
- [x] T019 [P] [US1] Build the Revenue Stream step in `src/pages/RevenueStep.tsx` supporting
      multiple streams, the `type` enum, `growthRatePercentPerMonth` (may be negative),
      `churnRatePercent`/`commissionRatePercent` ∈ [0, 100] per FR-004–007
- [x] T020 [P] [US1] Build the Cost Item step in `src/pages/ExpensesStep.tsx` supporting
      fixed/variable/one_time_startup/growth/custom categories, `variableBasis`,
      `startMonth`/`endMonth` per FR-008–010
- [x] T021 [P] [US1] Build the Funding step in `src/pages/FundingStep.tsx` for
      founder_capital/investment/grant/loan/other with `receivedMonth` per FR-011–012
- [x] T022 [US1] Build the Monthly Projection table in `src/components/ProjectionTable.tsx`
      (revenue, expenses, profit/loss, cash balance, cumulative profit/loss per month) per
      FR-021 (depends on T016)
- [x] T023 [US1] Build the Break-Even summary display in
      `src/components/BreakEvenSummary.tsx`, distinguishing operating vs. cumulative
      break-even and stating "Break-even is not reached within the selected projection
      period" when `null` per FR-018–019 (depends on T017)
- [x] T024 [US1] Wire `validateInputs()` error messages into the Business/Revenue/Expenses/
      Funding steps per FR-035 (depends on T008, T018–T021)
- [x] T025 [US1] Wire `AppStateContext` so any assumption change triggers recalculation of
      the projection and break-even result within 1 second per SC-005/FR-034 (depends on
      T009, T016, T017)

**Checkpoint**: User Story 1 is fully functional and independently testable per quickstart.md.

---

## Phase 4: User Story 2 - Investor-Ready Visual Dashboard (Priority: P2)

**Goal**: A visual dashboard summarizing headline metrics and charts, with break-even visually
highlighted.

**Independent Test**: Take a completed User Story 1 model, verify the dashboard's headline
metrics and charts match the underlying monthly projection exactly, and that the break-even
point is visually identifiable on the relevant chart(s).

### Tests for User Story 2 ⚠️ Write first; confirm they FAIL before implementing T028–T034

- [x] T026 [P] [US2] Unit tests verifying dashboard headline-metric values equal
      `computeMonthlyProjection()`/`computeBreakEven()` outputs for the canonical case in
      `tests/unit/dashboardMetrics.test.ts`
- [x] T027 [US2] Playwright E2E test: the dashboard shows correct headline metrics and
      break-even is visually marked on the revenue-vs-expenses chart at month 11 for the
      canonical case in `tests/e2e/dashboard.spec.ts`

### Implementation for User Story 2

- [x] T028 [P] [US2] Build the Dashboard headline metrics component in
      `src/components/DashboardMetrics.tsx` (revenue, gross margin, monthly burn, runway,
      break-even month, funding requirement, projected profitability) per FR-026
- [x] T029 [P] [US2] Build the Revenue-vs-Expenses chart in
      `src/components/RevenueExpensesChart.tsx` (Recharts, break-even point marked,
      non-color-only encoding) per FR-027, FR-030–031
- [x] T030 [P] [US2] Build the Profitability-over-time chart in
      `src/components/ProfitabilityChart.tsx` per FR-028
- [x] T031 [P] [US2] Build the Cash Position/Runway chart in
      `src/components/CashRunwayChart.tsx` per FR-028
- [x] T032 [US2] Add a numerical/tabular fallback for each chart per FR-042 (depends on
      T029–T031)
- [x] T033 [US2] Add explicit "break-even not reached" messaging to the dashboard when the
      break-even result is `null` per FR-019/FR-030 (depends on T028)
- [x] T034 [US2] Assemble the Dashboard page in `src/pages/DashboardStep.tsx`, integrating
      T028–T033

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Scenario Comparison (Priority: P3)

**Goal**: Create and compare Conservative/Base Case/Optimistic (or custom) scenarios.

**Independent Test**: Create three scenarios that differ only in growth rate or a cost
assumption, verify each scenario's computed metrics differ in the mathematically expected
direction, and that the comparison view displays all three accurately.

### Tests for User Story 3 ⚠️ Write first; confirm they FAIL before implementing T037–T041

- [x] T035 [P] [US3] Unit test: duplicating a base scenario with a lower growth rate produces
      an operating break-even month at or later than the base case's, in
      `tests/unit/scenario.test.ts`
- [x] T036 [US3] Playwright E2E test: create three named scenarios and verify the comparison
      view shows revenue/expenses/profitability/break-even/runway/cash requirements for all
      three in `tests/e2e/scenarios.spec.ts`

### Implementation for User Story 3

- [x] T037 [US3] Implement scenario duplication in `src/domain/scenario.ts` — a full copy of
      `revenueStreams`/`costItems`/`fundingSources`, not a diff/override, per data-model.md
      (depends on T007)
- [x] T038 [P] [US3] Build the Scenario management UI (create/name/duplicate/delete,
      `isBaseCase` toggle) in `src/pages/ScenariosStep.tsx` per FR-023
- [x] T039 [US3] Build the Scenario Comparison view in
      `src/components/ScenarioComparison.tsx` showing revenue/expenses/profitability/
      break-even month/runway/cash requirements per scenario per FR-024 (depends on T016,
      T017, T037)
- [x] T040 [US3] Surface each scenario's underlying assumption differences (not an opaque
      system-assigned label) in the comparison view per FR-023 acceptance scenario 3
      (depends on T039)
- [x] T041 [US3] Add a scenario-overlay mode to the dashboard charts (T029–T031) showing
      differences between scenarios per FR-029

**Checkpoint**: User Stories 1–3 all independently functional.

---

## Phase 6: User Story 4 - Investor Summary (Priority: P4)

**Goal**: Generate a downloadable investor-readable summary that distinguishes facts,
assumptions, calculated results, and projections.

**Independent Test**: Generate a summary from a completed model and verify every figure in it
is traceable to the underlying model's inputs and formulas, and that facts, assumptions,
calculated results, and projections are each distinguishable.

### Tests for User Story 4 ⚠️ Write first; confirm they FAIL before implementing T044–T046

- [x] T042 [P] [US4] Unit test: `generateInvestorSummaryDocument()` output content is tagged
      fact/assumption/calculated_result/projection per data-model.md's InvestorSummary
      section and contracts/investor-summary-export.md, in
      `tests/unit/investorSummary.test.ts`
- [x] T043 [US4] Playwright E2E test: generate and download the Investor Summary with no
      network requests observed, and confirm the disclaimer text is present, in
      `tests/e2e/investorSummary.spec.ts`

### Implementation for User Story 4

- [x] T044 [US4] Implement `generateInvestorSummaryDocument()` client-side PDF generation in
      `src/export/investorSummaryPdf.ts` per contracts/investor-summary-export.md (no
      network call; figures equal the on-screen dashboard exactly) (depends on T016, T017)
- [x] T045 [P] [US4] Build the Investor Summary preview page in
      `src/pages/InvestorSummaryStep.tsx` with fact/assumption/result/projection sections and
      the disclaimer per FR-032–033
- [x] T046 [US4] Wire the "Download" action to `generateInvestorSummaryDocument()` per
      FR-046 (depends on T044, T045)

**Checkpoint**: User Stories 1–4 all independently functional.

---

## Phase 7: User Story 5 - Sensitivity Analysis (Priority: P5)

**Goal**: Vary one assumption and see its effect on break-even/profitability/runway/cash
requirements.

**Independent Test**: Vary one assumption across a small range while holding others constant,
and verify the reported effect matches the direction and relative magnitude implied by the
underlying formulas.

### Tests for User Story 5 ⚠️ Write first; confirm they FAIL before implementing T049–T050

- [x] T047 [P] [US5] Unit test: `computeSensitivity()` results equal repeated
      `computeMonthlyProjection()`/`computeBreakEven()` calls on modified scenario copies
      (never an independent formula) in `tests/unit/sensitivity.test.ts`
- [x] T048 [US5] Playwright E2E test: vary price and confirm the effect on break-even
      month/runway is presented as a calculated effect, not an editable independent input,
      in `tests/e2e/sensitivity.spec.ts`

### Implementation for User Story 5

- [x] T049 [US5] Implement `computeSensitivity()` in `src/domain/sensitivity.ts` per
      contracts/calculation-engine.md (depends on T016, T017)
- [x] T050 [US5] Build the Sensitivity Analysis UI in `src/pages/SensitivityStep.tsx` (select
      assumption, specify candidate values, show effect on break-even/profitability/runway/
      cash) per FR-025 (depends on T049)

**Checkpoint**: All 5 user stories independently functional — full MVP scope complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T051 [P] Accessibility audit (keyboard navigation, focus states, contrast, semantic
      labels) across all guided-flow steps per FR-041, constitution Principle XV
- [ ] T052 [P] Responsive/mobile layout pass across all pages/components per constitution
      Principle XVI
- [ ] T053 [P] Add plain-language explanations/tooltips for gross margin, burn rate, runway,
      contribution margin, break-even, and operating profit per FR-044
- [ ] T054 Rounding/precision consistency pass: 2-decimal display, full-precision internal
      calculations per FR-037
- [ ] T055 [P] Privacy/security pass: confirm no financial figures appear in logs, analytics
      events, error messages, or browser console per FR-038–040
- [ ] T056 [P] README: document how to run, test, and build the app
- [ ] T057 Run the full quickstart.md validation pass (all reference cases plus the manual
      acceptance walkthrough for User Stories 1–5) end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phase 3–7)**: All depend on Foundational phase completion.
  - Each story can proceed in parallel (if staffed) or sequentially in priority order
    (P1 → P2 → P3 → P4 → P5).
  - US2, US3, US4 each depend on the calculation engine (T016, T017) from US1's
    implementation, but not on US1's UI — they are independently *testable* once the engine
    exists, per each story's Independent Test above.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### Within Each User Story

- Tests MUST be written and FAIL before implementation (constitution Principle VII, TDD).
- Domain/calculation logic before UI components that consume it.
- Story complete and checkpointed before moving to the next priority.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- T008–T011 (Foundational) can all run in parallel once T007 is complete.
- Within User Story 1: T012–T014 (tests) in parallel; T018–T021 (input steps) in parallel
  once T007 is complete.
- Within User Story 2: T028–T031 (dashboard components) in parallel.
- Once Foundational and the calculation engine (T016–T017) are complete, US2, US3, US4, and
  US5 implementation can proceed in parallel by different contributors.

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit tests for computeMonthlyProjection() in tests/unit/projection.test.ts"
Task: "Unit tests for computeBreakEven() in tests/unit/breakEven.test.ts"
Task: "Unit tests for validateInputs() in tests/unit/validation.test.ts"

# Once T007 is complete, launch all four input-step components together:
Task: "Build Business Setup step in src/pages/BusinessSetupStep.tsx"
Task: "Build Revenue Stream step in src/pages/RevenueStep.tsx"
Task: "Build Cost Item step in src/pages/ExpensesStep.tsx"
Task: "Build Funding step in src/pages/FundingStep.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (blocks all stories).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run `tests/unit/projection.test.ts` and
   `tests/unit/breakEven.test.ts` against the quickstart.md canonical reference case; run
   `tests/e2e/coreModel.spec.ts`.
5. Demo: a founder can already answer "when do we break even?" — the product's core value
   hypothesis — with just US1.

### Incremental Delivery

1. Setup + Foundational → foundation ready.
2. Add User Story 1 → validate independently → demo (MVP).
3. Add User Story 2 → validate independently → demo (adds the investor-facing visual layer).
4. Add User Story 3 → validate independently → demo (adds "what if" stress-testing).
5. Add User Story 4 → validate independently → demo (adds the shareable investor deliverable).
6. Add User Story 5 → validate independently → demo (adds sensitivity insight).
7. Phase 8: Polish (accessibility, responsiveness, security/privacy pass, full quickstart.md
   validation) before calling the feature release-ready per constitution Principle XXI
   (Definition of Done).

### Parallel Team Strategy

With multiple contributors: complete Setup + Foundational together first (T007's types are a
hard prerequisite for everything else). Once the calculation engine (T016–T017) lands from
User Story 1, US2–US5 can be staffed and built in parallel, since each has an independent test
that does not require the others' UI to exist.

---

## Notes

- [P] tasks touch different files and have no dependency on an incomplete task.
- [Story] label maps each task to its user story for traceability back to spec.md.
- Every calculation task must satisfy constitution Principle X (Financial Calculation
  Correctness and Investor Trust) — no formula ships without its quickstart.md reference case
  passing first.
- Commit after each task or logical group; stop at any checkpoint to validate a story
  independently before continuing.
