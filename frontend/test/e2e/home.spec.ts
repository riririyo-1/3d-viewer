import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.describe("Public Home Page", () => {
    test.beforeEach(async ({ page }) => {
      // Mock auth check - unauthenticated user
      await page.route("**/api/auth/me", async (route) => {
        await route.fulfill({ status: 401 });
      });

      await page.goto("/");
    });

    test("should have correct page title", async ({ page }) => {
      await expect(page).toHaveTitle(/Visionary Geometry/);
    });

    test("should display hero section with title", async ({ page }) => {
      // The home page has "Visionary" and "Geometry." as h2 content
      await expect(page.getByRole("heading", { name: /visionary/i })).toBeVisible();
    });

    test("should display Studio Perspective badge", async ({ page }) => {
      await expect(page.getByText(/Studio Perspective/i)).toBeVisible();
    });

    test("should display three feature cards", async ({ page }) => {
      // Home page has three GlowCards linking to collection, conversion, and share
      await expect(page.getByRole("link", { name: /collection/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /conversion/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /share/i })).toBeVisible();
    });
  });

  test.describe("Navigation from Home (Authenticated)", () => {
    test.beforeEach(async ({ page }) => {
      // Mock authenticated state for navigation tests
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

    test("should navigate to collection from feature card", async ({ page }) => {
      await page.getByRole("link", { name: /collection/i }).click();
      await expect(page).toHaveURL(/\/collection/);
    });

    test("should navigate to conversion from feature card", async ({ page }) => {
      await page.getByRole("link", { name: /conversion/i }).click();
      await expect(page).toHaveURL(/\/conversion/);
    });

    test("should navigate to share from feature card", async ({ page }) => {
      await page.getByRole("link", { name: /share/i }).click();
      await expect(page).toHaveURL(/\/share/);
    });
  });
});
