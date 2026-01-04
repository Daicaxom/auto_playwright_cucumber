🎯 THIẾT KẾ FRAMEWORK TỐI ƯU VỚI PLAYWRIGHT NATIVE FEATURES

Phân tích và tránh trùng lặp với các hàm có sẵn của Playwright:

📊 PHÂN TÍCH PLAYWRIGHT NATIVE FEATURES

1. Built-in Features của Playwright cần tận dụng:

text
✅ Có sẵn trong Playwright Test:
├── 📁 Test Runner
├── 📁 Fixtures (page, context, browser)
├── 📁 Assertions (expect)
├── 📁 Auto-waiting
├── 📁 Screenshot/Video capture
├── 📁 Trace viewer
├── 📁 Codegen
└── 📁 Device emulation

⚠️ Không nên tái tạo:
├── ❌ Browser management (Playwright đã có)
├── ❌ Page navigation/actions
├── ❌ Element selectors/locators
├── ❌ Network interception
├── ❌ Auto-retry mechanism
└── ❌ Screenshot comparison
🏗️ THIẾT KẾ FRAMEWORK MỚI

Cấu trúc tận dụng tối đa Playwright:

text
playwright-cucumber-enterprise/
├── 📁 configs/                          # Configuration management
├── 📁 src/
│   ├── core/                           # Core abstraction layer
│   │   ├── adapters/                   # Playwright adapters
│   │   ├── extensions/                 # Playwright extensions
│   │   ├── orchestrator/               # Test orchestration
│   │   └── utilities/                  # Utilities không trùng với Playwright
│   ├── features/                       # Cucumber features (không thay đổi)
│   ├── integrations/                   # External integrations
│   └── plugins/                        # Plugin system
├── 📁 tests/                           # Framework tests
└── 📁 results/                         # Test results
🔧 1. PLAYWRIGHT ADAPTER LAYER

Adapt Playwright Test Runner cho Cucumber

typescript
// src/core/adapters/playwright-adapter.ts
import { chromium, firefox, webkit, Browser, BrowserContext, Page } from '@playwright/test';
import { GlobalProperties } from '../../../configs/global/properties';

/**
 * Adapter pattern để wrap Playwright native functions
 * Không tái tạo mà chỉ extend/enhance
 */
export class PlaywrightAdapter {
  constructor(
    private readonly config: GlobalProperties,
    private readonly logger: Logger
  ) {}

  /**
   * Sử dụng Playwright's built-in browser factory
   * Thay vì tạo BrowserManager riêng
   */
  async createBrowser() {
    const browserType = this.config.get('browser.name', 'chromium');
    const browserArgs = this.config.get('browser.args', []);
    
    // Sử dụng Playwright's launch function
    const launchOptions = {
      headless: this.config.get('execution.headless', true),
      args: browserArgs,
      timeout: this.config.get('execution.timeout', 30000),
      ...this.config.get('browser.launchOptions', {})
    };

    switch (browserType) {
      case 'chromium':
        return await chromium.launch(launchOptions);
      case 'firefox':
        return await firefox.launch(launchOptions);
      case 'webkit':
        return await webkit.launch(launchOptions);
      default:
        throw new Error(`Unsupported browser: ${browserType}`);
    }
  }

  /**
   * Extend Playwright context với custom options
   */
  async createContext(browser: Browser, options?: any) {
    const contextOptions = {
      viewport: this.config.get('browser.viewport', { width: 1920, height: 1080 }),
      ignoreHTTPSErrors: true,
      recordVideo: this.config.get('reporting.video.enabled') 
        ? { dir: 'results/videos' } 
        : undefined,
      ...options
    };

    const context = await browser.newContext(contextOptions);

    // Thêm tracing nếu được enable
    if (this.config.get('execution.trace')) {
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true
      });
    }

    return context;
  }

  /**
   * Wrapper cho Playwright page với enhanced features
   */
  async createPage(context: BrowserContext) {
    const page = await context.newPage();
    
    // Set default timeout từ config
    page.setDefaultTimeout(this.config.get('ui.timeout', 30000));
    page.setDefaultNavigationTimeout(this.config.get('ui.navigationTimeout', 60000));
    
    // Add event listeners cho monitoring
    this.setupPageMonitoring(page);
    
    return page;
  }

  private setupPageMonitoring(page: Page) {
    // Chỉ thêm monitoring, không override Playwright functions
    page.on('load', () => {
      this.logger.debug('Page loaded', { url: page.url() });
    });

    page.on('request', (request) => {
      if (this.config.get('monitoring.network.enabled')) {
        this.logger.debug('Network request', {
          url: request.url(),
          method: request.method()
        });
      }
    });

    page.on('console', (msg) => {
      if (this.config.get('monitoring.console.enabled')) {
        this.logger.debug('Console message', {
          type: msg.type(),
          text: msg.text()
        });
      }
    });
  }
}
🎭 2. CUCUMBER-PLAYWRIGHT INTEGRATION

