# Contract: Investor Summary Export

Defines what the downloadable Investor Summary file (FR-046) contains and guarantees, entirely
generated client-side (no network call, no server involvement — research.md §1, §6).

```text
generateInvestorSummaryDocument(
  businessProfile: BusinessProfile,
  scenario: Scenario,
  projection: MonthlyProjection[],
  breakEven: BreakEvenResult
) → File (downloadable PDF)
```

## Content requirements (FR-032, FR-033)

The generated document MUST include, each visibly tagged by category per data-model.md's
InvestorSummary section:

- **Facts**: business name, business model type, currency, projection period.
- **Assumptions**: the revenue, cost, and funding inputs driving the scenario.
- **Calculated results**: operating and cumulative break-even month (or explicit "not reached
  within the projection period" per FR-019), current gross margin, runway.
- **Projections**: the forward-looking revenue/profitability trajectory.
- **Disclaimer** (FR-033, constitution Principle X): a visible statement that the document is a
  projection based on founder-supplied assumptions, not an audited financial statement, a
  guarantee of results, or financial/investment advice.

## Non-functional requirements

- MUST be generated and downloadable without any network request (no assumption or figure
  leaves the browser as part of export, per FR-039).
- MUST NOT silently omit the break-even result when it is `null` (not reached) — the "not
  reached within the selected period" state (FR-019) MUST appear in the document exactly as it
  appears in the app.
- Every numeric value in the document MUST equal the corresponding value from
  `computeMonthlyProjection`/`computeBreakEven` (contracts/calculation-engine.md) — the export
  path MUST NOT recompute or round differently than the on-screen dashboard.
