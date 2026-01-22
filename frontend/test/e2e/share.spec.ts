import { test, expect } from "@playwright/test";

test.describe("Share Management Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock shares API to avoid redirect to login
    await page.route("**/api/shares", async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });
    await page.goto("/share");
  });

  test("should display share management title", async ({ page }) => {
    await expect(page.locator("main h1")).toContainText(/share management/i);
  });

  test("should display empty state or table", async ({ page }) => {
    // Determine if we have data or empty state.
    // Since we don't mock backend in simple e2e, we check for presence of main table structure OR "No share links found"

    // We expect the table headers to be present if not loading strings unique to table
    // Actually, if empty, our component renders "No share links found" div, NOT the table.
    // So we check for either.

    const emptyState = page.getByText(/No share links found/i);
    const tableHeader = page.getByRole("columnheader", { name: /Object/i });

    // Wait for loading to finish (text "Loading..." disappears)
    await expect(page.getByText(/Loading.../i)).not.toBeVisible();

    // Check if either empty state or table header is visible
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();
    } else {
      await expect(tableHeader).toBeVisible();
    }
  });
});
