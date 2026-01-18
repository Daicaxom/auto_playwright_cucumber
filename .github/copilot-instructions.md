# AI Coding Agent Instructions

## Project Overview
Enterprise-grade Playwright + Cucumber BDD framework using TypeScript with **Page Object Model** architecture. Core principle: **leverage Playwright's native features** through an adapter pattern rather than recreating functionality.

## Architecture Philosophy

### Monorepo Structure (Critical)
The project separates reusable framework from application-specific tests:

```
Auto_UI/
├── framework/                    # 🎯 Reusable Framework Core
│   ├── src/
│   │   ├── core/                # Framework infrastructure
│   │   │   ├── adapters/        # Playwright adapter pattern
│   │   │   ├── utilities/       # Logger, GlobalProperties
│   │   │   └── world/           # PlaywrightWorld (Cucumber integration)
│   │   ├── plugins/             # Extensible plugin system
│   │   ├── factories/           # Test data factories (Faker.js)
│   │   └── index.ts             # Main framework exports
│   ├── package.json             # Framework as npm package
│   └── README.md
│
├── tests/                        # 🧪 Application-Specific Tests
│   ├── src/
│   │   ├── applications/        # Page Objects & Step Definitions
│   │   │   ├── saucedemo/      # SauceDemo app
│   │   │   │   ├── pages/      # Login, Inventory, Cart, Checkout pages
│   │   │   │   └── step-definitions/  # Domain-specific steps
│   │   │   ├── demoqa/         # DemoQA app
│   │   │   │   ├── pages/      # Elements page
│   │   │   │   └── step-definitions/
│   │   │   └── shared/
│   │   │       └── pages/
│   │   │           └── base.page.ts  # Abstract base page
│   │   └── features/            # Gherkin feature files
│   │       ├── saucedemo/
│   │       └── demoqa/
│   ├── support/                 # Cucumber support files
│   │   ├── hooks.ts            # Before/After hooks
│   │   └── world.ts            # World setup
│   └── unit/                    # Jest unit tests
│
├── configs/global/              # Configuration hierarchy
└── cucumber.js                  # Cucumber profiles
```

### Adapter Pattern (Critical)
- **Never override** Playwright native functions—wrap and enhance them
- [framework/src/core/adapters/playwright-adapter.ts](../framework/src/core/adapters/playwright-adapter.ts) wraps `chromium.launch()`, `browser.newContext()` with config/logging
- [framework/src/core/world/playwright-world.ts](../framework/src/core/world/playwright-world.ts) integrates Playwright with Cucumber World
- Preserves upgrade path to newer Playwright versions

### Page Object Model (Critical)
All UI interactions encapsulated in page objects:
- **BasePage** ([tests/src/applications/shared/pages/base.page.ts](../tests/src/applications/shared/pages/base.page.ts)) provides 14 common methods
- Page objects extend BasePage and hide selectors (private)
- Provide business-focused public methods
- Example: `LoginPage.login(username, password)` instead of scattered `page.fill()` calls

## Critical Patterns

### 1. Page Object Implementation
```typescript
// tests/src/applications/myapp/pages/my-page.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Private selectors
  private readonly selectors = {
    loginButton: '#login-btn',
    usernameInput: '[data-test="username"]',
  };

  // Business-focused public methods
  async clickLogin(): Promise<void> {
    await this.click(this.selectors.loginButton);
  }

  async enterUsername(username: string): Promise<void> {
    await this.fill(this.selectors.usernameInput, username);
  }
}
```

### 2. Step Definitions with Page Objects
Step definitions **must** use `this: PlaywrightWorld` and instantiate page objects:
```typescript
// tests/src/applications/myapp/step-definitions/auth.steps.ts
import { Given, When } from '@cucumber/cucumber';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { LoginPage } from '../pages/login.page';

Given('I am on the login page', async function (this: PlaywrightWorld) {
  if (!this.page) throw new Error('Page not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.navigate();
});

When('I login with {string} and {string}', 
  async function (this: PlaywrightWorld, username: string, password: string) {
    if (!this.page) throw new Error('Page not initialized');
    const loginPage = new LoginPage(this.page);
    await loginPage.login(username, password);
  }
);
```

**Key Rules:**
- Keep step definitions thin (only glue code)
- All UI logic in page objects
- `this.page`, `this.context`, `this.browser` available after `init()` in Before hook
- Access shared context: `this.sharedData`, `this.logger`, `this.config`

### 3. Hierarchical Configuration
[framework/src/core/utilities/global-properties.ts](../framework/src/core/utilities/global-properties.ts) implements priority chain:
```
CLI args > Env vars > CI/CD config > Environment config > Defaults
```
- Config files in `configs/global/`: `defaults.json`, `dev.json`, `ci-cd.json`
- Access via `config.get('browser.headless', true)` with dot notation
- Environment vars convert: `BROWSER_NAME=firefox` → `browser.name`

