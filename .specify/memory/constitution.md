<!--
Sync Impact Report
- Version change: (new project instantiation) → 1.0.0
- Source: adapted from the personal "Digital Product Development Constitution" (speckit
  base repo) and specialized for this single project, the Profitability Calculator.
- Modified sections:
  - Title and Mission: narrowed from a general-purpose, multi-project mission to this
    product specifically (break-even / unit economics / investor-facing projections for
    startups).
  - Principle I (Privacy and Security by Design): added explicit treatment of startup
    financial inputs as sensitive business data.
  - Principle III (Problem-First Product Development): reframed around the founder/investor
    dual-audience problem this product solves.
  - Principle IV (Business Analysis Before Architecture): added the concrete customer
    segment and audience for this product.
  - Principle XIV (Data Visualization Standards, renumbered from XIII): cross-referenced
    from the new financial-correctness principle.
  - Principle XVIII (Go-to-Market, renumbered from XVII): added concrete initial target
    market for this product.
- Added principles:
  - New Principle X, "Financial Calculation Correctness and Investor Trust" — inserted
    after Testing Strategy / Playwright, before Architecture Principles, because financial
    correctness is this product's core risk and belongs with the other testing principles.
- Renumbered principles (insertion of new Principle X shifts everything after it by one):
  old X (Architecture Principles) → XI
  old XI (Data as a Product Capability) → XII
  old XII (Data Analysis Standards) → XIII
  old XIII (Data Visualization Standards) → XIV
  old XIV (UX and Accessibility) → XV
  old XV (Mobile and Responsive Development) → XVI
  old XVI (API and Integration Discipline) → XVII
  old XVII (Go-to-Market) → XVIII
  old XVIII (MVP Discipline) → XIX
  old XIX (Side Project Management) → XX
  old XX (Definition of Done) → XXI
  old XXI (AI-Assisted Development Rules) → XXII
  old XXII (Human Decision Gates) → XXIII
  old XXIII (Dependency Discipline) → XXIV
  old XXIV (Observability and Failure) → XXV
  old XXV (Release Discipline) → XXVI
  old XXVI (Post-Launch Learning) → XXVII
  old XXVII (Universal Project Workflow) → XXVIII
  old XXIX (Final Engineering Principle) → XXIX (also corrects a pre-existing numbering
    swap in the source document, where Final Engineering Principle and Governing Priority
    were labeled out of document order)
  old XXVIII (Governing Priority) → XXX
- Removed sections: none.
- Cross-reference updates: "(Principle XXII)" → "(Principle XXIII)" [Human Decision Gates],
  "(Principle XX)" → "(Principle XXI)" [Definition of Done], "(Principle XXV)" →
  "(Principle XXVI)" [Release Discipline], "(Principle XXI)" → "(Principle XXII)"
  [AI-Assisted Development Rules]. "(Principle VI)" is unchanged.
- Templates requiring follow-up: none — `.specify/templates/*.md` reference principles
  generically, not by number, and do not need edits for this renumbering.
- Follow-up TODOs: none.
-->

# Profitability Calculator Constitution

**Mission**: I am building the Profitability Calculator — a tool that helps startup founders
model their unit economics, calculate their break-even point, and generate clear, trustworthy
financial projections they can show investors.

The product's core capabilities:
- Break-even analysis (fixed costs, variable costs, contribution margin, break-even revenue and
  break-even units)
- Unit economics (CAC, LTV, gross margin, contribution margin per unit)
- Runway and burn-rate modeling from cash position and monthly burn
- Scenario and sensitivity modeling (e.g. pricing, cost, or growth-rate changes)
- Investor-ready outputs: summaries, charts, and exportable views of the above

Every feature must connect business reasoning, founder needs, investor-audience needs,
engineering, security, data, testing, and go-to-market thinking. Code is not the starting point.
Understanding the founder's problem — and what an investor needs to see and trust — is.

## Core Principles

### I. Privacy and Security by Design
Privacy and security are first-order product requirements. They MUST be considered during
research, specification, architecture and data modelling — not added after implementation.

Before implementation, every feature MUST identify:
- Data being collected
- Why each data element is necessary
- Where data is stored
- Who can access it
- Authentication requirements
- Authorization boundaries
- Sensitive or personally identifiable information
- Third-party services receiving data
- Data retention requirements
- Deletion requirements
- Encryption requirements
- Likely attack surfaces
- Abuse scenarios
- Relevant regulatory or industry requirements

