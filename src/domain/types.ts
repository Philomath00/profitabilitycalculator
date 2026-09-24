/**
 * Domain types per specs/001-break-even-calculator/data-model.md.
 * No persistence: these shapes live only in in-memory session state (FR-045).
 */

export type BusinessModelType =
  | "saas_subscription"
  | "marketplace"
  | "ecommerce"
  | "service"
  | "transactional"
  | "product"
  | "hybrid"
  | "other";

/** name: required, 1-200 chars. currency: ISO 4217 code. projectionPeriodMonths: one of 12/24/36/60. startingCash: >= 0. */
export interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  businessModelType: BusinessModelType;
  currency: string;
  projectionStartDate: string; // ISO date
  projectionPeriodMonths: 12 | 24 | 36 | 60;
  startingCash: number;
}

export type RevenueStreamType = "subscription" | "unit_sale" | "transaction_commission" | "custom";

/** pricePerUnit/startingValue: >= 0. churnRatePercent/commissionRatePercent: 0-100. growthRatePercentPerMonth may be negative. */
export interface RevenueStream {
  id: string;
  name: string;
  type: RevenueStreamType;
  startingValue: number;
  pricePerUnit: number | null;
  growthRatePercentPerMonth: number;
  churnRatePercent: number;
  commissionRatePercent: number | null;
}

export type CostCategory = "fixed" | "variable" | "one_time_startup" | "growth" | "custom";
export type VariableBasis = "percent_of_revenue" | "per_unit" | null;

/** amount: >= 0. variableBasis: required when category = "variable". startMonth >= 1; endMonth >= startMonth or null (continues to end). */
export interface CostItem {
  id: string;
  name: string;
  category: CostCategory;
  amount: number;
  variableBasis: VariableBasis;
  startMonth: number;
  endMonth: number | null;
}

export type FundingType = "founder_capital" | "investment" | "grant" | "loan" | "other";

/** amount: >= 0. receivedMonth >= 1: the projection month the cash lands (never counted as revenue, FR-012). */
export interface FundingSource {
  id: string;
  type: FundingType;
  amount: number;
  receivedMonth: number;
}

/** A Scenario owns full copies of its own revenue/cost/funding collections (data-model.md: no diff/override model). */
export interface Scenario {
  id: string;
  businessProfileId: string;
  name: string;
  isBaseCase: boolean;
  revenueStreams: RevenueStream[];
  costItems: CostItem[];
  fundingSources: FundingSource[];
}

/** Derived, never independently entered (FR-013, FR-021). */
export interface MonthlyProjectionRow {
  month: number;
  revenue: number;
  fixedCosts: number;
  variableCosts: number;
  totalOperatingExpenses: number;
  grossProfit: number;
  grossMargin: number | null;
  operatingProfitLoss: number;
  netCashFlow: number;
  cashBalance: number;
  cumulativeProfitLoss: number;
  burnRate: number | null;
}

/** Derived (FR-018-020). null means "not reached" / "undefined", never a fabricated value. */
export interface BreakEvenResult {
  operatingBreakEvenMonth: number | null;
  cumulativeBreakEvenMonth: number | null;
  breakEvenUnits: number | null;
}

export interface ValidationIssue {
  field: string;
  message: string;
}
