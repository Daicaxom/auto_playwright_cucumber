import { faker } from '@faker-js/faker';
import { GlobalProperties } from '../../core/utilities/global-properties';

/**
 * Base factory for generating test data
 * Uses faker.js to generate realistic test data
 */
export abstract class BaseFactory<T> {
  protected faker = faker;

  constructor(protected readonly config: GlobalProperties) {
    // Set faker seed if configured for reproducible data
    const seed = this.config.get('testData.faker.seed') as number | null;
    if (seed !== null) {
      faker.seed(seed);
    }

    // Note: Faker locale configuration would require specific locale imports
    // For now, using default 'en' locale
  }

  /**
   * Create a single instance of test data
   * @param overrides - Properties to override in generated data
   */
  abstract create(overrides?: Partial<T>): T;

  /**
   * Create multiple instances of test data
   * @param count - Number of instances to create
   * @param overrides - Properties to override in all generated data
   */
  abstract createMany(count: number, overrides?: Partial<T>): T[];

  /**
   * Generate a unique ID
   */
  protected generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get configuration value with namespace
   * @param key - Configuration key relative to testData namespace
   * @param defaultValue - Default value if key not found
   */
  protected getConfigValue<V>(key: string, defaultValue: V): V {
    return this.config.get(`testData.${key}`, defaultValue) as V;
  }
}

/**
 * Registry for managing factory instances
 * Provides centralized factory management and lifecycle control
 */
export class FactoryRegistry {
  private factories = new Map<string, BaseFactory<unknown>>();

  /**
   * Register a factory with a name
   * @param name - Unique name for the factory
   * @param factory - Factory instance to register
   */
  register<T>(name: string, factory: BaseFactory<T>): void {
    this.factories.set(name, factory as BaseFactory<unknown>);
  }

  /**
   * Get a registered factory by name
   * @param name - Name of the factory to retrieve
   * @returns The registered factory
   * @throws Error if factory not found
   */
  get<T>(name: string): BaseFactory<T> {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(`Factory not found: ${name}`);
    }
    return factory as BaseFactory<T>;
  }

  /**
   * Check if a factory is registered
   * @param name - Name of the factory to check
   */
  has(name: string): boolean {
    return this.factories.has(name);
  }

  /**
   * Unregister a factory
   * @param name - Name of the factory to unregister
   */
  unregister(name: string): boolean {
    return this.factories.delete(name);
  }

  /**
   * Get all registered factory names
   */
  getRegisteredNames(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Cleanup all registered factories
   * Clears the registry to free resources
   */
  cleanup(): Promise<void> {
    this.factories.clear();
    return Promise.resolve();
  }
}
