import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyProjectionRow } from "../domain/types";

/**
 * FR-027/030/031: shows when revenue crosses expenses, marks the break-even point, uses a
 * non-color-only encoding (solid vs. dashed lines) so the chart doesn't rely on color alone,
 * and provides a numerical/tabular fallback (FR-042).
 */
export function RevenueExpensesChart({
  rows,
  operatingBreakEvenMonth,
  currency,
}: {
  rows: MonthlyProjectionRow[];
  operatingBreakEvenMonth: number | null;
  currency: string;
}) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return (
    <figure aria-label="Revenue versus expenses over time">
      <figcaption>Revenue vs. Expenses</figcaption>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5 }} />
          <YAxis tickFormatter={(v: number) => formatter.format(v)} width={90} />
          <Tooltip
            formatter={(value: number) => formatter.format(value)}
            labelFormatter={(m) => `Month ${m}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#1b5e20"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="totalOperatingExpenses"
            name="Expenses"
            stroke="#8b0000"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
          {operatingBreakEvenMonth !== null && (
            <ReferenceLine
              x={operatingBreakEvenMonth}
              stroke="#333"
              strokeDasharray="2 2"
              label={{ value: `Break-even: month ${operatingBreakEvenMonth}`, position: "top" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <details>
        <summary>View as table</summary>
        <table>
          <caption>Revenue vs. expenses by month</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Revenue</th>
              <th scope="col">Expenses</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                <td>{formatter.format(row.revenue)}</td>
                <td>{formatter.format(row.totalOperatingExpenses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
