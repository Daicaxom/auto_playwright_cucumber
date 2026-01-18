import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { GlobalProperties } from '../utilities/global-properties';
import { Logger } from '../utilities/logger';

/**
 * PlaywrightAdapter wraps Playwright native functions with configuration and monitoring
 * This adapter pattern allows us to extend Playwright functionality without overriding it
 */
export class PlaywrightAdapter {
  constructor(
    private readonly config: GlobalProperties,
    private readonly logger: Logger
  ) {}

  /**
   * Create a browser instance using Playwright's built-in browser factory
   * Supports chromium, firefox, and webkit
   */
  async createBrowser(): Promise<Browser> {
    const browserType = this.config.get('browser.name', 'chromium') as string;
    const browserArgs = this.config.get('browser.args', []) as string[];

    this.logger.debug('Creating browser', {
      type: browserType,
      headless: this.config.get('browser.headless'),
    });

    const launchOptions = {
      headless: this.config.get('browser.headless', true) as boolean,
      args: browserArgs,
      timeout: this.config.get('execution.timeout', 30000) as number,
      ...(this.config.get('browser.launchOptions', {}) as Record<string, unknown>),
    };

    let browser: Browser;

    switch (browserType) {
      case 'chromium':
        browser = await chromium.launch(launchOptions);
        break;
      case 'firefox':
        browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        browser = await webkit.launch(launchOptions);
        break;
      default:
        throw new Error(`Unsupported browser: ${browserType}`);
    }

    this.logger.info('Browser created successfully', { type: browserType });
    return browser;
  }

  /**
   * Create a browser context with enhanced options from configuration
   * Contexts provide isolation and allow custom settings per test
   */
  async createContext(
    browser: Browser,
    options?: Record<string, unknown>
  ): Promise<BrowserContext> {
    this.logger.debug('Creating browser context');

    const viewport = this.config.get('browser.viewport', { width: 1920, height: 1080 }) as {
      width: number;
      height: number;
    };

    const contextOptions = {
      viewport,
      ignoreHTTPSErrors: this.config.get('browser.ignoreHTTPSErrors', true) as boolean,
      recordVideo: this.config.get('reporting.video.enabled', false)
        ? { dir: 'results/videos' }
        : undefined,
      ...options,
    };

    const context = await browser.newContext(contextOptions);

    // Enable tracing if configured
    if (this.config.get('execution.trace', false)) {
      this.logger.debug('Starting tracing');
      await context.tracing.start({
        screenshots: this.config.get('reporting.trace.screenshots', true) as boolean,
        snapshots: this.config.get('reporting.trace.snapshots', true) as boolean,
        sources: this.config.get('reporting.trace.sources', true) as boolean,
      });
    }

    this.logger.info('Browser context created successfully');
    return context;
  }

  /**
   * Create a page with default timeouts and monitoring
   * Attaches event listeners for network, console, and page events
   */
  async createPage(context: BrowserContext): Promise<Page> {
    this.logger.debug('Creating page');

    const page = await context.newPage();

    // Set default timeouts from configuration
    const defaultTimeout = this.config.get('ui.timeout', 30000) as number;
    const navigationTimeout = this.config.get('ui.navigationTimeout', 60000) as number;

    page.setDefaultTimeout(defaultTimeout);
    page.setDefaultNavigationTimeout(navigationTimeout);

    // Setup page monitoring
    this.setupPageMonitoring(page);

    this.logger.info('Page created successfully');
    return page;
  }

  /**
   * Setup event listeners for page monitoring
   * This provides visibility into page behavior without interfering with Playwright
   */
  private setupPageMonitoring(page: Page): void {
    // Monitor page load events
    page.on('load', () => {
      this.logger.debug('Page loaded', { url: page.url() });
    });

    // Monitor network requests if enabled
    if (this.config.get('monitoring.network.enabled', false)) {
      page.on('request', (request) => {
        this.logger.debug('Network request', {
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
        });
      });

      page.on('response', (response) => {
        this.logger.debug('Network response', {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      });
    }

    // Monitor console messages if enabled
    if (this.config.get('monitoring.console.enabled', false)) {
      page.on('console', (msg) => {
        this.logger.debug('Console message', {
          type: msg.type(),
          text: msg.text(),
        });
      });
    }

    // Monitor page errors
    page.on('pageerror', (error) => {
      this.logger.error('Page error', error);
    });

    // Monitor crashes
    page.on('crash', () => {
      this.logger.error('Page crashed', { url: page.url() });
    });
  }
}
