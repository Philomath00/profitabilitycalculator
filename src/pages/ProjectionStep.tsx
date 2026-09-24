import { useAppState } from "../state/AppStateContext";
import { useProjection } from "../state/useProjection";
import { computeAnnualSummary } from "../domain/annualSummary";
import { ProjectionTable } from "../components/ProjectionTable";
import { AnnualSummaryTable } from "../components/AnnualSummaryTable";

export function ProjectionStep() {
  const { state } = useAppState();
  const { rows } = useProjection();

  if (!state.businessProfile) {
    return (
      <section aria-labelledby="projection-heading">
        <h2 id="projection-heading">Projection</h2>
        <p>Complete the Business step first to see a projection.</p>
      </section>
    );
  }

  const currency = state.businessProfile.currency;
  const years = computeAnnualSummary(rows);

  return (
    <section aria-labelledby="projection-heading">
      <h2 id="projection-heading">Projection</h2>
      <ProjectionTable rows={rows} currency={currency} />
      <AnnualSummaryTable years={years} currency={currency} />
    </section>
  );
}