Custom World với Playwright Fixtures

typescript
// src/core/world/playwright-world.ts
import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { PlaywrightAdapter } from '../adapters/playwright-adapter';
import { GlobalProperties } from '../../../configs/global/properties';
import { Logger } from '../utilities/logger';

export interface IPlaywrightWorld {
  browser: Browser | null;
  context: BrowserContext | null;
  page: Page | null;
  playwright: PlaywrightAdapter;
}

export class PlaywrightWorld extends World implements IPlaywrightWorld {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  playwright: PlaywrightAdapter;
  config: GlobalProperties;
  logger: Logger;

  constructor(options: any) {
    super(options);
    
    this.config = new GlobalProperties();
    this.logger = new Logger(this.config.get('logging'));
    this.playwright = new PlaywrightAdapter(this.config, this.logger);
    
    // Initialize shared data
    this.sharedData = {};
    this.screenshots = [];
  }

  async init() {
    // Khởi tạo browser sử dụng Playwright native
    this.browser = await this.playwright.createBrowser();
    this.context = await this.playwright.createContext(this.browser);
    this.page = await this.playwright.createPage(this.context);
    
    this.logger.info('Playwright World initialized');
  }

  async cleanup() {
    // Sử dụng Playwright's built-in cleanup
    if (this.context && this.config.get('execution.trace')) {
      const tracePath = `results/traces/trace-${Date.now()}.zip`;
      await this.context.tracing.stop({ path: tracePath });
    }

    await this.context?.close();
    await this.browser?.close();
    
    this.logger.info('Playwright World cleanup completed');
  }

  /**
   * Enhanced screenshot với context của Cucumber
   */
  async captureScreenshot(name: string) {
    if (!this.page) throw new Error('Page not initialized');
    
    const screenshot = await this.page.screenshot({
      fullPage: this.config.get('reporting.screenshots.fullPage', true),
      type: 'png'
    });
    
    // Store for reporting
    this.screenshots.push({ name, buffer: screenshot });
    
    // Attach to Cucumber report
    if (this.attach) {
      await this.attach(screenshot, 'image/png');
    }
    
    return screenshot;
  }

  /**
   * Wrapper cho Playwright locators với enhanced logging
   */
  getLocator(selector: string) {
    if (!this.page) throw new Error('Page not initialized');
    
    const locator = this.page.locator(selector);
    
    // Add custom methods to locator
    return this.enhanceLocator(locator, selector);
  }

  private enhanceLocator(locator: any, selector: string) {
    // Không override Playwright methods, chỉ thêm helpers
    return {
      ...locator,
      
      async clickWithRetry(options?: any) {
        try {
          await locator.click(options);
        } catch (error) {
          this.logger.warn(`Click failed on ${selector}, retrying...`);
          await locator.waitFor({ state: 'visible' });
          await locator.click(options);
        }
      },
      
      async getTextAndLog() {
        const text = await locator.textContent();
        this.logger.debug(`Text from ${selector}: ${text}`);
        return text;
      }
    };
  }
}

setWorldConstructor(PlaywrightWorld);
🔌 3. PLUGIN SYSTEM TẬN DỤNG PLAYWRIGHT HOOKS

Playwright Plugin Base Class

typescript
// src/plugins/base/playwright-plugin.ts
import { Page, BrowserContext, Browser } from '@playwright/test';
import { Logger } from '../../core/utilities/logger';

/**
 * Base plugin sử dụng Playwright's event system
 * Thay vì tạo event system riêng
 */
