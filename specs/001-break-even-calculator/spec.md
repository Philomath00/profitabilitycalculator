# Feature Specification: Startup Profitability & Break-Even Calculator

**Feature Branch**: `001-break-even-calculator`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "Build a Startup Profitability & Break-Even Calculator: a
decision-support and investor-readiness product that enables startup founders to model their
business economics, understand when the company can reach break-even and profitability, test
alternative assumptions, and present the resulting financial trajectory visually to investors
and other stakeholders." (Full 29-section product brief supplied by the user; summarized and
structured below per the project constitution, in particular Principle X, Financial Calculation
Correctness and Investor Trust.)

## Clarifications

### Session 2026-09-24

- Q: Does this feature require user accounts with login, so a founder's model is saved and
  retrievable across visits, or is a single working session (no login, data held only for that
  session) enough for this feature? → A: No logins; founders can download the analysis to
  retain or share it. This also resolves the investor-delivery-mechanism question: the Investor
  Summary is shared as a downloadable export, not an authenticated link or in-app-only view.
- Q: Should profit, gross margin, and break-even be calculated on a pre-tax/operating basis
  only, or does the model need to account for estimated taxes? → A: Pre-tax/operating basis
  only; taxes are explicitly out of scope for this feature.
- Q: After a founder changes an assumption, how quickly must the projection, break-even result,
  and charts update? → A: ≤ 1 second.
- Q: Convergence audit (T064) found the implemented guided flow has no standalone "Growth
  Assumptions" step as FR-043 originally named — growth rate/churn are captured within the
  Revenue step instead, and Dashboard/Sensitivity exist as their own steps that FR-043 didn't
  name. Should the flow be restructured to add that step, or should FR-043 be amended to match
  the shipped flow? → A: Amend FR-043. Growth rate and churn only ever apply alongside the
  revenue stream they modify; splitting them into a separate step would fragment the form
  without adding capability.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a Break-Even & Profitability Model (Priority: P1)

A founder defines their business (name, business model, currency, projection period),
enters their revenue assumptions (pricing, customer/volume growth, revenue streams) and cost
assumptions (fixed, variable, one-time, growth costs), and enters their current cash position
and funding. The system produces a month-by-month financial projection and tells the founder,
in plain language, whether and when the business reaches operating break-even and cumulative
break-even.

**Why this priority**: This is the foundational capability every other capability depends on.
Without a correct financial model, dashboards, scenarios and investor summaries have nothing
trustworthy to display. It is also independently valuable on its own: a founder who only ever
sees a monthly table of revenue/expenses/profit/cash and a break-even answer has already
answered the product's core question.

**Independent Test**: Can be fully tested by entering a single set of business, revenue, cost
and funding assumptions and verifying that the monthly projection table and the break-even
determination (operating and cumulative) are mathematically correct for known, hand-calculated
inputs — without any dashboard, scenario, or export functionality existing yet.

**Acceptance Scenarios**:

1. **Given** a new project, **When** the founder enters starting cash of $100,000, current
   monthly revenue of $10,000, monthly revenue growth of 10%, fixed monthly expenses of
   $20,000, and variable expenses of 20% of revenue, **Then** the system produces a month-by-
   month projection (revenue, expenses, profit/loss, cash balance, cumulative profit/loss) and
   reports the month in which monthly operating revenue first covers that month's operating
   expenses, and separately the month in which cumulative profit first recovers all prior
   accumulated losses.
2. **Given** the projection from Scenario 1, **When** the founder changes monthly revenue
   growth from 10% to 5%, **Then** the entire projection, the break-even determination, the
   cash position, and the runway recalculate and reflect the new assumption without the founder
   re-entering any other value.
3. **Given** a business whose assumptions never produce revenue exceeding expenses within the
   selected projection period, **When** the projection is generated, **Then** the system states
   explicitly that break-even is not reached within the selected period, rather than displaying
   a fabricated or extrapolated date.
4. **Given** a founder editing cost or revenue inputs, **When** an input is invalid (e.g. a
   negative price, a percentage outside 0-100% where only a rate is meaningful, a malformed
   number, or a missing required field), **Then** the system rejects or clearly flags the input
   before it affects the projection, and does not silently produce a distorted or NaN/Infinity
   result.

---

### User Story 2 - Investor-Ready Visual Dashboard (Priority: P2)

