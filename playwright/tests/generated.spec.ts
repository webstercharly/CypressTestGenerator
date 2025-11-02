import { test, expect } from "@playwright/test";

test.describe("User Login Flow", () => {
  test("Test user can login with valid credentials", async ({ page }) => {
    await page.goto("http://example.com/login");
    const elementCount = await page.locator(".cookie-banner").count();
    if (elementCount > 0) {
      await page.locator(".accept-cookies").click();
    }
    await page.locator("#username").fill("testuser");
    await page.locator("#password").fill("password123");
    await page.locator("#login-button").click();
    const url = page.url();
    if (url.includes("/dashboard")) {
      await expect(page.locator(".welcome-message")).toBeVisible();
      await expect(page.locator(".welcome-message")).toContainText(
        "Welcome back!"
      );
    } else {
      await expect(page.locator(".error-message")).toBeVisible();
      await page.screenshot({ path: "login-error.png" });
    }
  });
});
