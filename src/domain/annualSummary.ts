import type { MonthlyProjectionRow } from "./types";

export interface AnnualSummaryRow {
  year: number;
  monthsIncluded: number; // 12, or fewer for a partial final year
  revenue: number;
  totalOperatingExpenses: number;
  operatingProfitLoss: number;
  endingCashBalance: number;
  endingCumulativeProfitLoss: number;
}

/**
 * FR-022: derives annual summaries strictly by aggregating computeMonthlyProjection() rows —
 * never computed independently — so monthly and annual views can never disagree. Revenue,
 * expenses, and profit/loss are summed across each year's months (flows); cash balance and
 * cumulative profit/loss are the year's final month value (point-in-time balances, not summed).
 */
export function computeAnnualSummary(rows: MonthlyProjectionRow[]): AnnualSummaryRow[] {
  const years: AnnualSummaryRow[] = [];

  for (let i = 0; i < rows.length; i += 12) {
    const yearRows = rows.slice(i, i + 12);
    const lastRow = yearRows[yearRows.length - 1];

    years.push({
      year: years.length + 1,
      monthsIncluded: yearRows.length,
      revenue: yearRows.reduce((sum, r) => sum + r.revenue, 0),
      totalOperatingExpenses: yearRows.reduce((sum, r) => sum + r.totalOperatingExpenses, 0),
      operatingProfitLoss: yearRows.reduce((sum, r) => sum + r.operatingProfitLoss, 0),
      endingCashBalance: lastRow.cashBalance,
      endingCumulativeProfitLoss: lastRow.cumulativeProfitLoss,
    });
  }

  return years;
}
