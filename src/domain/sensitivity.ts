import { computeMonthlyProjection } from "./projection";
import { computeBreakEven } from "./breakEven";
import type { BreakEvenResult, BusinessProfile, MonthlyProjectionRow, Scenario } from "./types";

export interface SensitivityPoint {
  value: number;
  projection: MonthlyProjectionRow[];
  breakEven: BreakEvenResult;
}

const PATH_PATTERN = /^(revenueStreams|costItems|fundingSources)\[(\d+)\]\.(\w+)$/;

/**
 * Per contracts/calculation-engine.md `computeSensitivity`: for each candidate value, returns
 * the full recomputed projection/break-even as if only that one assumption changed —
 * implemented as repeated calls into computeMonthlyProjection/computeBreakEven against a
 * modified copy of the scenario, never an independent formula (FR-025), so it can never
 * drift from the primary calculation path.
 */
export function computeSensitivity(
  businessProfile: BusinessProfile,
  scenario: Scenario,
  assumptionPath: string,
  candidateValues: number[],
): SensitivityPoint[] {
  const match = PATH_PATTERN.exec(assumptionPath);
  if (!match) {
    throw new Error(`Unsupported assumption path: ${assumptionPath}`);
  }
  const [, collectionKey, indexStr, field] = match;
  const index = Number(indexStr);
  const collection = collectionKey as "revenueStreams" | "costItems" | "fundingSources";

  return candidateValues.map((value) => {
    const modifiedScenario: Scenario = {
      ...scenario,
      [collection]: scenario[collection].map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    } as Scenario;

    const projection = computeMonthlyProjection(businessProfile, modifiedScenario);
    const breakEven = computeBreakEven(projection, modifiedScenario);
    return { value, projection, breakEven };
  });
}