### 4. Hooks Workflow
[tests/support/hooks.ts](../tests/support/hooks.ts) manages lifecycle:
- `Before`: Calls `this.init()` to create browser/context/page
- `After`: Captures screenshot on failure, always runs `this.cleanup()`
- `AfterStep`: Captures screenshot after each step (for reports) with 10s timeout

### 5. Test Data Factories
Extend `BaseFactory<T>` in [framework/src/factories/base-factory.ts](../framework/src/factories/base-factory.ts):
```typescript
import { BaseFactory } from '@framework/factories/base-factory';
import { GlobalProperties } from '@framework/core/utilities/global-properties';

class UserFactory extends BaseFactory<User> {
  constructor(config: GlobalProperties) {
    super(config);  // Pass config to parent
  }

  create(overrides?: Partial<User>): User {
    return {
      email: this.faker.internet.email(),
      name: this.faker.person.fullName(),
      ...overrides  // Always support overrides
    };
  }

  createMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
```
- Faker seed from config: `testData.faker.seed`
- Factories require GlobalProperties in constructor

### 6. Logging Convention
Structured logging via [framework/src/core/utilities/logger.ts](../framework/src/core/utilities/logger.ts):
```typescript
// In page objects or step definitions
this.logger.info('Action performed', { selector: '#button', timeout: 5000 });
this.logger.debug('Debug info', { data: someData });
this.logger.error('Error occurred', error);
```
- Levels: `debug`, `info`, `warn`, `error`
- Context automatically includes scenario name
- Avoid `console.log`—always use logger
- Logger created with config: `new Logger({ level: 'info', console: true })`

### 7. Plugin System
Extend [framework/src/plugins/base/playwright-plugin.ts](../framework/src/plugins/base/playwright-plugin.ts) for custom features:
```typescript
import { PlaywrightPlugin } from '@framework/plugins/base/playwright-plugin';
import { Page } from '@playwright/test';

class MyPlugin extends PlaywrightPlugin {
  constructor() {
    super('my-plugin', logger, config);
  }

  protected async setupPageEvents(page: Page): Promise<void> {
    page.on('response', (response) => {
      // Custom response handling
    });
  }
}
```
- Hooks into Playwright events without modifying core
- Register in World or hooks

## Development Workflows

### Run Commands
```bash
# Unit tests
npm test                           # Jest unit tests (26 tests)
npm run test:coverage              # Coverage report (target: 70%+)

# Cucumber tests
npm run cucumber                   # All features (default profile)
npm run cucumber:smoke             # Smoke tests (@smoke tag)
npm run cucumber:regression        # Regression tests (@regression tag)
npm run cucumber:negative          # Negative tests (@negative tag)

# Specific features or tags
npm run cucumber -- tests/src/features/saucedemo/auth.feature
npm run cucumber -- --tags "@smoke and not @skip"

# Reports
npm run report:html                # Generate enhanced HTML report
npm run report:allure:generate     # Generate Allure report
npm run report:allure:serve        # Generate & open Allure report

# Linting
npm run lint                       # Check linting issues
npm run lint:fix                   # Auto-fix linting issues
```

### Testing Standards
- **Test-first development**: Write unit tests in `tests/unit/` before implementation
- Use Jest for unit tests: mock Playwright objects with `jest.fn()`
- Unit tests for framework components in `tests/unit/framework/`
- Integration tests validate end-to-end workflows
- Page objects should have selectors as private properties

### Feature File Conventions
- Features in `tests/src/features/**/*.feature` with BDD syntax
- Step definitions in `tests/src/applications/**/step-definitions/*.steps.ts`
- Use Scenario Outline for data-driven tests with Examples table
- Tag scenarios: `@smoke`, `@regression`, `@negative`, `@skip`
- See [cucumber.js](../cucumber.js) for profile configurations

### Adding New Application Tests

**1. Create Page Objects:**
```bash
# Create directory structure
mkdir -p tests/src/applications/myapp/pages
mkdir -p tests/src/applications/myapp/step-definitions
```

**2. Implement Page Object:**
```typescript
// tests/src/applications/myapp/pages/home.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '../../shared/pages/base.page';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private readonly selectors = {
    welcomeText: 'h1.welcome',
    logoutButton: '#logout',
  };

  async getWelcomeText(): Promise<string | null> {
    return await this.getText(this.selectors.welcomeText);
  }

  async logout(): Promise<void> {
    await this.click(this.selectors.logoutButton);
  }
}
```

**3. Create Step Definitions:**
```typescript
// tests/src/applications/myapp/step-definitions/home.steps.ts
import { Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PlaywrightWorld } from '../../../../../framework/src/core/world/playwright-world';
import { HomePage } from '../pages/home.page';

Then('I should see welcome message {string}', 
  async function (this: PlaywrightWorld, expectedText: string) {
    if (!this.page) throw new Error('Page not initialized');
    const homePage = new HomePage(this.page);
    const actualText = await homePage.getWelcomeText();
    expect(actualText).toBe(expectedText);
  }
);
```

