import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { computeMonthlyProjection } from "../domain/projection";
import { computeBreakEven } from "../domain/breakEven";
import { computeDashboardMetrics } from "../domain/dashboardMetrics";
import type { BusinessProfile, Scenario } from "../domain/types";

const LINE_COLORS = ["#1b5e20", "#0d47a1", "#8b0000", "#6a1b9a", "#e65100"];
// One dash pattern per color (undefined = solid) so every scenario line is distinguishable
// by shape alone, not just color (FR-031) — previously only 2 patterns cycled, so scenario 0
// and scenario 2 rendered as identical solid lines.
const DASH_PATTERNS = [undefined, "6 4", "2 2", "8 3 2 3", "1 4"];

function formatMonth(month: number | null): string {
  return month !== null ? `Month ${month}` : "Not reached";
}

/**
 * FR-024/029: compares scenarios side by side across revenue, expenses, profitability,
 * break-even, runway, and cash requirements, and visualizes the differences. FR-023
 * (acceptance scenario 3): surfaces the assumption differences driving each scenario rather
 * than an opaque label.
 */
export function ScenarioComparison({
  businessProfile,
  scenarios,
}: {
  businessProfile: BusinessProfile;
  scenarios: Scenario[];
}) {
  const currency = businessProfile.currency;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  const computed = scenarios.map((scenario) => {
    const rows = computeMonthlyProjection(businessProfile, scenario);
    const breakEven = computeBreakEven(rows, scenario);
    const metrics = computeDashboardMetrics(rows, breakEven);
    return { scenario, rows, breakEven, metrics };
  });

  const chartData = Array.from({ length: businessProfile.projectionPeriodMonths }, (_, i) => {
    const month = i + 1;
    const point: Record<string, number> = { month };
    computed.forEach(({ scenario, rows }) => {
      point[scenario.name] = rows[i]?.cumulativeProfitLoss ?? 0;
    });
    return point;
  });

  return (
    <div aria-labelledby="scenario-comparison-heading">
      <h3 id="scenario-comparison-heading">Scenario Comparison</h3>

      <table>
        <caption>Key metrics by scenario</caption>
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            <th scope="col">Key assumption (growth rate)</th>
            <th scope="col">Final-month revenue</th>
            <th scope="col">Final-month expenses</th>
            <th scope="col">Final-month profit/loss</th>
            <th scope="col">Operating break-even</th>
            <th scope="col">Cumulative break-even</th>
            <th scope="col">Runway</th>
            <th scope="col">Funding requirement</th>
          </tr>
        </thead>
        <tbody>
          {computed.map(({ scenario, rows, metrics }) => {
            const lastRow = rows[rows.length - 1];
            return (
              <tr key={scenario.id}>
                <th scope="row">{scenario.name}</th>
                <td>
                  {scenario.revenueStreams
                    .map((s) => `${s.name || "Revenue"}: ${s.growthRatePercentPerMonth}%/mo`)
                    .join(", ") || "No revenue streams"}
                </td>
                <td>{formatter.format(metrics.latestRevenue)}</td>
                <td>{formatter.format(lastRow?.totalOperatingExpenses ?? 0)}</td>
                <td>{formatter.format(lastRow?.operatingProfitLoss ?? 0)}</td>
                <td>{formatMonth(metrics.operatingBreakEvenMonth)}</td>
                <td>{formatMonth(metrics.cumulativeBreakEvenMonth)}</td>
                <td>
                  {metrics.runwayMonths !== null
                    ? `Depleted month ${metrics.runwayMonths}`
                    : "Never depleted"}
                </td>
                <td>{formatter.format(metrics.fundingRequirement)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <figure aria-label="Cumulative profit and loss by scenario">
        <figcaption>Scenario comparison: cumulative profit/loss over time</figcaption>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              label={{ value: "Month", position: "insideBottom", offset: -5 }}
            />
            <YAxis tickFormatter={(v: number) => formatter.format(v)} width={90} />
            <Tooltip
              formatter={(value: number) => formatter.format(value)}
              labelFormatter={(m) => `Month ${m}`}
            />
            <Legend />
            {computed.map(({ scenario }, index) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.name}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeDasharray={DASH_PATTERNS[index % DASH_PATTERNS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <details>
          <summary>View as table</summary>
          <table>
            <caption>Cumulative profit/loss by scenario, by month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                {computed.map(({ scenario }) => (
                  <th scope="col" key={scenario.id}>
                    {scenario.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((point) => (
                <tr key={point.month}>
                  <th scope="row">{point.month}</th>
                  {computed.map(({ scenario }) => (
                    <td key={scenario.id}>{formatter.format(point[scenario.name] ?? 0)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>
    </div>
  );
}
