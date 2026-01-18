import { Given, When, Then } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';

/**
 * SauceDemo Authentication Step Definitions
 * Handles login, logout, and session management scenarios
 */

Given('I am on the SauceDemo login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
  this.logger.info('Navigated to SauceDemo login page');
});

When(
  'I login to SauceDemo with username {string} and password {string}',
  async function (this: PlaywrightWorld, username: string, password: string) {
    if (!this.page) throw new Error('Page not initialized');

    const loginPage = new LoginPage(this.page);
    await loginPage.login(username, password);
    
    this.sharedData['saucedemo_username'] = username;
    this.logger.info('Logged in to SauceDemo', { username });
  }
);

Then('I should be on the SauceDemo inventory page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const inventoryPage = new InventoryPage(this.page);
  await inventoryPage.verifyOnPage();
  this.logger.info('Verified on SauceDemo inventory page');
});

When('I click the SauceDemo menu button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const inventoryPage = new InventoryPage(this.page);
  await inventoryPage.openMenu();
  this.logger.info('Clicked menu button');
});

When('I click the SauceDemo logout link', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const inventoryPage = new InventoryPage(this.page);
  await inventoryPage.logout();
  this.logger.info('Clicked logout link');
});

Then('I should be on the SauceDemo login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const loginPage = new LoginPage(this.page);
  await loginPage.verifyOnPage();
  this.logger.info('Verified on SauceDemo login page');
});

Then('the SauceDemo cart badge should not be visible', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const inventoryPage = new InventoryPage(this.page);
  await inventoryPage.verifyCartBadgeNotVisible();
  this.logger.info('Verified cart badge is not visible');
});
