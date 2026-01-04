import { Given, When, Then } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../core/world/playwright-world';
import { expect } from '@playwright/test';

/**
 * Step definitions for login feature
 */

Given('I am on the login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.goto('https://example.com/login');
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Navigated to login page');
});

When('I enter username {string}', async function (this: PlaywrightWorld, username: string) {
  if (!this.page) throw new Error('Page not initialized');
  this.sharedData['username'] = username;
  const field = this.getLocator('#username, [name="username"]');
  await field.fill(username);
  this.logger.info('Entered username', { username });
});

When('I enter password {string}', async function (this: PlaywrightWorld, password: string) {
  if (!this.page) throw new Error('Page not initialized');
  const field = this.getLocator('#password, [name="password"]');
  await field.fill(password);
  this.logger.info('Entered password');
});

When('I click the login button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  const button = this.getLocator('button[type="submit"]');
  await button.click();
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Clicked login button');
});

Then('I should see the dashboard', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/dashboard/);
  this.logger.info('Dashboard verified');
});

Then('I should see a welcome message', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  const username = this.sharedData['username'] as string;
  const message = this.getLocator(`text=/Welcome.*${username}/i`);
  await expect(message).toBeVisible();
  this.logger.info('Welcome message verified');
});

Then(
  'I should see an error message {string}',
  async function (this: PlaywrightWorld, errorMessage: string) {
    if (!this.page) throw new Error('Page not initialized');
    const error = this.getLocator(`.error:has-text("${errorMessage}")`);
    await expect(error).toBeVisible();
    this.logger.info('Error message verified');
  }
);

Then('I should remain on the login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/login/);
  this.logger.info('Still on login page');
});

Then('I should see the {string} page', async function (this: PlaywrightWorld, pageName: string) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(new RegExp(pageName, 'i'));
  this.logger.info('Page verified', { page: pageName });
});

Then('my role should be {string}', async function (this: PlaywrightWorld, role: string) {
  if (!this.page) throw new Error('Page not initialized');
  this.sharedData['role'] = role;
  const roleElement = this.getLocator(`[data-testid="user-role"]:has-text("${role}")`);
  await expect(roleElement).toBeVisible();
  this.logger.info('Role verified', { role });
});
