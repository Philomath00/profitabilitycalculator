import { useAppState } from "../state/AppStateContext";
import { useProjection } from "../state/useProjection";
import { BreakEvenSummary } from "../components/BreakEvenSummary";
import { Glossary } from "../components/Glossary";

export function BreakEvenStep() {
  const { state } = useAppState();
  const { breakEven } = useProjection();

  if (!state.businessProfile || !breakEven) {
    return (
      <section aria-labelledby="break-even-heading">
        <h2 id="break-even-heading">Break-Even</h2>
        <p>
          Complete the Business, Revenue, and Expenses steps first to see your break-even result.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="break-even-heading">
      <h2 id="break-even-heading">Break-Even</h2>
      <BreakEvenSummary result={breakEven} />
      <Glossary />
    </section>
  );
}
