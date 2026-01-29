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

  await page.route("**/api/shares", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
};


// # -- Helper: Navigate to Viewer via Collection Page --------------
const navigateToViewer = async (page: import("@playwright/test").Page) => {
  await page.route("**/api/assets", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{
          id: "asset-1",
          name: "cube.glb",
          type: "glb",
          downloadUrl: "/assets/asset-1/download",
          thumbnailUrl: null,
          storagePath: "uploads/cube.glb",
          createdAt: new Date().toISOString(),
        }]),
      });
    } else {
      await route.continue();
    }
  });

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

  await page.route("**/assets/asset-1/download", async (route) => {
    await route.fulfill({
      status: 200,
      body: "mock-binary",
      headers: { "Content-Type": "application/octet-stream" },
    });
  });

  // Navigate to collection first to establish auth state
  await page.goto("/collection");
  // Wait for authenticated content to render
  await expect(page.getByTestId("account-button")).toBeVisible({ timeout: 10000 });
  await expect(page.locator("h4").filter({ hasText: "cube.glb" })).toBeVisible({ timeout: 10000 });

  // Click on the asset type badge to navigate to viewer
  await page.getByText("glb", { exact: true }).first().click();
  await expect(page).toHaveURL(/\/viewer\/asset-1/, { timeout: 10000 });
};


test.describe("3D Viewer", () => {
  // Run serially to avoid race conditions with auth state
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedState(page);
    await navigateToViewer(page);
  });

  test("should render viewer page with 3D canvas area", async ({ page }) => {
    // The ViewerCanvas component creates a canvas element via Three.js/R3F
    await expect(page.locator("canvas")).toBeAttached({ timeout: 15000 });
  });

  test("should display viewer control buttons in footer", async ({ page }) => {
    // Control buttons are inside a footer element
    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 15000 });

    // Check that the control buttons are present
    await expect(footer.getByText(/wireframe/i)).toBeVisible();
    await expect(footer.getByText(/grid/i)).toBeVisible();
    await expect(footer.getByText(/spin/i)).toBeVisible();
  });

  test("should toggle wireframe control", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 15000 });

    // Wait for DOM to stabilize after initial render
    await page.waitForTimeout(1000);

    // Click wireframe button - it should toggle active state
    const wireframeBtn = footer.locator("button").filter({ hasText: /wireframe/i });
    await expect(wireframeBtn).toBeVisible();

    // Get initial class to verify toggle changes it
    const initialClass = await wireframeBtn.getAttribute("class");
    await wireframeBtn.click({ force: true });

    // After clicking, the button should still exist (no crash)
    await expect(footer.locator("button").filter({ hasText: /wireframe/i })).toBeVisible();
    const newClass = await footer.locator("button").filter({ hasText: /wireframe/i }).getAttribute("class");
    expect(newClass).not.toBe(initialClass);
  });

  test("should display back button to collection", async ({ page }) => {
    // The viewer/[id] page has a back button (ArrowLeft icon)
    const backButton = page.locator("button").filter({ has: page.locator("svg") }).first();
    await expect(backButton).toBeVisible({ timeout: 15000 });
  });
});
