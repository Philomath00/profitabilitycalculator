import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyProjectionRow } from "../domain/types";

/** FR-028: projected cash balance over time. */
export function CashRunwayChart({
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
    <figure aria-label="Cash position over time">
      <figcaption>Cash Position / Runway</figcaption>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={rows} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5 }} />
          <YAxis tickFormatter={(v: number) => formatter.format(v)} width={90} />
          <Tooltip
            formatter={(value: number) => formatter.format(value)}
            labelFormatter={(m) => `Month ${m}`}
          />
          <ReferenceLine y={0} stroke="#8b0000" strokeDasharray="4 4" label="Cash depleted" />
          <Area
            type="monotone"
            dataKey="cashBalance"
            name="Cash balance"
            stroke="#00695c"
            fill="#00695c"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
      <details>
        <summary>View as table</summary>
        <table>
          <caption>Cash balance by month</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Cash balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <th scope="row">{row.month}</th>
                <td>{formatter.format(row.cashBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
