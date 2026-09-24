# Phase 1 Data Model: Startup Profitability & Break-Even Calculator

All entities below exist only in in-memory application state for the duration of the browser
session (no backend, no persistent storage — see plan.md, research.md §1). Types are TypeScript
shapes, not a database schema. "Derived" entities are never independently entered; they are
always computed from the entities that precede them.

## BusinessProfile

The root of one financial model. Corresponds to spec.md's Business Profile entity and FR-001–003.

| Field | Type | Rules |
|---|---|---|
| `id` | string (client-generated) | Required, unique within the session |
| `name` | string | Required, 1–200 characters |
| `industry` | string | Optional free text (FR-002: must not force a single revenue structure) |
| `businessModelType` | enum: `saas_subscription`, `marketplace`, `ecommerce`, `service`, `transactional`, `product`, `hybrid`, `other` | Required |
| `currency` | string (ISO 4217 code, e.g. `USD`) | Required; single currency for the whole model (spec Assumptions) |
| `projectionStartDate` | date | Required |
| `projectionPeriodMonths` | integer, one of `12`, `24`, `36`, `60` | Required (FR-003) |
| `startingCash` | number ≥ 0 | Required; cash position at the start of the projection |

## RevenueStream

A distinct way the business earns money. One BusinessProfile has 1..N Revenue Streams
(FR-004, FR-007). Belongs to a Scenario (see below), not directly to the BusinessProfile — each
Scenario owns its own full set of Revenue Streams.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique within the scenario |
| `name` | string | Required |
| `type` | enum: `subscription`, `unit_sale`, `transaction_commission`, `custom` | Required |
| `startingValue` | number ≥ 0 | Starting customers/units/MRR, meaning depends on `type` |
| `pricePerUnit` | number ≥ 0 \| null | Required unless `type = transaction_commission` |
| `growthRatePercentPerMonth` | number | May be negative (declining business, edge case); default `0` |
| `churnRatePercent` | number, 0–100 | Optional, default `0` |
| `commissionRatePercent` | number, 0–100 | Required when `type = transaction_commission`, else `null` |

**Validation** (FR-035–036): `pricePerUnit` and `startingValue` MUST NOT be negative;
`churnRatePercent` and `commissionRatePercent` MUST be within `[0, 100]`; a missing required
field for the given `type` MUST be flagged before the stream contributes to a projection.

## CostItem

A single cost entry. One BusinessProfile/Scenario has 0..N Cost Items (FR-008–009).

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required, unique within the scenario |
| `name` | string | Required |
| `category` | enum: `fixed`, `variable`, `one_time_startup`, `growth`, `custom` | Required (FR-008) |
| `amount` | number ≥ 0 | Required |
| `variableBasis` | enum: `percent_of_revenue`, `per_unit` \| null | Required when `category = variable`, else `null` (FR-010) |
| `startMonth` | integer ≥ 1 | Default `1`; supports costs that begin later (e.g. a growth hire in month 6) |
| `endMonth` | integer ≥ `startMonth` \| null | `null` = continues through the end of the projection |

**Validation**: `amount` MUST NOT be negative; a `variable` category item MUST have a
`variableBasis`; if `variableBasis = percent_of_revenue`, the sum of all such percentages MUST
NOT exceed 100% for any revenue stream it applies to (contradictory-input edge case, FR-035).

## FundingSource

A cash inflow that is financing, not operating revenue (FR-011–012).

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required |
| `type` | enum: `founder_capital`, `investment`, `grant`, `loan`, `other` | Required |
| `amount` | number ≥ 0 | Required |
| `receivedMonth` | integer ≥ 1 | The projection month the cash lands (supports the "funding added partway through" edge case) |

**Note**: `startingCash` on BusinessProfile represents cash already on hand at projection start;
`FundingSource` entries represent additional funding events *during* the projection. Both affect
cash position; neither is ever counted as operating revenue (FR-012).

## Scenario

