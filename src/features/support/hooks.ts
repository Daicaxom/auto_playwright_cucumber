import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../core/world/playwright-world';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';

/**
 * Setup hook - runs before each scenario
 */
Before(async function (this: PlaywrightWorld) {
  // Initialize browser, context, and page
  await this.init();
});

/**
 * Teardown hook - runs after each scenario
 */
After(async function (this: PlaywrightWorld, { result, pickle }) {
  // Capture screenshot on failure
  if (result && result.status === Status.FAILED) {
    const scenarioName = pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotName = `${scenarioName}_${timestamp}`;

    try {
      await this.captureScreenshot(screenshotName);
      this.logger.info('Screenshot captured for failed scenario', {
        scenario: pickle.name,
        screenshotName,
      });
    } catch (error) {
      this.logger.error('Failed to capture screenshot', error);
    }
  }

  // Always cleanup Playwright resources - even if screenshot fails
  try {
    await this.cleanup();
  } catch (error) {
    this.logger.error('Error cleaning up in After hook', error);
    // Force cleanup even if error
    if (this.page) {
      try {
        await this.page.close().catch(() => {});
      } catch {}
    }
    if (this.context) {
      try {
        await this.context.close().catch(() => {});
      } catch {}
    }
    if (this.browser) {
      try {
        await this.browser.close().catch(() => {});
      } catch {}
    }
  }
});

/**
 * Global setup - runs once before all scenarios
 */
BeforeAll(async function () {
  // Ensure results directories exist
  const directories = [
    'results',
    'results/traces',
    'results/screenshots',
    'results/videos',
    'allure-results',
  ];

  for (const dir of directories) {
    const dirPath = resolve(process.cwd(), dir);
    try {
      await mkdir(dirPath, { recursive: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to create directory ${dir}:`, error);
    }
  }
});

/**
 * Global teardown - runs once after all scenarios
 */
AfterAll(function () {
  // Placeholder for global cleanup if needed
  // eslint-disable-next-line no-console
  console.log('All scenarios completed');
});
