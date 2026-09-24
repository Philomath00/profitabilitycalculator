import { test, expect } from "@playwright/test";

test("founder runs a sensitivity analysis and sees a calculated effect", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Business / startup name").fill("Sensitivity Test Co");
  await page.getByLabel("Starting cash").fill("100000");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: "Add revenue stream" }).click();
  await page.getByLabel("Starting customers/units").fill("1");
  await page.getByLabel("Price per unit / subscriber").fill("10000");
  await page.getByLabel("Monthly growth rate (%, may be negative)").fill("10");
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByRole("button", { name: "Add cost item" }).click();
  await page.locator("fieldset").filter({ hasText: "Cost item 1" }).getByLabel("Amount (currency)").fill("20000");
  await page.getByRole("button", { name: "Add cost item" }).click();
  const variableFieldset = page.locator("fieldset").filter({ hasText: "Cost item 2" });
  await variableFieldset.getByLabel("Category").selectOption("variable");
  await variableFieldset.getByLabel("Amount (%)").fill("20");

  // Navigate: Funding -> Projection -> Break-Even -> Dashboard -> Scenarios -> Sensitivity
  for (let i = 0; i < 6; i++) {
    await page.getByRole("button", { name: "Next" }).click();
  }

  await page
    .getByLabel("Assumption to vary")
    .selectOption("revenueStreams[0].growthRatePercentPerMonth");
  await page.getByLabel("Candidate values (comma-separated)").fill("5, 10, 15");
  await page.getByRole("button", { name: "Show effect" }).click();

  const table = page.getByRole("table", { name: "Calculated effect of varying the selected assumption" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(4); // header + 3 candidate values
});
