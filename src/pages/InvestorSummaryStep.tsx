import { useAppState } from "../state/AppStateContext";
import { useProjection } from "../state/useProjection";
import {
  buildInvestorSummaryContent,
  type InvestorSummaryCategory,
} from "../export/investorSummaryContent";
import { generateInvestorSummaryDocument } from "../export/investorSummaryPdf";

const CATEGORY_LABELS: Record<InvestorSummaryCategory, string> = {
  fact: "Fact",
  assumption: "Assumption",
  calculated_result: "Calculated result",
  projection: "Projection",
};

/** FR-032-033/046: investor-readable summary with facts/assumptions/results/projections distinguished, downloadable. */
export function InvestorSummaryStep() {
  const { state } = useAppState();
  const { rows, breakEven, profile, scenario } = useProjection();

  if (!profile || !scenario || !breakEven || rows.length === 0) {
    return (
      <section aria-labelledby="investor-summary-heading">
        <h2 id="investor-summary-heading">Investor View</h2>
        <p>
          Complete the Business, Revenue, and Expenses steps first to generate an investor summary.
        </p>
      </section>
    );
  }

  const content = buildInvestorSummaryContent(profile, scenario, rows, breakEven);

  function handleDownload() {
    if (!state.businessProfile) return;
    const file = generateInvestorSummaryDocument(profile!, scenario!, rows, breakEven!);
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="investor-summary-heading">
      <h2 id="investor-summary-heading">Investor View</h2>
      <h3>{content.title}</h3>

      {(["fact", "assumption", "calculated_result", "projection"] as const).map((category) => (
        <div key={category}>
          <h4>{CATEGORY_LABELS[category]}s</h4>
          <ul>
            {content.lines
              .filter((line) => line.category === category)
              .map((line) => (
                <li key={line.label}>
                  <strong>{line.label}:</strong> {line.value}
                </li>
              ))}
          </ul>
        </div>
      ))}

      <p role="note">{content.disclaimer}</p>

      <button type="button" onClick={handleDownload}>
        Download investor summary (PDF)
      </button>
    </section>
  );
}
