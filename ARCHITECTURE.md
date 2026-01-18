# Framework Architecture

## Overview

This project implements an **enterprise-grade test automation framework** using a monorepo architecture that separates reusable framework components from application-specific test code. This design ensures maximum reusability, maintainability, and scalability.

## Architecture Principles

### 1. **Separation of Concerns**
- **Framework Layer** (`framework/`): Reusable, application-agnostic components
- **Test Layer** (`tests/`): Application-specific page objects, step definitions, and scenarios

### 2. **Page Object Model (POM)**
All UI interactions are encapsulated in page objects that:
- Extend from `BasePage` with common methods
- Hide implementation details (selectors, waits)
- Provide high-level, business-focused APIs
- Enable easy maintenance when UI changes

### 3. **Adapter Pattern**
The framework wraps Playwright's native features without overriding them:
- Preserves upgrade path to newer Playwright versions
- Adds enterprise capabilities (logging, configuration)
- Maintains full access to Playwright API

### 4. **BDD with Cucumber**
- Feature files describe business scenarios in Gherkin
- Step definitions bridge feature files to page objects
- Enables collaboration between technical and non-technical stakeholders

## Directory Structure

```
playwright-cucumber-enterprise/
│
├── framework/                          # ════════════════════════════════════
│   │                                   # REUSABLE FRAMEWORK CORE
│   │                                   # ════════════════════════════════════
│   ├── src/
│   │   ├── core/                      # Core framework components
│   │   │   ├── adapters/
│   │   │   │   └── playwright-adapter.ts     # Wraps Playwright browser launch
│   │   │   ├── utilities/
│   │   │   │   ├── global-properties.ts      # Hierarchical configuration
│   │   │   │   └── logger.ts                 # Structured logging
│   │   │   └── world/
│   │   │       └── playwright-world.ts       # Cucumber World integration
│   │   ├── plugins/
│   │   │   └── base/
│   │   │       └── playwright-plugin.ts      # Plugin system base
│   │   ├── factories/
│   │   │   └── base/
│   │   │       └── base-factory.ts           # Test data factory base
│   │   └── index.ts                          # Main framework exports
│   ├── package.json                          # Framework as npm package
│   └── README.md                             # Framework documentation
│
├── tests/                              # ════════════════════════════════════
│   │                                   # APPLICATION-SPECIFIC TESTS
│   │                                   # ════════════════════════════════════
│   ├── src/
│   │   ├── applications/              # Application test suites
│   │   │   │
│   │   │   ├── shared/                # Shared components across apps
│   │   │   │   └── pages/
│   │   │   │       └── base.page.ts          # Abstract base page
│   │   │   │
│   │   │   ├── saucedemo/             # SauceDemo app test suite
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login.page.ts         # Login page object
│   │   │   │   │   ├── inventory.page.ts     # Inventory page object
│   │   │   │   │   ├── cart.page.ts          # Cart page object
│   │   │   │   │   └── checkout.page.ts      # Checkout page object
│   │   │   │   └── step-definitions/
│   │   │   │       ├── auth.steps.ts         # Authentication steps
│   │   │   │       ├── shopping.steps.ts     # Shopping steps
│   │   │   │       └── checkout.steps.ts     # Checkout steps
│   │   │   │
│   │   │   └── demoqa/                # DemoQA app test suite
│   │   │       ├── pages/
│   │   │       │   └── elements.page.ts      # Elements page object
│   │   │       └── step-definitions/
│   │   │           └── elements.steps.ts     # Elements interaction steps
│   │   │
│   │   └── features/                  # Cucumber feature files
│   │       ├── saucedemo/
│   │       │   ├── auth.feature              # Authentication scenarios
│   │       │   ├── shopping.feature          # Shopping scenarios
│   │       │   └── checkout.feature          # Checkout scenarios
│   │       └── demoqa/
│   │           └── elements.feature          # Elements interaction scenarios
│   │
│   └── support/                       # Cucumber support files
│       ├── hooks.ts                          # Before/After hooks
│       └── world.ts                          # World setup
│
├── configs/                            # ════════════════════════════════════
│   └── global/                        # CONFIGURATION FILES
│       ├── defaults.json              # ════════════════════════════════════
│       ├── dev.json                          # Default configuration
│       └── ci-cd.json                        # Development overrides
│                                             # CI/CD overrides
├── results/                            # Test execution results
│   ├── cucumber-report.html                  # Cucumber HTML report
│   ├── cucumber-report.json                  # Cucumber JSON report
│   ├── enhanced-html-report/                 # Enhanced HTML report
│   ├── screenshots/                          # Failure screenshots
│   └── traces/                               # Playwright traces
│
├── scripts/                            # Build and utility scripts
│   └── generate-report.js                    # Enhanced report generator
│
├── cucumber.js                         # Cucumber profiles configuration
├── playwright.config.ts                # Playwright configuration
├── tsconfig.json                       # TypeScript configuration
└── package.json                        # Root npm package
```

## Component Layers

### Framework Layer (`framework/`)

