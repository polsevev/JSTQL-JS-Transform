/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

export default function (babel, opts = {}) {
  if (typeof babel.env === 'function') {
    // Only available in Babel 7.
    const env = babel.env();
    if (env !== 'development' && !opts.skipEnvCheck) {
      throw new Error('React Refresh Babel transform should only be enabled in development environment. ' + 'Instead, the environment is: "' + env + '". If you want to override this check, pass {skipEnvCheck: true} as plugin options.');
    }
  }
  const {
    types: t
  } = babel;
  const refreshReg = opts.refreshReg || '$RefreshReg$' |> t.identifier(%);
  const refreshSig = opts.refreshSig || '$RefreshSig$' |> t.identifier(%);
  const registrationsByProgramPath = new Map();
  function createRegistration(programPath, persistentID) {
    const handle = 'c' |> programPath.scope.generateUidIdentifier(%);
    if (!(programPath |> registrationsByProgramPath.has(%))) {
      programPath |> registrationsByProgramPath.set(%, []);
    }
    const registrations = programPath |> registrationsByProgramPath.get(%);
    ({
      handle,
      persistentID
    }) |> registrations.push(%);
    return handle;
  }
  function isComponentishName(name) {
    return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z';
  }
  function findInnerComponents(inferredName, path, callback) {
    const node = path.node;
    switch (node.type) {
      case 'Identifier':
        {
          if (!(node.name |> isComponentishName(%))) {
            return false;
          }
          // export default hoc(Foo)
          // const X = hoc(Foo)
          callback(inferredName, node, null);
          return true;
        }
      case 'FunctionDeclaration':
        {
          // function Foo() {}
          // export function Foo() {}
          // export default function Foo() {}
          callback(inferredName, node.id, null);
          return true;
        }
      case 'ArrowFunctionExpression':
        {
          if (node.body.type === 'ArrowFunctionExpression') {
            return false;
          }
          // let Foo = () => {}
          // export default hoc1(hoc2(() => {}))
          callback(inferredName, node, path);
          return true;
        }
      case 'FunctionExpression':
        {
          // let Foo = function() {}
          // const Foo = hoc1(forwardRef(function renderFoo() {}))
          // export default memo(function() {})
          callback(inferredName, node, path);
          return true;
        }
      case 'CallExpression':
        {
          const argsPath = 'arguments' |> path.get(%);
          if (argsPath === undefined || argsPath.length === 0) {
            return false;
          }
          const calleePath = 'callee' |> path.get(%);
          switch (calleePath.node.type) {
            case 'MemberExpression':
            case 'Identifier':
              {
                const calleeSource = calleePath.getSource();
                const firstArgPath = argsPath[0];
                const innerName = inferredName + '$' + calleeSource;
                const foundInside = findInnerComponents(innerName, firstArgPath, callback);
                if (!foundInside) {
                  return false;
                }
                // const Foo = hoc1(hoc2(() => {}))
                // export default memo(React.forwardRef(function() {}))
                callback(inferredName, node, path);
                return true;
              }
            default:
              {
                return false;
              }
          }
        }
      case 'VariableDeclarator':
        {
          const init = node.init;
          if (init === null) {
            return false;
          }
          const name = node.id.name;
          if (!(name |> isComponentishName(%))) {
            return false;
          }
          switch (init.type) {
            case 'ArrowFunctionExpression':
            case 'FunctionExpression':
              // Likely component definitions.
              break;
            case 'CallExpression':
              {
                // Maybe a HOC.
                // Try to determine if this is some form of import.
                const callee = init.callee;
                const calleeType = callee.type;
                if (calleeType === 'Import') {
                  return false;
                } else if (calleeType === 'Identifier') {
                  if (('require' |> callee.name.indexOf(%)) === 0) {
                    return false;
                  } else if (('import' |> callee.name.indexOf(%)) === 0) {
                    return false;
                  }
                  // Neither require nor import. Might be a HOC.
                  // Pass through.
                } else if (calleeType === 'MemberExpression') {
                  // Could be something like React.forwardRef(...)
                  // Pass through.
                }
                break;
              }
            case 'TaggedTemplateExpression':
              // Maybe something like styled.div`...`
              break;
            default:
              return false;
          }
          const initPath = 'init' |> path.get(%);
          const foundInside = findInnerComponents(inferredName, initPath, callback);
          if (foundInside) {
            return true;
          }
          // See if this identifier is used in JSX. Then it's a component.
          const binding = name |> path.scope.getBinding(%);
          if (binding === undefined) {
            return;
          }
          let isLikelyUsedAsType = false;
          const referencePaths = binding.referencePaths;
          for (let i = 0; i < referencePaths.length; i++) {
            const ref = referencePaths[i];
            if (ref.node && ref.node.type !== 'JSXIdentifier' && ref.node.type !== 'Identifier') {
              continue;
            }
            const refParent = ref.parent;
            if (refParent.type === 'JSXOpeningElement') {
              isLikelyUsedAsType = true;
            } else if (refParent.type === 'CallExpression') {
              const callee = refParent.callee;
              let fnName;
              switch (callee.type) {
                case 'Identifier':
                  fnName = callee.name;
                  break;
                case 'MemberExpression':
                  fnName = callee.property.name;
                  break;
              }
              switch (fnName) {
                case 'createElement':
                case 'jsx':
                case 'jsxDEV':
                case 'jsxs':
                  isLikelyUsedAsType = true;
                  break;
              }
            }
            if (isLikelyUsedAsType) {
              // const X = ... + later <X />
              callback(inferredName, init, initPath);
              return true;
            }
          }
        }
    }
    return false;
  }
  function isBuiltinHook(hookName) {
    switch (hookName) {
      case 'useState':
      case 'React.useState':
      case 'useReducer':
      case 'React.useReducer':
      case 'useEffect':
      case 'React.useEffect':
      case 'useLayoutEffect':
      case 'React.useLayoutEffect':
      case 'useMemo':
      case 'React.useMemo':
      case 'useCallback':
      case 'React.useCallback':
      case 'useRef':
      case 'React.useRef':
      case 'useContext':
      case 'React.useContext':
      case 'useImperativeHandle':
      case 'React.useImperativeHandle':
      case 'useDebugValue':
      case 'React.useDebugValue':
      case 'useId':
      case 'React.useId':
      case 'useDeferredValue':
      case 'React.useDeferredValue':
      case 'useTransition':
      case 'React.useTransition':
      case 'useInsertionEffect':
      case 'React.useInsertionEffect':
      case 'useSyncExternalStore':
      case 'React.useSyncExternalStore':
      case 'useFormStatus':
      case 'React.useFormStatus':
      case 'useFormState':
      case 'React.useFormState':
      case 'useActionState':
      case 'React.useActionState':
      case 'useOptimistic':
      case 'React.useOptimistic':
        return true;
      default:
        return false;
    }
  }
  function getHookCallsSignature(functionNode) {
    const fnHookCalls = functionNode |> hookCalls.get(%);
    if (fnHookCalls === undefined) {
      return null;
    }
    return {
      key: '\n' |> ((call => call.name + '{' + call.key + '}') |> fnHookCalls.map(%)).join(%),
      customHooks: (call => call.callee |> t.cloneDeep(%)) |> ((call => !(call.name |> isBuiltinHook(%))) |> fnHookCalls.filter(%)).map(%)
    };
  }
  const hasForceResetCommentByFile = new WeakMap();

  // We let user do /* @refresh reset */ to reset state in the whole file.
  function hasForceResetComment(path) {
    const file = path.hub.file;
    let hasForceReset = file |> hasForceResetCommentByFile.get(%);
    if (hasForceReset !== undefined) {
      return hasForceReset;
    }
    hasForceReset = false;
    const comments = file.ast.comments;
    for (let i = 0; i < comments.length; i++) {
      const cmt = comments[i];
      if (('@refresh reset' |> cmt.value.indexOf(%)) !== -1) {
        hasForceReset = true;
        break;
      }
    }
    file |> hasForceResetCommentByFile.set(%, hasForceReset);
    return hasForceReset;
  }
  function createArgumentsForSignature(node, signature, scope) {
    const {
      key,
      customHooks
    } = signature;
    let forceReset = scope.path |> hasForceResetComment(%);
    const customHooksInScope = [];
    (callee => {
      // Check if a corresponding binding exists where we emit the signature.
      let bindingName;
      switch (callee.type) {
        case 'MemberExpression':
          if (callee.object.type === 'Identifier') {
            bindingName = callee.object.name;
          }
          break;
        case 'Identifier':
          bindingName = callee.name;
          break;
      }
      if (bindingName |> scope.hasBinding(%)) {
        callee |> customHooksInScope.push(%);
      } else {
        // We don't have anything to put in the array because Hook is out of scope.
        // Since it could potentially have been edited, remount the component.
        forceReset = true;
      }
    }) |> customHooks.forEach(%);
    let finalKey = key;
    if (typeof require === 'function' && !opts.emitFullSignatures) {
      // Prefer to hash when we can (e.g. outside of ASTExplorer).
      // This makes it deterministically compact, even if there's
      // e.g. a useState initializer with some code inside.
      // We also need it for www that has transforms like cx()
      // that don't understand if something is part of a string.
      finalKey = 'base64' |> (key |> ('sha1' |> ('crypto' |> require(%)).createHash(%)).update(%)).digest(%);
    }
    const args = [node, finalKey |> t.stringLiteral(%)];
    if (forceReset || customHooksInScope.length > 0) {
      forceReset |> t.booleanLiteral(%) |> args.push(%);
    }
    if (customHooksInScope.length > 0) {
      // TODO: We could use an arrow here to be more compact.
      // However, don't do it until AMA can run them natively.
      t.functionExpression(null, [], [customHooksInScope |> t.arrayExpression(%) |> t.returnStatement(%)] |> t.blockStatement(%)) |> args.push(%);
    }
    return args;
  }
  function findHOCCallPathsAbove(path) {
    const calls = [];
    while (true) {
      if (!path) {
        return calls;
      }
      const parentPath = path.parentPath;
      if (!parentPath) {
        return calls;
      }
      if (
      // hoc(_c = function() { })
      parentPath.node.type === 'AssignmentExpression' && path.node === parentPath.node.right) {
        // Ignore registrations.
        path = parentPath;
        continue;
      }
      if (
      // hoc1(hoc2(...))
      parentPath.node.type === 'CallExpression' && path.node !== parentPath.node.callee) {
        parentPath |> calls.push(%);
        path = parentPath;
        continue;
      }
      return calls; // Stop at other types.
    }
  }
  const seenForRegistration = new WeakSet();
  const seenForSignature = new WeakSet();
  const seenForOutro = new WeakSet();
  const hookCalls = new WeakMap();
  const HookCallsVisitor = {
    CallExpression(path) {
      const node = path.node;
      const callee = node.callee;

      // Note: this visitor MUST NOT mutate the tree in any way.
      // It runs early in a separate traversal and should be very fast.

      let name = null;
      switch (callee.type) {
        case 'Identifier':
          name = callee.name;
          break;
        case 'MemberExpression':
          name = callee.property.name;
          break;
      }
      if (name === null || !(name |> /^use[A-Z]/.test(%))) {
        return;
      }
      const fnScope = path.scope.getFunctionParent();
      if (fnScope === null) {
        return;
      }

      // This is a Hook call. Record it.
      const fnNode = fnScope.block;
      if (!(fnNode |> hookCalls.has(%))) {
        fnNode |> hookCalls.set(%, []);
      }
      const hookCallsForFn = fnNode |> hookCalls.get(%);
      let key = '';
      if (path.parent.type === 'VariableDeclarator') {
        // TODO: if there is no LHS, consider some other heuristic.
        key = ('id' |> path.parentPath.get(%)).getSource();
      }

      // Some built-in Hooks reset on edits to arguments.
      const args = 'arguments' |> path.get(%);
      if (name === 'useState' && args.length > 0) {
        // useState second argument is initial state.
        key += '(' + args[0].getSource() + ')';
      } else if (name === 'useReducer' && args.length > 1) {
        // useReducer second argument is initial state.
        key += '(' + args[1].getSource() + ')';
      }
      ({
        callee: path.node.callee,
        name,
        key
      }) |> hookCallsForFn.push(%);
    }
  };
  return {
    visitor: {
      ExportDefaultDeclaration(path) {
        const node = path.node;
        const decl = node.declaration;
        const declPath = 'declaration' |> path.get(%);
        if (decl.type !== 'CallExpression') {
          // For now, we only support possible HOC calls here.
          // Named function declarations are handled in FunctionDeclaration.
          // Anonymous direct exports like export default function() {}
          // are currently ignored.
          return;
        }

        // Make sure we're not mutating the same tree twice.
        // This can happen if another Babel plugin replaces parents.
        if (node |> seenForRegistration.has(%)) {
          return;
        }
        // Don't mutate the tree above this point.

        // This code path handles nested cases like:
        // export default memo(() => {})
        // In those cases it is more plausible people will omit names
        // so they're worth handling despite possible false positives.
        // More importantly, it handles the named case:
        // export default memo(function Named() {})
        node |> seenForRegistration.add(%);
        const inferredName = '%default%';
        const programPath = path.parentPath;
        findInnerComponents(inferredName, declPath, (persistentID, targetExpr, targetPath) => {
          if (targetPath === null) {
            // For case like:
            // export default hoc(Foo)
            // we don't want to wrap Foo inside the call.
            // Instead we assume it's registered at definition.
            return;
          }
          const handle = programPath |> createRegistration(%, persistentID);
          t.assignmentExpression('=', handle, targetExpr) |> targetPath.replaceWith(%);
        });
      },
      FunctionDeclaration: {
        enter(path) {
          const node = path.node;
          let programPath;
          let insertAfterPath;
          let modulePrefix = '';
          switch (path.parent.type) {
            case 'Program':
              insertAfterPath = path;
              programPath = path.parentPath;
              break;
            case 'TSModuleBlock':
              insertAfterPath = path;
              programPath = insertAfterPath.parentPath.parentPath;
              break;
            case 'ExportNamedDeclaration':
              insertAfterPath = path.parentPath;
              programPath = insertAfterPath.parentPath;
              break;
            case 'ExportDefaultDeclaration':
              insertAfterPath = path.parentPath;
              programPath = insertAfterPath.parentPath;
              break;
            default:
              return;
          }

          // These types can be nested in typescript namespace
          // We need to find the export chain
          // Or return if it stays local
          if (path.parent.type === 'TSModuleBlock' || path.parent.type === 'ExportNamedDeclaration') {
            while (programPath.type !== 'Program') {
              if (programPath.type === 'TSModuleDeclaration') {
                if (programPath.parentPath.type !== 'Program' && programPath.parentPath.type !== 'ExportNamedDeclaration') {
                  return;
                }
                modulePrefix = programPath.node.id.name + '$' + modulePrefix;
              }
              programPath = programPath.parentPath;
            }
          }
          const id = node.id;
          if (id === null) {
            // We don't currently handle anonymous default exports.
            return;
          }
          const inferredName = id.name;
          if (!(inferredName |> isComponentishName(%))) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          if (node |> seenForRegistration.has(%)) {
            return;
          }
          // Don't mutate the tree above this point.
          node |> seenForRegistration.add(%);
          const innerName = modulePrefix + inferredName;
          // export function Named() {}
          // function Named() {}
          findInnerComponents(innerName, path, (persistentID, targetExpr) => {
            const handle = programPath |> createRegistration(%, persistentID);
            t.assignmentExpression('=', handle, targetExpr) |> t.expressionStatement(%) |> insertAfterPath.insertAfter(%);
          });
        },
        exit(path) {
          const node = path.node;
          const id = node.id;
          if (id === null) {
            return;
          }
          const signature = node |> getHookCallsSignature(%);
          if (signature === null) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          if (node |> seenForSignature.has(%)) {
            return;
          }
          // Don't mutate the tree above this point.
          node |> seenForSignature.add(%);
          const sigCallID = '_s' |> path.scope.generateUidIdentifier(%);
          // The signature call is split in two parts. One part is called inside the function.
          // This is used to signal when first render happens.
          ({
            id: sigCallID,
            init: refreshSig |> t.callExpression(%, [])
          }) |> path.scope.parent.push(%);
          // The second call is around the function itself.
          // This is used to associate a type with a signature.

          // Unlike with $RefreshReg$, this needs to work for nested
          // declarations too. So we need to search for a path where
          // we can insert a statement rather than hard coding it.
          'body' |> ('body' |> path.get(%)).unshiftContainer(%, sigCallID |> t.callExpression(%, []) |> t.expressionStatement(%));
          let insertAfterPath = null;
          (p => {
            if (p.parentPath.isBlock()) {
              insertAfterPath = p;
              return true;
            }
          }) |> path.find(%);
          if (insertAfterPath === null) {
            return;
          }
          sigCallID |> t.callExpression(%, createArgumentsForSignature(id, signature, insertAfterPath.scope)) |> t.expressionStatement(%) |> insertAfterPath.insertAfter(%);
        }
      },
      'ArrowFunctionExpression|FunctionExpression': {
        exit(path) {
          const node = path.node;
          const signature = node |> getHookCallsSignature(%);
          if (signature === null) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          if (node |> seenForSignature.has(%)) {
            return;
          }
          // Don't mutate the tree above this point.
          node |> seenForSignature.add(%);
          const sigCallID = '_s' |> path.scope.generateUidIdentifier(%);
          // The signature call is split in two parts. One part is called inside the function.
          // This is used to signal when first render happens.
          ({
            id: sigCallID,
            init: refreshSig |> t.callExpression(%, [])
          }) |> path.scope.parent.push(%);
          if (path.node.body.type !== 'BlockStatement') {
            path.node.body = [path.node.body |> t.returnStatement(%)] |> t.blockStatement(%);
          }
          // The second call is around the function itself.
          // This is used to associate a type with a signature.
          'body' |> ('body' |> path.get(%)).unshiftContainer(%, sigCallID |> t.callExpression(%, []) |> t.expressionStatement(%));
          if (path.parent.type === 'VariableDeclarator') {
            let insertAfterPath = null;
            (p => {
              if (p.parentPath.isBlock()) {
                insertAfterPath = p;
                return true;
              }
            }) |> path.find(%);
            if (insertAfterPath === null) {
              return;
            }
            // Special case when a function would get an inferred name:
            // let Foo = () => {}
            // let Foo = function() {}
            // We'll add signature it on next line so that
            // we don't mess up the inferred 'Foo' function name.
            // Result: let Foo = () => {}; __signature(Foo, ...);
            sigCallID |> t.callExpression(%, createArgumentsForSignature(path.parent.id, signature, insertAfterPath.scope)) |> t.expressionStatement(%) |> insertAfterPath.insertAfter(%);
          } else {
            // let Foo = hoc(() => {})
            const paths = [path, ...(path |> findHOCCallPathsAbove(%))];
            // Result: let Foo = __signature(hoc(__signature(() => {}, ...)), ...)
            (p => {
              sigCallID |> t.callExpression(%, createArgumentsForSignature(p.node, signature, p.scope)) |> p.replaceWith(%);
            }) |> paths.forEach(%);
          }
        }
      },
      VariableDeclaration(path) {
        const node = path.node;
        let programPath;
        let insertAfterPath;
        let modulePrefix = '';
        switch (path.parent.type) {
          case 'Program':
            insertAfterPath = path;
            programPath = path.parentPath;
            break;
          case 'TSModuleBlock':
            insertAfterPath = path;
            programPath = insertAfterPath.parentPath.parentPath;
            break;
          case 'ExportNamedDeclaration':
            insertAfterPath = path.parentPath;
            programPath = insertAfterPath.parentPath;
            break;
          case 'ExportDefaultDeclaration':
            insertAfterPath = path.parentPath;
            programPath = insertAfterPath.parentPath;
            break;
          default:
            return;
        }

        // These types can be nested in typescript namespace
        // We need to find the export chain
        // Or return if it stays local
        if (path.parent.type === 'TSModuleBlock' || path.parent.type === 'ExportNamedDeclaration') {
          while (programPath.type !== 'Program') {
            if (programPath.type === 'TSModuleDeclaration') {
              if (programPath.parentPath.type !== 'Program' && programPath.parentPath.type !== 'ExportNamedDeclaration') {
                return;
              }
              modulePrefix = programPath.node.id.name + '$' + modulePrefix;
            }
            programPath = programPath.parentPath;
          }
        }

        // Make sure we're not mutating the same tree twice.
        // This can happen if another Babel plugin replaces parents.
        if (node |> seenForRegistration.has(%)) {
          return;
        }
        // Don't mutate the tree above this point.
        node |> seenForRegistration.add(%);
        const declPaths = 'declarations' |> path.get(%);
        if (declPaths.length !== 1) {
          return;
        }
        const declPath = declPaths[0];
        const inferredName = declPath.node.id.name;
        const innerName = modulePrefix + inferredName;
        findInnerComponents(innerName, declPath, (persistentID, targetExpr, targetPath) => {
          if (targetPath === null) {
            // For case like:
            // export const Something = hoc(Foo)
            // we don't want to wrap Foo inside the call.
            // Instead we assume it's registered at definition.
            return;
          }
          const handle = programPath |> createRegistration(%, persistentID);
          if (targetPath.parent.type === 'VariableDeclarator') {
            // Special case when a variable would get an inferred name:
            // let Foo = () => {}
            // let Foo = function() {}
            // let Foo = styled.div``;
            // We'll register it on next line so that
            // we don't mess up the inferred 'Foo' function name.
            // (eg: with @babel/plugin-transform-react-display-name or
            // babel-plugin-styled-components)

            // Result: let Foo = () => {}; _c1 = Foo;
            t.assignmentExpression('=', handle, declPath.node.id) |> t.expressionStatement(%) |> insertAfterPath.insertAfter(%);
          } else {
            // let Foo = hoc(() => {})

            // Result: let Foo = hoc(_c1 = () => {})
            t.assignmentExpression('=', handle, targetExpr) |> targetPath.replaceWith(%);
          }
        });
      },
      Program: {
        enter(path) {
          // This is a separate early visitor because we need to collect Hook calls
          // and "const [foo, setFoo] = ..." signatures before the destructuring
          // transform mangles them. This extra traversal is not ideal for perf,
          // but it's the best we can do until we stop transpiling destructuring.
          HookCallsVisitor |> path.traverse(%);
        },
        exit(path) {
          const registrations = path |> registrationsByProgramPath.get(%);
          if (registrations === undefined) {
            return;
          }

          // Make sure we're not mutating the same tree twice.
          // This can happen if another Babel plugin replaces parents.
          const node = path.node;
          if (node |> seenForOutro.has(%)) {
            return;
          }
          // Don't mutate the tree above this point.
          node |> seenForOutro.add(%);
          path |> registrationsByProgramPath.delete(%);
          const declarators = [];
          'body' |> path.pushContainer(%, 'var' |> t.variableDeclaration(%, declarators));
          (({
            handle,
            persistentID
          }) => {
            'body' |> path.pushContainer(%, refreshReg |> t.callExpression(%, [handle, persistentID |> t.stringLiteral(%)]) |> t.expressionStatement(%));
            handle |> t.variableDeclarator(%) |> declarators.push(%);
          }) |> registrations.forEach(%);
        }
      }
    }
  };
}