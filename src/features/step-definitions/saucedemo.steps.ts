import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../../core/world/playwright-world';

const SAUCEDEMO_URL = 'https://www.saucedemo.com';
const SAUCEDEMO_SELECTORS = {
  // Login page
  usernameInput: '#user-name',
  passwordInput: '#password',
  loginButton: '#login-button',
  loginError: '[data-test="error"]',

  // Inventory page
  inventoryContainer: '.inventory_container',
  inventoryItem: '.inventory_item',
  inventoryItemName: '.inventory_item_name',
  inventoryItemPrice: '.inventory_item_price',
  addToCartButton: (productName: string): string =>
    `[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,
  removeButton: (productName: string): string =>
    `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,
  productSortDropdown: '[data-test="product-sort-container"]',

  // Cart
  cartBadge: '.shopping_cart_badge',
  cartIcon: '.shopping_cart_link',
  cartItem: '.cart_item',
  cartItemName: '.inventory_item_name',
  cartItemPrice: '.inventory_item_price',
  cartRemoveButton: '.cart_button',
  checkoutButton: '[data-test="checkout"]',
  continueShoppingButton: '[data-test="continue-shopping"]',

  // Checkout
  firstNameInput: '[data-test="firstName"]',
  lastNameInput: '[data-test="lastName"]',
  postalCodeInput: '[data-test="postalCode"]',
  continueButton: '[data-test="continue"]',
  finishButton: '[data-test="finish"]',
  summaryTotal: '.summary_total_label',
  checkoutComplete: '.checkout_complete_container',
  completeHeader: '.complete-header',
};

// Login page steps
Given('I am on the SauceDemo login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.goto(SAUCEDEMO_URL);
  await this.page.waitForLoadState('domcontentloaded');
  this.logger.info('Navigated to SauceDemo login page');
});

When(
  'I login to SauceDemo with username {string} and password {string}',
  async function (this: PlaywrightWorld, username: string, password: string) {
    if (!this.page) throw new Error('Page not initialized');

    await this.getLocator(SAUCEDEMO_SELECTORS.usernameInput).fill(username);
    await this.getLocator(SAUCEDEMO_SELECTORS.passwordInput).fill(password);
    await this.getLocator(SAUCEDEMO_SELECTORS.loginButton).click();
    await this.page.waitForLoadState('networkidle');

    this.sharedData['saucedemo_username'] = username;
    this.logger.info('Logged in to SauceDemo', { username });
  }
);

// Inventory page steps
Then('I should be on the SauceDemo inventory page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/inventory\.html/);
  await expect(this.getLocator(SAUCEDEMO_SELECTORS.inventoryContainer)).toBeVisible();
  this.logger.info('Verified on SauceDemo inventory page');
});

When(
  'I add the SauceDemo product {string} to cart',
  async function (this: PlaywrightWorld, productName: string) {
    if (!this.page) throw new Error('Page not initialized');

    const addButton = this.getLocator(SAUCEDEMO_SELECTORS.addToCartButton(productName));
    await addButton.click();

    // Track added products
    const cartItems = (this.sharedData['saucedemo_cart_items'] as string[]) || [];
    cartItems.push(productName);
    this.sharedData['saucedemo_cart_items'] = cartItems;

    this.logger.info('Added product to cart', { productName });
  }
);

When('I add the first SauceDemo product to cart', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const firstProduct = this.getLocator(SAUCEDEMO_SELECTORS.inventoryItem).first();
  const productName = await firstProduct
    .locator(SAUCEDEMO_SELECTORS.inventoryItemName)
    .textContent();
  const addButton = firstProduct.locator('button').filter({ hasText: 'Add to cart' });
  await addButton.click();

  // Track added products
  const cartItems = (this.sharedData['saucedemo_cart_items'] as string[]) || [];
  cartItems.push(productName || 'First Product');
  this.sharedData['saucedemo_cart_items'] = cartItems;
  this.sharedData['saucedemo_first_product'] = productName;

  this.logger.info('Added first product to cart', { productName });
});

