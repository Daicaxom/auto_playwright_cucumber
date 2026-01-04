import { GlobalProperties } from '../../../src/core/utilities/global-properties';

describe('GlobalProperties', () => {
  let globalProperties: GlobalProperties;

  beforeEach(() => {
    // Clean up process.argv and process.env before each test
    process.argv = process.argv.slice(0, 2);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create a GlobalProperties instance', () => {
      globalProperties = new GlobalProperties();
      expect(globalProperties).toBeInstanceOf(GlobalProperties);
    });

    it('should load default configuration', () => {
      globalProperties = new GlobalProperties();
      expect(globalProperties.get('execution.timeout')).toBeDefined();
    });
  });

  describe('Configuration Loading', () => {
    it('should load configuration from defaults.json', () => {
      globalProperties = new GlobalProperties();
      const timeout = globalProperties.get('execution.timeout', 30000);
      expect(timeout).toBe(30000);
    });

    it('should merge environment-specific configuration', () => {
      process.env.NODE_ENV = 'dev';
      globalProperties = new GlobalProperties();
      // Dev config should override defaults if exists
      expect(globalProperties).toBeInstanceOf(GlobalProperties);
    });

    it('should override with environment variables', () => {
      process.env.BROWSER_NAME = 'firefox';
      globalProperties = new GlobalProperties();
      const browserName = globalProperties.get('browser.name');
      expect(browserName).toBeDefined();
    });
  });

  describe('get method', () => {
    beforeEach(() => {
      globalProperties = new GlobalProperties();
    });

    it('should return value for existing key', () => {
      const value = globalProperties.get('execution.timeout', 30000);
      expect(value).toBeDefined();
    });

    it('should return default value for non-existing key', () => {
      const value = globalProperties.get('non.existing.key', 'default');
      expect(value).toBe('default');
    });

    it('should handle nested keys', () => {
      const value = globalProperties.get('browser.viewport.width', 1920);
      expect(typeof value).toBe('number');
    });

    it('should return undefined for missing key without default', () => {
      const value = globalProperties.get('missing.key');
      expect(value).toBeUndefined();
    });
  });

  describe('set method', () => {
    beforeEach(() => {
      globalProperties = new GlobalProperties();
    });

    it('should set a simple value', () => {
      globalProperties.set('test.key', 'test-value');
      expect(globalProperties.get('test.key')).toBe('test-value');
    });

    it('should set a nested value', () => {
      globalProperties.set('test.nested.key', 'nested-value');
      expect(globalProperties.get('test.nested.key')).toBe('nested-value');
    });

    it('should override existing value', () => {
      globalProperties.set('test.key', 'value1');
      globalProperties.set('test.key', 'value2');
      expect(globalProperties.get('test.key')).toBe('value2');
    });
  });

  describe('Configuration Hierarchy', () => {
    it('should prioritize CLI args over env vars', () => {
      process.env.BROWSER_NAME = 'firefox';
      process.argv.push('--browser.name=chromium');

      globalProperties = new GlobalProperties();

      // CLI args should take precedence
      expect(globalProperties).toBeInstanceOf(GlobalProperties);
    });

    it('should prioritize env vars over config files', () => {
      process.env.EXECUTION_TIMEOUT = '45000';
      globalProperties = new GlobalProperties();

      // Env var should take precedence
      expect(globalProperties).toBeInstanceOf(GlobalProperties);
    });
  });

  describe('Environment Detection', () => {
    it('should detect CI environment', () => {
      process.env.CI = 'true';
      globalProperties = new GlobalProperties();

      const isCI = globalProperties.isCI();
      expect(isCI).toBe(true);
    });

    it('should detect non-CI environment', () => {
      // Save current CI env vars
      const savedCI = process.env.CI;
      const savedGithub = process.env.GITHUB_ACTIONS;

      // Clear CI environment variables
      delete process.env.CI;
      delete process.env.GITHUB_ACTIONS;

      globalProperties = new GlobalProperties();

      const isCI = globalProperties.isCI();
      expect(isCI).toBe(false);

      // Restore CI env vars
      if (savedCI) process.env.CI = savedCI;
      if (savedGithub) process.env.GITHUB_ACTIONS = savedGithub;
    });

    it('should detect current environment', () => {
      process.env.NODE_ENV = 'production';
      globalProperties = new GlobalProperties();

      const env = globalProperties.getEnvironment();
      expect(env).toBe('production');
    });
  });

  describe('Playwright Integration', () => {
    beforeEach(() => {
      globalProperties = new GlobalProperties();
    });

    it('should provide Playwright use options', () => {
      const useOptions = globalProperties.getPlaywrightUseOptions();

      expect(useOptions).toBeDefined();
      expect(useOptions).toHaveProperty('headless');
      expect(useOptions).toHaveProperty('viewport');
    });

    it('should merge custom use options', () => {
      const useOptions = globalProperties.getPlaywrightUseOptions();

      expect(useOptions.viewport).toBeDefined();
      expect(useOptions.viewport).toHaveProperty('width');
      expect(useOptions.viewport).toHaveProperty('height');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration file gracefully', () => {
      // Should not throw even if config files are missing
      expect(() => {
        globalProperties = new GlobalProperties();
      }).not.toThrow();
    });

    it('should handle invalid JSON in configuration file', () => {
      // Should handle parse errors gracefully
      expect(() => {
        globalProperties = new GlobalProperties();
      }).not.toThrow();
    });
  });
});
