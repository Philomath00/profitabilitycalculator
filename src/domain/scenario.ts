import type { Scenario } from "./types";

/**
 * "Duplicate, then edit" per data-model.md: a full copy of revenueStreams/costItems/
 * fundingSources, not a diff/override against a base model (constitution Principle XI,
 * avoid premature complexity). Every nested item gets a fresh id so scenarios never share
 * mutable state.
 */
export function duplicateScenario(source: Scenario, name: string): Scenario {
  return {
    id: crypto.randomUUID(),
    businessProfileId: source.businessProfileId,
    name,
    isBaseCase: false,
    revenueStreams: source.revenueStreams.map((s) => ({ ...s, id: crypto.randomUUID() })),
    costItems: source.costItems.map((c) => ({ ...c, id: crypto.randomUUID() })),
    fundingSources: source.fundingSources.map((f) => ({ ...f, id: crypto.randomUUID() })),
  };
}
