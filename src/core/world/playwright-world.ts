import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { PlaywrightAdapter } from '../adapters/playwright-adapter';
import { GlobalProperties } from '../utilities/global-properties';
import { Logger } from '../utilities/logger';

/**
 * Interface for Playwright World
 */
export interface IPlaywrightWorld {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  playwright: PlaywrightAdapter;
  config: GlobalProperties;
  logger: Logger;
  sharedData: Record<string, unknown>;
  screenshots: Array<{ name: string; buffer: Buffer }>;
}

/**
 * PlaywrightWorld integrates Playwright with Cucumber
 * It provides a shared context for all step definitions
 */
export class PlaywrightWorld extends World implements IPlaywrightWorld {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  playwright: PlaywrightAdapter;
  config: GlobalProperties;
  logger: Logger;
  sharedData: Record<string, unknown> = {};
  screenshots: Array<{ name: string; buffer: Buffer }> = [];

  constructor(options: IWorldOptions) {
    super(options);

    this.config = new GlobalProperties();
    this.logger = new Logger(
      {
        level: this.config.get('logging.level', 'info') as 'debug' | 'info' | 'warn' | 'error',
        format: this.config.get('logging.format', 'text') as 'json' | 'text',
        console: true,
        outputDir: this.config.get('logging.outputDir', 'logs') as string,
      },
      { scenario: (options as any).pickle?.name || 'unknown' }
    );

    this.playwright = new PlaywrightAdapter(this.config, this.logger);

    this.logger.info('PlaywrightWorld initialized', {
      scenario: (options as any).pickle?.name,
    });
  }

  /**
   * Initialize browser, context, and page
   * Call this in Before hook
   */
  async init(): Promise<void> {
    this.logger.info('Initializing Playwright resources');

    try {
      this.browser = await this.playwright.createBrowser();
      this.context = await this.playwright.createContext(this.browser);
      this.page = await this.playwright.createPage(this.context);

      this.logger.info('Playwright resources initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Playwright resources', error);
      throw error;
    }
  }

  /**
   * Cleanup browser, context, and page
   * Call this in After hook
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up Playwright resources');

    try {
      // Stop tracing if enabled
      if (this.context && this.config.get('execution.trace', false)) {
        const tracePath = `results/traces/trace-${Date.now()}.zip`;
        await this.context.tracing.stop({ path: tracePath });
        this.logger.info('Trace saved', { path: tracePath });
      }

      // Close resources in reverse order
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      this.logger.info('Playwright resources cleaned up successfully');
    } catch (error) {
      this.logger.error('Failed to cleanup Playwright resources', error);
      throw error;
    }
  }

  /**
   * Capture screenshot and attach to report
   */
  async captureScreenshot(name: string): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }

    this.logger.info('Capturing screenshot', { name });

    const screenshot = await this.page.screenshot({
      fullPage: this.config.get('reporting.screenshots.fullPage', true) as boolean,
      type: 'png',
    });

    // Store for later use
    this.screenshots.push({ name, buffer: screenshot });

    // Attach to Cucumber report
    if (this.attach) {
      await this.attach(screenshot, 'image/png');
    }

    this.logger.info('Screenshot captured', { name, size: screenshot.length });
    return screenshot;
  }

  /**
   * Get enhanced locator with additional methods
   */
  getLocator(selector: string): ReturnType<Page['locator']> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }

    this.logger.debug('Creating locator', { selector });
    return this.page.locator(selector);
  }

  /**
   * Navigate to URL with logging
   */
  async goto(url: string, options?: Parameters<Page['goto']>[1]): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }

    this.logger.info('Navigating to URL', { url });
    await this.page.goto(url, options);
  }

  /**
   * Wait for specified time
   */
  async wait(milliseconds: number): Promise<void> {
    this.logger.debug('Waiting', { milliseconds });
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}

// Export for manual registration in Cucumber support files
export { setWorldConstructor };
