import { describe, expect, it } from "vitest";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeBreakEven } from "../../src/domain/breakEven";
import { deriveFinancialRisks } from "../../src/export/financialRisks";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("deriveFinancialRisks", () => {
  it("flags single-revenue-stream concentration and always includes the baseline disclosure, for a scenario that clears break-even", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
    const scenario = canonicalScenario();
    const rows = computeMonthlyProjection(profile, scenario);
    const breakEven = computeBreakEven(rows, scenario);
    const risks = deriveFinancialRisks(scenario, rows, breakEven);

    expect(risks.some((r) => /single revenue stream/i.test(r))).toBe(true);
    expect(risks.some((r) => /projections derived entirely/i.test(r))).toBe(true);
    // This scenario does reach break-even and never depletes cash, so those risks are absent.
    expect(risks.some((r) => /does not reach operating break-even/i.test(r))).toBe(false);
    expect(risks.some((r) => /cash is projected to be depleted/i.test(r))).toBe(false);
  });

  it("flags never-reaches-break-even and cash depletion when they occur", () => {
    // 3% growth pushes operating break-even well past a 12-month projection window.
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 12, startingCash: 50_000 });
    const scenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-slow",
          name: "Slow growth",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 10_000,
          growthRatePercentPerMonth: 3,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const rows = computeMonthlyProjection(profile, scenario);
    const breakEven = computeBreakEven(rows, scenario);
    const risks = deriveFinancialRisks(scenario, rows, breakEven);

    expect(risks.some((r) => /does not reach operating break-even/i.test(r))).toBe(true);
    expect(risks.some((r) => /has not recovered its accumulated losses/i.test(r))).toBe(true);
    expect(risks.some((r) => /cash is projected to be depleted/i.test(r))).toBe(true);
  });

  it("flags declining revenue when growth is negative", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 12 });
    const decliningScenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-decline",
          name: "Declining",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 10_000,
          growthRatePercentPerMonth: -10,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const rows = computeMonthlyProjection(profile, decliningScenario);
    const breakEven = computeBreakEven(rows, decliningScenario);
    const risks = deriveFinancialRisks(decliningScenario, rows, breakEven);

    expect(risks.some((r) => /declining revenue/i.test(r))).toBe(true);
  });
});
