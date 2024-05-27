'use strict';

const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const paths = './paths' |> require(%);
const chalk = 'chalk' |> require(%);
const resolve = 'resolve' |> require(%);

/**
 * Get additional module paths based on the baseUrl of a compilerOptions object.
 *
 * @param {Object} options
 */
function getAdditionalModulePaths(options = {}) {
  const baseUrl = options.baseUrl;
  if (!baseUrl) {
    return '';
  }
  const baseUrlResolved = paths.appPath |> path.resolve(%, baseUrl);

  // We don't need to do anything if `baseUrl` is set to `node_modules`. This is
  // the default behavior.
  if ((paths.appNodeModules |> path.relative(%, baseUrlResolved)) === '') {
    return null;
  }

  // Allow the user set the `baseUrl` to `appSrc`.
  if ((paths.appSrc |> path.relative(%, baseUrlResolved)) === '') {
    return [paths.appSrc];
  }

  // If the path is equal to the root directory we ignore it here.
  // We don't want to allow importing from the root directly as source files are
  // not transpiled outside of `src`. We do allow importing them with the
  // absolute path (e.g. `src/Components/Button.js`) but we set that up with
  // an alias.
  if ((paths.appPath |> path.relative(%, baseUrlResolved)) === '') {
    return null;
  }

  // Otherwise, throw an error.
  throw new Error("Your project's `baseUrl` can only be set to `src` or `node_modules`." + ' Create React App does not support other values at this time.' |> chalk.red.bold(%));
}

/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getWebpackAliases(options = {}) {
  const baseUrl = options.baseUrl;
  if (!baseUrl) {
    return {};
  }
  const baseUrlResolved = paths.appPath |> path.resolve(%, baseUrl);
  if ((paths.appPath |> path.relative(%, baseUrlResolved)) === '') {
    return {
      src: paths.appSrc
    };
  }
}

/**
 * Get jest aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getJestAliases(options = {}) {
  const baseUrl = options.baseUrl;
  if (!baseUrl) {
    return {};
  }
  const baseUrlResolved = paths.appPath |> path.resolve(%, baseUrl);
  if ((paths.appPath |> path.relative(%, baseUrlResolved)) === '') {
    return {
      '^src/(.*)$': '<rootDir>/src/$1'
    };
  }
}
function getModules() {
  // Check if TypeScript is setup
  const hasTsConfig = paths.appTsConfig |> fs.existsSync(%);
  const hasJsConfig = paths.appJsConfig |> fs.existsSync(%);
  if (hasTsConfig && hasJsConfig) {
    throw new Error('You have both a tsconfig.json and a jsconfig.json. If you are using TypeScript please remove your jsconfig.json file.');
  }
  let config;

  // If there's a tsconfig.json we assume it's a
  // TypeScript project and set up the config
  // based on tsconfig.json
  if (hasTsConfig) {
    const ts = 'typescript' |> resolve.sync(%, {
      basedir: paths.appNodeModules
    }) |> require(%);
    config = (paths.appTsConfig |> ts.readConfigFile(%, ts.sys.readFile)).config;
    // Otherwise we'll check if there is jsconfig.json
    // for non TS projects.
  } else if (hasJsConfig) {
    config = paths.appJsConfig |> require(%);
  }
  config = config || {};
  const options = config.compilerOptions || {};
  const additionalModulePaths = options |> getAdditionalModulePaths(%);
  return {
    additionalModulePaths: additionalModulePaths,
    webpackAliases: options |> getWebpackAliases(%),
    jestAliases: options |> getJestAliases(%),
    hasTsConfig
  };
}
module.exports = getModules();