import { test, expect } from "@playwright/test";

test("displays collection page title", async ({ page }) => {
  await page.goto("/collection");

  // Verify collection page is loaded
  await expect(page.getByText(/collection/i).first()).toBeVisible();

  // Note: Collection page shows user's personal assets, not library models
  // For a new user with no uploads, it should show empty state
  const emptyMessage = page.getByText(/inventory empty/i);
  await expect(emptyMessage.or(page.locator('div[class*="grid"]'))).toBeVisible();
});
