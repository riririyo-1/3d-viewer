import { test, expect } from "@playwright/test";

// # -- Mock Data: Shared Asset Info --------------
const mockShareInfo = {
  id: "share-record-1",
  shareId: "share-123",
  hasPassword: false,
  asset: {
    id: "asset-pub-1",
    name: "public-cube.glb",
    type: "glb",
    thumbnailUrl: null,
    createdAt: new Date().toISOString(),
  },
};


test.describe("Public Share Viewer", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the public share info endpoint
    await page.route("**/api/shared/share-123", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockShareInfo),
        });
      } else {
        await route.continue();
      }
    });

    // Mock download endpoint (returns signed URL for model)
    await page.route("**/api/shared/share-123/download", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "http://localhost:4000/public/cube.glb" }),
      });
    });

    // Mock the model file download
    await page.route("**/public/cube.glb", async (route) => {
      await route.fulfill({
        status: 200,
        body: "mock-binary-content",
        headers: { "Content-Type": "application/octet-stream" },
      });
    });

    // Mock auth check (public page - no token required)
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({ status: 401 });
    });
  });

  test("should load shared asset without login", async ({ page }) => {
    await page.goto("/shared/share-123");

    // Should display asset name in the footer info area
    await expect(page.getByText("public-cube.glb")).toBeVisible({ timeout: 10000 });

    // Canvas may or may not render depending on Three.js initialization with mock data
    // Verify the viewer container is present (the main layout renders regardless)
    await expect(page.locator("canvas")).toBeAttached({ timeout: 10000 });
  });

  test("should display download button", async ({ page }) => {
    await page.goto("/shared/share-123");

    // The download button should be visible
    const downloadBtn = page.getByRole("button").filter({ has: page.locator("svg") });
    await expect(downloadBtn.first()).toBeVisible();
  });

  test("should show error for invalid share link", async ({ page }) => {
    // Mock invalid share link
    await page.route("**/api/shared/invalid-id", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Share not found" }),
      });
    });

    await page.goto("/shared/invalid-id");

    // Should display error state
    await expect(page.getByText(/共有リンクが無効です/)).toBeVisible();
  });

  test("should show password wall for protected share", async ({ page }) => {
    // Override to return a password-protected share
    await page.route("**/api/shared/protected-share", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ...mockShareInfo,
            shareId: "protected-share",
            hasPassword: true,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/shared/protected-share");

    // Should display password form
    await expect(page.getByText(/限定公開/)).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
    await expect(page.getByRole("button", { name: /閲覧する/ })).toBeVisible();
  });
});
