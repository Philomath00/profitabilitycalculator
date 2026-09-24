import type {
  BusinessProfile,
  CostItem,
  MonthlyProjectionRow,
  RevenueStream,
  Scenario,
} from "./types";

/**
 * Per contracts/calculation-engine.md `computeMonthlyProjection`. Pure and deterministic:
 * same input always produces the same output, and every field is directly attributable to
 * the formulas below (constitution Principle X — no hidden adjustments).
 */
export function computeMonthlyProjection(
  businessProfile: BusinessProfile,
  scenario: Scenario,
): MonthlyProjectionRow[] {
  const rows: MonthlyProjectionRow[] = [];
  let cashBalance = businessProfile.startingCash;
  let cumulativeProfitLoss = 0;

  for (let month = 1; month <= businessProfile.projectionPeriodMonths; month++) {
    const revenue = sumRevenueForMonth(scenario.revenueStreams, month);
    const totalUnits = sumUnitsForMonth(scenario.revenueStreams, month);

    let fixedCosts = 0;
    let variableCosts = 0;
    let otherExpenses = 0; // growth (recurring) + one_time_startup (single month) + custom

    for (const item of scenario.costItems) {
      const contribution = monthlyCostContribution(item, month, revenue, totalUnits);
      if (item.category === "fixed") fixedCosts += contribution;
      else if (item.category === "variable") variableCosts += contribution;
      else otherExpenses += contribution;
    }

    const totalOperatingExpenses = fixedCosts + variableCosts + otherExpenses;
    const grossProfit = revenue - variableCosts;
    const grossMargin = revenue === 0 ? null : grossProfit / revenue;
    const operatingProfitLoss = revenue - totalOperatingExpenses; // pre-tax/operating basis only (FR-047)

    const fundingThisMonth = scenario.fundingSources
      .filter((f) => f.receivedMonth === month)
      .reduce((sum, f) => sum + f.amount, 0);

    const netCashFlow = operatingProfitLoss + fundingThisMonth; // funding is cash, never revenue (FR-012)
    cashBalance += netCashFlow;
    cumulativeProfitLoss += operatingProfitLoss; // tracks operating P&L only, not cash/funding

    rows.push({
      month,
      revenue,
      fixedCosts,
      variableCosts,
      totalOperatingExpenses,
      grossProfit,
      grossMargin,
      operatingProfitLoss,
      netCashFlow,
      cashBalance,
      cumulativeProfitLoss,
      burnRate: netCashFlow < 0 ? -netCashFlow : null,
    });
  }

  return rows;
}

/** Growth-adjusted-for-churn multiplier at a given month (month 1 = multiplier 1). */
function growthFactor(stream: RevenueStream, month: number): number {
  const netMonthlyRate = (stream.growthRatePercentPerMonth - stream.churnRatePercent) / 100;
  return Math.pow(1 + netMonthlyRate, month - 1);
}

function streamRevenueForMonth(stream: RevenueStream, month: number): number {
  const factor = growthFactor(stream, month);
  if (stream.type === "transaction_commission") {
    const commissionRate = (stream.commissionRatePercent ?? 0) / 100;
    return stream.startingValue * factor * commissionRate;
  }
  const price = stream.pricePerUnit ?? 0;
  return stream.startingValue * factor * price;
}

function sumRevenueForMonth(streams: RevenueStream[], month: number): number {
  return streams.reduce((sum, s) => sum + streamRevenueForMonth(s, month), 0);
}

/** Volume (not revenue) for per-unit variable cost calculations. */
function sumUnitsForMonth(streams: RevenueStream[], month: number): number {
  return streams
    .filter((s) => s.type !== "transaction_commission")
    .reduce((sum, s) => sum + s.startingValue * growthFactor(s, month), 0);
}

function isActiveThisMonth(item: CostItem, month: number): boolean {
  if (item.category === "one_time_startup") return month === item.startMonth;
  if (month < item.startMonth) return false;
  if (item.endMonth !== null && month > item.endMonth) return false;
  return true;
}

/** growth/custom categories follow fixed-style recurring cost mechanics unless a variableBasis is set. */
function monthlyCostContribution(
  item: CostItem,
  month: number,
  revenue: number,
  totalUnits: number,
): number {
  if (!isActiveThisMonth(item, month)) return 0;

  if (item.category === "variable" || item.variableBasis) {
    if (item.variableBasis === "percent_of_revenue") return (item.amount / 100) * revenue;
    if (item.variableBasis === "per_unit") return item.amount * totalUnits;
  }
  return item.amount; // fixed / growth / one_time_startup / custom without a variable basis
}
