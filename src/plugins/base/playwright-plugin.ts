import { Page, BrowserContext, Browser } from '@playwright/test';
import { Logger } from '../../core/utilities/logger';

/**
 * Base plugin class for extending Playwright functionality
 * Plugins hook into Playwright's event system to add features
 * without overriding native Playwright behavior
 */
export abstract class PlaywrightPlugin {
  protected page: Page | null = null;
  protected context: BrowserContext | null = null;
  protected browser: Browser | null = null;

  constructor(
    protected readonly name: string,
    protected readonly logger: Logger,
    protected readonly config: Record<string, unknown>
  ) {
    this.logger.debug(`Plugin created: ${name}`);
  }

  /**
   * Register plugin with Playwright objects
   * This sets up all event listeners
   */
  async register(page: Page, context: BrowserContext, browser: Browser): Promise<void> {
    this.page = page;
    this.context = context;
    this.browser = browser;

    this.logger.info(`Registering plugin: ${this.name}`);

    try {
      await this.setupPageEvents(page);
      await this.setupContextEvents(context);
      await this.setupBrowserEvents(browser);

      this.logger.info(`Plugin registered successfully: ${this.name}`);
    } catch (error) {
      this.logger.error(`Failed to register plugin: ${this.name}`, error);
      throw error;
    }
  }

  /**
   * Setup page-level event listeners
   * ABSTRACT METHOD: Override in concrete plugins to add custom behavior
   * @param _page - The Playwright page instance
   */
  protected async setupPageEvents(_page: Page): Promise<void> {
    // To be implemented by concrete plugins
  }

  /**
   * Setup context-level event listeners
   * ABSTRACT METHOD: Override in concrete plugins to add custom behavior
   * @param _context - The Playwright browser context instance
   */
  protected async setupContextEvents(_context: BrowserContext): Promise<void> {
    // To be implemented by concrete plugins
  }

  /**
   * Setup browser-level event listeners
   * ABSTRACT METHOD: Override in concrete plugins to add custom behavior
   * @param _browser - The Playwright browser instance
   */
  protected async setupBrowserEvents(_browser: Browser): Promise<void> {
    // To be implemented by concrete plugins
  }

  /**
   * Cleanup plugin resources
   * Override in concrete plugins to add custom cleanup
   */
  cleanup(): Promise<void> {
    this.logger.info(`Cleaning up plugin: ${this.name}`);
    this.page = null;
    this.context = null;
    this.browser = null;
    return Promise.resolve();
  }

  /**
   * Get plugin name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Check if plugin is enabled
   */
  isEnabled(): boolean {
    return (this.config.enabled as boolean) !== false;
  }
}
