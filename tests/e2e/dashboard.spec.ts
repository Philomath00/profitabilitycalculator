import { test, expect } from "@playwright/test";

async function buildCanonicalModel(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByLabel("Business / startup name").fill("Canonical Test Co");
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

test("dashboard shows correct headline metrics and marks the break-even point", async ({
  page,
}) => {
  await buildCanonicalModel(page);

  await page.getByRole("button", { name: "Next" }).click(); // -> Funding
  await page.getByRole("button", { name: "Next" }).click(); // -> Projection
  await page.getByRole("button", { name: "Next" }).click(); // -> Break-Even
  await page.getByRole("button", { name: "Next" }).click(); // -> Dashboard

  const headlineMetrics = page.locator('dl[aria-label="Headline metrics"]');
  await expect(headlineMetrics.getByText("Operating break-even")).toBeVisible();
  await expect(headlineMetrics.getByText("Month 11", { exact: true })).toBeVisible();
  await expect(headlineMetrics.getByText("Cumulative break-even")).toBeVisible();
  await expect(headlineMetrics.getByText("Month 18", { exact: true })).toBeVisible();

  // Break-even is visually marked on the revenue-vs-expenses chart.
  await expect(page.getByText("Break-even: month 11")).toBeVisible();

  // Tabular fallback is present for accessibility (FR-042).
  await page.getByText("View as table").first().click();
  await expect(page.getByRole("table", { name: /Revenue vs\. expenses/i })).toBeVisible();
});
