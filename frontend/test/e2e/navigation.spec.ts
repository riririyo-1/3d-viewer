import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth and API to prevent redirect issues
    await page.addInitScript(() => {
      localStorage.setItem("token", "fake-token");
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-1",
          email: "test@example.com",
          plan: "free",
        }),
      });
    });

    await page.route("**/api/shares", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.route("**/api/assets", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/");
  });

  test("should navigate to collection page from home", async ({ page }) => {
    await page.getByRole("link", { name: /collection/i }).first().click();

    await expect(page).toHaveURL(/\/collection/);
    await expect(page.getByRole("heading", { level: 1, name: /collections/i })).toBeVisible();
  });

  test("should navigate to conversion page from home", async ({ page }) => {
    await page.getByRole("link", { name: /conversion/i }).first().click();

    await expect(page).toHaveURL(/\/conversion/);
    await expect(page.getByRole("heading", { level: 1, name: /conversion/i })).toBeVisible();
  });

  test("should navigate to share page from home", async ({ page }) => {
    await page.getByRole("link", { name: /share/i }).first().click();

    await expect(page).toHaveURL(/\/share/);
    await expect(page.getByRole("heading", { level: 1, name: /share management/i })).toBeVisible();
  });

  test("should navigate back to home from collection page", async ({ page }) => {
    await page.goto("/collection");

    // Click the "Studio" back link in PageContainer (exact match to avoid "StudioView")
    const backLink = page.getByRole("link", { name: "Studio", exact: true });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page).toHaveURL("/");
  });
});
