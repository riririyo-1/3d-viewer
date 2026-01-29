import { test, expect } from "@playwright/test";

// # -- Helper: Common Auth Mocks --------------
const mockUnauthenticated = async (page: import("@playwright/test").Page) => {
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  });
};

const mockAuthenticated = async (page: import("@playwright/test").Page) => {
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


test.describe("Authentication", () => {
  test.describe("Login Page", () => {
    test.beforeEach(async ({ page }) => {
      await mockUnauthenticated(page);
    });

    test("should display login page with form elements", async ({ page }) => {
      await page.goto("/login");

      // Check page title - CardTitle is not h1, use text matching
      await expect(page.getByText("Welcome Back")).toBeVisible();

      // Check form elements using label associations
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
    });

    test("should navigate to register page", async ({ page }) => {
      await page.goto("/login");

      await page.getByRole("link", { name: /sign up/i }).click();

      await expect(page).toHaveURL(/\/register/);
      await expect(page.getByRole("heading", { name: /Create Account/i })).toBeVisible();
    });

    test("should display Google Sign In button", async ({ page }) => {
      await page.goto("/login");

      const googleBtn = page.getByRole("button", { name: /sign in with google/i });
      await expect(googleBtn).toBeVisible();
      await expect(googleBtn).toBeEnabled();
    });
  });

  test.describe("Login Flow", () => {
    test("should handle successful login and redirect to home", async ({ page }) => {
      // Token-based auth mock: returns 401 when no token, 200 when token exists
      await page.route("**/api/auth/me", async (route) => {
        const authHeader = route.request().headers()["authorization"];
        if (authHeader) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: "user-1",
              email: "test@example.com",
              plan: "free",
            }),
          });
        } else {
          await route.fulfill({ status: 401 });
        }
      });

      // Mock login endpoint - API returns access_token
      await page.route("**/api/auth/login", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ access_token: "fake-token" }),
        });
      });

      // Mock shares API for home page
      await page.route("**/api/shares", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      });

      await page.goto("/login");

      // Fill in credentials
      await page.getByLabel(/email/i).fill("test@example.com");
      await page.getByLabel(/password/i).fill("password123");

      // Submit
      await page.getByRole("button", { name: "Sign In", exact: true }).click();

      // Should redirect to home
      await expect(page).toHaveURL("/", { timeout: 10000 });
    });

    test("should display error message on login failure", async ({ page }) => {
      await mockUnauthenticated(page);

      // Mock login endpoint to return error (use 400 to avoid 401 interceptor redirect)
      await page.route("**/api/auth/login", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ message: "Login failed. Please check your credentials." }),
        });
      });

      await page.goto("/login");

      await page.getByLabel(/email/i).fill("wrong@example.com");
      await page.getByLabel(/password/i).fill("wrongpassword");
      await page.getByRole("button", { name: "Sign In", exact: true }).click();

      // Error message should appear
      await expect(page.getByText(/login failed/i)).toBeVisible();
    });
  });

  test.describe("Logout Flow", () => {
    test("should handle logout and redirect to login", async ({ page }) => {
      // Set up authenticated state
      await page.addInitScript(() => {
        localStorage.setItem("token", "fake-token");
      });

      await mockAuthenticated(page);

      // Mock shares API to prevent errors
      await page.route("**/api/shares", async (route) => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
      });

      await page.goto("/");

      // Open account menu
      await page.getByTestId("account-button").click();

      // Wait for menu to be visible and click logout
      await expect(page.getByTestId("logout-button")).toBeVisible();
      await page.getByTestId("logout-button").click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