export abstract class PlaywrightPlugin {
  protected page: Page | null = null;
  protected context: BrowserContext | null = null;
  protected browser: Browser | null = null;

  constructor(
    protected readonly name: string,
    protected readonly logger: Logger,
    protected readonly config: any
  ) {}

  /**
   * Register to Playwright's native events
   */
  async register(page: Page, context: BrowserContext, browser: Browser) {
    this.page = page;
    this.context = context;
    this.browser = browser;

    // Hook into Playwright events
    await this.setupPageEvents(page);
    await this.setupContextEvents(context);
    await this.setupBrowserEvents(browser);
  }

  protected async setupPageEvents(page: Page) {
    // Override trong concrete plugins
  }

  protected async setupContextEvents(context: BrowserContext) {
    // Override trong concrete plugins
  }

  protected async setupBrowserEvents(browser: Browser) {
    // Override trong concrete plugins
  }

  /**
   * Cleanup khi test kết thúc
   */
  async cleanup() {
    // Implement trong concrete plugins
  }
}
Performance Monitoring Plugin

typescript
// src/plugins/performance/performance-plugin.ts
import { PlaywrightPlugin } from '../base/playwright-plugin';
import { Page } from '@playwright/test';

export class PerformancePlugin extends PlaywrightPlugin {
  private metrics: PerformanceMetric[] = [];
  private startTime: number = 0;

  async setupPageEvents(page: Page) {
    // Sử dụng Playwright's page.metrics()
    page.on('load', async () => {
      const metrics = await page.metrics();
      this.metrics.push({
        timestamp: Date.now(),
        name: 'page_load',
        metrics
      });
    });

    // Monitor network performance
    page.on('request', (request) => {
      this.metrics.push({
        timestamp: Date.now(),
        name: 'request_start',
        url: request.url(),
        method: request.method()
      });
    });

    page.on('response', (response) => {
      this.metrics.push({
        timestamp: Date.now(),
        name: 'response_end',
        url: response.url(),
        status: response.status(),
        timing: response.timing()
      });
    });
  }

  /**
   * Sử dụng Playwright's built-in performance API
   */
  async collectPerformanceMetrics() {
    if (!this.page) return [];
    
    // Sử dụng evaluate để lấy performance entries từ browser
    const perfEntries = await this.page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    return JSON.parse(perfEntries);
  }

  /**
   * Tận dụng Playwright's trace để phân tích performance
   */
  async analyzeTrace(tracePath: string) {
    // Parse Playwright trace file
    // Không cần tự parse, dùng Playwright's trace viewer API
  }
}
📊 4. ENHANCED REPORTING WITH PLAYWRIGHT TRACES

Trace Analysis & Reporting

typescript
// src/core/reporting/trace-analyzer.ts
import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';

/**
 * Phân tích Playwright traces thay vì tạo reporting system riêng
 */
export class TraceAnalyzer {
  constructor(private readonly config: GlobalProperties) {}

  /**
   * Generate report từ Playwright trace
   */
  async generateTraceReport(tracePath: string): Promise<TraceReport> {
    // Sử dụng Playwright's built-in trace viewer
    const report = {
      actions: [],
      network: [],
      console: [],
      errors: []
    };

    // Parse trace file (Playwright format)
    const traceContent = fs.readFileSync(tracePath, 'utf8');
    const traceData = JSON.parse(traceContent);

    // Extract useful information từ trace
    for (const event of traceData) {
      switch (event.type) {
        case 'action':
          report.actions.push({
            name: event.name,
            start: event.startTime,
            end: event.endTime,
            duration: event.endTime - event.startTime
          });
          break;
          
        case 'network':
          report.network.push({
            url: event.url,
            method: event.method,
            status: event.status,
            duration: event.duration
          });
          break;
          
        case 'console':
          report.console.push({
            type: event.messageType,
            text: event.text
          });
          break;
      }
    }

    return report;
  }

  /**
   * Integrate với Allure reporting
   */
  async attachTraceToAllure(tracePath: string) {
    const report = await this.generateTraceReport(tracePath);
    
    // Attach trace file
    allure.attachment('trace.json', fs.readFileSync(tracePath), 'application/json');
    
    // Attach summary
    allure.attachment('trace-summary.json', 
      JSON.stringify({
        totalActions: report.actions.length,
        totalNetworkRequests: report.network.length,
        slowestAction: report.actions.sort((a, b) => b.duration - a.duration)[0],
        failedRequests: report.network.filter(r => r.status >= 400)
      }, null, 2),
      'application/json'
    );
  }

