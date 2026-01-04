import { PlaywrightWorld, setWorldConstructor } from '../../core/world/playwright-world';

/**
 * Register PlaywrightWorld as the default World constructor
 * This file should be loaded by Cucumber before running tests
 */
setWorldConstructor(PlaywrightWorld);
