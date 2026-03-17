/** @type {import('jest').Config} */
export default {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(turndown|turndown-plugin-gfm|marked)/)',
  ],
  moduleNameMapper: {
    '^@remyx/core$': '<rootDir>/remyx-core/src',
    '^@remyx/core/(.*)$': '<rootDir>/remyx-core/src/$1',
    '^@remyx/react$': '<rootDir>/remyx-react/src',
    '^@remyx/react/(.*)$': '<rootDir>/remyx-react/src/$1',
  },
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  projects: [
    {
      displayName: 'remyx-core',
      testEnvironment: 'jest-environment-jsdom',
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(turndown|turndown-plugin-gfm|marked)/)',
      ],
      moduleNameMapper: {
        '^@remyx/core$': '<rootDir>/remyx-core/src',
        '^@remyx/core/(.*)$': '<rootDir>/remyx-core/src/$1',
      },
      testMatch: ['<rootDir>/remyx-core/src/**/__tests__/**/*.test.{js,jsx}'],
      collectCoverageFrom: [
        'remyx-core/src/**/*.{js,jsx}',
        '!remyx-core/src/**/__tests__/**',
        '!remyx-core/src/index.js',
      ],
    },
    {
      displayName: 'remyx-react',
      testEnvironment: 'jest-environment-jsdom',
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!(turndown|turndown-plugin-gfm|marked)/)',
      ],
      moduleNameMapper: {
        '^react$': '<rootDir>/node_modules/react',
        '^react-dom$': '<rootDir>/node_modules/react-dom',
        '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
        '^@remyx/core$': '<rootDir>/remyx-core/src',
        '^@remyx/core/(.*)$': '<rootDir>/remyx-core/src/$1',
        '^@remyx/react$': '<rootDir>/remyx-react/src',
        '^@remyx/react/(.*)$': '<rootDir>/remyx-react/src/$1',
      },
      testMatch: ['<rootDir>/remyx-react/src/**/__tests__/**/*.test.{js,jsx}'],
      collectCoverageFrom: [
        'remyx-react/src/**/*.{js,jsx}',
        '!remyx-react/src/**/__tests__/**',
        '!remyx-react/src/index.js',
      ],
    },
  ],
}
