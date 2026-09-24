# Quickstart: Validating the Break-Even Calculator

This guide proves the feature works end-to-end once implemented. It is a validation/run guide,
not an implementation spec — see `data-model.md` and `contracts/` for what to build, and (once
generated) `tasks.md` for how to build it.

## Prerequisites

- Node.js 20 LTS
- Dependencies installed (`npm install`, once `package.json` exists from implementation)

## Running the app locally

```bash
npm run dev
```

Opens the guided flow (FR-043: Business → Revenue → Expenses → Funding → Growth Assumptions →
Projection → Break-Even → Scenarios → Investor View) in the browser.

## Running the test suites

```bash
npm run test          # Vitest — calculation engine + component tests
npm run test:e2e       # Playwright — critical user journeys
```

## Canonical reference case (User Story 1, spec.md Acceptance Scenario 1)

This is the exact example from spec.md's core user journey. It is precise enough to be used
directly as a Vitest fixture for `computeMonthlyProjection`/`computeBreakEven`
(contracts/calculation-engine.md) — implement the calculation engine, feed it these inputs, and
confirm the outputs below match exactly (constitution Principle X requires this kind of
hand-calculated reference case before the formulas are trusted).

**Inputs**:

| Field | Value |
|---|---|
| Starting cash | $100,000 |
| Month 1 revenue | $10,000 |
| Monthly revenue growth | 10% |
| Fixed monthly expenses | $20,000 |
| Variable expenses | 20% of revenue |
| Projection period | 12+ months (need at least 18 to observe cumulative break-even) |

**Formulas** (per data-model.md / contracts/calculation-engine.md):

- `revenue(m) = 10000 × 1.1^(m-1)`
- `operatingProfitLoss(m) = revenue(m) × 0.8 − 20000`
- `cumulativeProfitLoss(m) = cumulativeProfitLoss(m-1) + operatingProfitLoss(m)`

**Expected outputs**:

| Month | Revenue | Operating Profit/Loss | Cumulative Profit/Loss |
|---|---|---|---|
| 1 | $10,000.00 | −$12,000.00 | −$12,000.00 |
| 5 | $14,641.00 | −$8,287.20 | −$51,159.20 |
| 10 | $23,579.48 | −$1,136.42 | −$72,500.60 (deepest deficit) |
| **11** | $25,937.42 | **+$749.94** | −$71,750.66 |
| 17 | $45,949.73 | +$16,759.78 | −$15,642.38 |
| **18** | $50,544.70 | +$20,435.76 | **+$4,793.39** |

- **Operating break-even month**: **11** — the first month `operatingProfitLoss >= 0`
  (FR-018a). Confirm the system does *not* report month 10 or earlier.
- **Cumulative break-even month**: **18** — the first month `cumulativeProfitLoss >= 0`
  (FR-018b). Confirm the system distinguishes this from the operating break-even month (User
  Story 1, Acceptance Scenario 1) rather than conflating the two.
- **Cash balance never reaches zero** in this scenario (minimum ≈ $100,000 − $72,500.60 =
  $27,499.40 around month 10), so runway should report as "not applicable / cash never
  depleted" rather than a false low number — a useful secondary check on the runway formula.

**Sensitivity check** (User Story 1, Acceptance Scenario 2): change monthly revenue growth from
10% to 5% and confirm operating break-even month moves later (slower growth reaches the $25,000
revenue break-even threshold later), and that the change is reflected without re-entering any
other input.

## "Never reaches break-even" case (Acceptance Scenario 3, Edge Cases)

**Inputs**: Fixed monthly expenses $20,000, variable expenses 20% of revenue, monthly revenue
growth **0%**, month 1 revenue $1,000, projection period 60 months.

Since `revenue(m) = 1000` for all `m`, `operatingProfitLoss(m) = 800 − 20000 = −19200` every
month — never non-negative.

**Expected outputs**:

- `operatingBreakEvenMonth`: `null`
- `cumulativeBreakEvenMonth`: `null`
- UI and Investor Summary MUST display "Break-even is not reached within the selected
  projection period" (FR-019) — confirm no numeric month, `NaN`, or `Infinity` is shown
  anywhere (FR-020, SC-008).

## Zero contribution margin case (Edge Cases, FR-020)

**Inputs**: A single revenue stream with `pricePerUnit = 10`, and a `variable` cost item with
`variableBasis = per_unit` costing `10` per unit (contribution margin per unit = $0).

**Expected output**: `breakEvenUnits: null` (undefined — not `Infinity`, not `NaN`, not a
divide-by-zero error). The UI MUST state that unit break-even is undefined under these
assumptions.

## Manual acceptance pass (maps to spec.md User Stories)

1. **US1**: Enter the canonical reference case above → verify the monthly table and both
   break-even months exactly match the table above.
2. **US2**: Open the dashboard → verify headline metrics match the underlying projection, and
   the break-even point is visually marked on the revenue-vs-expenses chart at month 11.
3. **US3**: Duplicate the base case into a "Conservative" scenario with 5% growth → verify its
   operating break-even month is later than 11, and the comparison view shows all three
   scenarios' metrics side by side.
4. **US4**: Generate the Investor Summary → verify it downloads without any network request,
   and that facts/assumptions/calculated-results/projections are visually distinguishable and
   the disclaimer is present.
5. **US5**: Run a sensitivity pass on price → verify the effect on break-even month is shown as
   a calculated effect, not an editable independent input.
