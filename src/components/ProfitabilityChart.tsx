import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyProjectionRow } from "../domain/types";

/** FR-028: monthly profit/loss and progression toward profitability. */
export function ProfitabilityChart({
  rows,
  currency,
}: {
  rows: MonthlyProjectionRow[];
  currency: string;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <figure aria-label="Profitability over time">
      <figcaption>Profitability Over Time</figcaption>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5 }} />
          <YAxis tickFormatter={(v: number) => formatter.format(v)} width={90} />
          <Tooltip
            formatter={(value: number) => formatter.format(value)}
            labelFormatter={(m) => `Month ${m}`}
          />
          <Line
            type="monotone"
            dataKey="operatingProfitLoss"
            name="Monthly profit/loss"
            stroke="#0d47a1"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cumulativeProfitLoss"
            name="Cumulative profit/loss"
            stroke="#6a1b9a"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <details>
        <summary>View as table</summary>
        <table>
          <caption>Monthly and cumulative profit/loss by month</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Monthly profit/loss</th>
              <th scope="col">Cumulative profit/loss</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                <td>{formatter.format(row.operatingProfitLoss)}</td>
                <td>{formatter.format(row.cumulativeProfitLoss)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
