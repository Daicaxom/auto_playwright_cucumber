import { Page, expect } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

/**
 * SauceDemo Checkout Page Object
 * Handles checkout process including information entry and order completion
 */
export class CheckoutPage extends BasePage {
  private readonly selectors = {
    firstNameInput: '[data-test="firstName"]',
    lastNameInput: '[data-test="lastName"]',
    postalCodeInput: '[data-test="postalCode"]',
    continueButton: '[data-test="continue"]',
    finishButton: '[data-test="finish"]',
    errorMessage: '[data-test="error"]',
    summaryTotal: '.summary_total_label',
    checkoutComplete: '.checkout_complete_container',
    completeHeader: '.complete-header',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify on checkout step one page
   */
  async verifyOnStepOne(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }

  /**
   * Verify on checkout step two page
   */
  async verifyOnStepTwo(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
  }

  /**
   * Verify on checkout complete page
   */
  async verifyOnComplete(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await this.waitForElement(this.selectors.checkoutComplete);
  }

  /**
   * Fill checkout information
   */
  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fill(this.selectors.firstNameInput, firstName);
    await this.fill(this.selectors.lastNameInput, lastName);
    await this.fill(this.selectors.postalCodeInput, postalCode);
  }

  /**
   * Click continue button
   */
  async clickContinue(): Promise<void> {
    await this.click(this.selectors.continueButton);
    await this.waitForNavigation();
  }

  /**
   * Click finish button
   */
  async clickFinish(): Promise<void> {
    await this.click(this.selectors.finishButton);
    await this.waitForNavigation();
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.getText(this.selectors.errorMessage);
  }

  /**
   * Verify error message
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(this.getLocator(this.selectors.errorMessage)).toBeVisible();
    await expect(this.getLocator(this.selectors.errorMessage)).toHaveText(expectedMessage);
  }

  /**
   * Verify order summary total is visible
   */
  async verifyOrderSummaryVisible(): Promise<void> {
    await expect(this.getLocator(this.selectors.summaryTotal)).toBeVisible();
  }

  /**
   * Get order total
   */
  async getOrderTotal(): Promise<string | null> {
    return await this.getText(this.selectors.summaryTotal);
  }

  /**
   * Verify order confirmation message
   */
  async verifyConfirmationMessage(expectedMessage: string): Promise<void> {
    await expect(this.getLocator(this.selectors.completeHeader)).toHaveText(expectedMessage);
  }
}
