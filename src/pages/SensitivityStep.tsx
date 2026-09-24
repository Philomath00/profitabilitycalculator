import { useState } from "react";
import { useAppState } from "../state/AppStateContext";
import { computeSensitivity, type SensitivityPoint } from "../domain/sensitivity";
import { computeDashboardMetrics } from "../domain/dashboardMetrics";

interface AssumptionOption {
  path: string;
  label: string;
}

function buildAssumptionOptions(
  scenario: ReturnType<typeof useAppState>["activeScenario"],
): AssumptionOption[] {
  const options: AssumptionOption[] = [];
  scenario.revenueStreams.forEach((s, i) => {
    options.push({
      path: `revenueStreams[${i}].growthRatePercentPerMonth`,
      label: `${s.name || `Revenue stream ${i + 1}`}: growth rate (%/mo)`,
    });
    options.push({
      path: `revenueStreams[${i}].pricePerUnit`,
      label: `${s.name || `Revenue stream ${i + 1}`}: price per unit`,
    });
  });
  scenario.costItems.forEach((c, i) => {
    options.push({
      path: `costItems[${i}].amount`,
      label: `${c.name || `Cost item ${i + 1}`}: amount`,
    });
  });
  return options;
}

function formatMonth(month: number | null): string {
  return month !== null ? `Month ${month}` : "Not reached";
}

/** FR-025: vary one assumption, show the calculated effect — never an editable independent input. */
export function SensitivityStep() {
  const { state, activeScenario } = useAppState();
  const [selectedPath, setSelectedPath] = useState("");
  const [valuesInput, setValuesInput] = useState("");
  const [results, setResults] = useState<SensitivityPoint[]>([]);

  if (!state.businessProfile) {
    return (
      <section aria-labelledby="sensitivity-heading">
        <h2 id="sensitivity-heading">Sensitivity</h2>
        <p>Complete the Business, Revenue, and Expenses steps first.</p>
      </section>
    );
  }

  const options = buildAssumptionOptions(activeScenario);

  function runAnalysis() {
    const candidateValues = valuesInput
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !Number.isNaN(v));
    if (!selectedPath || candidateValues.length === 0 || !state.businessProfile) return;
    setResults(
      computeSensitivity(state.businessProfile, activeScenario, selectedPath, candidateValues),
    );
  }

  return (
    <section aria-labelledby="sensitivity-heading">
      <h2 id="sensitivity-heading">Sensitivity</h2>

      <label htmlFor="sensitivity-assumption">Assumption to vary</label>
      <select
        id="sensitivity-assumption"
        value={selectedPath}
        onChange={(e) => setSelectedPath(e.target.value)}
      >
        <option value="">Select an assumption</option>
        {options.map((opt) => (
          <option key={opt.path} value={opt.path}>
            {opt.label}
          </option>
        ))}
      </select>

      <label htmlFor="sensitivity-values">Candidate values (comma-separated)</label>
      <input
        id="sensitivity-values"
        type="text"
        value={valuesInput}
        onChange={(e) => setValuesInput(e.target.value)}
        placeholder="e.g. 5, 10, 15"
      />

      <button type="button" onClick={runAnalysis}>
        Show effect
      </button>

      {results.length > 0 && (
        <table>
          <caption>Calculated effect of varying the selected assumption</caption>
          <thead>
            <tr>
              <th scope="col">Value</th>
              <th scope="col">Operating break-even</th>
              <th scope="col">Runway</th>
              <th scope="col">Funding requirement</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const metrics = computeDashboardMetrics(result.projection, result.breakEven);
              return (
                <tr key={result.value}>
                  <th scope="row">{result.value}</th>
                  <td>{formatMonth(result.breakEven.operatingBreakEvenMonth)}</td>
                  <td>
                    {metrics.runwayMonths !== null
                      ? `Depleted month ${metrics.runwayMonths}`
                      : "Never depleted"}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: state.businessProfile!.currency,
                    }).format(metrics.fundingRequirement)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
