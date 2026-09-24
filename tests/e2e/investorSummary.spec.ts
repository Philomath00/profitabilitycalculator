import { test, expect } from "@playwright/test";

test("founder generates and downloads the investor summary with no network requests", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("Business / startup name").fill("Investor Test Co");
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

  // Navigate: Funding -> Projection -> Break-Even -> Dashboard -> Scenarios -> Sensitivity -> Investor View
  for (let i = 0; i < 7; i++) {
    await page.getByRole("button", { name: "Next" }).click();
  }

  await expect(page.getByText(/Facts/)).toBeVisible();
  await expect(page.getByText(/Assumptions/)).toBeVisible();
  await expect(page.getByText(/Calculated results/)).toBeVisible();
  await expect(page.getByText(/Projections/)).toBeVisible();
  await expect(page.getByRole("note")).toContainText(/not.*audited/i);
  await expect(page.getByRole("note")).toContainText(/not.*advice/i);

  const requestsDuringDownload: string[] = [];
  const listener = (req: import("@playwright/test").Request) =>
    requestsDuringDownload.push(req.url());
  page.on("request", listener);

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download investor summary (PDF)" }).click(),
  ]);

  page.off("request", listener);
  expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  expect(requestsDuringDownload).toHaveLength(0);
});
