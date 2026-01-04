# Playwright-Cucumber Enterprise Framework

> A top-tier, enterprise-grade test automation framework combining Playwright's powerful browser automation with Cucumber's BDD approach. Built with TypeScript and following industry best practices.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green.svg)](https://playwright.dev/)
[![Cucumber](https://img.shields.io/badge/Cucumber-10.2-orange.svg)](https://cucumber.io/)

## 🎯 Overview

This framework leverages Playwright's native features while extending them with enterprise-level capabilities. It follows the **adapter pattern** to enhance rather than replace Playwright's built-in functionality.

### Key Principles

- **Test-First Development**: All components developed with comprehensive unit tests
- **Top 0.1% Code Quality**: Strict TypeScript, ESLint, Prettier configuration
- **Native Feature Leverage**: Uses Playwright's built-in capabilities instead of reinventing
- **Adapter Pattern**: Wraps and extends Playwright without overriding
- **Enterprise Ready**: Hierarchical configuration, comprehensive logging, plugin system

## ✨ Features

### Core Capabilities

- ✅ **Playwright Integration**: Full Playwright Test API support
- ✅ **Cucumber BDD**: Behavior-driven development with Gherkin syntax
- ✅ **TypeScript**: Strict type safety and modern JavaScript features
- ✅ **Hierarchical Configuration**: Multi-level config with environment overrides
- ✅ **Smart Logging**: Structured logging with context and levels
- ✅ **Test Data Factories**: Generate realistic test data with Faker.js
- ✅ **Plugin System**: Extensible architecture for custom functionality
- ✅ **Screenshot & Video**: Automatic capture on failure
- ✅ **Trace Recording**: Built-in Playwright trace support
- ✅ **Parallel Execution**: Multi-worker test execution
- ✅ **Retry Logic**: Configurable automatic retries

### Framework Components

```
playwright-cucumber-enterprise/
├── src/
│   ├── core/
│   │   ├── adapters/         # Playwright adapters
│   │   ├── utilities/         # Logger, config management
│   │   └── world/             # Cucumber World integration
│   ├── features/              # Cucumber features & steps
│   ├── plugins/               # Extensible plugin system
│   └── test-data/             # Test data factories
├── tests/                     # Comprehensive test suite
├── configs/                   # Configuration files
└── results/                   # Test results & artifacts
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/Daicaxom/auto_playwright_cucumber.git
cd auto_playwright_cucumber

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage

# Run Cucumber tests
npm run cucumber

# Run Cucumber tests with automatic report generation
npm run cucumber:report

# Run specific Cucumber feature
npm run cucumber -- src/features/saucedemo.feature

# Run tests with specific tags
npm run cucumber -- --tags "@complex and @purchase"

# Build the project
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

### Generating Reports

```bash
# Generate enhanced HTML report from test results
npm run report:generate

# Generate Allure report
npm run report:allure

# Open Allure report in browser
npm run report:allure:open

# Generate and serve Allure report instantly
npm run report:allure:serve
```

## 📖 Usage

### Writing Features

Create feature files in `src/features/`:

```gherkin
Feature: Login
  As a user
  I want to log into the application

  Scenario: Successful login
    Given I am on the login page
    When I enter username "user@example.com"
    And I enter password "SecurePass123!"
    And I click the login button
    Then I should see the dashboard
```

### Writing Step Definitions

Create step definitions using the PlaywrightWorld:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../core/world/playwright-world';
import { expect } from '@playwright/test';

Given('I am on the login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await this.goto('https://example.com/login');
  await this.page.waitForLoadState('networkidle');
});

When('I enter username {string}', async function (this: PlaywrightWorld, username: string) {
  if (!this.page) throw new Error('Page not initialized');
  const field = this.getLocator('#username');
  await field.fill(username);
});

Then('I should see the dashboard', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  await expect(this.page).toHaveURL(/dashboard/);
});
```

### Configuration

Configuration files are located in `configs/global/`:

- `defaults.json`: Base configuration
- `dev.json`: Development environment overrides
- `ci-cd.json`: CI/CD environment settings

Example configuration:

```json
{
  "execution": {
    "timeout": 30000,
    "headless": true,
    "workers": 4,
    "retries": 2
  },
  "browser": {
    "name": "chromium",
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  },
  "reporting": {
    "screenshots": {
      "enabled": true,
      "onFailure": true
    }
  }
}
```

### Test Data Factories

Create reusable test data generators:

```typescript
import { BaseFactory } from './test-data/factories/base-factory';
import { GlobalProperties } from './core/utilities/global-properties';

interface User {
  id: string;
  name: string;
  email: string;
}

class UserFactory extends BaseFactory<User> {
  create(overrides?: Partial<User>): User {
    return {
      id: this.generateUniqueId(),
      name: this.faker.person.fullName(),
      email: this.faker.internet.email(),
      ...overrides,
    };
  }

  createMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

// Usage
const config = new GlobalProperties();
const factory = new UserFactory(config);
const user = factory.create({ name: 'John Doe' });
const users = factory.createMany(10);
```

## 🏗️ Architecture

### Playwright Adapter Pattern

The framework uses an adapter pattern to wrap Playwright functionality:

```typescript
import { PlaywrightAdapter } from './core/adapters/playwright-adapter';
import { GlobalProperties } from './core/utilities/global-properties';
import { Logger } from './core/utilities/logger';

const config = new GlobalProperties();
const logger = new Logger({ level: 'info' });
const adapter = new PlaywrightAdapter(config, logger);

// Create browser with configuration
const browser = await adapter.createBrowser();
const context = await adapter.createContext(browser);
const page = await adapter.createPage(context);
```

### Cucumber World Integration

The PlaywrightWorld provides shared context for all step definitions:

```typescript
export class PlaywrightWorld extends World {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  sharedData: Record<string, unknown> = {};
  screenshots: Array<{ name: string; buffer: Buffer }> = [];

  async init(): Promise<void> {
    this.browser = await this.playwright.createBrowser();
    this.context = await this.playwright.createContext(this.browser);
    this.page = await this.playwright.createPage(this.context);
  }

  async cleanup(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }
}
```

### Plugin System

Extend framework functionality with plugins:

```typescript
import { PlaywrightPlugin } from './plugins/base/playwright-plugin';
import { Page } from '@playwright/test';

class PerformancePlugin extends PlaywrightPlugin {
  async setupPageEvents(page: Page): Promise<void> {
    page.on('load', async () => {
      const metrics = await page.metrics();
      this.logger.info('Performance metrics', { metrics });
    });
  }
}
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                      # Unit tests
│   ├── core/                  # Core component tests
│   ├── plugins/               # Plugin tests
│   └── test-data/             # Factory tests
└── integration/               # Integration tests
```

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- tests/unit/core/global-properties.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

The framework maintains high test coverage:

- Minimum 80% coverage threshold
- Comprehensive unit tests for all components
- Integration tests for end-to-end flows

## 📊 Reporting

The framework provides multiple reporting formats to suit different needs, from simple HTML reports to comprehensive Allure reports with rich visualizations.

### Available Report Types

#### 1. Standard Cucumber HTML Report
Basic HTML report generated by Cucumber, providing a simple overview of test execution.

**Location:** `results/cucumber-report.html`

#### 2. Enhanced HTML Report
Rich, interactive HTML report with detailed metrics, charts, and metadata using `multiple-cucumber-html-reporter`.

**Features:**
- Detailed scenario execution information
- Test duration metrics
- Browser and platform information
- Custom metadata and branding
- Interactive charts and graphs

**Location:** `results/enhanced-html-report/index.html`

**Generate:** `npm run report:generate`

#### 3. Allure Report
Enterprise-grade reporting with comprehensive test analytics, history trends, and detailed test execution data.

**Features:**
- Test execution trends and history
- Test duration and retry information
- Categories and severity levels
- Detailed test steps with screenshots
- Attachments (screenshots, logs, traces)
- Comprehensive test analytics

**Location:** `allure-report/index.html`

**Commands:**
```bash
# Generate Allure report
npm run report:allure

# Open generated report in browser
npm run report:allure:open

# Generate and serve report instantly
npm run report:allure:serve
```

#### 4. JSON Report
Machine-readable JSON format for custom processing and integration with other tools.

**Location:** `results/cucumber-report.json`

### Test Artifacts

The framework automatically captures various artifacts during test execution:

- **Screenshots**: Automatically captured on test failures
  - Location: `results/screenshots/`
  - Attached to Cucumber and Allure reports

- **Traces**: Playwright traces for detailed debugging (when enabled)
  - Location: `results/traces/`
  - Open with: `npx playwright show-trace results/traces/trace-*.zip`

- **Videos**: Optional video recording of test execution
  - Location: `results/videos/`
  - Enable in configuration: `execution.video = true`

- **Logs**: Structured application logs
  - Location: `logs/`
  - Format: JSON or text (configurable)

### Generating Reports

#### Run tests and generate all reports:
```bash
# Run Cucumber tests with report generation
npm run cucumber:report
```

#### Generate reports from existing test results:
```bash
# Enhanced HTML report
npm run report:generate

# Allure report
npm run report:allure

# Open Allure report in browser
npm run report:allure:open
```

### CI/CD Integration

Reports are automatically generated and uploaded as artifacts in CI/CD pipelines:

1. **Standard Cucumber HTML** - Basic test results
2. **Enhanced HTML Report** - Rich interactive report
3. **Allure Report** - Comprehensive analytics
4. **Test Results** - All JSON data and artifacts

All reports are retained for 30 days and can be downloaded from the GitHub Actions artifacts section.

### Viewing Reports Locally

After running tests:

```bash
# Open enhanced HTML report
open results/enhanced-html-report/index.html

# Or on Linux
xdg-open results/enhanced-html-report/index.html

# Serve Allure report
npm run report:allure:serve
```

### Report Configuration

Configure reporting behavior in `configs/global/defaults.json`:

```json
{
  "reporting": {
    "screenshots": {
      "enabled": true,
      "onFailure": true,
      "fullPage": true
    },
    "video": {
      "enabled": false,
      "mode": "on-failure"
    },
    "trace": {
      "enabled": false,
      "mode": "on-failure"
    }
  },
  "execution": {
    "trace": false
  }
}
```

#### Allure Reporter Configuration

The Allure reporter supports custom link patterns through environment variables:

```bash
# Set GitHub repository for issue links (default: Daicaxom/auto_playwright_cucumber)
export GITHUB_REPOSITORY="your-org/your-repo"

# Set TMS (Test Management System) URL for @tms links
export TMS_URL="https://your-tms.com/issue/%s"

# Run tests
npm run cucumber
```

You can also add custom tags to your features for better Allure integration:

```gherkin
@feature:user-authentication
@severity:critical
@story:login
@issue=123
@tms=TEST-456
Scenario: User login with valid credentials
  Given I am on the login page
  ...
```

### Test Results

## 🔧 Configuration

### Environment Variables

Override configuration using environment variables:

```bash
BROWSER_NAME=firefox npm run cucumber
EXECUTION_HEADLESS=false npm run cucumber
UI_TIMEOUT=45000 npm run cucumber
```

### CLI Arguments

Pass configuration via command line:

```bash
npm run cucumber -- --browser.name=firefox --execution.headless=false
```

### Configuration Hierarchy

Priority order (highest to lowest):

1. CLI arguments
2. Environment variables
3. CI/CD configuration
4. Environment-specific configuration
5. Default configuration

## 🔌 Extending the Framework

### Creating Custom Plugins

```typescript
import { PlaywrightPlugin } from './plugins/base/playwright-plugin';
import { Page } from '@playwright/test';
import { Logger } from './core/utilities/logger';

export class CustomPlugin extends PlaywrightPlugin {
  constructor(logger: Logger, config: Record<string, unknown>) {
    super('custom-plugin', logger, config);
  }

  async setupPageEvents(page: Page): Promise<void> {
    // Add custom page event handlers
    page.on('console', (msg) => {
      this.logger.debug('Console:', msg.text());
    });
  }

  async cleanup(): Promise<void> {
    // Custom cleanup logic
    this.logger.info('Cleaning up custom plugin');
  }
}
```

### Creating Custom Factories

```typescript
import { BaseFactory } from './test-data/factories/base-factory';

interface Product {
  id: string;
  name: string;
  price: number;
}

class ProductFactory extends BaseFactory<Product> {
  create(overrides?: Partial<Product>): Product {
    return {
      id: this.generateUniqueId(),
      name: this.faker.commerce.productName(),
      price: parseFloat(this.faker.commerce.price()),
      ...overrides,
    };
  }

  createMany(count: number, overrides?: Partial<Product>): Product[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests first (TDD approach)
4. Implement your changes
5. Ensure all tests pass
6. Run linting and formatting
7. Submit a pull request

### Code Quality Standards

- TypeScript strict mode enabled
- ESLint rules must pass
- Prettier formatting required
- Minimum 80% test coverage
- All tests must pass

## 📝 License

MIT

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Modern browser automation
- [Cucumber](https://cucumber.io/) - BDD framework
- [Faker.js](https://fakerjs.dev/) - Test data generation
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

---

**Built with ❤️ following top 0.1% code quality standards**
