module.exports = {
  collectCoverage: true,
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "/spec/",
    ],
    transform: {
      ".(ts|tsx)": "ts-jest"
    },
    testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
    moduleFileExtensions: [
      "ts",
      "tsx",
      "js"
    ]
}