import { useAppState } from "../state/AppStateContext";
import { useProjection } from "../state/useProjection";
import { ProjectionTable } from "../components/ProjectionTable";

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

  return (
    <section aria-labelledby="projection-heading">
      <h2 id="projection-heading">Projection</h2>
      <ProjectionTable rows={rows} currency={state.businessProfile.currency} />
    </section>
  );
}
