import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * T065: automated accessibility verification (FR-041, constitution Principle XV) beyond
 * manual semantic-HTML construction. Scans every guided-flow step with axe-core's WCAG 2.1
 * A/AA ruleset for violations.
 */
async function buildCanonicalModel(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Business / startup name").fill("A11y Test Co");
  await page.getByLabel("Starting cash").fill("100000");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: "Add revenue stream" }).click();
  await page.getByLabel("Starting customers/units").fill("1");
  await page.getByLabel("Price per unit / subscriber").fill("10000");
  await page.getByLabel("Monthly growth rate (%, may be negative)").fill("10");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: "Add cost item" }).click();
  await page
    .locator("fieldset")
    .filter({ hasText: "Cost item 1" })
    .getByLabel("Amount (currency)")
    .fill("20000");
  await page.getByRole("button", { name: "Add cost item" }).click();
  const variableFieldset = page.locator("fieldset").filter({ hasText: "Cost item 2" });
  await variableFieldset.getByLabel("Category").selectOption("variable");
  await variableFieldset.getByLabel("Amount (%)").fill("20");
}

const STEPS = [
  "Business",
  "Revenue",
  "Expenses",
  "Funding",
  "Projection",
  "Break-Even",
  "Dashboard",
  "Scenarios",
  "Sensitivity",
  "Investor View",
];

test("every guided-flow step has no automated WCAG 2.1 A/AA violations", async ({ page }) => {
  await buildCanonicalModel(page);

  for (const step of STEPS) {
    await page.getByRole("button", { name: step, exact: true }).click();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(
      results.violations,
      `Violations on "${step}" step: ${JSON.stringify(results.violations, null, 2)}`,
    ).toEqual([]);
  }
});
