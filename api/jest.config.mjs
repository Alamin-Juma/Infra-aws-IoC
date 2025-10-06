const config = {
  transform: {
    "^.+\\.js$": "babel-jest",
  },

  testEnvironment: 'node',

  clearMocks: true,

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageProvider: "v8",

  // Ensure module paths resolve correctly
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};

export default config;
