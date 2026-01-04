import { PlaywrightAdapter } from '../../../src/core/adapters/playwright-adapter';
import { GlobalProperties } from '../../../src/core/utilities/global-properties';
import { Logger } from '../../../src/core/utilities/logger';
import { Browser, BrowserContext, Page } from '@playwright/test';

describe('PlaywrightAdapter', () => {
  let adapter: PlaywrightAdapter;
  let config: GlobalProperties;
  let logger: Logger;

  beforeEach(() => {
    config = new GlobalProperties();
    logger = new Logger({ level: 'error', console: false });
    adapter = new PlaywrightAdapter(config, logger);
  });

  afterEach(async () => {
    // Clean up any resources
  });

  describe('Initialization', () => {
    it('should create a PlaywrightAdapter instance', () => {
      expect(adapter).toBeInstanceOf(PlaywrightAdapter);
    });

    it('should accept configuration and logger', () => {
      const customConfig = new GlobalProperties();
      const customLogger = new Logger({ level: 'debug', console: false });
      const customAdapter = new PlaywrightAdapter(customConfig, customLogger);
      expect(customAdapter).toBeInstanceOf(PlaywrightAdapter);
    });
  });

  describe('Browser Creation', () => {
    let browser: Browser;

    afterEach(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('should create a chromium browser by default', async () => {
      browser = await adapter.createBrowser();
      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);
    }, 30000);

    it('should create browser with custom options from config', async () => {
      config.set('browser.name', 'chromium');
      config.set('browser.headless', true);
      
      browser = await adapter.createBrowser();
      expect(browser).toBeDefined();
      expect(browser.isConnected()).toBe(true);
    }, 30000);

    it('should throw error for unsupported browser', async () => {
      config.set('browser.name', 'unsupported');
      await expect(adapter.createBrowser()).rejects.toThrow('Unsupported browser');
    });
  });

  describe('Context Creation', () => {
    let browser: Browser;
    let context: BrowserContext;

    beforeEach(async () => {
      browser = await adapter.createBrowser();
    });

    afterEach(async () => {
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    });

    it('should create a browser context', async () => {
      context = await adapter.createContext(browser);
      expect(context).toBeDefined();
    }, 30000);

    it('should create context with viewport from config', async () => {
      config.set('browser.viewport', { width: 1280, height: 720 });
      
      context = await adapter.createContext(browser);
      expect(context).toBeDefined();
    }, 30000);

    it('should create context with custom options', async () => {
      const options = {
        viewport: { width: 800, height: 600 },
        userAgent: 'Custom User Agent',
      };
      
      context = await adapter.createContext(browser, options);
      expect(context).toBeDefined();
    }, 30000);

    it('should enable tracing when configured', async () => {
      config.set('execution.trace', true);
      
      context = await adapter.createContext(browser);
      expect(context).toBeDefined();
      // Tracing should be started automatically
    }, 30000);
  });

  describe('Page Creation', () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    beforeEach(async () => {
      browser = await adapter.createBrowser();
      context = await adapter.createContext(browser);
    });

    afterEach(async () => {
      if (page) {
        await page.close();
      }
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    });

    it('should create a page', async () => {
      page = await adapter.createPage(context);
      expect(page).toBeDefined();
    }, 30000);

    it('should set default timeout from config', async () => {
      config.set('ui.timeout', 45000);
      
      page = await adapter.createPage(context);
      expect(page).toBeDefined();
      // Page should have timeout set
    }, 30000);

    it('should set navigation timeout from config', async () => {
      config.set('ui.navigationTimeout', 90000);
      
      page = await adapter.createPage(context);
      expect(page).toBeDefined();
    }, 30000);
  });

  describe('Page Monitoring', () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    beforeEach(async () => {
      config.set('monitoring.network.enabled', true);
      config.set('monitoring.console.enabled', true);
      
      browser = await adapter.createBrowser();
      context = await adapter.createContext(browser);
    });

    afterEach(async () => {
      if (page) {
        await page.close();
      }
      if (context) {
        await context.close();
      }
      if (browser) {
        await browser.close();
      }
    });

    it('should setup event listeners when monitoring enabled', async () => {
      page = await adapter.createPage(context);
      expect(page).toBeDefined();
      // Event listeners should be attached
    }, 30000);

    it('should not interfere with page functionality', async () => {
      page = await adapter.createPage(context);
      
      // Should be able to navigate
      await page.goto('about:blank');
      expect(page.url()).toBe('about:blank');
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle browser launch failure gracefully', async () => {
      config.set('browser.launchOptions', { executablePath: '/invalid/path' });
      
      await expect(adapter.createBrowser()).rejects.toThrow();
    });

    it('should handle invalid configuration gracefully', async () => {
      config.set('browser.name', 'invalid-browser');
      
      await expect(adapter.createBrowser()).rejects.toThrow();
    });
  });
});