A founder opens a visual dashboard summarizing the model built in User Story 1: headline
metrics (revenue, gross margin, monthly burn, runway, break-even month, funding requirement,
projected profitability) and charts showing revenue vs. expenses, profitability over time, and
cash position/runway, with the break-even point visually highlighted.

**Why this priority**: Founders and investors both need to absorb the financial story quickly;
a table alone does not deliver the "present this to investors" value the product exists for.
This depends on User Story 1's model but delivers a distinct, demonstrable capability (a
visual, presentation-ready view) on top of it.

**Independent Test**: Can be tested by taking a completed model (from User Story 1) and
verifying the dashboard's headline metrics and charts match the underlying monthly projection
exactly, and that the break-even point is visually identifiable on the relevant chart(s).

**Acceptance Scenarios**:

1. **Given** a completed financial model, **When** the founder opens the dashboard, **Then**
   the headline metrics shown (revenue, gross margin, monthly burn, runway, break-even month,
   funding requirement, projected profitability) match the values computed from the underlying
   monthly projection.
2. **Given** a completed financial model with a determinable break-even month, **When** the
   founder views the revenue-vs-expenses or profitability chart, **Then** the point or period
   at which revenue crosses expenses (break-even) is visually distinguishable from the rest of
   the trajectory.
3. **Given** a model whose break-even is not reached within the projection period, **When** the
   founder views the dashboard, **Then** the dashboard communicates this explicitly rather than
   omitting the break-even metric silently or showing a misleading value.

---

### User Story 3 - Scenario Comparison (Priority: P3)

A founder creates multiple scenarios (at minimum Conservative, Base Case, and Optimistic) by
adjusting assumptions such as growth rate or costs, and compares them side by side across key
metrics: revenue, expenses, profitability, break-even month, runway, and cash requirements.

**Why this priority**: Investors expect founders to have stress-tested their assumptions, and
"what if growth is slower" is one of the core questions this product exists to answer (see
Product Problem). It builds directly on User Story 1's model (each scenario is a variant of it)
and is independently demonstrable as a comparison view.

**Independent Test**: Can be tested by creating three scenarios that differ only in growth rate
or a cost assumption, and verifying that each scenario's computed metrics differ in the
mathematically expected direction and that the comparison view displays all three accurately.

**Acceptance Scenarios**:

1. **Given** a base-case model, **When** the founder creates a Conservative variant with a
   lower growth rate, **Then** the Conservative scenario's break-even month is the same as or
   later than the Base Case's, consistent with the changed assumption.
2. **Given** three named scenarios, **When** the founder opens the comparison view, **Then**
   revenue, expenses, profitability, break-even month, runway, and cash requirements are shown
   for all three scenarios in a way that makes differences identifiable without recomputation
   by the founder.
3. **Given** a scenario comparison, **When** the founder inspects what makes one scenario
   "conservative" or "optimistic", **Then** the underlying assumption differences are visible
   rather than being an opaque system-assigned label.

---

### User Story 4 - Investor Summary (Priority: P4)

A founder generates an investor-readable summary of the model: business model, revenue and cost
assumptions, projected break-even period, capital requirements, runway, projected profitability,
key assumptions, and major financial risks — with facts, assumptions, calculated results, and
projections clearly distinguished from one another.

**Why this priority**: This is the culmination of the product's stated purpose ("present the
resulting financial trajectory... to investors") but depends on both the model (User Story 1)
and the visual presentation (User Story 2) already existing to summarize.

**Independent Test**: Can be tested by generating a summary from a completed model and verifying
that every figure in the summary is traceable to the underlying model's inputs and formulas, and
that facts, assumptions, calculated results, and projections are each visually or structurally
distinguishable from one another in the output.

**Acceptance Scenarios**:

1. **Given** a completed model, **When** the founder generates the investor summary, **Then**
   the summary includes business model, revenue assumptions, major cost assumptions, expected
   break-even period, capital requirements, runway, projected profitability, key assumptions,
   and major financial risks.
2. **Given** a generated investor summary, **When** an investor reads it, **Then** they can
   distinguish which statements are facts the founder entered, which are assumptions driving
   the model, which are calculated results, and which are forward-looking projections.
