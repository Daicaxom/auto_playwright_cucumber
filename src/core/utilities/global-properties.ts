import * as fs from 'fs';
import * as path from 'path';

/**
 * GlobalProperties manages hierarchical configuration for the framework.
 * Priority order (highest to lowest):
 * 1. CLI arguments
 * 2. Environment variables
 * 3. CI/CD configuration
 * 4. Environment-specific configuration
 * 5. Default configuration
 */
export class GlobalProperties {
  private properties: Record<string, unknown> = {};
  private readonly configDir: string;

  constructor(configDir?: string) {
    this.configDir = configDir || path.join(process.cwd(), 'configs');
    this.loadConfiguration();
  }

  /**
   * Load configuration in hierarchical order
   */
  private loadConfiguration(): void {
    // 1. Load defaults
    this.loadFile('defaults.json');

    // 2. Load environment-specific config
    const env = this.getEnvironment();
    this.loadFile(`${env}.json`);

    // 3. Load CI/CD config if in CI environment
    if (this.isCI()) {
      this.loadFile('ci-cd.json');
    }

    // 4. Override with environment variables
    this.loadEnvironmentVariables();

    // 5. Override with CLI arguments
    this.loadCLIArguments();
  }

  /**
   * Load configuration from a file
   */
  private loadFile(filename: string): void {
    const filePath = path.join(this.configDir, 'global', filename);

    if (!fs.existsSync(filePath)) {
      return; // Skip if file doesn't exist
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const config = JSON.parse(content) as Record<string, unknown>;
      this.mergeProperties(config);
    } catch (error) {
      // Silently skip invalid files
      // In production, you might want to log this
    }
  }

  /**
   * Load configuration from environment variables
   * Converts SNAKE_CASE to dot.notation
   */
  private loadEnvironmentVariables(): void {
    const envVars = process.env;

    for (const [key, value] of Object.entries(envVars)) {
      if (this.isFrameworkEnvVar(key)) {
        const configKey = this.envVarToConfigKey(key);
        this.setNested(this.properties, configKey, this.parseValue(value || ''));
      }
    }
  }

  /**
   * Check if environment variable belongs to framework
   */
  private isFrameworkEnvVar(key: string): boolean {
    const frameworkPrefixes = ['BROWSER', 'EXECUTION', 'UI', 'REPORTING', 'MONITORING'];
    return frameworkPrefixes.some((prefix) => key.startsWith(prefix));
  }

  /**
   * Convert environment variable name to config key
   * e.g., BROWSER_NAME -> browser.name
   */
  private envVarToConfigKey(envVar: string): string {
    return envVar.toLowerCase().replace(/_/g, '.');
  }

  /**
   * Parse string value to appropriate type
   */
  private parseValue(value: string): unknown {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if not valid JSON
      return value;
    }
  }

  /**
   * Load configuration from CLI arguments
   * Format: --key.nested.value=something
   */
  private loadCLIArguments(): void {
    const args = process.argv.slice(2);

    for (const arg of args) {
      if (arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        if (key && value !== undefined) {
          this.setNested(this.properties, key, this.parseValue(value));
        }
      }
    }
  }

  /**
   * Merge properties with existing configuration
   */
  private mergeProperties(newProps: Record<string, unknown>): void {
    this.properties = this.deepMerge(this.properties, newProps);
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(
    target: Record<string, unknown>,
    source: Record<string, unknown>
  ): Record<string, unknown> {
    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(
          (result[key] as Record<string, unknown>) || {},
          value as Record<string, unknown>
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Get configuration value by key
   */
  public get<T>(key: string, defaultValue?: T): T | undefined {
    const value = this.getNested(this.properties, key);
    return (value !== undefined ? value : defaultValue) as T | undefined;
  }

  /**
   * Set configuration value by key
   */
  public set(key: string, value: unknown): void {
    this.setNested(this.properties, key, value);
  }

  /**
   * Get nested property value using dot notation
   */
  private getNested(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Set nested property value using dot notation
   */
  private setNested(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();

    if (!lastKey) return;

    let current = obj;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    current[lastKey] = value;
  }

  /**
   * Check if running in CI environment
   */
  public isCI(): boolean {
    return (
      process.env.CI === 'true' ||
      !!process.env.GITHUB_ACTIONS ||
      !!process.env.GITLAB_CI ||
      !!process.env.JENKINS_URL ||
      !!process.env.TRAVIS ||
      !!process.env.CIRCLECI
    );
  }

  /**
   * Get current environment
   */
  public getEnvironment(): string {
    return process.env.NODE_ENV || 'dev';
  }

  /**
   * Get Playwright use options from configuration
   */
  public getPlaywrightUseOptions(): Record<string, unknown> {
    return {
      headless: this.get('browser.headless', true),
      viewport: this.get('browser.viewport', { width: 1920, height: 1080 }),
      ignoreHTTPSErrors: this.get('browser.ignoreHTTPSErrors', true),
      ...(this.get('browser.useOptions', {}) as Record<string, unknown>),
    };
  }

  /**
   * Get all properties
   */
  public getAll(): Record<string, unknown> {
    return { ...this.properties };
  }
}
