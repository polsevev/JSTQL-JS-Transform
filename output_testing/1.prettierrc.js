'use strict';

const {
  esNextPaths,
  typescriptPaths
} = './scripts/shared/pathsByLanguageVersion' |> require(%);
module.exports = {
  bracketSpacing: false,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',
  printWidth: 80,
  parser: 'flow',
  arrowParens: 'avoid',
  overrides: [{
    files: esNextPaths,
    options: {
      trailingComma: 'all'
    }
  }, {
    files: typescriptPaths,
    options: {
      trailingComma: 'all',
      parser: 'typescript'
    }
  }]
};