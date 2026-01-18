import { Page, expect } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

/**
 * SauceDemo Login Page Object
 * Encapsulates all login page interactions and selectors
 */
export class LoginPage extends BasePage {
  private readonly url = 'https://www.saucedemo.com';

  private readonly selectors = {
    usernameInput: '#user-name',
    passwordInput: '#password',
    loginButton: '#login-button',
    errorMessage: '[data-test="error"]',
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await super.navigate(this.url);
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<void> {
    await this.fill(this.selectors.usernameInput, username);
    await this.fill(this.selectors.passwordInput, password);
    await this.click(this.selectors.loginButton);
    await this.waitForNavigation();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.getText(this.selectors.errorMessage);
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.errorMessage);
  }

  /**
   * Verify on login page
   */
  async verifyOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(this.url);
    await this.waitForElement(this.selectors.loginButton);
  }
}
