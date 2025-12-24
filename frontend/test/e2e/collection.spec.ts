import { test, expect } from "@playwright/test";

test("displays models on collection page", async ({ page }) => {
  await page.goto("/collection");
  // Expect to see model names.
  // Using .first() because the same name might appear for both OBJ and GLB if they share names,
  // or just to be safe.
  await expect(page.getByText("FlexiSpot cherryblossom").first()).toBeVisible();
  await expect(page.getByText("Gingerbread House").first()).toBeVisible();
});