  /**
   * Generate visual timeline từ trace
   */
  async generateTimeline(tracePath: string): Promise<string> {
    // Sử dụng Playwright's trace viewer
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Playwright Trace Timeline</title>
          <script src="https://unpkg.com/@playwright/test/lib/vite/trace-viewer/bundle.js"></script>
        </head>
        <body>
          <div id="trace-viewer"></div>
          <script>
            window.initTraceViewer('${tracePath}', 'trace-viewer');
          </script>
        </body>
      </html>
    `;
    
    return html;
  }
}
🧪 5. TEST DATA MANAGEMENT (KHÔNG TRÙNG VỚI PLAYWRIGHT)

Factory Pattern với Context Isolation

typescript
// src/test-data/factories/base-factory.ts
import { faker } from '@faker-js/faker';
import { GlobalProperties } from '../../../configs/global/properties';

/**
 * Test data factory độc lập với Playwright
 */
export abstract class BaseFactory<T> {
  protected faker = faker;
  
  constructor(protected readonly config: GlobalProperties) {
    // Set locale từ config
    this.faker.setLocale(this.config.get('testData.locale', 'en'));
  }

  abstract create(overrides?: Partial<T>): T;
  abstract createMany(count: number, overrides?: Partial<T>): T[];
  
  protected generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  protected getConfigValue(key: string, defaultValue: any) {
    return this.config.get(`testData.${key}`, defaultValue);
  }
}

// Factory registry để quản lý lifecycle
export class FactoryRegistry {
  private factories = new Map<string, BaseFactory<any>>();
  
  register<T>(name: string, factory: BaseFactory<T>) {
    this.factories.set(name, factory);
  }
  
  get<T>(name: string): BaseFactory<T> {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Factory not found: ${name}`);
    }
    return factory;
  }
  
  async cleanup() {
    // Cleanup bất kỳ resource nào factories đang giữ
    this.factories.clear();
  }
}
🔄 6. TEST ORCHESTRATION (COMPLEMENTARY TO PLAYWRIGHT)

Smart Test Distribution

typescript
// src/core/orchestration/test-distributor.ts
import { GlobalProperties } from '../../../configs/global/properties';

/**
 * Complementary to Playwright's sharding, không trùng lặp
 */
export class TestDistributor {
  constructor(private readonly config: GlobalProperties) {}
  
  /**
   * Distribute tests dựa trên nhiều yếu tố
   * Playwright chỉ hỗ trợ sharding đơn giản
   */
  async distributeTests(tests: TestSpec[], workers: number): Promise<TestDistribution[]> {
    const distribution: TestDistribution[] = Array.from(
      { length: workers }, 
      () => ({ workerId: 0, tests: [], estimatedDuration: 0 })
    );
    
    // Sort tests by estimated duration (longest first)
    const sortedTests = [...tests].sort((a, b) => b.estimatedDuration - a.estimatedDuration);
    
    // Distribute using bin packing algorithm
    for (const test of sortedTests) {
      // Find worker with minimum load
      const targetWorker = distribution.reduce((min, curr) => 
        curr.estimatedDuration < min.estimatedDuration ? curr : min
      );
      
      targetWorker.tests.push(test);
      targetWorker.estimatedDuration += test.estimatedDuration;
    }
    
    return distribution;
  }
  
  /**
   * Tính toán optimal sharding config cho Playwright
   */
  calculateShardingConfig(totalTests: number): { total: number; current: number }[] {
    const workers = this.config.get('execution.workers', 4);
    const shards = [];
    
    for (let i = 0; i < workers; i++) {
      shards.push({
        total: workers,
        current: i + 1
      });
    }
    
    return shards;
  }
}
🎨 7. VISUAL TESTING (COMPLEMENTARY TO PLAYWRIGHT)

Visual Regression Service

typescript
// src/core/visual/visual-regression-service.ts
import { Page, expect } from '@playwright/test';
import { GlobalProperties } from '../../../configs/global/properties';

