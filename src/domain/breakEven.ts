import type { BreakEvenResult, MonthlyProjectionRow, Scenario } from "./types";

/**
 * Per contracts/calculation-engine.md `computeBreakEven`. Returns `null` — never a fabricated
 * or extrapolated value — whenever break-even is not reached or is undefined (FR-018-020).
 */
export function computeBreakEven(
  projection: MonthlyProjectionRow[],
  scenario: Scenario,
): BreakEvenResult {
  const operatingRow = projection.find((row) => row.operatingProfitLoss >= 0);
  const cumulativeRow = projection.find((row) => row.cumulativeProfitLoss >= 0);

  return {
    operatingBreakEvenMonth: operatingRow ? operatingRow.month : null,
    cumulativeBreakEvenMonth: cumulativeRow ? cumulativeRow.month : null,
    breakEvenUnits: computeBreakEvenUnits(scenario),
  };
}

/**
 * Aggregate contribution margin per unit across unit-priced revenue streams, weighted by
 * starting volume. `null` when contribution margin is zero or negative — unit break-even is
 * undefined under those assumptions, never Infinity/NaN (FR-015/FR-020).
 */
function computeBreakEvenUnits(scenario: Scenario): number | null {
  const unitStreams = scenario.revenueStreams.filter(
    (s) => s.type !== "transaction_commission" && s.pricePerUnit !== null,
  );
  if (unitStreams.length === 0) return null;

  const totalWeightedVolume = unitStreams.reduce((sum, s) => sum + s.startingValue, 0);
  if (totalWeightedVolume === 0) return null;

  const perUnitVariableCost = scenario.costItems
    .filter((c) => c.category === "variable" && c.variableBasis === "per_unit")
    .reduce((sum, c) => sum + c.amount, 0);

  const weightedAvgPrice =
    unitStreams.reduce((sum, s) => sum + (s.pricePerUnit ?? 0) * s.startingValue, 0) /
    totalWeightedVolume;

  const contributionMarginPerUnit = weightedAvgPrice - perUnitVariableCost;
  if (contributionMarginPerUnit <= 0) return null;

  const fixedCosts = scenario.costItems
    .filter((c) => c.category === "fixed")
    .reduce((sum, c) => sum + c.amount, 0);

  return fixedCosts / contributionMarginPerUnit;
}
