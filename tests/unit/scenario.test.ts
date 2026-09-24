import { describe, expect, it } from "vitest";
import { duplicateScenario } from "../../src/domain/scenario";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeBreakEven } from "../../src/domain/breakEven";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("duplicateScenario", () => {
  it("produces an independent copy with fresh ids", () => {
    const base = canonicalScenario();
    const copy = duplicateScenario(base, "Conservative");

    expect(copy.id).not.toBe(base.id);
    expect(copy.name).toBe("Conservative");
    expect(copy.isBaseCase).toBe(false);
    expect(copy.revenueStreams[0].id).not.toBe(base.revenueStreams[0].id);
    expect(copy.revenueStreams[0].growthRatePercentPerMonth).toBe(
      base.revenueStreams[0].growthRatePercentPerMonth,
    );

    // Mutating the copy must not affect the original (independent objects).
    copy.revenueStreams[0].growthRatePercentPerMonth = -50;
    expect(base.revenueStreams[0].growthRatePercentPerMonth).toBe(10);
  });

  it("a lower-growth duplicate reaches operating break-even no sooner than the base case", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 60 });
    const base = canonicalScenario();
    const conservative = duplicateScenario(base, "Conservative");
    conservative.revenueStreams[0].growthRatePercentPerMonth = 5;

    const baseBreakEven = computeBreakEven(computeMonthlyProjection(profile, base), base);
    const conservativeBreakEven = computeBreakEven(
      computeMonthlyProjection(profile, conservative),
      conservative,
    );

    expect(conservativeBreakEven.operatingBreakEvenMonth).not.toBeNull();
    expect(baseBreakEven.operatingBreakEvenMonth).not.toBeNull();
    expect(conservativeBreakEven.operatingBreakEvenMonth as number).toBeGreaterThanOrEqual(
      baseBreakEven.operatingBreakEvenMonth as number,
    );
  });
});