/**
 * Extend Playwright's screenshot comparison
 * Sử dụng expect(page).toHaveScreenshot() là chính
 */
export class VisualRegressionService {
  constructor(private readonly config: GlobalProperties) {}
  
  /**
   * Wrapper cho Playwright's screenshot comparison với additional features
   */
  async compareScreenshot(
    page: Page, 
    name: string, 
    options: ScreenshotOptions = {}
  ): Promise<VisualComparisonResult> {
    const baselinePath = this.getBaselinePath(name);
    const threshold = options.threshold || this.config.get('visual.threshold', 0.1);
    
    try {
      // Sử dụng Playwright's built-in screenshot comparison
      await expect(page).toHaveScreenshot(name, {
        timeout: 10000,
        maxDiffPixelRatio: threshold,
        ...options
      });
      
      return {
        passed: true,
        diffPath: null,
        diffPercentage: 0
      };
      
    } catch (error: any) {
      // Extract diff information từ error
      const diffPath = this.extractDiffPath(error);
      const diffPercentage = this.calculateDiffPercentage(diffPath);
      
      return {
        passed: false,
        diffPath,
        diffPercentage,
        message: error.message
      };
    }
  }
  
  /**
   * Chỉ xử lý những phần Playwright không có:
   * - Ignore dynamic regions
   * - Compare specific elements
   * - Generate diff reports
   */
  async compareWithMasking(
    page: Page,
    name: string,
    maskSelectors: string[]
  ): Promise<VisualComparisonResult> {
    // Tạo masked screenshot
    const screenshot = await page.screenshot();
    const maskedScreenshot = await this.applyMasks(screenshot, maskSelectors);
    
    // Compare masked screenshot
    return this.compareScreenshots(maskedScreenshot, name);
  }
  
  private async applyMasks(screenshot: Buffer, selectors: string[]): Promise<Buffer> {
    // Implement masking logic
    // Sử dụng sharp hoặc canvas để mask dynamic regions
    return screenshot;
  }
}
📦 8. CONFIGURATION MANAGEMENT (ĐỘC LẬP)

Hierarchical Configuration

typescript
// configs/global/properties.ts
import { config } from '@playwright/test';

/**
 * Configuration management không trùng với Playwright config
 */
export class GlobalProperties {
  private properties: any = {};
  private playwrightConfig: any;
  
  constructor() {
    // Load Playwright config nhưng không override
    this.playwrightConfig = config;
    this.loadHierarchical();
  }
  
  private async loadHierarchical() {
    // 1. Load defaults
    this.properties = await this.loadFile('defaults.json');
    
    // 2. Load environment specific
    const env = this.detectEnvironment();
    const envConfig = await this.loadFile(`${env}.json`);
    this.mergeProperties(envConfig);
    
    // 3. Load CI/CD specific
    if (this.isCI()) {
      const ciConfig = await this.loadFile('ci-cd.json');
      this.mergeProperties(ciConfig);
    }
    
    // 4. Override với environment variables
    this.loadEnvironmentVariables();
    
    // 5. Override với CLI arguments
    this.loadCLIArguments();
  }
  
  /**
   * Get configuration, fallback to Playwright config nếu không có
   */
  get<T>(key: string, defaultValue?: T): T {
    // Check our properties first
    const value = this.getNested(this.properties, key);
    if (value !== undefined) return value;
    
    // Fallback to Playwright config
    const playwrightValue = this.getNested(this.playwrightConfig, key);
    if (playwrightValue !== undefined) return playwrightValue;
    
    // Return default
    return defaultValue as T;
  }
  
  /**
   * Get configuration cho Playwright use options
   */
  getPlaywrightUseOptions() {
    return {
      headless: this.get('browser.headless', true),
      viewport: this.get('browser.viewport', { width: 1920, height: 1080 }),
      ignoreHTTPSErrors: this.get('browser.ignoreHTTPSErrors', true),
      ...this.get('browser.useOptions', {})
    };
  }
}
🧩 9. INTEGRATION PATTERN

Kết hợp Playwright Test với Cucumber

typescript
// src/core/integration/playwright-cucumber-bridge.ts
import { test as playwrightTest, expect } from '@playwright/test';
import { Before, After, Given, When, Then } from '@cucumber/cucumber';

