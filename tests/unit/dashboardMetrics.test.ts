import { describe, expect, it } from "vitest";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeBreakEven } from "../../src/domain/breakEven";
import { computeDashboardMetrics } from "../../src/domain/dashboardMetrics";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("computeDashboardMetrics", () => {
  it("matches computeMonthlyProjection/computeBreakEven for the canonical case", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
    const scenario = canonicalScenario();
    const rows = computeMonthlyProjection(profile, scenario);
    const breakEven = computeBreakEven(rows, scenario);
    const metrics = computeDashboardMetrics(rows, breakEven);

    expect(metrics.operatingBreakEvenMonth).toBe(11);
    expect(metrics.cumulativeBreakEvenMonth).toBe(18);
    expect(metrics.latestRevenue).toBeCloseTo(rows[23].revenue, 6);
    expect(metrics.latestGrossMargin).toBeCloseTo(0.8, 6);
    // starting cash $100,000 always exceeds the ~$72,500 trough, so cash never runs out
    expect(metrics.runwayMonths).toBeNull();
    expect(metrics.fundingRequirement).toBe(0);
    expect(metrics.isProfitableAtEndOfProjection).toBe(true);
  });

  it("reports a positive funding requirement when cash goes negative", () => {
    const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24, startingCash: 50_000 });
    const scenario = canonicalScenario();
    const rows = computeMonthlyProjection(profile, scenario);
    const breakEven = computeBreakEven(rows, scenario);
    const metrics = computeDashboardMetrics(rows, breakEven);

    // trough is ~$72,500 loss against $50,000 starting cash -> cash goes negative
    expect(metrics.runwayMonths).not.toBeNull();
    expect(metrics.fundingRequirement).toBeGreaterThan(0);
  });
});