3. **Given** a generated investor summary, **When** it is viewed by anyone, **Then** it visibly
   discloses that projections are based on founder-supplied assumptions and are not guarantees,
   audited financials, or financial/investment advice.

---

### User Story 5 - Sensitivity Analysis (Priority: P5)

A founder selects an assumption (e.g. price, growth rate, churn, a cost) and sees how changing
it affects break-even, profitability, runway, and cash requirements, helping identify which
assumptions matter most.

**Why this priority**: This is a natural extension of scenario comparison (User Story 3) that
deepens understanding of the model, but a founder can already get substantial value from the
model, dashboard, scenarios, and summary without it — so it is the first capability that could
be deferred if MVP scope needs to shrink further.

**Independent Test**: Can be tested by varying one assumption across a small range while holding
others constant and verifying that the reported effect on break-even/profitability/runway/cash
requirements matches the direction and relative magnitude implied by the underlying formulas.

**Acceptance Scenarios**:

1. **Given** a completed model, **When** the founder selects an assumption (e.g. price) and
   specifies alternative values, **Then** the system shows the resulting effect on break-even
   month, profitability, runway, and cash requirements for each value.
2. **Given** a sensitivity result, **When** the founder reviews it, **Then** it is visibly
   presented as a calculated effect of changing an assumption, not as an additional independent
   assumption or fact.

---

### Edge Cases

- What happens when a business has zero revenue for part or all of the projection period?
- What happens when fixed costs are zero (e.g. a very lean solo-founder model)?
- What happens when contribution margin is zero or negative (variable costs equal or exceed
  price), making a unit-based break-even undefined? The system must not divide by zero or
  produce NaN/Infinity; it must state that unit break-even is undefined under these assumptions.
- What happens when revenue growth is negative (a declining business)?
- What happens when a business never reaches break-even within the longest selectable
  projection period (60 months)?
- What happens when a business breaks even on a monthly operating basis but has not yet
  recovered its accumulated historical losses (operating break-even vs. cumulative break-even
  diverge)?
- What happens when additional funding is added partway through the projection period? Cash
  position must reflect it, but it must not be counted as operating revenue in profitability or
  break-even calculations.
- What happens when a founder defines multiple revenue streams with different growth rates or
  starting points?
- What happens when a founder changes the projection period (e.g. from 12 to 60 months) after a
  model already exists? The full projection, break-even determination, and dependent views must
  recalculate consistently.
- What happens when inputs are contradictory (e.g. variable costs alone exceed 100% of revenue,
  or a percentage field is given a value outside a valid range)?
- What happens when currency amounts accumulate rounding error over a 60-month projection? The
  displayed figures must remain consistent with the documented rounding/precision rule
  (Assumptions) rather than drifting.
- What happens when a founder deletes or edits a cost/revenue item that existing scenarios
  depend on?
- What happens when a founder closes the browser tab, navigates away, or the session otherwise
  ends before they have downloaded their analysis? Since no account/login persists the model
  server-side, work-in-progress must not be silently lost without warning.

## Requirements *(mandatory)*

### Functional Requirements — Business Setup

- **FR-001**: System MUST allow a founder to define a business profile including business/
  startup name, industry or sector, business model, primary currency, projection start date,
  and projection period.
- **FR-002**: System MUST support common startup business models (at minimum SaaS/subscription,
  marketplace, e-commerce, service business, transactional business, product business) without
  forcing every business model to use an identical revenue structure.
- **FR-003**: System MUST allow the founder to select a projection period from at least 12, 24,
  36, and 60 months.

### Functional Requirements — Revenue Modeling

- **FR-004**: System MUST allow a founder to define one or more revenue streams using inputs
  appropriate to their business model (e.g. selling price, subscription price, number of
  customers, units sold, transactions, average order value, monthly/annual recurring revenue,
  commission/take rate).
- **FR-005**: System MUST allow revenue-driving assumptions (e.g. customer count, growth rate,
  churn) to change over the course of the projection rather than requiring a single constant
  monthly figure.
- **FR-006**: System MUST allow a founder to model customer or revenue growth over time (e.g.
  a starting value and a period-over-period growth rate, or explicit period-by-period values).
- **FR-007**: System MUST support multiple concurrent revenue streams within a single model.

### Functional Requirements — Cost Modeling

