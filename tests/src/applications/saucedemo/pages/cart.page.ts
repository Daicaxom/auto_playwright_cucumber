import { Page, expect } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

/**
 * SauceDemo Cart Page Object
 * Handles cart operations and checkout initiation
 */
export class CartPage extends BasePage {
  private readonly selectors = {
    cartItem: '.cart_item',
    cartItemName: '.inventory_item_name',
    cartItemPrice: '.inventory_item_price',
    removeButton: '.cart_button',
    checkoutButton: '[data-test="checkout"]',
    continueShoppingButton: '[data-test="continue-shopping"]',
    cartBadge: '.shopping_cart_badge',
    cartIcon: '.shopping_cart_link',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to cart
   */
  async navigate(): Promise<void> {
    await this.click(this.selectors.cartIcon);
    await this.waitForNavigation();
  }

  /**
   * Verify on cart page
   */
  async verifyOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  /**
   * Get all cart item names
   */
  async getCartItemNames(): Promise<string[]> {
    return await this.getLocator(this.selectors.cartItemName).allTextContents();
  }

  /**
   * Verify cart contains products
   */
  async verifyCartContains(productNames: string[]): Promise<void> {
    const cartItems = await this.getCartItemNames();
    for (const productName of productNames) {
      expect(cartItems).toContain(productName);
    }
  }

  /**
   * Remove most expensive item from cart
   */
  async removeMostExpensiveItem(): Promise<void> {
    const cartItems = this.getLocator(this.selectors.cartItem);
    const count = await cartItems.count();

    let maxPrice = 0;
    let maxPriceIndex = 0;

    for (let i = 0; i < count; i++) {
      const priceText = await cartItems.nth(i).locator(this.selectors.cartItemPrice).textContent();
      const price = parseFloat((priceText || '0').replace('$', ''));
      if (price > maxPrice) {
        maxPrice = price;
        maxPriceIndex = i;
      }
    }

    await cartItems.nth(maxPriceIndex).locator(this.selectors.removeButton).click();
  }

  /**
   * Click checkout button
   */
  async proceedToCheckout(): Promise<void> {
    await this.click(this.selectors.checkoutButton);
    await this.waitForNavigation();
  }

  /**
   * Continue shopping
   */
  async continueShopping(): Promise<void> {
    await this.click(this.selectors.continueShoppingButton);
    await this.waitForNavigation();
  }

  /**
   * Get cart badge count
   */
  async getCartBadgeCount(): Promise<string | null> {
    return await this.getText(this.selectors.cartBadge);
  }

  /**
   * Verify cart badge count
   */
  async verifyCartBadgeCount(expectedCount: string): Promise<void> {
    await expect(this.getLocator(this.selectors.cartBadge)).toHaveText(expectedCount);
  }
}
