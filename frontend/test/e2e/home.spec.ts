import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Visionary Geometry/);
});

test("shows main heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("text=STUDIO PERSPECTIVE")).toBeVisible();
});
