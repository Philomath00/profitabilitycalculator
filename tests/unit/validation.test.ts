import { describe, expect, it } from "vitest";
import { validateInputs } from "../../src/domain/validation";
import { canonicalBusinessProfile, canonicalScenario } from "./fixtures";

describe("validateInputs", () => {
  it("returns no issues for the canonical valid case", () => {
    expect(validateInputs(canonicalBusinessProfile(), canonicalScenario())).toEqual([]);
  });

  it("rejects a negative price", () => {
    const scenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-negative",
          name: "Bad price",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: -5,
          growthRatePercentPerMonth: 0,
          churnRatePercent: 0,
          commissionRatePercent: null,
        },
      ],
    });
    const issues = validateInputs(canonicalBusinessProfile(), scenario);
    expect(issues.some((i) => i.field.includes("pricePerUnit"))).toBe(true);
  });

  it("rejects an out-of-range churn percentage", () => {
    const scenario = canonicalScenario({
      revenueStreams: [
        {
          id: "rs-badchurn",
          name: "Bad churn",
          type: "unit_sale",
          startingValue: 1,
          pricePerUnit: 10,
          growthRatePercentPerMonth: 0,
          churnRatePercent: 150,
          commissionRatePercent: null,
        },
      ],
    });
    const issues = validateInputs(canonicalBusinessProfile(), scenario);
    expect(issues.some((i) => i.field.includes("churnRatePercent"))).toBe(true);
  });

  it("rejects a missing required business name", () => {
    const issues = validateInputs(canonicalBusinessProfile({ name: "" }), canonicalScenario());
    expect(issues.some((i) => i.field === "businessProfile.name")).toBe(true);
  });

  it("rejects an invalid projection period", () => {
    // @ts-expect-error 18 is intentionally not one of the valid periods, for this test
    const invalidProfile = canonicalBusinessProfile({ projectionPeriodMonths: 18 });
    const issues = validateInputs(invalidProfile, canonicalScenario());
    expect(issues.some((i) => i.field === "businessProfile.projectionPeriodMonths")).toBe(true);
  });

  it("rejects negative starting cash", () => {
    const issues = validateInputs(
      canonicalBusinessProfile({ startingCash: -1 }),
      canonicalScenario(),
    );
    expect(issues.some((i) => i.field === "businessProfile.startingCash")).toBe(true);
  });

  it("flags variable percent-of-revenue costs summing above 100%", () => {
    const scenario = canonicalScenario({
      costItems: [
        {
          id: "ci-1",
          name: "A",
          category: "variable",
          amount: 60,
          variableBasis: "percent_of_revenue",
          startMonth: 1,
          endMonth: null,
        },
        {
          id: "ci-2",
          name: "B",
          category: "variable",
          amount: 50,
          variableBasis: "percent_of_revenue",
          startMonth: 1,
          endMonth: null,
        },
      ],
    });
    const issues = validateInputs(canonicalBusinessProfile(), scenario);
    expect(issues.some((i) => i.field === "scenario.costItems")).toBe(true);
  });
});
