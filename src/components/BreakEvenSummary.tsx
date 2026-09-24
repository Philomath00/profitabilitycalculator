import type { BreakEvenResult } from "../domain/types";

/** FR-018-019: distinguishes operating vs. cumulative break-even; states "not reached" explicitly. */
export function BreakEvenSummary({ result }: { result: BreakEvenResult }) {
  return (
    <dl>
      <dt>Operating break-even</dt>
      <dd>
        {result.operatingBreakEvenMonth !== null
          ? `Month ${result.operatingBreakEvenMonth} — the first month revenue covers that month's operating expenses.`
          : "Break-even is not reached within the selected projection period."}
      </dd>

      <dt>Cumulative break-even</dt>
      <dd>
        {result.cumulativeBreakEvenMonth !== null
          ? `Month ${result.cumulativeBreakEvenMonth} — the first month accumulated profit has recovered all prior accumulated losses.`
          : "Break-even is not reached within the selected projection period."}
      </dd>

      <dt>Break-even volume (units)</dt>
      <dd>
        {result.breakEvenUnits !== null
          ? Math.ceil(result.breakEvenUnits).toLocaleString()
          : "Undefined under the current assumptions (contribution margin per unit is zero or negative)."}
      </dd>
    </dl>
  );
}
