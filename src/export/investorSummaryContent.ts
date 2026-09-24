import type { BreakEvenResult, BusinessProfile, MonthlyProjectionRow, Scenario } from "../domain/types";

export type InvestorSummaryCategory = "fact" | "assumption" | "calculated_result" | "projection";

export interface InvestorSummaryLine {
  label: string;
  value: string;
  category: InvestorSummaryCategory;
}

export interface InvestorSummaryContent {
  title: string;
  lines: InvestorSummaryLine[];
  disclaimer: string;
}

function formatMonth(month: number | null): string {
  return month !== null ? `Month ${month}` : "Not reached within the selected projection period";
}

/**
 * Per data-model.md's InvestorSummary section and contracts/investor-summary-export.md: pure
 * data assembly, entirely from computeMonthlyProjection()/computeBreakEven() output — never a
 * separate calculation — so the exported document can never disagree with the on-screen
 * dashboard (contracts/investor-summary-export.md).
 */
export function buildInvestorSummaryContent(
  businessProfile: BusinessProfile,
  scenario: Scenario,
  projection: MonthlyProjectionRow[],
  breakEven: BreakEvenResult,
): InvestorSummaryContent {
  const lastRow = projection[projection.length - 1];
  const currency = businessProfile.currency;
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });

  const lines: InvestorSummaryLine[] = [
    { label: "Business name", value: businessProfile.name, category: "fact" },
    { label: "Business model", value: businessProfile.businessModelType, category: "fact" },
    { label: "Currency", value: businessProfile.currency, category: "fact" },
    {
      label: "Projection period",
      value: `${businessProfile.projectionPeriodMonths} months from ${businessProfile.projectionStartDate}`,
      category: "fact",
    },
    { label: "Scenario", value: scenario.name, category: "fact" },
    { label: "Starting cash", value: formatter.format(businessProfile.startingCash), category: "fact" },

    ...scenario.revenueStreams.map((s) => ({
      label: `Revenue assumption: ${s.name || "Revenue stream"}`,
      value: `Starting value ${s.startingValue}, growth ${s.growthRatePercentPerMonth}%/mo, churn ${s.churnRatePercent}%`,
      category: "assumption" as const,
    })),
    ...scenario.costItems.map((c) => ({
      label: `Cost assumption: ${c.name || "Cost item"}`,
      value: `${c.category}, amount ${c.amount}${c.variableBasis ? ` (${c.variableBasis})` : ""}`,
      category: "assumption" as const,
    })),

    {
      label: "Operating break-even",
      value: formatMonth(breakEven.operatingBreakEvenMonth),
      category: "calculated_result",
    },
    {
      label: "Cumulative break-even",
      value: formatMonth(breakEven.cumulativeBreakEvenMonth),
      category: "calculated_result",
    },
    {
      label: "Gross margin (final projected month)",
      value: lastRow?.grossMargin !== null && lastRow?.grossMargin !== undefined
        ? `${(lastRow.grossMargin * 100).toFixed(1)}%`
        : "N/A",
      category: "calculated_result",
    },
    {
      label: "Runway",
      value: projection.some((r) => r.cashBalance < 0)
        ? `Cash depleted by month ${projection.find((r) => r.cashBalance < 0)!.month}`
        : "Cash never depleted within the projection",
      category: "calculated_result",
    },

    {
      label: "Projected revenue trajectory (final projected month)",
      value: formatter.format(lastRow?.revenue ?? 0),
      category: "projection",
    },
    {
      label: "Projected profitability (final projected month)",
      value: formatter.format(lastRow?.operatingProfitLoss ?? 0),
      category: "projection",
    },
  ];

  return {
    title: `Investor Summary — ${businessProfile.name} (${scenario.name})`,
    lines,
    disclaimer:
      "This document presents projections based on assumptions supplied by the founder. " +
      "It is not an audited financial statement, a guarantee of future results, or " +
      "financial, investment, or accounting advice.",
  };
}
