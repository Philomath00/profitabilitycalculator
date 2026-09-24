import type { AnnualSummaryRow } from "../domain/annualSummary";

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

/** FR-022: annual summaries, derived by aggregating the monthly rows — never computed independently. */
export function AnnualSummaryTable({
  years,
  currency,
}: {
  years: AnnualSummaryRow[];
  currency: string;
}) {
  return (
    <table>
      <caption>Annual summary</caption>
      <thead>
        <tr>
          <th scope="col">Year</th>
          <th scope="col">Revenue</th>
          <th scope="col">Total expenses</th>
          <th scope="col">Profit / loss</th>
          <th scope="col">Ending cash balance</th>
          <th scope="col">Ending cumulative profit / loss</th>
        </tr>
      </thead>
      <tbody>
        {years.map((year) => (
          <tr key={year.year}>
            <th scope="row">
              Year {year.year}
              {year.monthsIncluded < 12 ? ` (${year.monthsIncluded} months)` : ""}
            </th>
            <td>{formatCurrency(year.revenue, currency)}</td>
            <td>{formatCurrency(year.totalOperatingExpenses, currency)}</td>
            <td>{formatCurrency(year.operatingProfitLoss, currency)}</td>
            <td>{formatCurrency(year.endingCashBalance, currency)}</td>
            <td>{formatCurrency(year.endingCumulativeProfitLoss, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
