import { Page, expect } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

/**
 * SauceDemo Inventory Page Object
 * Handles product browsing, sorting, and adding to cart
 */
export class InventoryPage extends BasePage {
  private readonly selectors = {
    container: '.inventory_container',
    item: '.inventory_item',
    itemName: '.inventory_item_name',
    itemPrice: '.inventory_item_price',
    addToCartButton: (productName: string) =>
      `[data-test="add-to-cart-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,
    removeButton: (productName: string) =>
      `[data-test="remove-${productName.toLowerCase().replace(/\s+/g, '-')}"]`,
    sortDropdown: '[data-test="product-sort-container"]',
    cartBadge: '.shopping_cart_badge',
    menuButton: '#react-burger-menu-btn',
    logoutLink: '#logout_sidebar_link',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify on inventory page
   */
  async verifyOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await this.waitForElement(this.selectors.container);
  }

  /**
   * Add product to cart by name
   */
  async addToCart(productName: string): Promise<void> {
    await this.click(this.selectors.addToCartButton(productName));
  }

  /**
   * Add first product to cart
   */
  async addFirstProduct(): Promise<string> {
    const firstItem = this.getLocator(this.selectors.item).first();
    const productName = await firstItem.locator(this.selectors.itemName).textContent();
    await firstItem.locator('button').filter({ hasText: 'Add to cart' }).click();
    return productName || 'First Product';
  }

  /**
   * Add last product to cart
   */
  async addLastProduct(): Promise<string> {
    const lastItem = this.getLocator(this.selectors.item).last();
    const productName = await lastItem.locator(this.selectors.itemName).textContent();
    await lastItem.locator('button').filter({ hasText: 'Add to cart' }).click();
    return productName || 'Last Product';
  }

  /**
   * Sort products
   */
  async sortProducts(option: string): Promise<void> {
    await this.page.selectOption(this.selectors.sortDropdown, { label: option });
    await this.waitForNavigation();
  }

  /**
   * Get all product prices
   */
  async getProductPrices(): Promise<number[]> {
    const prices = await this.getLocator(this.selectors.itemPrice).allTextContents();
    return prices.map((p) => parseFloat(p.replace('$', '')));
  }

  /**
   * Verify first product is cheapest
   */
  async verifyFirstProductIsCheapest(): Promise<boolean> {
    const prices = await this.getProductPrices();
    const firstPrice = prices[0];
    const minPrice = Math.min(...prices);
    return firstPrice === minPrice;
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

  /**
   * Check if product button shows specific text
   */
  async verifyProductButtonText(productName: string, expectedText: string): Promise<void> {
    const productItem = this.getLocator(this.selectors.item).filter({ hasText: productName });
    const button = productItem.locator('button');
    await expect(button).toHaveText(expectedText);
  }

  /**
   * Open menu
   */
  async openMenu(): Promise<void> {
    await this.click(this.selectors.menuButton);
    await this.page.waitForTimeout(500); // Wait for animation
  }

  /**
   * Click logout
   */
  async logout(): Promise<void> {
    await this.click(this.selectors.logoutLink);
    await this.waitForNavigation();
  }

  /**
   * Verify cart badge is not visible
   */
  async verifyCartBadgeNotVisible(): Promise<void> {
    await expect(this.getLocator(this.selectors.cartBadge)).not.toBeVisible();
  }
}
