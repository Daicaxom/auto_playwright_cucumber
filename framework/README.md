# @auto-ui/playwright-cucumber-framework

Enterprise-grade Playwright + Cucumber BDD testing framework with TypeScript.

## Features

- **Adapter Pattern**: Wraps Playwright native features without overriding
- **Hierarchical Configuration**: CLI args > Env vars > CI/CD config > Environment config > Defaults
- **Cucumber Integration**: Seamless integration with Cucumber World
- **Plugin System**: Extensible architecture for custom functionality
- **Structured Logging**: Comprehensive logging with context
- **Type Safety**: Full TypeScript support with strict mode

## Installation

```bash
npm install @auto-ui/playwright-cucumber-framework
```

## Peer Dependencies

```bash
npm install @cucumber/cucumber @playwright/test
```

## Usage

### Import Core Components

```typescript
import {
  PlaywrightWorld,
  PlaywrightAdapter,
  GlobalProperties,
  Logger,
  setWorldConstructor
} from '@auto-ui/playwright-cucumber-framework';

// Register Playwright World with Cucumber
setWorldConstructor(PlaywrightWorld);
```

### Step Definitions

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { PlaywrightWorld } from '@auto-ui/playwright-cucumber-framework';

Given('I navigate to {string}', async function(this: PlaywrightWorld, url: string) {
  if (!this.page) throw new Error('Page not initialized');
  await this.goto(url);
});
```

## Architecture

- `core/` - Core framework components (adapters, utilities, world)
- `plugins/` - Plugin system for extensibility
- `factories/` - Test data generation with Faker.js
- `hooks/` - Generic Cucumber hooks

## API Documentation

See [API.md](API.md) for detailed API documentation.

## License

MIT
