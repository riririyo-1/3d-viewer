import { test, expect } from "@playwright/test";

// # -- Helper: Setup Authenticated State --------------
const setupAuthenticatedState = async (page: import("@playwright/test").Page) => {
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
};


// # -- Mock Data: Share Links --------------
const mockShareData = [
  {
    id: "share-id-1",
    shareId: "share-abc",
    assetId: "asset-1",
    shareUrl: null,
    hasPassword: false,
    asset: { name: "shared-box.glb", type: "glb", thumbnailUrl: null },
    viewCount: 10,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];


test.describe("Share Management Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedState(page);

    // Mock shares API
    await page.route("**/api/shares", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockShareData),
        });
      } else {
        await route.continue();
      }
    });

    // Mock delete endpoint
    await page.route("**/api/shares/share-id-1", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });

    await page.goto("/share");
  });

  test("should display share management page title", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /share management/i }),
    ).toBeVisible();
  });

  test("should display share list in table", async ({ page }) => {
    // Check that the share data is displayed in the table
    await expect(page.getByText("shared-box.glb")).toBeVisible();
    await expect(page.getByText("10")).toBeVisible();
  });

  test("should display table headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: /object/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /views/i })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /expires/i })).toBeVisible();
  });

  test("should open dropdown menu for share actions", async ({ page }) => {
    // Find the row with the share data and click the menu trigger
    const row = page.getByRole("row").filter({ hasText: "shared-box.glb" });
    const menuTrigger = row.getByRole("button").last();
    await menuTrigger.click();

    // Check dropdown menu items are visible
    await expect(page.getByRole("menuitem", { name: /コピー/ })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /削除/ })).toBeVisible();
  });

  test("should delete share with confirmation", async ({ page }) => {
    // Set up dialog handler
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // Open the dropdown menu
    const row = page.getByRole("row").filter({ hasText: "shared-box.glb" });
    const menuTrigger = row.getByRole("button").last();
    await menuTrigger.click();

    // Click delete
    await page.getByRole("menuitem", { name: /削除/ }).click();

    // Toast message should appear
    await expect(page.getByText(/deleted successfully|削除しました/i)).toBeVisible();
  });

  test("should show empty state when no shares exist", async ({ page }) => {
    // Override the shares mock to return empty array
    await page.route("**/api/shares", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.reload();

    await expect(page.getByText(/no share links found/i)).toBeVisible();
  });
});
