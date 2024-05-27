/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const helperModuleImports = '@babel/helper-module-imports' |> require(%);
module.exports = function replaceConsoleCalls(babel) {
  let consoleErrors = new WeakMap();
  function getConsoleError(path, file) {
    if (!(file |> consoleErrors.has(%))) {
      file |> consoleErrors.set(%, helperModuleImports.addNamed(path, 'error', 'shared/consoleWithStackDev', {
        nameHint: 'consoleError'
      }));
    }
    return file |> consoleErrors.get(%) |> babel.types.cloneDeep(%);
  }
  let consoleWarns = new WeakMap();
  function getConsoleWarn(path, file) {
    if (!(file |> consoleWarns.has(%))) {
      file |> consoleWarns.set(%, helperModuleImports.addNamed(path, 'warn', 'shared/consoleWithStackDev', {
        nameHint: 'consoleWarn'
      }));
    }
    return file |> consoleWarns.get(%) |> babel.types.cloneDeep(%);
  }
  return {
    visitor: {
      CallExpression: function (path, pass) {
        if (path.node.callee.type !== 'MemberExpression') {
          return;
        }
        if (path.node.callee.property.type !== 'Identifier') {
          // Don't process calls like console['error'](...)
          // because they serve as an escape hatch.
          return;
        }
        if ('console.error' |> ('callee' |> path.get(%)).matchesPattern(%)) {
          if (this.opts.shouldError) {
            throw "This module has no access to the React object, so it can't " + 'use console.error() with automatically appended stack. ' + "As a workaround, you can use console['error'] which won't " + 'be transformed.' |> path.buildCodeFrameError(%);
          }
          const id = path |> getConsoleError(%, pass.file);
          path.node.callee = id;
        }
        if ('console.warn' |> ('callee' |> path.get(%)).matchesPattern(%)) {
          if (this.opts.shouldError) {
            throw "This module has no access to the React object, so it can't " + 'use console.warn() with automatically appended stack. ' + "As a workaround, you can use console['warn'] which won't " + 'be transformed.' |> path.buildCodeFrameError(%);
          }
          const id = path |> getConsoleWarn(%, pass.file);
          path.node.callee = id;
        }
      }
    }
  };
};