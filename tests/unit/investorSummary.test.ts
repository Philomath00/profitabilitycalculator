import { describe, expect, it } from "vitest";
import { computeMonthlyProjection } from "../../src/domain/projection";
import { computeBreakEven } from "../../src/domain/breakEven";
import { buildInvestorSummaryContent } from "../../src/export/investorSummaryContent";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("buildInvestorSummaryContent", () => {
  const profile = canonicalBusinessProfile({ projectionPeriodMonths: 24 });
  const scenario = canonicalScenario();
  const rows = computeMonthlyProjection(profile, scenario);
  const breakEven = computeBreakEven(rows, scenario);
  const content = buildInvestorSummaryContent(profile, scenario, rows, breakEven);

  it("includes lines from all four categories (FR-033)", () => {
    const categories = new Set(content.lines.map((l) => l.category));
    expect(categories).toEqual(new Set(["fact", "assumption", "calculated_result", "projection"]));
  });

  it("the calculated break-even result matches computeBreakEven exactly", () => {
    const operatingLine = content.lines.find((l) => l.label === "Operating break-even");
    const cumulativeLine = content.lines.find((l) => l.label === "Cumulative break-even");
    expect(operatingLine?.value).toBe("Month 11");
    expect(cumulativeLine?.value).toBe("Month 18");
  });

  it("includes a disclaimer that this is a projection, not a guarantee or advice", () => {
    expect(content.disclaimer).toMatch(/not.*audited/i);
    expect(content.disclaimer).toMatch(/not.*advice/i);
  });

  it("includes a Capital requirement line (FR-032/US4 AC1)", () => {
    const capitalLine = content.lines.find((l) => l.label === "Capital requirement");
    expect(capitalLine).toBeDefined();
    // canonical case never goes cash-negative, so no capital is required
    expect(capitalLine?.value).toMatch(/none/i);
  });

  it("reports a nonzero capital requirement when cash goes negative", () => {
    const tightProfile = canonicalBusinessProfile({
      projectionPeriodMonths: 24,
      startingCash: 50_000,
    });
    const tightRows = computeMonthlyProjection(tightProfile, scenario);
    const tightBreakEven = computeBreakEven(tightRows, scenario);
    const tightContent = buildInvestorSummaryContent(
      tightProfile,
      scenario,
      tightRows,
      tightBreakEven,
    );
    const capitalLine = tightContent.lines.find((l) => l.label === "Capital requirement");
    expect(capitalLine?.value).toMatch(/\$22,500\.60/);
  });

  it("includes at least one Financial risk line (FR-032/US4 AC1)", () => {
    const riskLines = content.lines.filter((l) => l.label === "Financial risk");
    expect(riskLines.length).toBeGreaterThan(0);
    expect(riskLines.every((l) => l.category === "calculated_result")).toBe(true);
  });

  it("never-reached break-even is stated explicitly, not a fabricated month", () => {
    const flatScenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-flat",
          name: "Flat",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 1000,
          growthRatePercentPerMonth: 0,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const flatProfile = canonicalBusinessProfile({ projectionPeriodMonths: 12 });
    const flatRows = computeMonthlyProjection(flatProfile, flatScenario);
    const flatBreakEven = computeBreakEven(flatRows, flatScenario);
    const flatContent = buildInvestorSummaryContent(
      flatProfile,
      flatScenario,
      flatRows,
      flatBreakEven,
    );

    const operatingLine = flatContent.lines.find((l) => l.label === "Operating break-even");
    expect(operatingLine?.value).toBe("Not reached within the selected projection period");
  });
});
