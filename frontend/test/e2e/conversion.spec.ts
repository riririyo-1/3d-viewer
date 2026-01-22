import { test, expect } from "@playwright/test";

test.describe("Conversion Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/conversion");
  });

  test("should display conversion options", async ({ page }) => {
    await expect(page.locator("main h1")).toContainText(/conversion/i);
    await expect(page.getByText(/OBJ → GLB/)).toBeVisible();
    await expect(page.getByText(/OBJ → GLTF/)).toBeVisible();
  });

  test("should show upload area", async ({ page }) => {
    // Check for dropzone text
    await expect(page.getByText(/Select File/i).first()).toBeVisible();
    await expect(
      page.getByText(/Supported format: .obj/i).first(),
    ).toBeVisible();
  });
});
