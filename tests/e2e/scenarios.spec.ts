import { test, expect } from "@playwright/test";

test("founder creates and compares three scenarios", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Business / startup name").fill("Scenario Test Co");
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

  // Navigate to Scenarios (Funding -> Projection -> Break-Even -> Dashboard -> Scenarios)
  for (let i = 0; i < 5; i++) {
    await page.getByRole("button", { name: "Next" }).click();
  }

  await page.getByLabel(/Duplicate the selected scenario/).fill("Conservative");
  await page.getByRole("button", { name: "Duplicate scenario" }).click();
  await page.getByLabel(/Duplicate the selected scenario/).fill("Optimistic");
  await page.getByRole("button", { name: "Duplicate scenario" }).click();

  const table = page.getByRole("table", { name: "Key metrics by scenario" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("row")).toHaveCount(4); // header + 3 scenarios
  await expect(table.getByText("Base Case")).toBeVisible();
  await expect(table.getByText("Conservative")).toBeVisible();
  await expect(table.getByText("Optimistic")).toBeVisible();

  // The comparison surfaces the assumption difference (growth rate), not an opaque label.
  await expect(table.getByText(/10%\/mo/).first()).toBeVisible();
});
