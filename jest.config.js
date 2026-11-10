/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!.*(@react-native|react-native|expo|@expo|@maplibre|@gorhom|@shopify|@tanstack|react-navigation|@react-navigation|ky|msw|@mswjs|rettime|headers-polyfill|@open-draft|outvariant|strict-event-emitter|until-async))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^rettime$': '<rootDir>/src/test/mocks/rettime.cjs',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.m?js$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/test/**'],
};
