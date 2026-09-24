import type { BreakEvenResult, MonthlyProjectionRow, Scenario } from "../domain/types";

/**
 * Derives "major financial risks" (FR-032) from objective, calculable conditions in the
 * model — never invented text (constitution Principle II/XXII: never fabricate findings).
 * Each risk is directly traceable to the projection/break-even output or the scenario's own
 * inputs, consistent with FR-034 (every output traceable to assumptions and formula).
 */
export function deriveFinancialRisks(
  scenario: Scenario,
  projection: MonthlyProjectionRow[],
  breakEven: BreakEvenResult,
): string[] {
  const risks: string[] = [];

  if (breakEven.operatingBreakEvenMonth === null) {
    risks.push(
      "This scenario does not reach operating break-even within the selected projection period.",
    );
  }
  if (breakEven.cumulativeBreakEvenMonth === null) {
    risks.push(
      "This scenario has not recovered its accumulated losses within the selected projection period.",
    );
  }

  const firstNegativeCash = projection.find((r) => r.cashBalance < 0);
  if (firstNegativeCash) {
    risks.push(
      `Cash is projected to be depleted by month ${firstNegativeCash.month} unless additional funding is secured.`,
    );
  }

  if (scenario.revenueStreams.length === 1) {
    risks.push("Revenue relies on a single revenue stream, with no diversification modeled.");
  }

  const decliningStreams = scenario.revenueStreams.filter((s) => s.growthRatePercentPerMonth < 0);
  if (decliningStreams.length > 0) {
    risks.push(
      `This scenario assumes declining revenue (negative monthly growth) for ${decliningStreams.length === 1 ? "one revenue stream" : `${decliningStreams.length} revenue streams`}.`,
    );
  }

  // Always present: a projection is only as reliable as the assumptions behind it.
  risks.push(
    "All figures above are projections derived entirely from the founder-supplied assumptions listed above; they are not guarantees of future performance.",
  );

  return risks;
}
