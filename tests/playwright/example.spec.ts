import { test, expect } from '@playwright/test';

/**
 * Example Playwright Test
 * 
 * This is a standalone Playwright test (not using Cucumber)
 * that demonstrates Playwright's native HTML reporter.
 * 
 * Run with: npx playwright test
 * View report: npx playwright show-report playwright-report
 */

test.describe('Playwright Native Test Example', () => {
  test('basic test example', async ({ page }) => {
    // Navigate to Playwright website
    await page.goto('https://playwright.dev/');
    
    // Expect page title to contain Playwright
    await expect(page).toHaveTitle(/Playwright/);
    
    // Click get started link
    await page.getByRole('link', { name: 'Get started' }).first().click();
    
    // Verify we're on the installation page
    await expect(page).toHaveURL(/.*intro/);
  });
  
  test('screenshot demonstration', async ({ page }) => {
    // Navigate to a page
    await page.goto('https://www.saucedemo.com');
    
    // Take a screenshot that will be attached to the report
    await page.screenshot({ path: 'results/demo-screenshot.png', fullPage: true });
    
    // Verify page elements
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
