export default {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'modules/**/*.js',
    'config/**/*.js',
    'app.js',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  verbose: true,
  testTimeout: 30000,
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};