When('I add the last SauceDemo product to cart', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const lastProduct = this.getLocator(SAUCEDEMO_SELECTORS.inventoryItem).last();
  const productName = await lastProduct
    .locator(SAUCEDEMO_SELECTORS.inventoryItemName)
    .textContent();
  const addButton = lastProduct.locator('button').filter({ hasText: 'Add to cart' });
  await addButton.click();

  // Track added products
  const cartItems = (this.sharedData['saucedemo_cart_items'] as string[]) || [];
  cartItems.push(productName || 'Last Product');
  this.sharedData['saucedemo_cart_items'] = cartItems;
  this.sharedData['saucedemo_last_product'] = productName;

  this.logger.info('Added last product to cart', { productName });
});

When(
  'I sort SauceDemo products by {string}',
  async function (this: PlaywrightWorld, sortOption: string) {
    if (!this.page) throw new Error('Page not initialized');

    const sortDropdown = this.getLocator(SAUCEDEMO_SELECTORS.productSortDropdown);
    await sortDropdown.selectOption({ label: sortOption });
    await this.page.waitForLoadState('networkidle');

    this.sharedData['saucedemo_sort_option'] = sortOption;
    this.logger.info('Sorted products', { sortOption });
  }
);

Then('the first SauceDemo product should be the cheapest', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const prices = await this.getLocator(SAUCEDEMO_SELECTORS.inventoryItemPrice).allTextContents();
  const numericPrices = prices.map((p) => parseFloat(p.replace('$', '')));

  const firstPrice = numericPrices[0];
  const minPrice = Math.min(...numericPrices);

  expect(firstPrice).toBe(minPrice);
  this.sharedData['saucedemo_cheapest_price'] = minPrice;
  this.logger.info('Verified first product is cheapest', { firstPrice, minPrice });
});

Then(
  'the SauceDemo cart badge should show {string} items',
  async function (this: PlaywrightWorld, expectedCount: string) {
    if (!this.page) throw new Error('Page not initialized');

    const badge = this.getLocator(SAUCEDEMO_SELECTORS.cartBadge);
    await expect(badge).toHaveText(expectedCount);
    this.logger.info('Verified cart badge count', { expectedCount });
  }
);

// Cart page steps
When('I click the SauceDemo cart icon', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  await this.getLocator(SAUCEDEMO_SELECTORS.cartIcon).click();
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Clicked cart icon');
});

Then('I should be on the SauceDemo cart page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/cart\.html/);
  this.logger.info('Verified on SauceDemo cart page');
});

Then(
  'I should see the following SauceDemo cart items:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const expectedItems = dataTable.hashes();
    const cartItemNames = await this.getLocator(SAUCEDEMO_SELECTORS.cartItemName).allTextContents();

    for (const item of expectedItems) {
      const productName = item['Product Name'];
      expect(cartItemNames).toContain(productName);
    }

    this.logger.info('Verified cart items', {
      expectedItems: expectedItems.length,
      actualItems: cartItemNames.length,
    });
  }
);

When(
  'I remove the most expensive SauceDemo item from cart',
  async function (this: PlaywrightWorld) {
    if (!this.page) throw new Error('Page not initialized');

    const cartItems = this.getLocator(SAUCEDEMO_SELECTORS.cartItem);
    const count = await cartItems.count();

    let maxPrice = 0;
    let maxPriceIndex = 0;

    for (let i = 0; i < count; i++) {
      const priceText = await cartItems
        .nth(i)
        .locator(SAUCEDEMO_SELECTORS.cartItemPrice)
        .textContent();
      const price = parseFloat((priceText || '0').replace('$', ''));
      if (price > maxPrice) {
        maxPrice = price;
        maxPriceIndex = i;
      }
    }

    const removeButton = cartItems.nth(maxPriceIndex).locator(SAUCEDEMO_SELECTORS.cartRemoveButton);
    await removeButton.click();

    this.logger.info('Removed most expensive item from cart', { price: maxPrice });
  }
);

When('I click the SauceDemo continue shopping button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  await this.getLocator(SAUCEDEMO_SELECTORS.continueShoppingButton).click();
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Clicked continue shopping button');
});

