import { When, Then, DataTable } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { expect } from '@playwright/test';

/**
 * SauceDemo Checkout Step Definitions
 * Handles checkout process and purchase flow
 */

Then(
  'I should see the following SauceDemo cart items:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const expectedItems = dataTable.hashes();
    const cartPage = new CartPage(this.page);
    const cartItemNames = await cartPage.getCartItemNames();

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

When('I click the SauceDemo checkout button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const cartPage = new CartPage(this.page);
  await cartPage.proceedToCheckout();
  this.logger.info('Clicked checkout button');
});

Then('I should be on the SauceDemo checkout step one page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.verifyOnStepOne();
  this.logger.info('Verified on checkout step one page');
});

When(
  'I fill the SauceDemo checkout information:',
  async function (this: PlaywrightWorld, dataTable: DataTable) {
    if (!this.page) throw new Error('Page not initialized');

    const [data] = dataTable.hashes();
    const checkoutPage = new CheckoutPage(this.page);
    await checkoutPage.fillCheckoutInfo(
      data['First Name'],
      data['Last Name'],
      data['Postal Code']
    );

    this.sharedData['saucedemo_checkout_info'] = data;
    this.logger.info('Filled checkout information', data);
  }
);

When('I click the SauceDemo continue button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.clickContinue();
  this.logger.info('Clicked continue button');
});

Then('I should be on the SauceDemo checkout step two page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.verifyOnStepTwo();
  this.logger.info('Verified on checkout step two page');
});

Then('I should see the SauceDemo order summary with total', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.verifyOrderSummaryVisible();

  const totalText = await checkoutPage.getOrderTotal();
  this.sharedData['saucedemo_order_total'] = totalText;
  this.logger.info('Verified order summary with total', { total: totalText });
});

When('I click the SauceDemo finish button', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');

  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.clickFinish();
  this.logger.info('Clicked finish button');
});

Then('I should be on the SauceDemo checkout complete page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  
  const checkoutPage = new CheckoutPage(this.page);
  await checkoutPage.verifyOnComplete();
  this.logger.info('Verified on checkout complete page');
});

Then(
  'I should see the SauceDemo order confirmation message {string}',
  async function (this: PlaywrightWorld, expectedMessage: string) {
    if (!this.page) throw new Error('Page not initialized');

    const checkoutPage = new CheckoutPage(this.page);
    await checkoutPage.verifyConfirmationMessage(expectedMessage);
    this.logger.info('Verified order confirmation message', { expectedMessage });
  }
);

Then(
  'I should see the SauceDemo error message {string}',
  async function (this: PlaywrightWorld, expectedMessage: string) {
    if (!this.page) throw new Error('Page not initialized');

    const checkoutPage = new CheckoutPage(this.page);
    await checkoutPage.verifyErrorMessage(expectedMessage);
    this.logger.info('Verified error message', { expectedMessage });
  }
);
