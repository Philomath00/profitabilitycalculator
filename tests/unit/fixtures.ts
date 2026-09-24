import type { BusinessProfile, Scenario } from "../../src/domain/types";

/**
 * The canonical reference case from specs/001-break-even-calculator/quickstart.md /
 * spec.md User Story 1 Acceptance Scenario 1: $100,000 starting cash, $10,000 month-1
 * revenue, 10% monthly growth, $20,000 fixed monthly expenses, 20% variable expenses.
 * Modeled as one unit_sale-type revenue stream with startingValue=1 "unit" priced at
 * $10,000 so that revenue(m) = 10000 * 1.1^(m-1).
 */
export function canonicalBusinessProfile(
  overrides: Partial<BusinessProfile> = {},
): BusinessProfile {
  return {
    id: "bp-1",
    name: "Canonical Test Co",
    industry: "software",
    businessModelType: "saas_subscription",
    currency: "USD",
    projectionStartDate: "2026-01-01",
    projectionPeriodMonths: 24,
    startingCash: 100_000,
    ...overrides,
  };
}

export function canonicalScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: "sc-1",
    businessProfileId: "bp-1",
    name: "Base Case",
    isBaseCase: true,
    revenueStreams: [
      {
        id: "rs-1",
        name: "Primary revenue",
        type: "unit_sale",
        startingValue: 1,
        pricePerUnit: 10_000,
        growthRatePercentPerMonth: 10,
        churnRatePercent: 0,
        commissionRatePercent: null,
      },
    ],
    costItems: [
      {
        id: "ci-fixed",
        name: "Fixed operating costs",
        category: "fixed",
        amount: 20_000,
        variableBasis: null,
        startMonth: 1,
        endMonth: null,
      },
      {
        id: "ci-variable",
        name: "Variable costs (% of revenue)",
        category: "variable",
        amount: 20,
        variableBasis: "percent_of_revenue",
        startMonth: 1,
        endMonth: null,
      },
    ],
    fundingSources: [],
    ...overrides,
  };
}