A founder's revenue, costs, pricing, margins, burn rate, and cap-table-adjacent figures are
sensitive competitive business data even when they contain no personally identifiable
information, and MUST be protected to the same standard as PII: least-privilege access, no
exposure through logs, analytics, URLs, error messages, client-side code, repositories, test
fixtures, or AI prompts. Apply data minimization: do not collect information simply because it
may become useful later. Secrets, API keys, credentials and production tokens MUST NEVER be
hard-coded. Authentication and authorization MUST follow least-privilege principles.
Security-sensitive functionality — including authentication, permissions, payments, file
uploads, exports/sharing of a founder's financials, APIs, database access and personal-data
processing — requires explicit threat analysis. When uncertainty exists, choose the architecture
that exposes less data and grants less privilege.

### II. Research Before Implementation
No substantial feature should begin with implementation. Start by understanding:
1. The problem
2. The intended users
3. Existing alternatives
4. Market conditions
5. Business constraints
6. Technical constraints
7. Regulatory constraints
8. Available evidence

Research MUST distinguish facts, assumptions, hypotheses, opinions, and unknowns. Material
claims should have evidence where reasonably available. Unknowns that could materially change
the product MUST become research questions before implementation. Never fabricate research,
statistics, competitor information, user behaviour or market evidence.

