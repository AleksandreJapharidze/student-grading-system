module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  testMatch: ["**/src/tests/**/*.{test,spec}.ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
};