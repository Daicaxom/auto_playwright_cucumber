import { PlaywrightWorld } from '../../../src/core/world/playwright-world';

describe('PlaywrightWorld', () => {
  let world: PlaywrightWorld;
  const mockOptions = {
    parameters: {},
    attach: jest.fn(),
    log: jest.fn(),
    link: jest.fn(),
    pickle: { name: 'Test Scenario' },
  };

  beforeEach(() => {
    world = new PlaywrightWorld(mockOptions);
  });

  describe('Initialization', () => {
    it('should create a PlaywrightWorld instance', () => {
      expect(world).toBeInstanceOf(PlaywrightWorld);
    });

    it('should initialize with null browser, context, and page', () => {
      expect(world.browser).toBeNull();
      expect(world.context).toBeNull();
      expect(world.page).toBeNull();
    });

    it('should have config and logger', () => {
      expect(world.config).toBeDefined();
      expect(world.logger).toBeDefined();
    });

    it('should have playwright adapter', () => {
      expect(world.playwright).toBeDefined();
    });
  });

  describe('Properties', () => {
    it('should have sharedData property', () => {
      expect(world.sharedData).toBeDefined();
      expect(world.sharedData).toEqual({});
    });

    it('should have screenshots array', () => {
      expect(world.screenshots).toBeDefined();
      expect(Array.isArray(world.screenshots)).toBe(true);
      expect(world.screenshots.length).toBe(0);
    });

    it('should allow setting shared data', () => {
      world.sharedData['testKey'] = 'testValue';
      expect(world.sharedData['testKey']).toBe('testValue');
    });
  });

  describe('Data Sharing', () => {
    it('should share data between steps', () => {
      world.sharedData['userId'] = '12345';
      world.sharedData['userName'] = 'John Doe';

      expect(world.sharedData['userId']).toBe('12345');
      expect(world.sharedData['userName']).toBe('John Doe');
    });

    it('should handle complex data types', () => {
      const complexData = {
        user: { id: 1, name: 'Test' },
        items: [1, 2, 3],
      };

      world.sharedData['complex'] = complexData;
      expect(world.sharedData['complex']).toEqual(complexData);
    });
  });
});
