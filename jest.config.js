const commonProjectOptions = {
  clearMocks: true,
  resetMocks: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'jest.config.ts', '/test/', '/bin/'],
  testPathIgnorePatterns: ['/node_modules/', '/bin/'],
  watchPathIgnorePatterns: ['./test/'],
};

const config = {
  ...commonProjectOptions,
  coverageDirectory: 'test/coverage',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  projects: [
    {
      ...commonProjectOptions,
      displayName: {
        name: 'unit',
        color: 'blue',
      },
      testMatch: ['<rootDir>/**/*.unit.test.ts'],
    },
  ],
};

module.exports = config;
