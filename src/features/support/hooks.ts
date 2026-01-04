import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../core/world/playwright-world';

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
  try {
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

    // Cleanup Playwright resources
    await this.cleanup();
  } catch (error) {
    this.logger.error('Error in After hook', error);
    throw error;
  }
});

/**
 * Global setup - runs once before all scenarios
 */
BeforeAll(async function () {
  // Ensure results directories exist
  const fs = await import('fs/promises');
  const path = await import('path');

  const directories = [
    'results',
    'results/traces',
    'results/screenshots',
    'results/videos',
    'allure-results',
  ];

  for (const dir of directories) {
    const dirPath = path.resolve(process.cwd(), dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${dir}:`, error);
    }
  }
});

/**
 * Global teardown - runs once after all scenarios
 */
AfterAll(async function () {
  // Placeholder for global cleanup if needed
  console.log('All scenarios completed');
});
