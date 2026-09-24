import { describe, expect, it } from "vitest";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeAnnualSummary } from "../../src/domain/annualSummary";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("computeAnnualSummary", () => {
  const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
  const scenario = canonicalScenario();
  const rows = computeMonthlyProjection(profile, scenario);
  const years = computeAnnualSummary(rows);

  it("produces one row per 12-month year", () => {
    expect(years).toHaveLength(2);
    expect(years[0].monthsIncluded).toBe(12);
    expect(years[1].monthsIncluded).toBe(12);
  });

  it("sums revenue/expenses/profit-loss across each year's months (never computed independently)", () => {
    const manualYear1Revenue = rows.slice(0, 12).reduce((sum, r) => sum + r.revenue, 0);
    const manualYear2Revenue = rows.slice(12, 24).reduce((sum, r) => sum + r.revenue, 0);
    expect(years[0].revenue).toBeCloseTo(manualYear1Revenue, 6);
    expect(years[1].revenue).toBeCloseTo(manualYear2Revenue, 6);

    const manualYear1Profit = rows.slice(0, 12).reduce((sum, r) => sum + r.operatingProfitLoss, 0);
    expect(years[0].operatingProfitLoss).toBeCloseTo(manualYear1Profit, 6);
  });

  it("uses the year's final month for cash balance and cumulative profit/loss (point-in-time, not summed)", () => {
    expect(years[0].endingCashBalance).toBeCloseTo(rows[11].cashBalance, 6);
    expect(years[0].endingCumulativeProfitLoss).toBeCloseTo(rows[11].cumulativeProfitLoss, 6);
    expect(years[1].endingCumulativeProfitLoss).toBeCloseTo(rows[23].cumulativeProfitLoss, 6);
  });

  it("handles a partial final year", () => {
    const partialProfile = canonicalBusinessProfile({ projectionPeriodMonths: 12 });
    // 12 months exactly divides into one year; use a non-multiple to test partial-year handling
    const partialRows = computeMonthlyProjection(partialProfile, scenario).slice(0, 7);
    const partialYears = computeAnnualSummary(partialRows);
    expect(partialYears).toHaveLength(1);
    expect(partialYears[0].monthsIncluded).toBe(7);
  });
});
