# Contract: Calculation Engine

This is the one true interface boundary in a client-only architecture: pure, deterministic
functions between founder-entered assumptions (data-model.md) and every derived output the UI
displays. Isolating it this way exists specifically to satisfy constitution Principle X
(Financial Calculation Correctness and Investor Trust) — every function here MUST be unit-tested
against hand-calculated reference cases (see quickstart.md) before it is relied on by any UI
code.

All functions are pure: same input → same output, no side effects, no I/O. This is what makes
the ≤1 second recalculation target (SC-005) trivial and what makes each function independently
testable per constitution Principle VII (TDD).

## `computeMonthlyProjection`

```text
computeMonthlyProjection(
  businessProfile: BusinessProfile,
  scenario: Scenario
) → MonthlyProjection[]
```

- Returns exactly `businessProfile.projectionPeriodMonths` rows, ordered by `month` ascending.
- MUST NOT throw for any valid (per data-model.md validation rules) input, including the edge
  cases documented in spec.md: zero revenue, zero fixed costs, negative growth, multiple revenue
  streams, funding added partway through, changed projection period.
- MUST NOT produce `NaN` or `Infinity` in any field (FR-020); `grossMargin` is `null` instead of
  `NaN` when `revenue = 0`.
- Annual summaries (if displayed) MUST be derived by aggregating this function's monthly output,
  never computed independently (FR-022).

## `computeBreakEven`

```text
computeBreakEven(
  projection: MonthlyProjection[],
  scenario: Scenario
) → BreakEvenResult
```

- MUST return `operatingBreakEvenMonth: null` (not a fabricated or extrapolated month) when no
  row in `projection` has `operatingProfitLoss >= 0` (FR-019).
- MUST return `cumulativeBreakEvenMonth: null` under the equivalent condition for
  `cumulativeProfitLoss`.
- MUST return `breakEvenUnits: null` when the scenario's aggregate contribution margin per unit
  is `<= 0` (undefined unit economics, FR-015/FR-020) rather than dividing by zero.

## `computeSensitivity`

```text
computeSensitivity(
  businessProfile: BusinessProfile,
  scenario: Scenario,
  assumptionPath: string,      // e.g. "revenueStreams[0].growthRatePercentPerMonth"
  candidateValues: number[]
) → { value: number, projection: MonthlyProjection[], breakEven: BreakEvenResult }[]
```

- For each candidate value, returns the full recomputed projection and break-even result as if
  only that one assumption changed (FR-025) — implemented as repeated calls to
  `computeMonthlyProjection`/`computeBreakEven` against a modified copy of `scenario`, never as
  an independent formula, so it can never drift from the primary calculation path.

## `validateInputs`

```text
validateInputs(
  businessProfile: Partial<BusinessProfile>,
  scenario: Partial<Scenario>
) → { field: string, message: string }[]
```

- Returns an empty array when all data-model.md validation rules pass.
- Every entry MUST identify the specific field and a plain-language reason (FR-035), enforced
  before the offending data is passed to `computeMonthlyProjection`.
- MUST catch, at minimum: negative values where only non-negative is meaningful, percentages
  outside `[0, 100]` where a rate is meaningful, missing required fields for the given `type`/
  `category`, and `variable`-basis percentages summing above 100% against one revenue stream.

## Consumers

UI code (components/pages) MUST call these functions rather than reimplementing any formula
inline — this is what keeps FR-016/FR-034 (every output traceable to a documented formula,
recalculation triggered automatically) true by construction rather than by convention.
