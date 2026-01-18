/**
 * Integration Test: Framework Structure Validation
 * 
 * This test validates that the repository restructuring was successful:
 * - Framework exports are accessible
 * - Page objects can be instantiated
 * - Core utilities work correctly
 */

import { GlobalProperties } from '../../../../framework/src/core/utilities/global-properties';
import { Logger } from '../../../../framework/src/core/utilities/logger';
import { PlaywrightWorld } from '../../../../framework/src/core/world/playwright-world';
import { BaseFactory } from '../../../../framework/src/factories/base-factory';

describe('Framework Structure Integration Tests', () => {
  describe('Core Utilities', () => {
    it('should create GlobalProperties instance', () => {
      const config = new GlobalProperties();
      expect(config).toBeDefined();
      expect(typeof config.get).toBe('function');
    });

    it('should access browser configuration', () => {
      const config = new GlobalProperties();
      const browserName = config.get('browser.name');
      expect(browserName).toBeDefined();
      expect(['chromium', 'firefox', 'webkit']).toContain(browserName);
    });

    it('should create Logger instance', () => {
      const logger = new Logger({ level: 'info' });
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
    });

    it('should log messages without errors', () => {
      const logger = new Logger({ level: 'debug', console: false });
      expect(() => {
        logger.debug('Test debug');
        logger.info('Test info');
        logger.warn('Test warn');
        logger.error('Test error');
      }).not.toThrow();
    });

    it('should handle logger metadata', () => {
      const logger = new Logger({ level: 'info', console: false });
      expect(() => {
        logger.info('Test with metadata', { userId: 123, action: 'click' });
      }).not.toThrow();
    });
  });

  describe('PlaywrightWorld', () => {
    it('should create PlaywrightWorld instance', () => {
      const world = new PlaywrightWorld({} as any);
      expect(world).toBeDefined();
    });

    it('should initialize with null browser resources', () => {
      const world = new PlaywrightWorld({} as any);
      expect(world.browser).toBeNull();
      expect(world.context).toBeNull();
      expect(world.page).toBeNull();
    });

    it('should have logger instance', () => {
      const world = new PlaywrightWorld({} as any);
      expect(world.logger).toBeDefined();
    });

    it('should have config instance', () => {
      const world = new PlaywrightWorld({} as any);
      expect(world.config).toBeDefined();
    });

    it('should have sharedData object', () => {
      const world = new PlaywrightWorld({} as any);
      expect(world.sharedData).toBeDefined();
      expect(typeof world.sharedData).toBe('object');
    });

    it('should allow storing data in sharedData', () => {
      const world = new PlaywrightWorld({} as any);
      world.sharedData.testKey = 'testValue';
      expect(world.sharedData.testKey).toBe('testValue');
    });
  });

  describe('Factory System', () => {
    interface TestData {
      id: number;
      name: string;
    }

    class TestDataFactory extends BaseFactory<TestData> {
      create(overrides?: Partial<TestData>): TestData {
        return {
          id: this.faker.number.int({ min: 1, max: 1000 }),
          name: this.faker.person.fullName(),
          ...overrides,
        };
      }

      createMany(count: number, overrides?: Partial<TestData>): TestData[] {
        return Array.from({ length: count }, () => this.create(overrides));
      }
    }

    it('should create factory with config', () => {
      const config = new GlobalProperties();
      const factory = new TestDataFactory(config);
      expect(factory).toBeDefined();
    });

    it('should generate test data', () => {
      const config = new GlobalProperties();
      const factory = new TestDataFactory(config);
      const data = factory.create();

      expect(data.id).toBeDefined();
      expect(data.name).toBeDefined();
      expect(typeof data.id).toBe('number');
      expect(typeof data.name).toBe('string');
    });

    it('should support overrides', () => {
      const config = new GlobalProperties();
      const factory = new TestDataFactory(config);
      const data = factory.create({ name: 'John Doe' });

      expect(data.name).toBe('John Doe');
      expect(data.id).toBeDefined();
    });

    it('should generate multiple items', () => {
      const config = new GlobalProperties();
      const factory = new TestDataFactory(config);
      const items = factory.createMany(5);

      expect(items).toHaveLength(5);
      items.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
      });
    });
  });

  describe('Configuration Hierarchy', () => {
    it('should load default configuration', () => {
      const config = new GlobalProperties();
      
      expect(config.get('browser')).toBeDefined();
      expect(config.get('execution')).toBeDefined();
      expect(config.get('reporting')).toBeDefined();
    });

    it('should support dot notation for nested properties', () => {
      const config = new GlobalProperties();
      
      const browserName = config.get('browser.name');
      const executionTimeout = config.get('execution.timeout');
      const headless = config.get('browser.headless');

      expect(browserName).toBeDefined();
      expect(executionTimeout).toBeDefined();
      expect(headless).toBeDefined();
    });

    it('should return default values when key not found', () => {
      const config = new GlobalProperties();
      
      const value = config.get('nonexistent.key', 'default-value');
      expect(value).toBe('default-value');
    });

    it('should handle various default value types', () => {
      const config = new GlobalProperties();
      
      expect(config.get('missing.string', 'default')).toBe('default');
      expect(config.get('missing.number', 42)).toBe(42);
      expect(config.get('missing.boolean', true)).toBe(true);
    });
  });

  describe('Framework Exports', () => {
    it('should export GlobalProperties', () => {
      expect(GlobalProperties).toBeDefined();
      expect(typeof GlobalProperties).toBe('function');
    });

    it('should export Logger', () => {
      expect(Logger).toBeDefined();
      expect(typeof Logger).toBe('function');
    });

    it('should export PlaywrightWorld', () => {
      expect(PlaywrightWorld).toBeDefined();
      expect(typeof PlaywrightWorld).toBe('function');
    });

    it('should export BaseFactory', () => {
      expect(BaseFactory).toBeDefined();
      expect(typeof BaseFactory).toBe('function');
    });
  });

  describe('Logger Context Management', () => {
    it('should create logger with context', () => {
      const logger = new Logger({ level: 'info', console: false }, { scenario: 'Test Scenario' });
      
      // Logger should be created successfully with context
      expect(logger).toBeDefined();
      expect(() => {
        logger.info('Message with context');
      }).not.toThrow();
    });

    it('should create multiple loggers with different contexts', () => {
      const logger1 = new Logger({ level: 'info', console: false }, { scenario: 'Scenario 1' });
      const logger2 = new Logger({ level: 'info', console: false }, { scenario: 'Scenario 2' });
      
      expect(() => {
        logger1.info('First message');
        logger2.info('Second message');
      }).not.toThrow();
    });
  });

  describe('Faker Integration', () => {
    it('should have faker instance in factory', () => {
      interface Product {
        sku: string;
        price: number;
      }

      class ProductFactory extends BaseFactory<Product> {
        create(overrides?: Partial<Product>): Product {
          return {
            sku: this.faker.string.alphanumeric(8),
            price: this.faker.number.float({ min: 1, max: 100, multipleOf: 0.01 }),
            ...overrides,
          };
        }

        createMany(count: number, overrides?: Partial<Product>): Product[] {
          return Array.from({ length: count }, () => this.create(overrides));
        }
      }

      const config = new GlobalProperties();
      const factory = new ProductFactory(config);
      const product = factory.create();

      expect(product.sku).toBeDefined();
      expect(product.sku.length).toBe(8);
      expect(product.price).toBeGreaterThan(0);
      expect(product.price).toBeLessThan(100);
    });
  });
});