Then(
  'the first SauceDemo product add button should show {string}',
  async function (this: PlaywrightWorld, expectedText: string) {
    if (!this.page) throw new Error('Page not initialized');

    const firstProduct = this.getLocator(SAUCEDEMO_SELECTORS.inventoryItem).first();
    const addButton = firstProduct.locator('button');
    await expect(addButton).toHaveText(expectedText);
    this.logger.info('Verified add button text', { expectedText });
  }
);

Then(
  'the last SauceDemo product add button should show {string}',
  async function (this: PlaywrightWorld, expectedText: string) {
    if (!this.page) throw new Error('Page not initialized');

    const lastProduct = this.getLocator(SAUCEDEMO_SELECTORS.inventoryItem).last();
    const addButton = lastProduct.locator('button');
    await expect(addButton).toHaveText(expectedText);
    this.logger.info('Verified last product add button text', { expectedText });
  }
);

Then(
  'the first SauceDemo product remove button should be visible',
  async function (this: PlaywrightWorld) {
    if (!this.page) throw new Error('Page not initialized');

    const firstProduct = this.getLocator(SAUCEDEMO_SELECTORS.inventoryItem).first();
    const removeButton = firstProduct.locator('button').filter({ hasText: 'Remove' });
    await expect(removeButton).toBeVisible();
    this.logger.info('Verified remove button is visible for first product');
  }
);

Then(
  'the SauceDemo product {string} should show {string} button',
  async function (this: PlaywrightWorld, productName: string, expectedButtonText: string) {
    if (!this.page) throw new Error('Page not initialized');

    const productItem = this.getLocator(SAUCEDEMO_SELECTORS.inventoryItem).filter({
      hasText: productName,
    });
    const button = productItem.locator('button');
    await expect(button).toHaveText(expectedButtonText);
    this.logger.info('Verified product button state', { productName, expectedButtonText });
  }
);

// Checkout steps
When('I click the SauceDemo checkout button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  await this.getLocator(SAUCEDEMO_SELECTORS.checkoutButton).click();
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Clicked checkout button');
});

Then('I should be on the SauceDemo checkout step one page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  this.logger.info('Verified on checkout step one page');
});

When(
  'I fill the SauceDemo checkout information:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const [data] = dataTable.hashes();
    await this.getLocator(SAUCEDEMO_SELECTORS.firstNameInput).fill(data['First Name']);
    await this.getLocator(SAUCEDEMO_SELECTORS.lastNameInput).fill(data['Last Name']);
    await this.getLocator(SAUCEDEMO_SELECTORS.postalCodeInput).fill(data['Postal Code']);

    this.sharedData['saucedemo_checkout_info'] = data;
    this.logger.info('Filled checkout information', data);
  }
);

When('I click the SauceDemo continue button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  await this.getLocator(SAUCEDEMO_SELECTORS.continueButton).click();
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Clicked continue button');
});

Then('I should be on the SauceDemo checkout step two page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  this.logger.info('Verified on checkout step two page');
});

Then('I should see the SauceDemo order summary with total', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const totalElement = this.getLocator(SAUCEDEMO_SELECTORS.summaryTotal);
  await expect(totalElement).toBeVisible();

  const totalText = await totalElement.textContent();
  this.sharedData['saucedemo_order_total'] = totalText;
  this.logger.info('Verified order summary with total', { total: totalText });
});

When('I click the SauceDemo finish button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  await this.getLocator(SAUCEDEMO_SELECTORS.finishButton).click();
  await this.page.waitForLoadState('networkidle');
  this.logger.info('Clicked finish button');
});

Then('I should be on the SauceDemo checkout complete page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/checkout-complete\.html/);
  await expect(this.getLocator(SAUCEDEMO_SELECTORS.checkoutComplete)).toBeVisible();
  this.logger.info('Verified on checkout complete page');
});

Then(
  'I should see the SauceDemo order confirmation message {string}',
  async function (this: PlaywrightWorld, expectedMessage: string) {
    if (!this.page) throw new Error('Page not initialized');

    const confirmationHeader = this.getLocator(SAUCEDEMO_SELECTORS.completeHeader);
    await expect(confirmationHeader).toHaveText(expectedMessage);
    this.logger.info('Verified order confirmation message', { expectedMessage });
  }
);
