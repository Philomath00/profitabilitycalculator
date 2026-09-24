import { useMemo } from "react";
import { computeMonthlyProjection } from "../domain/projection";
import { computeBreakEven } from "../domain/breakEven";
import type { BusinessProfile, Scenario } from "../domain/types";
import { useAppState } from "./AppStateContext";

/**
 * Recomputes the projection and break-even result for the active scenario whenever the
 * business profile or scenario changes (FR-034/SC-005: within 1 second — in practice this
 * synchronous pure-function computation completes in low single-digit milliseconds, see
 * research.md §8). `useMemo` avoids recomputing on unrelated re-renders.
 */
export function useProjection(profileOverride?: BusinessProfile, scenarioOverride?: Scenario) {
  const { state, activeScenario } = useAppState();
  const profile = profileOverride ?? state.businessProfile;
  const scenario = scenarioOverride ?? activeScenario;

  return useMemo(() => {
    if (!profile || !scenario) return { rows: [], breakEven: null, profile, scenario };
    const rows = computeMonthlyProjection(profile, scenario);
    const breakEven = computeBreakEven(rows, scenario);
    return { rows, breakEven, profile, scenario };
  }, [profile, scenario]);
}