/**
 * Bridge để tích hợp Playwright Test với Cucumber
 */
export class PlaywrightCucumberBridge {
  private testContext: any = {};
  
  /**
   * Khởi tạo Playwright test fixtures
   */
  async initPlaywrightFixtures() {
    playwrightTest.beforeEach(async ({ page, context, browser }) => {
      // Store Playwright fixtures trong Cucumber world
      this.testContext.page = page;
      this.testContext.context = context;
      this.testContext.browser = browser;
    });
    
    playwrightTest.afterEach(async ({ page }) => {
      // Cleanup và reporting
      await this.captureArtifacts(page);
    });
  }
  
  /**
   * Cucumber steps sử dụng Playwright fixtures
   */
  registerSteps() {
    Given('I navigate to {string}', async (url: string) => {
      await this.testContext.page.goto(url);
    });
    
    When('I click on {string}', async (selector: string) => {
      await this.testContext.page.click(selector);
    });
    
    Then('I should see {string}', async (text: string) => {
      await expect(this.testContext.page.locator(`text=${text}`)).toBeVisible();
    });
  }
  
  /**
   * Tận dụng Playwright's test hooks
   */
  private async captureArtifacts(page: any) {
    // Auto-capture trên failure
    if (playwrightTest.info().status === 'failed') {
      const screenshot = await page.screenshot();
      playwrightTest.info().attachments.push({
        name: 'screenshot',
        contentType: 'image/png',
        body: screenshot
      });
    }
  }
}
📊 10. COMPARISON: NATIVE VS CUSTOM

Phân tích trùng lặp và giải pháp:

Feature	Playwright Native	Framework của chúng ta	Giải pháp
Browser Management	browser.launch()	BrowserManager class	Sử dụng native, chỉ thêm adapter
Page Actions	page.click(), page.fill()	Custom wrapper methods	Sử dụng native, chỉ thêm logging
Assertions	expect(page).toHaveText()	Custom assertion library	Sử dụng native, extend khi cần
Screenshots	page.screenshot()	Screenshot service	Sử dụng native, chỉ thêm post-processing
Video Recording	recordVideo option	Custom video service	Sử dụng native, chỉ thêm compression
Trace Recording	context.tracing	Custom trace analysis	Sử dụng native, chỉ thêm reporting
Network Mocking	page.route()	API mocking service	Sử dụng native, chỉ thêm abstraction
Parallel Execution	Sharding, workers	Test orchestrator	Sử dụng native, chỉ thêm smart distribution
Retry Logic	retries option	Custom retry with recovery	Sử dụng native, chỉ thêm recovery strategies
Device Emulation	devices object	Device profiles	Sử dụng native, chỉ thêm custom profiles
🎯 THIẾT KẾ CUỐI CÙNG

Principles đã tuân thủ:

Không tái tạo wheel: Sử dụng tối đa Playwright native features
Adapter pattern: Wrap Playwright functions thay vì override
Extension, không replacement: Chỉ thêm features Playwright thiếu
Configuration harmony: Config của framework complement Playwright config
Lifecycle integration: Hook vào Playwright lifecycle events
Core components độc lập:

Configuration Management - ✅ Độc lập
Test Data Factories - ✅ Độc lập
Reporting System - ⚠️ Complement (Allure + Playwright traces)
Plugin System - ✅ Extends Playwright
Visual Regression - ⚠️ Extends Playwright screenshot comparison
Performance Monitoring - ✅ Độc lập (dùng Performance API)
AI Features - ✅ Độc lập
Kiến trúc tối ưu:

text
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution Layer                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Cucumber  │  │ Playwright  │  │   Custom Plugins    │  │
│  │     BDD     │◄─┤     Test    │◄─┤  (Performance, AI,  │  │
│  │             │  │   Runner    │  │   Visual, etc.)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                  Adapter & Extension Layer                   │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Playwright Adapter (không override)           │  │
│  │  • Browser/Context/Page wrappers                      │  │
│  │  • Event monitoring                                   │  │
│  │  • Enhanced locators                                  │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   Core Business Logic                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Test Data   │  │   API       │  │   Configuration     │  │
│  │ Management  │  │ Integration │  │   Management        │  │
│  │             │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
