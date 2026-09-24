import type {
  BusinessProfile,
  CostItem,
  FundingSource,
  RevenueStream,
  Scenario,
  ValidationIssue,
} from "./types";

const VALID_PERIODS = [12, 24, 36, 60];
const ISO_CURRENCY = /^[A-Z]{3}$/;

/**
 * Per contracts/calculation-engine.md `validateInputs`: returns an empty array when all
 * data-model.md validation rules pass (FR-035-037). Every issue names a field and a
 * plain-language reason.
 */
export function validateInputs(
  businessProfile: Partial<BusinessProfile>,
  scenario: Partial<Scenario>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  issues.push(...validateBusinessProfile(businessProfile));

  const revenueStreams = scenario.revenueStreams ?? [];
  const costItems = scenario.costItems ?? [];
  const fundingSources = scenario.fundingSources ?? [];

  if (revenueStreams.length === 0) {
    issues.push({ field: "scenario.revenueStreams", message: "At least one revenue stream is required." });
  }
  revenueStreams.forEach((stream, index) => issues.push(...validateRevenueStream(stream, index)));
  costItems.forEach((item, index) => issues.push(...validateCostItem(item, index)));
  fundingSources.forEach((source, index) => issues.push(...validateFundingSource(source, index)));

  // Contradictory-input edge case (FR-035): percent-of-revenue variable costs summing above
  // 100% against a business with a single aggregate revenue base is nonsensical.
  const percentOfRevenueTotal = costItems
    .filter((item) => item.category === "variable" && item.variableBasis === "percent_of_revenue")
    .reduce((sum, item) => sum + item.amount, 0);
  if (percentOfRevenueTotal > 100) {
    issues.push({
      field: "scenario.costItems",
      message: `Variable costs set as a percent of revenue sum to ${percentOfRevenueTotal}%, which exceeds 100%.`,
    });
  }

  return issues;
}

function validateBusinessProfile(profile: Partial<BusinessProfile>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!profile.name || profile.name.trim().length === 0) {
    issues.push({ field: "businessProfile.name", message: "Business name is required." });
  } else if (profile.name.length > 200) {
    issues.push({ field: "businessProfile.name", message: "Business name must be 200 characters or fewer." });
  }

  if (!profile.currency || !ISO_CURRENCY.test(profile.currency)) {
    issues.push({
      field: "businessProfile.currency",
      message: "Currency must be a 3-letter ISO 4217 code (e.g. USD).",
    });
  }

  if (!profile.projectionPeriodMonths || !VALID_PERIODS.includes(profile.projectionPeriodMonths)) {
    issues.push({
      field: "businessProfile.projectionPeriodMonths",
      message: "Projection period must be one of 12, 24, 36, or 60 months.",
    });
  }

  if (profile.startingCash === undefined || profile.startingCash === null) {
    issues.push({ field: "businessProfile.startingCash", message: "Starting cash is required." });
  } else if (profile.startingCash < 0) {
    issues.push({ field: "businessProfile.startingCash", message: "Starting cash cannot be negative." });
  }

  return issues;
}

function validateRevenueStream(stream: RevenueStream, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const prefix = `scenario.revenueStreams[${index}]`;

  if (!stream.name || stream.name.trim().length === 0) {
    issues.push({ field: `${prefix}.name`, message: "Revenue stream name is required." });
  }
  if (stream.startingValue < 0) {
    issues.push({ field: `${prefix}.startingValue`, message: "Starting value cannot be negative." });
  }
  if (stream.type !== "transaction_commission") {
    if (stream.pricePerUnit === null || stream.pricePerUnit === undefined) {
      issues.push({
        field: `${prefix}.pricePerUnit`,
        message: "Price per unit is required for this revenue stream type.",
      });
    } else if (stream.pricePerUnit < 0) {
      issues.push({ field: `${prefix}.pricePerUnit`, message: "Price per unit cannot be negative." });
    }
  } else if (
    stream.commissionRatePercent === null ||
    stream.commissionRatePercent === undefined
  ) {
    issues.push({
      field: `${prefix}.commissionRatePercent`,
      message: "Commission rate is required for a transaction/commission revenue stream.",
    });
  }
  if (stream.churnRatePercent < 0 || stream.churnRatePercent > 100) {
    issues.push({ field: `${prefix}.churnRatePercent`, message: "Churn rate must be between 0 and 100." });
  }
  if (
    stream.commissionRatePercent !== null &&
    stream.commissionRatePercent !== undefined &&
    (stream.commissionRatePercent < 0 || stream.commissionRatePercent > 100)
  ) {
    issues.push({
      field: `${prefix}.commissionRatePercent`,
      message: "Commission rate must be between 0 and 100.",
    });
  }

  return issues;
}

function validateCostItem(item: CostItem, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const prefix = `scenario.costItems[${index}]`;

  if (!item.name || item.name.trim().length === 0) {
    issues.push({ field: `${prefix}.name`, message: "Cost item name is required." });
  }
  if (item.amount < 0) {
    issues.push({ field: `${prefix}.amount`, message: "Cost amount cannot be negative." });
  }
  if (item.category === "variable" && !item.variableBasis) {
    issues.push({
      field: `${prefix}.variableBasis`,
      message: "Variable costs must specify a basis (percent of revenue or per unit).",
    });
  }
  if (item.startMonth < 1) {
    issues.push({ field: `${prefix}.startMonth`, message: "Start month must be 1 or greater." });
  }
  if (item.endMonth !== null && item.endMonth !== undefined && item.endMonth < item.startMonth) {
    issues.push({ field: `${prefix}.endMonth`, message: "End month cannot be before start month." });
  }

  return issues;
}

function validateFundingSource(source: FundingSource, index: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const prefix = `scenario.fundingSources[${index}]`;

  if (source.amount < 0) {
    issues.push({ field: `${prefix}.amount`, message: "Funding amount cannot be negative." });
  }
  if (source.receivedMonth < 1) {
    issues.push({ field: `${prefix}.receivedMonth`, message: "Received month must be 1 or greater." });
  }

  return issues;
}
