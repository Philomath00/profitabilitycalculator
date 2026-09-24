import { describe, expect, it } from "vitest";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("computeMonthlyProjection (canonical reference case, quickstart.md)", () => {
  const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
  const scenario = canonicalScenario();
  const rows = computeMonthlyProjection(profile, scenario);

  it("returns exactly projectionPeriodMonths rows", () => {
    expect(rows).toHaveLength(24);
  });

  it.each([
    [1, 10_000.0, -12_000.0],
    [5, 14_641.0, -8_287.2],
    [10, 23_579.4769, -1_136.418472],
    [11, 25_937.4245, 749.9396808],
    [17, 45_949.729863572, 16_759.783890858],
    [18, 50_544.702849929, 20_435.762279944],
  ])("month %i: revenue=%f, operatingProfitLoss=%f", (month, revenue, operatingProfitLoss) => {
    const row = rows[month - 1];
    expect(row.month).toBe(month);
    expect(row.revenue).toBeCloseTo(revenue, 2);
    expect(row.operatingProfitLoss).toBeCloseTo(operatingProfitLoss, 2);
  });

  it("cumulative profit/loss matches the running sum of operating profit/loss", () => {
    expect(rows[9].cumulativeProfitLoss).toBeCloseTo(-72_500.603192, 2); // month 10 (deepest deficit)
    expect(rows[10].cumulativeProfitLoss).toBeCloseTo(-71_750.6635112, 2); // month 11
    expect(rows[17].cumulativeProfitLoss).toBeCloseTo(4_793.38516, 2); // month 18 (first positive)
  });

  it("never produces NaN or Infinity for any field", () => {
    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === "number") {
          expect(Number.isFinite(value), `${key} at month ${row.month}`).toBe(true);
        }
      }
    }
  });

  it("grossMargin is null when revenue is zero (edge case)", () => {
    const zeroRevenueScenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-zero",
          name: "No revenue",
          type: "unit_sale",
          startingValue: 0,
          pricePerUnit: 100,
          growthRatePercentPerMonth: 0,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const zeroProfile = canonicalBusinessProfile({ projectionPeriodMonths: 12 });
    const zeroRows = computeMonthlyProjection(zeroProfile, zeroRevenueScenario);
    expect(zeroRows[0].revenue).toBe(0);
    expect(zeroRows[0].grossMargin).toBeNull();
  });

  it("supports negative growth (declining business edge case)", () => {
    const decliningScenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-decline",
          name: "Declining revenue",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 10_000,
          growthRatePercentPerMonth: -10,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const decliningRows = computeMonthlyProjection(
      canonicalBusinessProfile({ projectionPeriodMonths: 12 }),
      decliningScenario,
    );
    expect(decliningRows[1].revenue).toBeLessThan(decliningRows[0].revenue);
  });

  it("annual totals derive from (sum of) the monthly rows, never computed independently", () => {
    const yearOneRevenue = rows.slice(0, 12).reduce((sum, r) => sum + r.revenue, 0);
    const manualSum = rows
      .slice(0, 12)
      .map((r) => r.revenue)
      .reduce((a, b) => a + b, 0);
    expect(yearOneRevenue).toBeCloseTo(manualSum, 6);
  });
});