- **FR-008**: System MUST allow a founder to record costs under at minimum the following
  categories: Fixed Costs, Variable Costs, Startup/One-Time Costs, and Growth Costs.
- **FR-009**: System MUST allow a founder to create custom cost categories or line items beyond
  the predefined examples.
- **FR-010**: System MUST treat variable costs as a function of revenue or volume, and fixed
  costs as independent of revenue or volume, when computing projections.

### Functional Requirements — Funding & Capital

- **FR-011**: System MUST allow a founder to record cash and funding inputs, including founder
  capital, investment, grants, loans, and prior or planned future funding.
- **FR-012**: System MUST exclude funding/financing inflows from operating revenue when
  computing profitability, gross margin, and break-even, while still reflecting funding in cash
  position and runway.

### Functional Requirements — Financial Calculations

- **FR-013**: System MUST compute, for each period of the projection: revenue, fixed costs,
  variable costs, total operating expenses, gross profit, gross margin, operating profit/loss,
  net cash flow, and cumulative cash position.
- **FR-014**: System MUST compute burn rate and runway (time until cash position reaches zero
  at the current or projected burn rate) for each relevant period.
- **FR-015**: System MUST compute contribution margin and, where unit economics are available,
  break-even volume (units/customers) using contribution margin.
- **FR-016**: All financial calculations MUST be deterministic and reproducible: identical
  inputs MUST always produce identical outputs, and every output MUST be attributable to a
  documented formula and the specific inputs that produced it (see constitution Principle X).
- **FR-017**: System MUST document, in terms accessible to a non-financial founder, the precise
  definition of every calculated metric it presents (e.g. gross margin, burn rate, runway,
  contribution margin, operating profit, cumulative profitability) and apply each definition
  consistently throughout the product.
- **FR-047**: All profit, margin, and break-even calculations in this feature MUST be computed
  on a pre-tax/operating basis; estimated or actual taxes MUST NOT be modeled or subtracted in
  this feature. Any product surface presenting these figures (dashboard, scenarios, investor
  summary) MUST label them consistently as pre-tax/operating figures.

### Functional Requirements — Break-Even Analysis

- **FR-018**: System MUST determine and clearly distinguish two forms of break-even: (a)
  monthly operating break-even — the first period in which that period's operating revenue
  covers that period's operating expenses — and (b) cumulative break-even — the first period in
  which cumulative profit has recovered all previously accumulated losses (including applicable
  startup costs).
- **FR-019**: System MUST NOT report a numeric break-even date when break-even is not reached
  within the selected projection period; instead it MUST state explicitly that break-even is
  not reached within that period.
- **FR-020**: System MUST avoid divide-by-zero, NaN, and Infinity results in break-even and
  related calculations (e.g. when contribution margin is zero), and MUST instead communicate
  that the affected metric is undefined under the current assumptions.

### Functional Requirements — Time-Based Projection

- **FR-021**: System MUST generate a month-by-month projection for the selected period, showing
  at minimum revenue, expenses, profit/loss, cash balance, and cumulative profit/loss per month.
- **FR-022**: System MUST derive annual summaries from the underlying monthly model rather than
  computing them independently, so that monthly and annual views never disagree.

### Functional Requirements — Scenario & Sensitivity Analysis

- **FR-023**: System MUST allow a founder to create and name multiple scenarios (at minimum
  Conservative, Base Case, and Optimistic) as founder-defined sets of assumptions — the system
  MUST NOT algorithmically decide what counts as "optimistic" or "conservative" on the founder's
  behalf.
- **FR-024**: System MUST allow scenarios to be compared side by side across revenue, expenses,
  profitability, break-even month, runway, and cash requirements.
- **FR-025**: System MUST allow a founder to vary a selected assumption (e.g. price, growth
  rate, churn, customer acquisition cost, gross margin, payroll, marketing spend, variable
  costs) and view the resulting effect on break-even, profitability, runway, and cash
  requirements, presented as a calculated effect rather than an independent input.

### Functional Requirements — Investor Dashboard & Visualization

- **FR-026**: System MUST provide a dashboard summarizing headline metrics: revenue, gross
  margin, monthly burn, runway, break-even month, funding requirement, and projected
  profitability, prioritizing decision-relevant information over displaying every available
  metric.
- **FR-027**: System MUST visualize revenue vs. expenses over time, showing where/when revenue
  crosses expenses.
