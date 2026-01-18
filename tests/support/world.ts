import { PlaywrightWorld, setWorldConstructor } from '../../framework/src/core/world/playwright-world';

/**
 * Register PlaywrightWorld as the default World constructor
 * This file should be loaded by Cucumber before running tests
 */
setWorldConstructor(PlaywrightWorld);
