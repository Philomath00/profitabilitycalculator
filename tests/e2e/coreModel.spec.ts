import { test, expect } from "@playwright/test";

/**
 * User Story 1, Acceptance Scenario 1 (spec.md) / quickstart.md canonical reference case:
 * founder completes Business → Revenue → Expenses → Funding with known inputs and sees the
 * correct operating (month 11) and cumulative (month 18) break-even result.
 */
test("founder builds the canonical model and sees the correct break-even result", async ({
  page,
}) => {
  await page.goto("/");

  // Business step
  await page.getByLabel("Business / startup name").fill("Canonical Test Co");
  await page.getByLabel("Starting cash").fill("100000");

  await page.getByRole("button", { name: "Next" }).click(); // -> Revenue

  // Revenue step: add one stream matching the canonical case (1 unit at $10,000, 10% growth)
  await page.getByRole("button", { name: "Add revenue stream" }).click();
  await page.getByLabel("Starting customers/units").fill("1");
  await page.getByLabel("Price per unit / subscriber").fill("10000");
  await page.getByLabel("Monthly growth rate (%, may be negative)").fill("10");

  await page.getByRole("button", { name: "Next" }).click(); // -> Expenses

  // Expenses step: fixed $20,000/mo + variable 20% of revenue
  await page.getByRole("button", { name: "Add cost item" }).click();
  const fixedFieldset = page.locator("fieldset").filter({ hasText: "Cost item 1" });
  await fixedFieldset.getByLabel("Amount (currency)").fill("20000");

  await page.getByRole("button", { name: "Add cost item" }).click();
  const variableFieldset = page.locator("fieldset").filter({ hasText: "Cost item 2" });
  await variableFieldset.getByLabel("Category").selectOption("variable");
  await variableFieldset.getByLabel("Amount (%)").fill("20");

  await page.getByRole("button", { name: "Next" }).click(); // -> Funding
  await page.getByRole("button", { name: "Next" }).click(); // -> Projection
  await page.getByRole("button", { name: "Next" }).click(); // -> Break-Even

  await expect(page.getByText(/Month 11 — the first month revenue covers/)).toBeVisible();
  await expect(
    page.getByText(/Month 18 — the first month accumulated profit has recovered/),
  ).toBeVisible();
});

test("shows an explicit message when break-even is never reached", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Business / startup name").fill("Never Break Even Co");
  await page.getByLabel("Starting cash").fill("100000");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: "Add revenue stream" }).click();
  await page.getByLabel("Starting customers/units").fill("1");
  await page.getByLabel("Price per unit / subscriber").fill("1000");
  await page.getByLabel("Monthly growth rate (%, may be negative)").fill("0");

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Add cost item" }).click();
  await page
    .locator("fieldset")
    .filter({ hasText: "Cost item 1" })
    .getByLabel("Amount (currency)")
    .fill("20000");

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next" }).click();

  await expect(
    page.getByText("Break-even is not reached within the selected projection period.").first(),
  ).toBeVisible();
});
