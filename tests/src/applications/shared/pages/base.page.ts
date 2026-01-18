import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object class providing common functionality for all page objects
 * Following Page Object Model best practices for top 0.1% automation frameworks
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for DOM content to be loaded
   */
  async waitForDOMLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get a locator for an element
   */
  protected getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Click an element with optional wait
   */
  protected async click(selector: string, options?: { delay?: number }): Promise<void> {
    await this.getLocator(selector).click(options);
  }

  /**
   * Fill an input field
   */
  protected async fill(selector: string, value: string): Promise<void> {
    await this.getLocator(selector).fill(value);
  }

  /**
   * Get text content of an element
   */
  protected async getText(selector: string): Promise<string | null> {
    return await this.getLocator(selector).textContent();
  }

  /**
   * Check if element is visible
   */
  protected async isVisible(selector: string): Promise<boolean> {
    return await this.getLocator(selector).isVisible();
  }

  /**
   * Wait for element to be visible
   */
  protected async waitForElement(selector: string, timeout?: number): Promise<void> {
    await this.getLocator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Take a screenshot
   */
  async screenshot(options?: { fullPage?: boolean; path?: string }): Promise<Buffer> {
    return await this.page.screenshot({ fullPage: true, ...options });
  }

  /**
   * Get current page URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
