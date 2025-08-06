// jest.config.mjs
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.mjs'],
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
};