**4. Create Feature File:**
```gherkin
# tests/src/features/myapp/home.feature
@smoke @myapp
Feature: Home Page

  Scenario: User sees welcome message
    Given I am logged in
    Then I should see welcome message "Welcome back!"
```

## Common Pitfalls

1. **Don't recreate Playwright features**: Before adding utilities for screenshots, tracing, or retries, check if Playwright has it built-in
2. **Always type `this: PlaywrightWorld`**: TypeScript won't infer Cucumber context
3. **Check `this.page` nullability**: Page may not be initialized if hooks fail
4. **Use page objects for all UI interactions**: Never use `page.locator()` directly in step definitions
5. **Keep selectors private**: All selectors should be in private `selectors` object in page objects
6. **Instantiate page objects in steps**: Create new page object instance in each step definition
7. **Config changes require restart**: Configuration loads once at startup
8. **Path imports**: Use relative paths like `../../../../../framework/src/...` from step definitions
9. **External site timeouts**: For external sites like DemoQA, increase timeout to 60s: `page.goto(url, { timeout: 60000 })`
10. **Screenshot timeouts**: Add timeout to screenshot capture: `page.screenshot({ timeout: 10000 })` to prevent cascade failures

## TypeScript Configuration
Strict mode enabled ([tsconfig.json](../tsconfig.json)):
- No implicit any
- Strict null checks
- All strict flags enabled
- Target ES2022 with commonjs modules
- baseUrl: "." for path resolution
- Path aliases configured: `@framework/*`, `@tests/*` (future migration)

## Reporting Stack
- **Cucumber**: Built-in JSON/HTML via [cucumber.js](../cucumber.js)
- **Allure**: Results in `allure-results/`, reports in `allure-report/`
- **Enhanced HTML**: Custom generator via [scripts/generate-report.js](../scripts/generate-report.js)
- **Playwright Traces**: Per-scenario traces in `results/traces/`
- **Screenshots**: On failure + per-step in `results/screenshots/`

## Extension Points
When adding features, prefer this order:
1. **Use Playwright native** (check docs first)
2. **Create page object** for new UI interactions
3. **Extend via plugin system** (event-based hooks)
4. **Enhance PlaywrightWorld** with helper methods
5. **Last resort**: Add to adapter (but keep wrapping pattern)

## Best Practices Summary

### Page Objects
- Extend from BasePage
- Keep selectors private in `selectors` object
- Provide business-focused public methods
- Log all major actions using logger (not available in page objects directly)
- Return promises for async operations
- Pass `Page` instance in constructor

### Step Definitions
- Thin glue code only
- Instantiate page objects with `new PageObject(this.page)`
- No business logic
- Type with `this: PlaywrightWorld`
- Use descriptive step names
- Check `this.page` nullability before use

### Feature Files
- One feature per file
- Use Background for common setup
- Tag appropriately (@smoke, @regression, @negative)
- Use Scenario Outline for data-driven tests
- Keep scenarios focused on single business flow

### Configuration
- Use environment-specific configs (dev.json, ci-cd.json)
- Access via `config.get()` with default fallback
- Never hardcode environment values
- Use environment variables for sensitive data

### Logging
- Use `this.logger` in step definitions and PlaywrightWorld
- Structured logging with metadata
- Appropriate levels (debug for details, info for actions)
- Never use `console.log`

### External Site Handling
- Increase timeouts for external sites: `page.goto(url, { timeout: 60000 })`
- Add retry logic for unreliable external dependencies
- Consider health checks before test execution
- Add `@skip` tag for unstable external sites in CI/CD

## Current Test Coverage
- **Unit Tests**: 26 integration tests validating framework structure
- **Smoke Tests**: 2 scenarios (critical path)
- **Regression Tests**: 4 scenarios (full coverage)
- **Negative Tests**: 1 scenario (validation)
- **Total**: 7 scenarios, 50+ steps

## Framework Maturity
✅ Production-ready monorepo architecture  
✅ Page Object Model fully implemented  
✅ Adapter pattern for Playwright integration  
✅ Hierarchical configuration system  
✅ Comprehensive logging and tracing  
✅ Factory system for test data  
✅ Plugin system for extensibility  
✅ 100% passing smoke and negative tests  
✅ Complete documentation (ARCHITECTURE.md, RESTRUCTURING_SUMMARY.md)

## Troubleshooting

### TypeScript Import Errors
- Ensure `baseUrl: "."` in tsconfig.json
- Use relative paths from step definitions to framework
- Clear TypeScript cache: `rm -rf node_modules/.cache`

### Test Timeouts
- External sites: Increase timeout to 60s
- Screenshot capture: Add 10s timeout parameter
- Navigation: Use retry logic for unreliable sites
- Check network conditions and site availability

### Page Object Issues
- Always pass `Page` instance in constructor
- Keep selectors private
- Use BasePage protected methods (click, fill, getText, etc.)
- Don't bypass page objects in step definitions

### Configuration Not Loading
- Check file exists in `configs/global/`
- Verify JSON syntax is valid
- Configuration loads once at startup (restart required)
- Use CLI args for quick overrides: `--browser.headless=false`
