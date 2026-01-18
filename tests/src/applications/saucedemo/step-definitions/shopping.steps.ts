import { When, Then } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { expect } from '@playwright/test';

/**
 * SauceDemo Shopping Step Definitions
 * Handles product browsing, filtering, and cart management
 */

When(
  'I add the SauceDemo product {string} to cart',
  async function (this: PlaywrightWorld, productName: string) {
    if (!this.page) throw new Error('Page not initialized');

    const inventoryPage = new InventoryPage(this.page);
    await inventoryPage.addToCart(productName);

    // Track added products
    const cartItems = (this.sharedData['saucedemo_cart_items'] as string[]) || [];
    cartItems.push(productName);
    this.sharedData['saucedemo_cart_items'] = cartItems;

    this.logger.info('Added product to cart', { productName });
  }
);

When('I add the first SauceDemo product to cart', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const inventoryPage = new InventoryPage(this.page);
  const productName = await inventoryPage.addFirstProduct();

  // Track added products
  const cartItems = (this.sharedData['saucedemo_cart_items'] as string[]) || [];
  cartItems.push(productName);
  this.sharedData['saucedemo_cart_items'] = cartItems;
  this.sharedData['saucedemo_first_product'] = productName;

  this.logger.info('Added first product to cart', { productName });
});

When('I add the last SauceDemo product to cart', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const inventoryPage = new InventoryPage(this.page);
  const productName = await inventoryPage.addLastProduct();

  // Track added products
  const cartItems = (this.sharedData['saucedemo_cart_items'] as string[]) || [];
  cartItems.push(productName);
  this.sharedData['saucedemo_cart_items'] = cartItems;
  this.sharedData['saucedemo_last_product'] = productName;

  this.logger.info('Added last product to cart', { productName });
});

When(
  'I sort SauceDemo products by {string}',
  async function (this: PlaywrightWorld, sortOption: string) {
    if (!this.page) throw new Error('Page not initialized');

    const inventoryPage = new InventoryPage(this.page);
    await inventoryPage.sortProducts(sortOption);

    this.sharedData['saucedemo_sort_option'] = sortOption;
    this.logger.info('Sorted products', { sortOption });
  }
);

Then('the first SauceDemo product should be the cheapest', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const inventoryPage = new InventoryPage(this.page);
  const isCheapest = await inventoryPage.verifyFirstProductIsCheapest();
  
  expect(isCheapest).toBe(true);
  this.logger.info('Verified first product is cheapest');
});

Then(
  'the SauceDemo cart badge should show {string} items',
  async function (this: PlaywrightWorld, expectedCount: string) {
    if (!this.page) throw new Error('Page not initialized');

    const inventoryPage = new InventoryPage(this.page);
    await inventoryPage.verifyCartBadgeCount(expectedCount);
    this.logger.info('Verified cart badge count', { expectedCount });
  }
);

When('I click the SauceDemo cart icon', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const cartPage = new CartPage(this.page);
  await cartPage.navigate();
  this.logger.info('Clicked cart icon');
});

Then('I should be on the SauceDemo cart page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const cartPage = new CartPage(this.page);
  await cartPage.verifyOnPage();
  this.logger.info('Verified on SauceDemo cart page');
});

When(
  'I remove the most expensive SauceDemo item from cart',
  async function (this: PlaywrightWorld) {
    if (!this.page) throw new Error('Page not initialized');

    const cartPage = new CartPage(this.page);
    await cartPage.removeMostExpensiveItem();
    this.logger.info('Removed most expensive item from cart');
  }
);

When('I click the SauceDemo continue shopping button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const cartPage = new CartPage(this.page);
  await cartPage.continueShopping();
  this.logger.info('Clicked continue shopping button');
});

Then(
  'the SauceDemo product {string} should show {string} button',
  async function (this: PlaywrightWorld, productName: string, expectedButtonText: string) {
    if (!this.page) throw new Error('Page not initialized');

    const inventoryPage = new InventoryPage(this.page);
    await inventoryPage.verifyProductButtonText(productName, expectedButtonText);
    this.logger.info('Verified product button state', { productName, expectedButtonText });
  }
);