### III. Problem-First Product Development
This product serves two audiences on every screen: the founder who enters the numbers and the
investor who reads the output. Before defining a feature, establish:
- Target user (founder persona, e.g. pre-seed/seed, non-finance background)
- Secondary audience (the investor or advisor who will view the output)
- User problem (what financial question the founder can't currently answer confidently)
- Existing behaviour/workaround (e.g. ad hoc spreadsheets)
- Why the problem matters and how urgently
- Proposed value for the founder and for the investor reading their numbers
- Business opportunity
- Constraints
- Success criteria, for both audiences

Do not build features merely because they are technically interesting. Every major feature MUST
trace back to a founder need, an investor-trust need, a business requirement, a risk requirement,
or a measurable product objective.

### IV. Business Analysis Before Architecture
The customer segment for this product is startup founders — pre-seed through Series A —
modeling their own business, with investors and advisors as the audience for the output. Where
applicable, evaluate:
- Customer segments
- User personas
- Jobs to be done
- Existing alternatives
- Competitors
- Market structure
- Value proposition
- Revenue model
- Cost structure
- Distribution channels
- Operational requirements
- Key partnerships
- Major risks
- Adoption barriers
- Regulatory constraints

Separate assumptions from validated findings. Critical business assumptions should become
testable hypotheses.

### V. PRD as Product Source of Truth
Every substantial feature MUST have a Product Requirements Document before implementation. The
PRD should define:
- Product context
- Problem statement
- Objectives
- Target users
- User journeys
- Functional requirements
- Non-functional requirements
- User stories
- Acceptance criteria
- Data requirements
- Privacy requirements
- Security requirements
- Accessibility requirements
- Analytics requirements
- Edge cases
- Failure states
- Dependencies
- Constraints
- Out-of-scope items
- Success metrics
- Release criteria

Requirements MUST be testable. Ambiguous requirements MUST be clarified before implementation.
Do not silently make major product assumptions.

### VI. Specification-Driven Development
Specifications govern implementation. Use the following hierarchy:

Constitution → Research → Product Brief → PRD → Feature Specification → Technical Plan →
Test Plan → Tasks → Implementation → Validation → Release

Code should implement the specification. The specification should not be rewritten after the
fact merely to justify existing code. When requirements change, update the relevant
specification and propagate the change through implementation and tests. Each implementation
task MUST trace to a requirement or acceptance criterion.

### VII. Test-Driven Development
Test-Driven Development is the default engineering approach. For business logic and critical
functionality:
1. Define expected behaviour.
2. Write the test.
3. Confirm the test fails for the expected reason.
4. Implement the minimum correct solution.
5. Confirm the test passes.
6. Refactor without changing behaviour.
7. Run the relevant test suite again.

Tests are part of the product specification, not cleanup work. Bug fixes should include
regression tests whenever practical. Critical functionality — above all, financial calculations
(see Principle X) — MUST NOT depend solely on manual testing.

### VIII. Testing Strategy
Testing should operate at appropriate layers: unit, component, integration, API, end-to-end,
security, accessibility, and regression tests.

Prioritize tests around risk rather than chasing arbitrary coverage percentages. Critical flows
require stronger testing than cosmetic functionality, including: authentication, registration,
authorization, payments, financial calculations and formulas, data submission, data
modification, file/export handling, permissions, account recovery, and core business workflows.

### IX. Playwright as the Default E2E Framework
Playwright is the preferred end-to-end testing framework for web products unless project
constraints justify another tool. Critical user journeys should have Playwright coverage. Tests
should represent realistic user behaviour rather than implementation details. Where relevant,
Playwright tests should cover: happy paths, invalid inputs, authentication states, authorization
boundaries, form validation, navigation, error states, empty states, loading states, responsive
behaviour, critical browser workflows, and core conversion paths (including entering business
inputs and reaching a correct break-even/unit-economics result).

E2E tests MUST be deterministic and isolated where reasonably possible. Do not rely on arbitrary
sleep timers when deterministic conditions can be awaited.

### X. Financial Calculation Correctness and Investor Trust
This product exists to answer one question correctly: when does this startup break even, and
what do its unit economics look like. Financial calculations — revenue, costs, contribution
margin, gross margin, burn rate, runway, break-even point, CAC, LTV, and any derived metric —
MUST be:
- Implemented from an explicit, documented formula before code is written.
- Covered by unit tests using hand-calculated reference cases, including edge cases (zero
  revenue, negative margin, zero or negative fixed costs, division by zero in ratios, single
  vs. multiple revenue streams).
- Traceable: every number shown to a user MUST be attributable to a formula and the inputs that
  produced it. No hidden adjustments or silent rounding beyond what is explicitly specified and
  documented.
- Reviewed for unit and time-period consistency (e.g. monthly vs. annual figures MUST NOT be
  mixed without an explicit, visible conversion).

Because outputs may be shown directly to investors, every investor-facing view MUST:
- State the assumptions and inputs behind the numbers shown (e.g. pricing, churn, cost inputs).
- Clearly label projections and estimates as such, visually distinct from historical/actual
  data.
- Include a visible disclaimer that outputs are projections based on user-supplied inputs, not
  audited financials, guarantees of results, or professional financial/investment/accounting
  advice.
- Follow the honesty and clarity requirements of Principle XIV (Data Visualization Standards) —
  avoid formatting, chart choices, or language that could overstate certainty or mislead about
  the startup's financial position.

A financial calculation bug is a trust-destroying defect, not a cosmetic one, and MUST be
treated as a release blocker (see Principle XXI, Definition of Done).

### XI. Architecture Principles
Prefer simplicity, modularity, explicit interfaces, clear separation of concerns, testability,
maintainability, observability, and secure defaults.

Avoid premature complexity. Do not introduce technologies, dependencies, microservices,
abstraction layers or infrastructure merely because they are fashionable. Architecture should
reflect the scale and risk of the actual product. Start simple while preserving reasonable paths
for growth.

Major architectural decisions MUST document: decision, context, alternatives, trade-offs,
security implications, and operational implications.

### XII. Data as a Product Capability
Data requirements should be designed alongside product requirements. Before implementation,
determine: what should be measured, why should it be measured, what decisions will the
measurement support, how will the data be captured, what privacy implications exist, and how
will quality be validated.

Analytics events should have consistent naming and documented definitions. Avoid collecting
analytics without a defined decision-making purpose.

### XIII. Data Analysis Standards
Analysis must distinguish between descriptive, diagnostic, predictive, and prescriptive
analysis. Never present correlation as causation without evidence.

Document: data sources, data quality limitations, missing data, transformations, assumptions,
methodology, uncertainty, and relevant limitations. Reproducibility is preferred wherever
practical.

### XIV. Data Visualization Standards
Visualizations exist to communicate information and support decisions — for this product,
decisions a founder or an investor will make about the business. Choose charts based on the
analytical question, not aesthetics.

Visualizations should prioritize: accuracy, readability, appropriate scales, clear labels,
relevant context, accessibility, and honest representation. Avoid misleading axes, unnecessary
3D effects, decorative complexity, and visual elements that distort interpretation. Dashboards
should emphasize decisions and actionable information rather than displaying every available
metric.

### XV. UX and Accessibility
Products should be understandable without requiring users to understand the underlying
technology. Interfaces should provide clear: navigation, feedback, validation, loading states,
empty states, success states, error states, and recovery paths.

Accessibility is a product requirement. Where applicable, consider keyboard navigation,
semantic structure, contrast, screen-reader compatibility, focus states, responsive behaviour,
and accessible form controls.

### XVI. Mobile and Responsive Development
Web products should be responsive by default unless explicitly designed for a constrained
environment. Mobile products should account for: different screen sizes, network instability,
slow connections, offline or degraded states where relevant, touch interaction, device
permissions, battery/network consumption, and platform conventions.

Design for realistic user environments rather than ideal development conditions.

### XVII. API and Integration Discipline
External services introduce dependencies and risk. Before adopting a third-party service,
evaluate: necessity, security, privacy, reliability, cost, vendor lock-in, rate limits, data
ownership, failure behaviour, and exit strategy.

External failures should degrade gracefully where possible. Never assume third-party services
will always be available.

### XVIII. Go-to-Market Is Part of Product Development
GTM analysis begins before launch. The initial target market is early-stage startup founders
preparing investor updates, board materials, or fundraising decks who need a credible break-even
and unit-economics story. Where applicable, define: target market, initial customer segment,
positioning, core value proposition, acquisition channels, pricing hypothesis, activation event,
conversion funnel, retention strategy, distribution strategy, launch strategy, feedback
mechanisms, and success metrics.

Product decisions and GTM assumptions should inform each other. A technically functional
product is not automatically a commercially viable product.

### XIX. MVP Discipline
MVP means the smallest product capable of testing the central value hypothesis: that a founder
can, in minutes, produce a break-even/unit-economics view they trust enough to show an investor.
It does not mean poor-quality software.

MVP scope may reduce features but MUST NOT deliberately compromise essential: security, privacy,
data integrity, financial calculation correctness (Principle X), core testing, and accessibility
of critical flows.

Classify requirements where useful as: Must Have, Should Have, Could Have, Later, Out of Scope.
Protect the smallest useful release from uncontrolled scope expansion.

### XX. Side Project Management
This project should maintain lightweight project management artifacts, including: current
objective, current phase, backlog, priorities, milestones, dependencies, risks, decisions,
blockers, completed work, and next actions.

Tasks should be small enough to verify independently. Do not begin several dependent tasks
simultaneously when one unresolved architectural decision could invalidate them.

### XXI. Definition of Done
A feature is not complete because the code runs. A feature is complete when applicable:
- Requirements are satisfied
- Acceptance criteria pass
- Unit tests pass, including financial-calculation reference-case tests (Principle X)
- Integration tests pass
- Playwright tests pass
- Security requirements are satisfied
- Privacy requirements are satisfied
- Accessibility has been checked
- Error states are handled
- Analytics are implemented where required
- Documentation is updated
- No unresolved critical defects remain
- Build succeeds
- Relevant lint/static checks pass

### XXII. AI-Assisted Development Rules
AI is an engineering assistant, not the source of truth. Agents MUST read the constitution and
relevant specifications before implementing substantial changes.

Agents should not:
- Invent requirements
- Invent APIs
- Invent research findings
- Fabricate dependencies
- Silently change architecture
- Invent or silently alter financial formulas (Principle X)
- Remove security controls to make tests pass
- Disable tests to make builds pass
- Expose credentials
- Use production personal or founder financial data unnecessarily
- Introduce unnecessary dependencies
- Rewrite unrelated working code

When information is missing, identify the assumption explicitly. Prefer evidence and repository
context over assumptions.

### XXIII. Human Decision Gates
Human approval is required before consequential changes involving:
- Authentication architecture
- Authorization models
- Encryption
- Production database migrations
- Destructive data operations
- Payment architecture
- Major dependency changes
- Infrastructure architecture
- Public API contracts
- Sensitive personal or founder financial data
- Production secrets
- Major changes to product scope
- Changes to a core financial formula (break-even, unit economics, runway) already shipped

Agents may analyze and recommend approaches but should not autonomously make irreversible
high-risk decisions.

### XXIV. Dependency Discipline
Every dependency adds maintenance and security cost. Before introducing a dependency,
determine: whether existing functionality can solve the problem, maintenance status, security
history, license implications, bundle/runtime impact, and long-term necessity.

Prefer established, actively maintained dependencies. Do not add packages to solve trivial
problems that can be implemented clearly and safely without them.

### XXV. Observability and Failure
Production systems should make failures diagnosable without compromising user privacy. Where
appropriate, provide: structured logging, error monitoring, performance monitoring, health
checks, and audit trails for sensitive actions.

Never silently swallow critical failures. Error reporting must not expose secrets or sensitive
user or founder financial information.

### XXVI. Release Discipline
Before production release, follow this sequence:

Research → Specification → Architecture → Threat assessment → Test plan → Implementation →
Automated testing → Security/privacy review → Acceptance validation → Release

Production deployment should not be the first realistic test of a feature. Critical
functionality should have rollback or recovery considerations.

### XXVII. Post-Launch Learning
Shipping begins the learning cycle. After launch, evaluate: adoption, activation, usage,
conversion, retention, errors, performance, user feedback, business outcomes, and security
signals.

Compare actual behaviour against original hypotheses. Use evidence to determine subsequent
iterations. Do not continue building solely because features existed on the original roadmap.

## Development Workflow

### XXVIII. Universal Project Workflow
For a new idea, execute:

IDEA → DISCOVERY → RESEARCH → PROBLEM VALIDATION → BUSINESS ANALYSIS → PRODUCT BRIEF → PRD →
PRIVACY + THREAT MODEL → TECHNICAL ARCHITECTURE → DATA + ANALYTICS PLAN → TEST STRATEGY →
TASK BREAKDOWN → TDD IMPLEMENTATION → PLAYWRIGHT E2E VALIDATION → SECURITY + PRIVACY REVIEW →
GTM PREPARATION → RELEASE → MEASUREMENT → ITERATION

No phase should exist merely as bureaucracy. Scale the depth of each phase according to feature
complexity and risk.

## Guiding Philosophy

### XXIX. Final Engineering Principle
Build the smallest correct solution that:
- solves a validated problem,
- protects its users,
- can be tested,
- can be understood,
- can be measured,
- can be maintained,
- and can evolve when evidence changes.

Research before assuming. Specify before implementing. Threat-model before exposing. Test before
trusting. Measure before scaling. Iterate from evidence.

## Governance

This constitution supersedes all other project practices, templates, and ad hoc conventions.
Every specification, plan, and implementation MUST be consistent with it, or MUST document and
justify the deviation.

### XXX. Governing Priority
When principles conflict, prioritize in this order:
1. User safety and data protection
2. Security
3. Privacy
4. Correctness and data integrity (including financial calculation correctness, Principle X)
5. User requirements
6. Reliability
7. Accessibility
8. Maintainability
9. Performance
10. Delivery speed
11. Convenience

Never sacrifice security, privacy, data integrity or financial calculation correctness merely
to ship faster.

### Amendment Procedure
Amendments to this constitution MUST:
- Be proposed with the specific text change, the rationale, and the affected principles/sections
  identified.
- Go through a Human Decision Gate (Principle XXIII) whenever the amendment touches product
  scope, security, privacy, or architecture; a documented owner review is sufficient otherwise.
- Increment `CONSTITUTION_VERSION` per semantic versioning: MAJOR for backward-incompatible
  principle removals or redefinitions, MINOR for new principles or materially expanded guidance,
  PATCH for clarifications and non-semantic wording fixes.
- Update `Last Amended` to the date of the change and propagate the change through dependent
  specifications, plans, and tasks per Principle VI (Specification-Driven Development).

### Compliance Review
- Every PRD, Feature Specification, Technical Plan, and Test Plan MUST be checked against this
  constitution before implementation begins.
- Every release MUST satisfy the Definition of Done (Principle XXI) and the Release Discipline
  sequence (Principle XXVI) before shipping.
- AI agents (Principle XXII) MUST read this constitution before making substantial changes and
  MUST surface any conflict between a requested change and a principle here rather than silently
  resolving it.
- Complexity, new dependencies, or deviations from these principles MUST be explicitly justified
  in the relevant specification or plan; unjustified deviations MUST be rejected in review.

**Version**: 1.0.0 | **Ratified**: 2026-09-24 | **Last Amended**: 2026-09-24
