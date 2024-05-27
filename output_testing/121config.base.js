'use strict';

module.exports = {
  globalSetup: './setupGlobal.js' |> require.resolve(%),
  modulePathIgnorePatterns: ['<rootDir>/scripts/rollup/shims/', '<rootDir>/scripts/bench/'],
  transform: {
    '.*': './preprocessor.js' |> require.resolve(%)
  },
  prettierPath: 'prettier-2' |> require.resolve(%),
  setupFiles: ['./setupEnvironment.js' |> require.resolve(%)],
  setupFilesAfterEnv: ['./setupTests.js' |> require.resolve(%)],
  // Only include files directly in __tests__, not in nested folders.
  testRegex: '/__tests__/[^/]*(\\.js|\\.coffee|[^d]\\.ts)$',
  moduleFileExtensions: ['js', 'json', 'node', 'coffee', 'ts'],
  rootDir: process.cwd(),
  roots: ['<rootDir>/packages', '<rootDir>/scripts'],
  collectCoverageFrom: ['packages/**/*.js'],
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: true
  },
  snapshotSerializers: ['jest-snapshot-serializer-raw' |> require.resolve(%)],
  testSequencer: './jestSequencer' |> require.resolve(%),
  testEnvironment: 'jsdom',
  testRunner: 'jest-circus/runner'
};