**Purpose**: Provide reusable, application-agnostic automation infrastructure.

#### Core Components

1. **PlaywrightAdapter** (`core/adapters/playwright-adapter.ts`)
   - Wraps Playwright browser/context/page creation
   - Adds logging, configuration, tracing
   - Maintains native Playwright API access

2. **GlobalProperties** (`core/utilities/global-properties.ts`)
   - Hierarchical configuration management
   - Priority: CLI args > Env vars > CI/CD config > Environment config > Defaults
   - Dot notation access: `config.get('browser.headless', true)`

3. **Logger** (`core/utilities/logger.ts`)
   - Structured logging with context
   - Levels: debug, info, warn, error
   - Automatic scenario context injection

4. **PlaywrightWorld** (`core/world/playwright-world.ts`)
   - Integrates Playwright with Cucumber World
   - Manages browser/context/page lifecycle
   - Provides helper methods for step definitions

5. **Plugin System** (`plugins/base/playwright-plugin.ts`)
   - Event-based extension points
   - Hook into Playwright events without modifying core

6. **Factory System** (`factories/base/base-factory.ts`)
   - Test data generation with Faker.js
   - Consistent data structure across tests

### Test Layer (`tests/`)

**Purpose**: Application-specific test implementation using Page Object Model.

#### Page Objects

All page objects extend `BasePage` which provides:
- **Navigation**: `navigate(url)`, `goto(url)`, `waitForPageLoad()`
- **Element Interaction**: `click(selector)`, `fill(selector, value)`, `getText(selector)`
- **Waits**: `waitForElement(selector)`, `waitForVisible(selector)`
- **Utilities**: `screenshot(name)`, `isVisible(selector)`, `getLocator(selector)`

**Example Page Object Structure**:
```typescript
import { BasePage } from '@tests/applications/shared/pages/base.page';
import { PlaywrightWorld } from '@framework/core';

export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameInput: '#user-name',
    passwordInput: '#password',
    loginButton: '#login-button',
  };

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.selectors.usernameInput, username);
    await this.fill(this.selectors.passwordInput, password);
    await this.click(this.selectors.loginButton);
  }
}
```

#### Step Definitions

Step definitions act as the glue between Gherkin scenarios and page objects:
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { LoginPage } from '../pages/login.page';

Given('I am on the login page', async function (this: PlaywrightWorld) {
  const loginPage = new LoginPage(this);
  await loginPage.navigate();
});

When('I login with {string} and {string}', 
  async function (this: PlaywrightWorld, username: string, password: string) {
    const loginPage = new LoginPage(this);
    await loginPage.login(username, password);
  }
);
```

## Configuration Hierarchy

Configuration is loaded in priority order (highest to lowest):

1. **CLI Arguments**: `--browser=firefox`
2. **Environment Variables**: `BROWSER_NAME=firefox`
3. **CI/CD Config**: `configs/global/ci-cd.json`
4. **Environment Config**: `configs/global/dev.json`
5. **Defaults**: `configs/global/defaults.json`

**Example Configuration Access**:
```typescript
const config = GlobalProperties.getInstance();
const headless = config.get('browser.headless', false);
const timeout = config.get('timeouts.default', 30000);
```

## Test Execution Flow

1. **Cucumber Loads** feature files from `tests/src/features/`
2. **Before Hook** (`tests/support/hooks.ts`):
   - Calls `PlaywrightWorld.init()` to create browser/context/page
   - Sets up logging context with scenario name
3. **Scenario Execution**:
   - Step definitions instantiate page objects
   - Page objects interact with application via Playwright
   - Each step captured in screenshots (configurable)
4. **After Hook**:
   - Screenshots on failure
   - Saves Playwright trace
   - Calls `PlaywrightWorld.cleanup()` to close browser resources

## Testing Strategy

### Cucumber Profiles

Defined in `cucumber.js`:
- **default**: All features except `@skip` tag
- **smoke**: Only `@smoke` tagged scenarios (critical path)
- **regression**: Only `@regression` tagged scenarios (full coverage)
- **negative**: Only `@negative` tagged scenarios (validation/error handling)

### Feature Organization

Features are organized by application and domain:
```
tests/src/features/
├── saucedemo/
│   ├── auth.feature       # Login, logout, session management
│   ├── shopping.feature   # Product browsing, cart operations
│   └── checkout.feature   # Checkout flow, order completion
└── demoqa/
    └── elements.feature   # Form interactions, table operations