A named, founder-authored variant of the model (FR-023). Each Scenario owns its own complete
copies of RevenueStream, CostItem, and FundingSource collections — **not** a diff/override
against a "base" model. This is a deliberate simplicity choice: given the small scale in scope
(Technical Context: at minimum 3 scenarios, modest item counts), a full-copy model is easier to
reason about, test, and edit independently than a delta/inheritance system, per constitution
Architecture Principles (XI, avoid premature complexity). Creating a new scenario from an
existing one is a UI-level "duplicate, then edit" operation, not a distinct data-model concept.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required |
| `businessProfileId` | string (FK) | Required |
| `name` | string | Required (e.g. "Conservative", "Base Case", "Optimistic", or custom — FR-023) |
| `isBaseCase` | boolean | Exactly one Scenario per BusinessProfile SHOULD be marked base case for comparison purposes |
| `revenueStreams` | RevenueStream[] | 1..N |
| `costItems` | CostItem[] | 0..N |
| `fundingSources` | FundingSource[] | 0..N |

**Lifecycle**: No persisted state machine. A Scenario exists in session memory from creation
until the founder deletes it or the session ends (no draft/archived states in this feature).

## MonthlyProjection *(derived)*

Computed per Scenario by `computeMonthlyProjection()` (see
`contracts/calculation-engine.md`). One row per month, `1..projectionPeriodMonths`. Never
independently entered or edited (spec.md Key Entities).

| Field | Type | Formula source |
|---|---|---|
| `month` | integer | — |
| `revenue` | number | Sum of all RevenueStream contributions for this month (FR-013) |
| `fixedCosts` | number | Sum of applicable `fixed`-category CostItems (FR-013) |
| `variableCosts` | number | Sum of applicable `variable`-category CostItems, computed against `revenue` (FR-013) |
| `totalOperatingExpenses` | number | `fixedCosts + variableCosts` + applicable `growth`/`one_time_startup` items active this month |
| `grossProfit` | number | `revenue - variableCosts` |
| `grossMargin` | number \| null | `grossProfit / revenue`; `null` when `revenue = 0` (edge case, FR-020) |
| `operatingProfitLoss` | number | `revenue - totalOperatingExpenses` (pre-tax/operating basis, FR-047) |
| `netCashFlow` | number | `operatingProfitLoss` + any `FundingSource.amount` received this month |
| `cashBalance` | number | Previous month's `cashBalance` (or `startingCash` for month 1) + `netCashFlow` |
| `cumulativeProfitLoss` | number | Previous month's `cumulativeProfitLoss` + this month's `operatingProfitLoss` |
| `burnRate` | number \| null | `-netCashFlow` when negative, else `null` (not burning cash) |

## BreakEvenResult *(derived)*

Computed per Scenario by `computeBreakEven()`.

| Field | Type | Rules |
|---|---|---|
| `operatingBreakEvenMonth` | integer \| null | First month where `operatingProfitLoss >= 0`; `null` = not reached within the projection (FR-018–019) |
| `cumulativeBreakEvenMonth` | integer \| null | First month where `cumulativeProfitLoss >= 0`; `null` = not reached (FR-018–019) |
| `breakEvenUnits` | number \| null | Fixed costs ÷ contribution margin per unit; `null` when contribution margin ≤ 0 (undefined, FR-015/020) |

## InvestorSummary *(derived)*

Computed/rendered per Scenario for export (FR-032–034, FR-046). Not a stored entity — generated
on demand from BusinessProfile + Scenario + MonthlyProjection + BreakEvenResult.

| Section | Category tag (FR-033) | Source |
|---|---|---|
| Business model, currency, projection period | `fact` | BusinessProfile |
| Revenue/cost/funding assumptions | `assumption` | RevenueStream / CostItem / FundingSource |
| Break-even month(s), runway, current gross margin | `calculated_result` | BreakEvenResult / MonthlyProjection |
| Future revenue/profitability trajectory | `projection` | MonthlyProjection (future months) |
| Disclaimer | — | Static text (FR-033: not a guarantee, not audited, not advice) |

## Entity Relationship Summary

```text
BusinessProfile 1───N Scenario
Scenario 1───N RevenueStream
Scenario 1───N CostItem
Scenario 1───N FundingSource
Scenario 1───N MonthlyProjection   (derived)
Scenario 1───1 BreakEvenResult     (derived)
Scenario 1───1 InvestorSummary     (derived, on demand)
```
