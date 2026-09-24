import type { BreakEvenResult, MonthlyProjectionRow } from "./types";

export interface DashboardMetrics {
  latestRevenue: number;
  latestGrossMargin: number | null;
  currentMonthlyBurn: number | null;
  runwayMonths: number | null; // null = cash never depleted within the projection
  operatingBreakEvenMonth: number | null;
  cumulativeBreakEvenMonth: number | null;
  fundingRequirement: number; // magnitude of the deepest cash deficit, 0 if never negative
  isProfitableAtEndOfProjection: boolean;
}

/**
 * Derives every headline dashboard figure (FR-026) directly from
 * computeMonthlyProjection()/computeBreakEven() output — no independent formula, so these
 * numbers can never drift from the on-screen projection table (FR-034).
 */
export function computeDashboardMetrics(
  rows: MonthlyProjectionRow[],
  breakEven: BreakEvenResult,
): DashboardMetrics {
  const lastRow = rows[rows.length - 1];
  const firstNegativeCash = rows.find((r) => r.cashBalance < 0);
  const lowestCashRow = rows.reduce(
    (min, r) => (r.cashBalance < min.cashBalance ? r : min),
    rows[0],
  );

  return {
    latestRevenue: lastRow?.revenue ?? 0,
    latestGrossMargin: lastRow?.grossMargin ?? null,
    currentMonthlyBurn: lastRow?.burnRate ?? null,
    runwayMonths: firstNegativeCash ? firstNegativeCash.month : null,
    operatingBreakEvenMonth: breakEven.operatingBreakEvenMonth,
    cumulativeBreakEvenMonth: breakEven.cumulativeBreakEvenMonth,
    fundingRequirement: lowestCashRow && lowestCashRow.cashBalance < 0 ? -lowestCashRow.cashBalance : 0,
    isProfitableAtEndOfProjection: (lastRow?.operatingProfitLoss ?? 0) >= 0,
  };
}
