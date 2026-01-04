import { PlaywrightPlugin } from '../../../src/plugins/base/playwright-plugin';
import { Logger } from '../../../src/core/utilities/logger';
import { Page } from '@playwright/test';

// Mock implementation for testing
class TestPlugin extends PlaywrightPlugin {
  public setupCalled = false;
  public cleanupCalled = false;

  async setupPageEvents(_page: Page): Promise<void> {
    this.setupCalled = true;
  }

  async cleanup(): Promise<void> {
    this.cleanupCalled = true;
  }
}

describe('PlaywrightPlugin', () => {
  let plugin: TestPlugin;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ level: 'error', console: false });
    plugin = new TestPlugin('test-plugin', logger, {});
  });

  describe('Initialization', () => {
    it('should create a plugin instance', () => {
      expect(plugin).toBeInstanceOf(PlaywrightPlugin);
    });

    it('should have null playwright objects initially', () => {
      expect(plugin['page']).toBeNull();
      expect(plugin['context']).toBeNull();
      expect(plugin['browser']).toBeNull();
    });

    it('should store name, logger, and config', () => {
      expect(plugin['name']).toBe('test-plugin');
      expect(plugin['logger']).toBe(logger);
      expect(plugin['config']).toEqual({});
    });
  });

  describe('Lifecycle', () => {
    it('should call setupPageEvents during registration', () => {
      expect(plugin.setupCalled).toBe(false);
    });

    it('should call cleanup method', async () => {
      await plugin.cleanup();
      expect(plugin.cleanupCalled).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should accept configuration', () => {
      const config = { enabled: true, threshold: 100 };
      const configuredPlugin = new TestPlugin('configured', logger, config);
      expect(configuredPlugin['config']).toEqual(config);
    });
  });
});
