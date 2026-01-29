import { test, expect } from "@playwright/test";
import path from "path";

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

  await page.route("**/api/shares", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
};


test.describe("Collection Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedState(page);

    // Mock initial assets
    await page.route("**/api/assets", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              id: "asset-1",
              name: "cube.glb",
              type: "glb",
              downloadUrl: "/assets/asset-1/download",
              thumbnailUrl: null,
              storagePath: "uploads/cube.glb",
              createdAt: new Date().toISOString(),
            },
            {
              id: "asset-2",
              name: "sphere.obj",
              type: "obj",
              downloadUrl: "/assets/asset-2/download",
              thumbnailUrl: null,
              storagePath: "uploads/sphere.obj",
              createdAt: new Date().toISOString(),
            },
          ]),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "asset-3",
            name: "uploaded.gltf",
            type: "gltf",
            thumbnailUrl: null,
            createdAt: new Date().toISOString(),
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/collection");
  });

  test("should display collection page with title", async ({ page }) => {
    // PageContainer renders h1 with title
    await expect(page.getByRole("heading", { level: 1, name: /collections/i })).toBeVisible();
  });

  test("should list assets in grid view", async ({ page }) => {
    // Check that asset cards are displayed (h4 elements with asset names)
    await expect(page.locator("h4").filter({ hasText: "cube.glb" })).toBeVisible();
    await expect(page.locator("h4").filter({ hasText: "sphere.obj" })).toBeVisible();
  });

  test("should show empty state when no assets", async ({ page }) => {
    // Override the assets mock to return empty array
    await page.route("**/api/assets", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    await page.reload();

    // Check for empty state message - "Inventory Empty" from i18n
    // Both Grid and Table panels are mounted (unmount=false), so use .first()
    await expect(page.getByText(/inventory empty/i).first()).toBeVisible();
  });

  test("should handle file upload", async ({ page }) => {
    // Find the file input (hidden input within label)
    const fileInput = page.locator('input[type="file"][accept=".obj,.glb,.gltf"]');

    // Upload file
    await fileInput.setInputFiles(path.resolve(__dirname, "../fixtures/sample.gltf"));

    // After upload, the page should refresh or stay on collection
    // We just verify no errors occurred and page is still functional
    await expect(page).toHaveURL(/\/collection/);
    await expect(page.getByRole("heading", { level: 1, name: /collections/i })).toBeVisible();
  });

  test("should navigate to viewer when clicking an asset", async ({ page }) => {
    // Mock asset detail endpoint
    await page.route("**/api/assets/asset-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "asset-1",
          name: "cube.glb",
          type: "glb",
          downloadUrl: "/assets/asset-1/download",
          thumbnailUrl: null,
          createdAt: new Date().toISOString(),
        }),
      });
    });

    // Click on the card's thumbnail area to trigger onAssetClick
    // The GlowCard has onClick={() => onAssetClick(asset)} on the whole card
    const cubeCard = page.locator("h4").filter({ hasText: "cube.glb" });
    await expect(cubeCard).toBeVisible();

    // Click the h4 title directly - it's inside the GlowCard's click zone
    // and not blocked by the absolute overlay div in the thumbnail area
    await cubeCard.click();

    // Should navigate to viewer with asset ID
    await expect(page).toHaveURL(/\/viewer\/asset-1/, { timeout: 10000 });
  });

  test("should delete asset with confirmation", async ({ page }) => {
    // Mock delete endpoint
    await page.route("**/api/assets/asset-1", async (route) => {
      if (route.request().method() === "DELETE") {
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });

    // Set up dialog handler before triggering action
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    // Find the h4 element with "cube.glb", navigate up to the card, then find the delete button
    const cubeTitle = page.locator("h4").filter({ hasText: "cube.glb" });
    await expect(cubeTitle).toBeVisible();

    // The delete button is in the same card area - find the closest parent with buttons
    // The card structure: GlowCard > div (content) > div (footer with title + buttons)
    // The Trash2 button is the last button sibling to the share popover
    const cardFooter = cubeTitle.locator("xpath=ancestor::div[contains(@class, 'flex justify-between')]");
    const deleteButton = cardFooter.locator("button").last();

    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Verify the page is still functional (no crash)
    await expect(page).toHaveURL(/\/collection/);
  });
});
