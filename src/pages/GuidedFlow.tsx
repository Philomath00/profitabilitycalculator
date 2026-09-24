import { useState } from "react";
import { STEPS, STEP_LABELS, type StepId } from "./steps";
import { useAppState } from "../state/AppStateContext";
import { useUnsavedChangesGuard } from "../state/unsavedChangesGuard";
import { BusinessSetupStep } from "./BusinessSetupStep";
import { RevenueStep } from "./RevenueStep";
import { ExpensesStep } from "./ExpensesStep";
import { FundingStep } from "./FundingStep";
import { ProjectionStep } from "./ProjectionStep";
import { BreakEvenStep } from "./BreakEvenStep";
import { DashboardStep } from "./DashboardStep";
import { ScenariosStep } from "./ScenariosStep";
import { SensitivityStep } from "./SensitivityStep";
import { InvestorSummaryStep } from "./InvestorSummaryStep";

const STEP_COMPONENTS: Record<StepId, () => JSX.Element> = {
  business: BusinessSetupStep,
  revenue: RevenueStep,
  expenses: ExpensesStep,
  funding: FundingStep,
  projection: ProjectionStep,
  breakEven: BreakEvenStep,
  dashboard: DashboardStep,
  scenarios: ScenariosStep,
  sensitivity: SensitivityStep,
  investorSummary: InvestorSummaryStep,
};

/**
 * FR-043: guided, step-based flow. The founder can return to any prior step, change values,
 * and see the model update (enforced by all steps reading/writing the same AppState).
 */
export function GuidedFlow() {
  const [stepIndex, setStepIndex] = useState(0);
  const { hasUnsavedWork } = useAppState();
  useUnsavedChangesGuard(hasUnsavedWork);

  const currentStep = STEPS[stepIndex];
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div>
      <nav aria-label="Guided flow steps">
        <ol>
          {STEPS.map((step, index) => (
            <li key={step}>
              <button
                type="button"
                aria-current={index === stepIndex ? "step" : undefined}
                disabled={index === stepIndex}
                onClick={() => setStepIndex(index)}
              >
                {STEP_LABELS[step]}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <main>
        <StepComponent />
      </main>
      <footer>
        <button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => i - 1)}>
          Back
        </button>
        <button
          type="button"
          disabled={stepIndex === STEPS.length - 1}
          onClick={() => setStepIndex((i) => i + 1)}
        >
          Next
        </button>
      </footer>
    </div>
  );
}