- **FR-028**: System MUST visualize profitability over time (monthly profit/loss and
  progression toward profitability) and cash position/runway over time.
- **FR-029**: System MUST visualize differences between scenarios when more than one scenario
  exists.
- **FR-030**: System MUST make the break-even point visually prominent and immediately
  identifiable within the relevant chart(s), and MUST NOT hide the assumptions underlying the
  visualization from the founder.
- **FR-031**: All visualizations MUST use honest, non-distorting scales and clear labels, and
  MUST NOT rely on color alone to convey financial meaning (see also FR-041, Accessibility).

### Functional Requirements — Investor Summary & Assumption Transparency

- **FR-032**: System MUST generate an investor-readable summary covering business model,
  revenue assumptions, major cost assumptions, expected revenue trajectory, expected break-even
  period, capital requirements, runway, projected profitability, key assumptions, and major
  financial risks.
- **FR-033**: The investor summary MUST visually or structurally distinguish facts, assumptions,
  calculated results, and projections from one another, and MUST NOT present projections as
  guaranteed or factual future performance.
- **FR-034**: Every calculated result presented anywhere in the product MUST be traceable back
  to the specific assumptions and formula that produced it, and changing an assumption MUST
  automatically recalculate every output that depends on it within 1 second (see SC-005).

### Functional Requirements — Input Validation

- **FR-035**: System MUST validate financial inputs and reject or clearly flag malformed
  numbers, impossible percentages, invalid dates, invalid projection periods, contradictory
  assumptions, and missing required inputs before they affect a projection.
- **FR-036**: System MUST handle zero and negative input values intentionally (with defined,
  documented behavior) rather than allowing them to produce accidental calculation failures.
- **FR-037**: System MUST apply consistent, documented currency precision/rounding rules and
  MUST NOT allow silent rounding drift to change a break-even or profitability determination.

### Functional Requirements — Data Persistence & Export

- **FR-045**: System MUST NOT require a user account or login to create, edit, or view a
  financial model; all modeling functionality MUST be usable entirely within the founder's
  current working session.
- **FR-046**: System MUST allow a founder to download their analysis — at minimum the Investor
  Summary — as an exportable file, so it can be retained or shared with investors outside the
  application without the founder or the recipient needing an account or login.
- **FR-048**: System MUST warn the founder before any action within its control that would
  discard unsaved, undownloaded model data (e.g., closing or resetting the working session),
  giving the founder the opportunity to download first.

### Functional Requirements — Privacy & Security

- **FR-038**: System MUST apply data minimization: it MUST NOT collect personal or business
  information beyond what is necessary for the modeling functionality described in this
  specification.
- **FR-039**: System MUST NOT expose financial assumptions or figures through public URLs,
  application logs, analytics events, error messages, browser console output, or client-side
  secrets.
- **FR-040**: System MUST NOT send confidential financial values to third-party analytics
  services; analytics events (e.g. project created, projection generated, scenario created,
  scenario compared, break-even calculated, investor view opened, report generated) MUST
  measure product usage, not carry the underlying financial figures.

### Functional Requirements — Accessibility & UX

- **FR-041**: All critical workflows (business setup through investor view) MUST be usable via
  keyboard navigation, with accessible form controls, visible focus states, sufficient contrast,
  and semantic labeling.
- **FR-042**: Every chart MUST have a numerical/tabular alternative available, so financial
  meaning is not communicated through visualization alone.
- **FR-043**: System MUST present a guided, step-based flow (business → revenue → expenses →
  funding → projection → break-even → dashboard → scenarios → sensitivity → investor view) and
  MUST allow the founder to return to any prior step, change values, and see the model update.
  Growth rate and churn are captured as part of each revenue stream within the Revenue step,
  not as a separate step — they only ever apply alongside the revenue stream they modify, so a
  dedicated step would split a field from the input it belongs to without adding capability
  (amended 2026-09-24, see Clarifications).
- **FR-044**: System MUST provide plain-language explanations of financial terminology (e.g.
  gross margin, burn rate, runway, contribution margin, break-even, operating profit) accessible
  to founders without a financial modeling background, while still allowing advanced users to
  inspect the underlying assumptions and calculations.

### Key Entities *(include if feature involves data)*

