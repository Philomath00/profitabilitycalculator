/** Guided-flow step order per FR-043. */
export const STEPS = [
  "business",
  "revenue",
  "expenses",
  "funding",
  "projection",
  "breakEven",
  "dashboard",
  "scenarios",
  "sensitivity",
  "investorSummary",
] as const;

export type StepId = (typeof STEPS)[number];

export const STEP_LABELS: Record<StepId, string> = {
  business: "Business",
  revenue: "Revenue",
  expenses: "Expenses",
  funding: "Funding",
  projection: "Projection",
  breakEven: "Break-Even",
  dashboard: "Dashboard",
  scenarios: "Scenarios",
  sensitivity: "Sensitivity",
  investorSummary: "Investor View",
};
