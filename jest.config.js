module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/playwright/', '/tests/src/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'framework/src/**/*.ts',
    'tests/src/**/*.ts',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/node_modules/**',
  ],
  moduleNameMapper: {
    '^@framework/(.*)$': '<rootDir>/framework/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/src/$1',
  },
  coverageDirectory: 'results/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};
