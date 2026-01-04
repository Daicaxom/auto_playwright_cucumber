import { BaseFactory, FactoryRegistry } from '../../../src/test-data/factories/base-factory';
import { GlobalProperties } from '../../../src/core/utilities/global-properties';

// Mock factory for testing
interface TestUser {
  id: string;
  name: string;
  email: string;
}

class UserFactory extends BaseFactory<TestUser> {
  create(overrides?: Partial<TestUser>): TestUser {
    return {
      id: this.generateUniqueId(),
      name: this.faker.person.fullName(),
      email: this.faker.internet.email(),
      ...overrides,
    };
  }

  createMany(count: number, overrides?: Partial<TestUser>): TestUser[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}

describe('BaseFactory', () => {
  let config: GlobalProperties;
  let factory: UserFactory;

  beforeEach(() => {
    config = new GlobalProperties();
    factory = new UserFactory(config);
  });

  describe('Initialization', () => {
    it('should create a factory instance', () => {
      expect(factory).toBeInstanceOf(BaseFactory);
    });

    it('should have faker instance', () => {
      expect(factory['faker']).toBeDefined();
    });
  });

  describe('create method', () => {
    it('should create a single object', () => {
      const user = factory.create();

      expect(user).toBeDefined();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
    });

    it('should generate unique IDs', () => {
      const user1 = factory.create();
      const user2 = factory.create();

      expect(user1.id).not.toBe(user2.id);
    });

    it('should accept overrides', () => {
      const user = factory.create({ name: 'Custom Name' });

      expect(user.name).toBe('Custom Name');
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
    });

    it('should generate realistic data', () => {
      const user = factory.create();

      expect(user.name).toBeTruthy();
      expect(user.email).toContain('@');
    });
  });

  describe('createMany method', () => {
    it('should create multiple objects', () => {
      const users = factory.createMany(3);

      expect(users).toHaveLength(3);
      expect(users[0]).toHaveProperty('id');
      expect(users[1]).toHaveProperty('id');
      expect(users[2]).toHaveProperty('id');
    });

    it('should create unique objects', () => {
      const users = factory.createMany(5);
      const ids = users.map((u) => u.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });

    it('should apply overrides to all objects', () => {
      const users = factory.createMany(3, { name: 'Same Name' });

      users.forEach((user) => {
        expect(user.name).toBe('Same Name');
      });
    });
  });
});

describe('FactoryRegistry', () => {
  let registry: FactoryRegistry;
  let config: GlobalProperties;

  beforeEach(() => {
    registry = new FactoryRegistry();
    config = new GlobalProperties();
  });

  describe('Factory Registration', () => {
    it('should register a factory', () => {
      const factory = new UserFactory(config);
      registry.register('user', factory);

      const retrieved = registry.get<TestUser>('user');
      expect(retrieved).toBe(factory);
    });

    it('should throw error for unregistered factory', () => {
      expect(() => {
        registry.get('nonexistent');
      }).toThrow('Factory not found: nonexistent');
    });

    it('should allow multiple factories', () => {
      const userFactory = new UserFactory(config);
      const anotherFactory = new UserFactory(config);

      registry.register('user', userFactory);
      registry.register('admin', anotherFactory);

      expect(registry.get('user')).toBe(userFactory);
      expect(registry.get('admin')).toBe(anotherFactory);
    });
  });

  describe('Cleanup', () => {
    it('should clear all factories', async () => {
      const factory = new UserFactory(config);
      registry.register('user', factory);

      await registry.cleanup();

      expect(() => {
        registry.get('user');
      }).toThrow();
    });
  });
});
