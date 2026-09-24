import type { MonthlyProjectionRow } from "../domain/types";

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/** FR-021: month, revenue, expenses, profit/loss, cash balance, cumulative profit/loss. */
export function ProjectionTable({
  rows,
  currency,
}: {
  rows: MonthlyProjectionRow[];
  currency: string;
}) {
  return (
    <table>
      <caption>Monthly financial projection</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">Revenue</th>
          <th scope="col">Total expenses</th>
          <th scope="col">Profit / loss</th>
          <th scope="col">Cash balance</th>
          <th scope="col">Cumulative profit / loss</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.month}>
            <th scope="row">{row.month}</th>
            <td>{formatCurrency(row.revenue, currency)}</td>
            <td>{formatCurrency(row.totalOperatingExpenses, currency)}</td>
            <td>{formatCurrency(row.operatingProfitLoss, currency)}</td>
            <td>{formatCurrency(row.cashBalance, currency)}</td>
            <td>{formatCurrency(row.cumulativeProfitLoss, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
