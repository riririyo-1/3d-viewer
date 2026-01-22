import { test, expect } from "@playwright/test";

test("displays collection page title", async ({ page }) => {
  await page.goto("/collection");

  // Verify collection page is loaded by checking for the title
  await expect(
    page.locator("main h1").filter({ hasText: /collection/i }),
  ).toBeVisible();

  // Verify either empty state message or the grid container is present
  const gridContainer = page.locator(
    "div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-2.xl\\:grid-cols-3",
  );
  await expect(gridContainer).toBeVisible();
});