- **Business Profile**: Represents the startup being modeled — name, industry/sector, business
  model type, primary currency, projection start date, and selected projection period. One
  Business Profile is the root of one financial model.
- **Revenue Stream**: A distinct way the business earns money (e.g. subscriptions, unit sales,
  transactions), with its own pricing/volume inputs and growth assumptions over time. A
  Business Profile may have one or more Revenue Streams.
- **Cost Item**: A single cost entry belonging to one of the categories Fixed, Variable,
  Startup/One-Time, or Growth (or a founder-defined custom category), with the inputs needed to
  compute its contribution to each period's expenses.
- **Funding Source**: A cash inflow that is financing rather than operating revenue (founder
  capital, investment, grant, loan, planned future funding), with an amount and timing.
- **Scenario**: A named, founder-defined variant of a model's assumptions (e.g. Conservative,
  Base Case, Optimistic, or custom), used to generate an independent projection and break-even
  result for comparison against other scenarios of the same Business Profile.
- **Monthly Projection**: The derived, period-by-period output (revenue, expenses, profit/loss,
  cash balance, cumulative profit/loss, and related metrics) computed for a given Business
  Profile and Scenario. Always derived — never independently entered.
- **Break-Even Result**: The derived determination of operating break-even and cumulative
  break-even (a period, or an explicit "not reached within period" state) for a given Scenario.
- **Investor Summary**: A derived, presentation-oriented view of a Scenario's model that
  separates facts, assumptions, calculated results, and projections for an external audience,
  and can be downloaded as an exportable file (see FR-046).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A founder with no prior financial modeling experience can complete a business
  profile, revenue assumptions, cost assumptions, and funding inputs, and view a projected
  break-even result, in under 10 minutes.
- **SC-002**: 100% of the product's financial calculations can be independently verified against
  hand-calculated reference cases derived from their documented formulas (see constitution
  Principle X); any discrepancy is treated as a release-blocking defect.
- **SC-003**: In 100% of cases where break-even is not reachable within the selected projection
  period, the system communicates this explicitly rather than displaying a numeric break-even
  date.
- **SC-004**: A founder can create three scenarios (Conservative, Base Case, Optimistic) and
  identify which one reaches break-even soonest without performing any calculation themselves.
- **SC-005**: Changing any single assumption updates every dependent output (projection,
  break-even result, charts, investor summary) within 1 second, without the founder taking any
  action beyond confirming the change.
- **SC-006**: A reader unfamiliar with the product can, from the investor summary alone,
  correctly classify a given statement as a fact, an assumption, a calculated result, or a
  projection, verified via usability review.
- **SC-007**: Every primary workflow, from business setup through investor view, is completable
  using keyboard navigation alone and meets WCAG 2.1 AA contrast requirements.
- **SC-008**: Zero instances of divide-by-zero, NaN, or Infinity values are surfaced to a user
  across the documented edge cases (zero revenue, zero fixed costs, zero/negative contribution
  margin, negative growth).

## Assumptions

- Each project/model uses a single primary currency for all figures; multi-currency input or
  live foreign-exchange conversion is out of scope for this feature.
- The monthly period is the base unit of calculation; annual and other period summaries are
  always derived by aggregating monthly figures, never computed independently.
- "Growth Costs" (e.g. marketing, sales, additional hires, scaling infrastructure) are modeled
  using the same Fixed/Variable cost mechanics as other categories — no separate calculation
  method is required for this feature.
- Scenario definitions (Conservative/Base Case/Optimistic, or custom-named scenarios) are
  entirely founder-authored assumption sets; the system provides the comparison mechanism but
  does not generate or infer scenario assumptions on the founder's behalf.
- Displayed currency values are rounded to two decimal places for presentation; underlying
  calculations retain full precision internally to avoid cumulative rounding drift across long
  (up to 60-month) projections.
- This feature covers a single-founder-authored model at a time; concurrent, simultaneous
  multi-editor collaboration on the same model is not required for this feature. No user
  accounts or login exist in this feature — a model lives only in the founder's working session
  and must be downloaded to be retained or shared (see Clarifications).
- Full accounting, bookkeeping, bank synchronization, tax filing, payroll processing, invoicing,
  cap-table management, investor CRM, fundraising marketplace features, AI-generated investment
  recommendations, and automatic business valuations are out of scope for this feature and are
  noted as potential future capabilities, not silently included.
