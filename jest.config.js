module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/test/**/*test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/config/**',
    '!server/models/**'
  ],
  verbose: true,
  setupFilesAfterEnv: [],
  testTimeout: 30000
};
