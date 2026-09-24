import { describe, expect, it } from "vitest";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeBreakEven } from "../../src/domain/breakEven";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("computeBreakEven", () => {
  it("canonical case: operating break-even = month 11, cumulative break-even = month 18", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
    const scenario = canonicalScenario();
    const rows = computeMonthlyProjection(profile, scenario);
    const result = computeBreakEven(rows, scenario);

    expect(result.operatingBreakEvenMonth).toBe(11);
    expect(result.cumulativeBreakEvenMonth).toBe(18);
  });

  it("never-reaches-break-even case returns null for both months, not a fabricated date", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 60 });
    const scenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-flat",
          name: "Flat revenue",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 1_000,
          growthRatePercentPerMonth: 0,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const rows = computeMonthlyProjection(profile, scenario);
    const result = computeBreakEven(rows, scenario);

    // revenue is flat at 1000/mo; 0.8*1000=800 < 20000 fixed costs every month.
    expect(result.operatingBreakEvenMonth).toBeNull();
    expect(result.cumulativeBreakEvenMonth).toBeNull();
  });

  it("zero contribution margin yields breakEvenUnits = null, not Infinity/NaN", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 12 });
    const scenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-zero-margin",
          name: "Zero margin",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 10,
          growthRatePercentPerMonth: 0,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
      costItems: [
        {
          id: "ci-per-unit",
          name: "Per-unit cost equal to price",
          category: "variable",
          amount: 10,
          variableBasis: "per_unit",
          startMonth: 1,
          endMonth: null,
        },
      ],
    });
    const rows = computeMonthlyProjection(profile, scenario);
    const result = computeBreakEven(rows, scenario);

    expect(result.breakEvenUnits).toBeNull();
    expect(Number.isNaN(result.breakEvenUnits as unknown as number)).toBe(false);
  });
});
