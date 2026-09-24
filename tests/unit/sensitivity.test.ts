import { describe, expect, it } from "vitest";
import { computeSensitivity } from "../../src/domain/sensitivity";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeBreakEven } from "../../src/domain/breakEven";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("computeSensitivity", () => {
  it("each candidate value equals a direct computeMonthlyProjection/computeBreakEven call (never an independent formula)", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
    const scenario = canonicalScenario();

    const results = computeSensitivity(
      profile,
      scenario,
      "revenueStreams[0].growthRatePercentPerMonth",
      [5, 10, 15],
    );

    for (const result of results) {
      const manualScenario = canonicalScenario({
        revenueStreams: [
          { ...scenario.revenueStreams[0], growthRatePercentPerMonth: result.value },
        ],
      });
      const manualProjection = computeMonthlyProjection(profile, manualScenario);
      const manualBreakEven = computeBreakEven(manualProjection, manualScenario);

      expect(result.projection).toEqual(manualProjection);
      expect(result.breakEven).toEqual(manualBreakEven);
    }
  });

  it("higher growth reaches operating break-even no later than lower growth", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
    const scenario = canonicalScenario();
    const results = computeSensitivity(
      profile,
      scenario,
      "revenueStreams[0].growthRatePercentPerMonth",
      [5, 15],
    );
    const [lowGrowth, highGrowth] = results;
    expect(highGrowth.breakEven.operatingBreakEvenMonth as number).toBeLessThanOrEqual(
      lowGrowth.breakEven.operatingBreakEvenMonth as number,
    );
  });
});