```

### Tagging Strategy

- `@smoke`: Critical business path scenarios (run on every commit)
- `@regression`: Full feature coverage (run nightly)
- `@negative`: Error handling and validation (run nightly)
- `@skip`: Temporarily disabled tests (excluded from all runs)

## Reporting

The framework generates multiple report formats:

1. **Cucumber HTML Report**: Standard Cucumber report
   - Path: `results/cucumber-report.html`
   - Generated automatically after each run

2. **Cucumber JSON Report**: Machine-readable results
   - Path: `results/cucumber-report.json`
   - Used by enhanced report generator

3. **Enhanced HTML Report**: Multi-Cucumber-HTML-Reporter
   - Path: `results/enhanced-html-report/`
   - Generated via: `npm run report:html`

4. **Allure Report**: Rich interactive report
   - Path: `allure-report/`
   - Generated via: `npm run report:allure:serve`

5. **Playwright Traces**: Step-by-step execution traces
   - Path: `results/traces/`
   - View with: `npx playwright show-trace <trace-file>`

## Extending the Framework

### Adding a New Application

1. Create application directory: `tests/src/applications/myapp/`
2. Add page objects in `tests/src/applications/myapp/pages/`
3. Create step definitions in `tests/src/applications/myapp/step-definitions/`
4. Add feature files in `tests/src/features/myapp/`

### Adding a New Page Object

```typescript
// tests/src/applications/myapp/pages/my-page.page.ts
import { BasePage } from '@tests/applications/shared/pages/base.page';
import { PlaywrightWorld } from '@framework/core';

export class MyPage extends BasePage {
  constructor(world: PlaywrightWorld) {
    super(world);
  }

  private readonly selectors = {
    myButton: '#my-button',
  };

  async clickMyButton(): Promise<void> {
    await this.click(this.selectors.myButton);
  }
}
```

### Adding Framework Plugins

```typescript
// framework/src/plugins/my-plugin.ts
import { PlaywrightPlugin } from './base/playwright-plugin';
import { Page } from '@playwright/test';

export class MyPlugin extends PlaywrightPlugin {
  protected async setupPageEvents(page: Page): Promise<void> {
    page.on('response', async (response) => {
      // Custom response handling
    });
  }
}
```

### Adding Test Data Factories

```typescript
// framework/src/factories/user-factory.ts
import { BaseFactory } from './base/base-factory';

interface User {
  email: string;
  password: string;
  firstName: string;
}

export class UserFactory extends BaseFactory<User> {
  create(overrides?: Partial<User>): User {
    return {
      email: this.faker.internet.email(),
      password: this.faker.internet.password(),
      firstName: this.faker.person.firstName(),
      ...overrides,
    };
  }
}
```

## Best Practices

### 1. Page Objects
- Keep selectors private
- Provide business-focused public methods
- Return promises for async operations
- Use `this.logger` for debugging
- Always extend from `BasePage`

### 2. Step Definitions
- Keep step definitions thin (delegate to page objects)
- Always type `this: PlaywrightWorld`
- Use descriptive step names matching Gherkin
- Avoid business logic in steps

### 3. Feature Files
- Use Scenario Outline for data-driven tests
- Tag scenarios appropriately (@smoke, @regression, @negative)
- Keep scenarios focused on single business flow
- Use Background for common setup

### 4. Configuration
- Use environment-specific configs (dev.json, ci-cd.json)
- Access via `config.get()` with default fallback
- Never hardcode environment-specific values
- Use environment variables for sensitive data

### 5. Logging
- Use structured logging with context
- Log at appropriate levels (debug, info, warn, error)
- Include relevant metadata in logs
- Avoid `console.log` - always use `this.logger`

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check TypeScript path aliases in `tsconfig.json`
   - Verify relative import paths in step definitions

2. **Page not initialized**
   - Ensure `Before` hook calls `this.init()`
   - Check if hooks.ts is properly loaded

3. **Tests timing out**
   - Increase timeout in config: `timeouts.default`
   - Check for missing `await` keywords
   - Verify selectors are correct

4. **Configuration not loading**
   - Check file path: `configs/global/{env}.json`
   - Verify JSON syntax is valid
   - Ensure environment variable is set correctly

## Performance Considerations

- **Parallel Execution**: Cucumber runs scenarios in parallel by default
- **Browser Reuse**: Each scenario gets a fresh browser context (not browser)
- **Headless Mode**: Use headless for faster CI execution
- **Video Recording**: Disable in config unless debugging
- **Trace Recording**: Only on failure to save disk space

## CI/CD Integration

Example GitHub Actions workflow:
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install chromium

- name: Run smoke tests
  run: npm run cucumber:smoke
  env:
    BROWSER_HEADLESS: true
    ENV: ci-cd

- name: Generate Allure report
  if: always()
  run: npm run report:allure:generate

- name: Upload artifacts
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      results/
      allure-report/
```

## Maintenance Guidelines

### Version Updates
1. Update Playwright: `npm update @playwright/test`
2. Update Cucumber: `npm update @cucumber/cucumber`
3. Run full regression suite after major updates
4. Check for breaking changes in release notes

### Code Quality
- Run `npm run lint:fix` before committing
- Maintain 70%+ test coverage for framework code
- Use `npm test` to run unit tests
- Follow TypeScript strict mode guidelines

### Documentation
- Update ARCHITECTURE.md for structural changes
- Update README.md for new features
- Add JSDoc comments to public methods
- Keep copilot-instructions.md synchronized

---

**Last Updated**: January 2026  
**Framework Version**: 1.0.0  
**Maintained By**: Auto UI Team
