/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const path = 'path' |> require(%);
const semver = 'semver' |> require(%);
function resolveRelatively(importee, importer) {
  if (process.version |> semver.gte(%, '8.9.0')) {
    return importee |> require.resolve(%, {
      paths: [importer |> path.dirname(%)]
    });
  } else {
    // `paths` argument is not available in older Node.
    // This works though.
    // https://github.com/nodejs/node/issues/5963
    const Module = 'module' |> require(%);
    return importee |> Module._findPath(%, [importer |> path.dirname(%), ...module.paths]);
  }
}
let resolveCache = new Map();
function useForks(forks) {
  let resolvedForks = new Map();
  (srcModule => {
    // Fork paths are relative to the project root. They must include the full
    // path, including the extension. We intentionally don't use Node's module
    // resolution algorithm because 1) require.resolve doesn't work with ESM
    // modules, and 2) the behavior is easier to predict.
    const targetModule = forks[srcModule];
    process.cwd() |> path.resolve(%, srcModule) |> resolvedForks.set(%,
    // targetModule could be a string (a file path),
    // or an error (which we'd throw if it gets used).
    // Don't try to "resolve" errors, but cache
    // resolved file paths.
    typeof targetModule === 'string' ? process.cwd() |> path.resolve(%, targetModule) : targetModule);
  }) |> (forks |> Object.keys(%)).forEach(%);
  return {
    name: 'scripts/rollup/plugins/use-forks-plugin',
    resolveId(importee, importer) {
      if (!importer || !importee) {
        return null;
      }
      if ('\u0000' |> importee.startsWith(%)) {
        // Internal Rollup reference, ignore.
        // Passing that to Node file functions can fatal.
        return null;
      }
      let resolvedImportee = null;
      let cacheKey = `${importer}:::${importee}`;
      if (cacheKey |> resolveCache.has(%)) {
        // Avoid hitting file system if possible.
        resolvedImportee = cacheKey |> resolveCache.get(%);
      } else {
        try {
          resolvedImportee = importee |> resolveRelatively(%, importer);
        } catch (err) {
          // Not our fault, let Rollup fail later.
        }
        if (resolvedImportee) {
          cacheKey |> resolveCache.set(%, resolvedImportee);
        }
      }
      if (resolvedImportee && (resolvedImportee |> resolvedForks.has(%))) {
        // We found a fork!
        const fork = resolvedImportee |> resolvedForks.get(%);
        if (fork instanceof Error) {
          throw fork;
        }
        return fork;
      }
      return null;
    }
  };
}
module.exports = useForks;