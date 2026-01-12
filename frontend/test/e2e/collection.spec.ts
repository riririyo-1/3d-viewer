import { test, expect } from "@playwright/test";

test("displays collection page title", async ({ page }) => {
  await page.goto("/collection");

  // Verify collection page is loaded by checking for the title
  await expect(
    page.locator("h2").filter({ hasText: /collection/i })
  ).toBeVisible();

  // Verify either empty state message or the grid container is present
  const gridContainer = page.locator(
    'div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4'
  );
  await expect(gridContainer).toBeVisible();
});
