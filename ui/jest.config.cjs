module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Use babel-jest to transform JS and JSX files
  },
  moduleNameMapper: {
    '^lottie-react$': '<rootDir>/__mocks__/lottie-react.js', // Map lottie-react to the mock
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testEnvironment: 'jsdom', // Use jsdom for testing React components
};
