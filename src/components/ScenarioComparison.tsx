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
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 });

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
            <th scope="col">Operating break-even</th>
            <th scope="col">Cumulative break-even</th>
            <th scope="col">Runway</th>
            <th scope="col">Funding requirement</th>
          </tr>
        </thead>
        <tbody>
          {computed.map(({ scenario, metrics }) => (
            <tr key={scenario.id}>
              <th scope="row">{scenario.name}</th>
              <td>
                {scenario.revenueStreams
                  .map((s) => `${s.name || "Revenue"}: ${s.growthRatePercentPerMonth}%/mo`)
                  .join(", ") || "No revenue streams"}
              </td>
              <td>{formatter.format(metrics.latestRevenue)}</td>
              <td>{formatMonth(metrics.operatingBreakEvenMonth)}</td>
              <td>{formatMonth(metrics.cumulativeBreakEvenMonth)}</td>
              <td>{metrics.runwayMonths !== null ? `Depleted month ${metrics.runwayMonths}` : "Never depleted"}</td>
              <td>{formatter.format(metrics.fundingRequirement)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <figure aria-label="Cumulative profit and loss by scenario">
        <figcaption>Scenario comparison: cumulative profit/loss over time</figcaption>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5 }} />
            <YAxis tickFormatter={(v: number) => formatter.format(v)} width={90} />
            <Tooltip formatter={(value: number) => formatter.format(value)} labelFormatter={(m) => `Month ${m}`} />
            <Legend />
            {computed.map(({ scenario }, index) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.name}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeDasharray={index % 2 === 1 ? "6 4" : undefined}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </figure>
    </div>
  );
}
