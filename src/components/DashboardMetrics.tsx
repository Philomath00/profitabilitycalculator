import type { DashboardMetrics as Metrics } from "../domain/dashboardMetrics";

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

function formatMonth(month: number | null): string {
  return month !== null ? `Month ${month}` : "Not reached within projection period";
}

/** FR-026: headline metrics — prioritizes decision-relevant information over every available metric. */
export function DashboardMetrics({ metrics, currency }: { metrics: Metrics; currency: string }) {
  const tiles: { label: string; value: string }[] = [
    { label: "Revenue (final projected month)", value: formatCurrency(metrics.latestRevenue, currency) },
    {
      label: "Gross margin (final projected month)",
      value: metrics.latestGrossMargin !== null ? `${(metrics.latestGrossMargin * 100).toFixed(1)}%` : "N/A",
    },
    {
      label: "Monthly burn (final projected month)",
      value:
        metrics.currentMonthlyBurn !== null
          ? formatCurrency(metrics.currentMonthlyBurn, currency)
          : "Cash flow positive",
    },
    {
      label: "Runway",
      value: metrics.runwayMonths !== null ? `Cash depleted by month ${metrics.runwayMonths}` : "Cash never depleted within projection",
    },
    { label: "Operating break-even", value: formatMonth(metrics.operatingBreakEvenMonth) },
    { label: "Cumulative break-even", value: formatMonth(metrics.cumulativeBreakEvenMonth) },
    { label: "Funding requirement", value: formatCurrency(metrics.fundingRequirement, currency) },
    {
      label: "Projected profitability",
      value: metrics.isProfitableAtEndOfProjection ? "Profitable by end of projection" : "Not yet profitable",
    },
  ];

  return (
    <dl>
      {tiles.map((tile) => (
        <div key={tile.label}>
          <dt>{tile.label}</dt>
          <dd>{tile.value}</dd>
        </div>
      ))}
    </dl>
  );
}
