import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock shares API to avoid redirect to login
    await page.route("**/api/shares", async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });
    await page.goto("/");
  });

  test("should navigate to collection page", async ({ page }) => {
    await page.click('a[href="/collection"]');
    await expect(page).toHaveURL(/.*\/collection/);
    await expect(page.locator("main h1")).toContainText(/collection/i);
  });

  test("should navigate to conversion page", async ({ page }) => {
    await page.click('a[href="/conversion"]');
    await expect(page).toHaveURL(/.*\/conversion/);
    await expect(page.locator("main h1")).toContainText(/conversion/i);
  });

  test("should navigate to share page", async ({ page }) => {
    await page.click('a[href="/share"]');
    await expect(page).toHaveURL(/.*\/share/);
    await expect(page.locator("main h1")).toContainText(/share management/i);
  });
});
