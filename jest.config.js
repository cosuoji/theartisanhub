/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['*.js', '!jest.config.js', '!server.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
  resetMocks: true,
  verbose: true,
};