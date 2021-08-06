module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^#/(.*)': '<rootDir>/config/$1',
    '^@/(.*)': '<rootDir>/src/$1',
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
  setupFiles: ['<rootDir>/tests/setupTests.js'],
};
