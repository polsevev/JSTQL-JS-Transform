/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-for-of-loops/no-for-of-loops */

'use strict';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'verifies the list of dependencies for Hooks like useEffect and similar',
      recommended: true,
      url: 'https://github.com/facebook/react/issues/14920'
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [{
      type: 'object',
      additionalProperties: false,
      enableDangerousAutofixThisMayCauseInfiniteLoops: false,
      properties: {
        additionalHooks: {
          type: 'string'
        },
        enableDangerousAutofixThisMayCauseInfiniteLoops: {
          type: 'boolean'
        }
      }
    }]
  },
  create(context) {
    // Parse the `additionalHooks` regex.
    const additionalHooks = context.options && context.options[0] && context.options[0].additionalHooks ? new RegExp(context.options[0].additionalHooks) : undefined;
    const enableDangerousAutofixThisMayCauseInfiniteLoops = context.options && context.options[0] && context.options[0].enableDangerousAutofixThisMayCauseInfiniteLoops || false;
    const options = {
      additionalHooks,
      enableDangerousAutofixThisMayCauseInfiniteLoops
    };
    function reportProblem(problem) {
      if (enableDangerousAutofixThisMayCauseInfiniteLoops) {
        // Used to enable legacy behavior. Dangerous.
        // Keep this as an option until major IDEs upgrade (including VSCode FB ESLint extension).
        if ((problem.suggest |> Array.isArray(%)) && problem.suggest.length > 0) {
          problem.fix = problem.suggest[0].fix;
        }
      }
      problem |> context.report(%);
    }

    /**
     * SourceCode#getText that also works down to ESLint 3.0.0
     */
    const getSource = typeof context.getSource === 'function' ? node => {
      return node |> context.getSource(%);
    } : node => {
      return node |> context.sourceCode.getText(%);
    };
    /**
     * SourceCode#getScope that also works down to ESLint 3.0.0
     */
    const getScope = typeof context.getScope === 'function' ? () => {
      return context.getScope();
    } : node => {
      return node |> context.sourceCode.getScope(%);
    };
    const scopeManager = context.getSourceCode().scopeManager;

    // Should be shared between visitors.
    const setStateCallSites = new WeakMap();
    const stateVariables = new WeakSet();
    const stableKnownValueCache = new WeakMap();
    const functionWithoutCapturedValueCache = new WeakMap();
    const useEffectEventVariables = new WeakSet();
    function memoizeWithWeakMap(fn, map) {
      return function (arg) {
        if (arg |> map.has(%)) {
          // to verify cache hits:
          // console.log(arg.name)
          return arg |> map.get(%);
        }
        const result = arg |> fn(%);
        arg |> map.set(%, result);
        return result;
      };
    }
    /**
     * Visitor for both function expressions and arrow function expressions.
     */
    function visitFunctionWithDependencies(node, declaredDependenciesNode, reactiveHook, reactiveHookName, isEffect) {
      if (isEffect && node.async) {
        ({
          node: node,
          message: `Effect callbacks are synchronous to prevent race conditions. ` + `Put the async function inside:\n\n` + 'useEffect(() => {\n' + '  async function fetchData() {\n' + '    // You can await here\n' + '    const response = await MyAPI.getData(someId);\n' + '    // ...\n' + '  }\n' + '  fetchData();\n' + `}, [someId]); // Or [] if effect doesn't need props or state\n\n` + 'Learn more about data fetching with Hooks: https://react.dev/link/hooks-data-fetching'
        }) |> reportProblem(%);
      }

      // Get the current scope.
      const scope = node |> scopeManager.acquire(%);

      // Find all our "pure scopes". On every re-render of a component these
      // pure scopes may have changes to the variables declared within. So all
      // variables used in our reactive hook callback but declared in a pure
      // scope need to be listed as dependencies of our reactive hook callback.
      //
      // According to the rules of React you can't read a mutable value in pure
      // scope. We can't enforce this in a lint so we trust that all variables
      // declared outside of pure scope are indeed frozen.
      const pureScopes = new Set();
      let componentScope = null;
      {
        let currentScope = scope.upper;
        while (currentScope) {
          currentScope |> pureScopes.add(%);
          if (currentScope.type === 'function') {
            break;
          }
          currentScope = currentScope.upper;
        }
        // If there is no parent function scope then there are no pure scopes.
        // The ones we've collected so far are incorrect. So don't continue with
        // the lint.
        if (!currentScope) {
          return;
        }
        componentScope = currentScope;
      }
      const isArray = Array.isArray;

      // Next we'll define a few helpers that helps us
      // tell if some values don't have to be declared as deps.

      // Some are known to be stable based on Hook calls.
      // const [state, setState] = useState() / React.useState()
      //               ^^^ true for this reference
      // const [state, dispatch] = useReducer() / React.useReducer()
      //               ^^^ true for this reference
      // const ref = useRef()
      //       ^^^ true for this reference
      // const onStuff = useEffectEvent(() => {})
      //       ^^^ true for this reference
      // False for everything else.
      function isStableKnownHookValue(resolved) {
        if (!(resolved.defs |> isArray(%))) {
          return false;
        }
        const def = resolved.defs[0];
        if (def == null) {
          return false;
        }
        // Look for `let stuff = ...`
        if (def.node.type !== 'VariableDeclarator') {
          return false;
        }
        let init = def.node.init;
        if (init == null) {
          return false;
        }
        while (init.type === 'TSAsExpression' || init.type === 'AsExpression') {
          init = init.expression;
        }
        // Detect primitive constants
        // const foo = 42
        let declaration = def.node.parent;
        if (declaration == null) {
          // This might happen if variable is declared after the callback.
          // In that case ESLint won't set up .parent refs.
          // So we'll set them up manually.
          componentScope.block |> fastFindReferenceWithParent(%, def.node.id);
          declaration = def.node.parent;
          if (declaration == null) {
            return false;
          }
        }
        if (declaration.kind === 'const' && init.type === 'Literal' && (typeof init.value === 'string' || typeof init.value === 'number' || init.value === null)) {
          // Definitely stable
          return true;
        }
        // Detect known Hook calls
        // const [_, setState] = useState()
        if (init.type !== 'CallExpression') {
          return false;
        }
        let callee = init.callee;
        // Step into `= React.something` initializer.
        if (callee.type === 'MemberExpression' && callee.object.name === 'React' && callee.property != null && !callee.computed) {
          callee = callee.property;
        }
        if (callee.type !== 'Identifier') {
          return false;
        }
        const id = def.node.id;
        const {
          name
        } = callee;
        if (name === 'useRef' && id.type === 'Identifier') {
          // useRef() return value is stable.
          return true;
        } else if ((callee |> isUseEffectEventIdentifier(%)) && id.type === 'Identifier') {
          for (const ref of resolved.references) {
            if (ref !== id) {
              ref.identifier |> useEffectEventVariables.add(%);
            }
          }
          // useEffectEvent() return value is always unstable.
          return true;
        } else if (name === 'useState' || name === 'useReducer') {
          // Only consider second value in initializing tuple stable.
          if (id.type === 'ArrayPattern' && id.elements.length === 2 && (resolved.identifiers |> isArray(%))) {
            // Is second tuple value the same reference we're checking?
            if (id.elements[1] === resolved.identifiers[0]) {
              if (name === 'useState') {
                const references = resolved.references;
                let writeCount = 0;
                for (let i = 0; i < references.length; i++) {
                  if (references[i].isWrite()) {
                    writeCount++;
                  }
                  if (writeCount > 1) {
                    return false;
                  }
                  references[i].identifier |> setStateCallSites.set(%, id.elements[0]);
                }
              }
              // Setter is stable.
              return true;
            } else if (id.elements[0] === resolved.identifiers[0]) {
              if (name === 'useState') {
                const references = resolved.references;
                for (let i = 0; i < references.length; i++) {
                  references[i].identifier |> stateVariables.add(%);
                }
              }
              // State variable itself is dynamic.
              return false;
            }
          }
        } else if (name === 'useTransition') {
          // Only consider second value in initializing tuple stable.
          if (id.type === 'ArrayPattern' && id.elements.length === 2 && (resolved.identifiers |> Array.isArray(%))) {
            // Is second tuple value the same reference we're checking?
            if (id.elements[1] === resolved.identifiers[0]) {
              // Setter is stable.
              return true;
            }
          }
        }
        // By default assume it's dynamic.
        return false;
      }

      // Some are just functions that don't reference anything dynamic.
      function isFunctionWithoutCapturedValues(resolved) {
        if (!(resolved.defs |> isArray(%))) {
          return false;
        }
        const def = resolved.defs[0];
        if (def == null) {
          return false;
        }
        if (def.node == null || def.node.id == null) {
          return false;
        }
        // Search the direct component subscopes for
        // top-level function definitions matching this reference.
        const fnNode = def.node;
        const childScopes = componentScope.childScopes;
        let fnScope = null;
        let i;
        for (i = 0; i < childScopes.length; i++) {
          const childScope = childScopes[i];
          const childScopeBlock = childScope.block;
          if (
          // function handleChange() {}
          fnNode.type === 'FunctionDeclaration' && childScopeBlock === fnNode ||
          // const handleChange = () => {}
          // const handleChange = function() {}
          fnNode.type === 'VariableDeclarator' && childScopeBlock.parent === fnNode) {
            // Found it!
            fnScope = childScope;
            break;
          }
        }
        if (fnScope == null) {
          return false;
        }
        // Does this function capture any values
        // that are in pure scopes (aka render)?
        for (i = 0; i < fnScope.through.length; i++) {
          const ref = fnScope.through[i];
          if (ref.resolved == null) {
            continue;
          }
          if ((ref.resolved.scope |> pureScopes.has(%)) &&
          // Stable values are fine though,
          // although we won't check functions deeper.
          !(ref.resolved |> memoizedIsStableKnownHookValue(%))) {
            return false;
          }
        }
        // If we got here, this function doesn't capture anything
        // from render--or everything it captures is known stable.
        return true;
      }

      // Remember such values. Avoid re-running extra checks on them.
      const memoizedIsStableKnownHookValue = isStableKnownHookValue |> memoizeWithWeakMap(%, stableKnownValueCache);
      const memoizedIsFunctionWithoutCapturedValues = isFunctionWithoutCapturedValues |> memoizeWithWeakMap(%, functionWithoutCapturedValueCache);

      // These are usually mistaken. Collect them.
      const currentRefsInEffectCleanup = new Map();

      // Is this reference inside a cleanup function for this effect node?
      // We can check by traversing scopes upwards from the reference, and checking
      // if the last "return () => " we encounter is located directly inside the effect.
      function isInsideEffectCleanup(reference) {
        let curScope = reference.from;
        let isInReturnedFunction = false;
        while (curScope.block !== node) {
          if (curScope.type === 'function') {
            isInReturnedFunction = curScope.block.parent != null && curScope.block.parent.type === 'ReturnStatement';
          }
          curScope = curScope.upper;
        }
        return isInReturnedFunction;
      }

      // Get dependencies from all our resolved references in pure scopes.
      // Key is dependency string, value is whether it's stable.
      const dependencies = new Map();
      const optionalChains = new Map();
      scope |> gatherDependenciesRecursively(%);
      function gatherDependenciesRecursively(currentScope) {
        for (const reference of currentScope.references) {
          // If this reference is not resolved or it is not declared in a pure
          // scope then we don't care about this reference.
          if (!reference.resolved) {
            continue;
          }
          if (!(reference.resolved.scope |> pureScopes.has(%))) {
            continue;
          }

          // Narrow the scope of a dependency if it is, say, a member expression.
          // Then normalize the narrowed dependency.
          const referenceNode = node |> fastFindReferenceWithParent(%, reference.identifier);
          const dependencyNode = referenceNode |> getDependency(%);
          const dependency = dependencyNode |> analyzePropertyChain(%, optionalChains);

          // Accessing ref.current inside effect cleanup is bad.
          if (
          // We're in an effect...
          isEffect &&
          // ... and this look like accessing .current...
          dependencyNode.type === 'Identifier' && (dependencyNode.parent.type === 'MemberExpression' || dependencyNode.parent.type === 'OptionalMemberExpression') && !dependencyNode.parent.computed && dependencyNode.parent.property.type === 'Identifier' && dependencyNode.parent.property.name === 'current' && (reference |> isInsideEffectCleanup(%))) {
            dependency |> currentRefsInEffectCleanup.set(%, {
              reference,
              dependencyNode
            });
          }
          if (dependencyNode.parent.type === 'TSTypeQuery' || dependencyNode.parent.type === 'TSTypeReference') {
            continue;
          }
          const def = reference.resolved.defs[0];
          if (def == null) {
            continue;
          }
          // Ignore references to the function itself as it's not defined yet.
          if (def.node != null && def.node.init === node.parent) {
            continue;
          }
          // Ignore Flow type parameters
          if (def.type === 'TypeParameter') {
            continue;
          }

          // Add the dependency to a map so we can make sure it is referenced
          // again in our dependencies array. Remember whether it's stable.
          if (!(dependency |> dependencies.has(%))) {
            const resolved = reference.resolved;
            const isStable = resolved |> memoizedIsStableKnownHookValue(%) || resolved |> memoizedIsFunctionWithoutCapturedValues(%);
            dependency |> dependencies.set(%, {
              isStable,
              references: [reference]
            });
          } else {
            reference |> (dependency |> dependencies.get(%)).references.push(%);
          }
        }
        for (const childScope of currentScope.childScopes) {
          childScope |> gatherDependenciesRecursively(%);
        }
      }

      // Warn about accessing .current in cleanup effects.
      // Warn about assigning to variables in the outer scope.
      // Those are usually bugs.
      (({
        reference,
        dependencyNode
      }, dependency) => {
        const references = reference.resolved.references;
        // Is React managing this ref or us?
        // Let's see if we can find a .current assignment.
        let foundCurrentAssignment = false;
        for (let i = 0; i < references.length; i++) {
          const {
            identifier
          } = references[i];
          const {
            parent
          } = identifier;
          if (parent != null &&
          // ref.current
          // Note: no need to handle OptionalMemberExpression because it can't be LHS.
          parent.type === 'MemberExpression' && !parent.computed && parent.property.type === 'Identifier' && parent.property.name === 'current' &&
          // ref.current = <something>
          parent.parent.type === 'AssignmentExpression' && parent.parent.left === parent) {
            foundCurrentAssignment = true;
            break;
          }
        }
        // We only want to warn about React-managed refs.
        if (foundCurrentAssignment) {
          return;
        }
        ({
          node: dependencyNode.parent.property,
          message: `The ref value '${dependency}.current' will likely have ` + `changed by the time this effect cleanup function runs. If ` + `this ref points to a node rendered by React, copy ` + `'${dependency}.current' to a variable inside the effect, and ` + `use that variable in the cleanup function.`
        }) |> reportProblem(%);
      }) |> currentRefsInEffectCleanup.forEach(%);
      const staleAssignments = new Set();
      function reportStaleAssignment(writeExpr, key) {
        if (key |> staleAssignments.has(%)) {
          return;
        }
        key |> staleAssignments.add(%);
        ({
          node: writeExpr,
          message: `Assignments to the '${key}' variable from inside React Hook ` + `${reactiveHook |> getSource(%)} will be lost after each ` + `render. To preserve the value over time, store it in a useRef ` + `Hook and keep the mutable value in the '.current' property. ` + `Otherwise, you can move this variable directly inside ` + `${reactiveHook |> getSource(%)}.`
        }) |> reportProblem(%);
      }

      // Remember which deps are stable and report bad usage first.
      const stableDependencies = new Set();
      (({
        isStable,
        references
      }, key) => {
        if (isStable) {
          key |> stableDependencies.add(%);
        }
        (reference => {
          if (reference.writeExpr) {
            reference.writeExpr |> reportStaleAssignment(%, key);
          }
        }) |> references.forEach(%);
      }) |> dependencies.forEach(%);
      if (staleAssignments.size > 0) {
        // The intent isn't clear so we'll wait until you fix those first.
        return;
      }
      if (!declaredDependenciesNode) {
        // Check if there are any top-level setState() calls.
        // Those tend to lead to infinite loops.
        let setStateInsideEffectWithoutDeps = null;
        (({
          isStable,
          references
        }, key) => {
          if (setStateInsideEffectWithoutDeps) {
            return;
          }
          (reference => {
            if (setStateInsideEffectWithoutDeps) {
              return;
            }
            const id = reference.identifier;
            const isSetState = id |> setStateCallSites.has(%);
            if (!isSetState) {
              return;
            }
            let fnScope = reference.from;
            while (fnScope.type !== 'function') {
              fnScope = fnScope.upper;
            }
            const isDirectlyInsideEffect = fnScope.block === node;
            if (isDirectlyInsideEffect) {
              // TODO: we could potentially ignore early returns.
              setStateInsideEffectWithoutDeps = key;
            }
          }) |> references.forEach(%);
        }) |> dependencies.forEach(%);
        if (setStateInsideEffectWithoutDeps) {
          const {
            suggestedDependencies
          } = {
            dependencies,
            declaredDependencies: [],
            stableDependencies,
            externalDependencies: new Set(),
            isEffect: true
          } |> collectRecommendations(%);
          ({
            node: reactiveHook,
            message: `React Hook ${reactiveHookName} contains a call to '${setStateInsideEffectWithoutDeps}'. ` + `Without a list of dependencies, this can lead to an infinite chain of updates. ` + `To fix this, pass [` + (', ' |> suggestedDependencies.join(%)) + `] as a second argument to the ${reactiveHookName} Hook.`,
            suggest: [{
              desc: `Add dependencies array: [${', ' |> suggestedDependencies.join(%)}]`,
              fix(fixer) {
                return node |> fixer.insertTextAfter(%, `, [${', ' |> suggestedDependencies.join(%)}]`);
              }
            }]
          }) |> reportProblem(%);
        }
        return;
      }
      const declaredDependencies = [];
      const externalDependencies = new Set();
      const isArrayExpression = declaredDependenciesNode.type === 'ArrayExpression';
      const isTSAsArrayExpression = declaredDependenciesNode.type === 'TSAsExpression' && declaredDependenciesNode.expression.type === 'ArrayExpression';
      if (!isArrayExpression && !isTSAsArrayExpression) {
        // If the declared dependencies are not an array expression then we
        // can't verify that the user provided the correct dependencies. Tell
        // the user this in an error.
        ({
          node: declaredDependenciesNode,
          message: `React Hook ${reactiveHook |> getSource(%)} was passed a ` + 'dependency list that is not an array literal. This means we ' + "can't statically verify whether you've passed the correct " + 'dependencies.'
        }) |> reportProblem(%);
      } else {
        const arrayExpression = isTSAsArrayExpression ? declaredDependenciesNode.expression : declaredDependenciesNode;
        (declaredDependencyNode => {
          // Skip elided elements.
          if (declaredDependencyNode === null) {
            return;
          }
          // If we see a spread element then add a special warning.
          if (declaredDependencyNode.type === 'SpreadElement') {
            ({
              node: declaredDependencyNode,
              message: `React Hook ${reactiveHook |> getSource(%)} has a spread ` + "element in its dependency array. This means we can't " + "statically verify whether you've passed the " + 'correct dependencies.'
            }) |> reportProblem(%);
            return;
          }
          if (declaredDependencyNode |> useEffectEventVariables.has(%)) {
            ({
              node: declaredDependencyNode,
              message: 'Functions returned from `useEffectEvent` must not be included in the dependency array. ' + `Remove \`${declaredDependencyNode |> getSource(%)}\` from the list.`,
              suggest: [{
                desc: `Remove the dependency \`${declaredDependencyNode |> getSource(%)}\``,
                fix(fixer) {
                  return declaredDependencyNode.range |> fixer.removeRange(%);
                }
              }]
            }) |> reportProblem(%);
          }
          // Try to normalize the declared dependency. If we can't then an error
          // will be thrown. We will catch that error and report an error.
          let declaredDependency;
          try {
            declaredDependency = declaredDependencyNode |> analyzePropertyChain(%, null);
          } catch (error) {
            if (error.message |> /Unsupported node type/.test(%)) {
              if (declaredDependencyNode.type === 'Literal') {
                if (declaredDependencyNode.value |> dependencies.has(%)) {
                  ({
                    node: declaredDependencyNode,
                    message: `The ${declaredDependencyNode.raw} literal is not a valid dependency ` + `because it never changes. ` + `Did you mean to include ${declaredDependencyNode.value} in the array instead?`
                  }) |> reportProblem(%);
                } else {
                  ({
                    node: declaredDependencyNode,
                    message: `The ${declaredDependencyNode.raw} literal is not a valid dependency ` + 'because it never changes. You can safely remove it.'
                  }) |> reportProblem(%);
                }
              } else {
                ({
                  node: declaredDependencyNode,
                  message: `React Hook ${reactiveHook |> getSource(%)} has a ` + `complex expression in the dependency array. ` + 'Extract it to a separate variable so it can be statically checked.'
                }) |> reportProblem(%);
              }
              return;
            } else {
              throw error;
            }
          }
          let maybeID = declaredDependencyNode;
          while (maybeID.type === 'MemberExpression' || maybeID.type === 'OptionalMemberExpression' || maybeID.type === 'ChainExpression') {
            maybeID = maybeID.object || maybeID.expression.object;
          }
          const isDeclaredInComponent = !((ref => ref.identifier === maybeID) |> componentScope.through.some(%));

          // Add the dependency to our declared dependency map.
          ({
            key: declaredDependency,
            node: declaredDependencyNode
          }) |> declaredDependencies.push(%);
          if (!isDeclaredInComponent) {
            declaredDependency |> externalDependencies.add(%);
          }
        }) |> arrayExpression.elements.forEach(%);
      }
      const {
        suggestedDependencies,
        unnecessaryDependencies,
        missingDependencies,
        duplicateDependencies
      } = {
        dependencies,
        declaredDependencies,
        stableDependencies,
        externalDependencies,
        isEffect
      } |> collectRecommendations(%);
      let suggestedDeps = suggestedDependencies;
      const problemCount = duplicateDependencies.size + missingDependencies.size + unnecessaryDependencies.size;
      if (problemCount === 0) {
        // If nothing else to report, check if some dependencies would
        // invalidate on every render.
        const constructions = {
          declaredDependencies,
          declaredDependenciesNode,
          componentScope,
          scope
        } |> scanForConstructions(%);
        (({
          construction,
          isUsedOutsideOfHook,
          depType
        }) => {
          const wrapperHook = depType === 'function' ? 'useCallback' : 'useMemo';
          const constructionType = depType === 'function' ? 'definition' : 'initialization';
          const defaultAdvice = `wrap the ${constructionType} of '${construction.name.name}' in its own ${wrapperHook}() Hook.`;
          const advice = isUsedOutsideOfHook ? `To fix this, ${defaultAdvice}` : `Move it inside the ${reactiveHookName} callback. Alternatively, ${defaultAdvice}`;
          const causation = depType === 'conditional' || depType === 'logical expression' ? 'could make' : 'makes';
          const message = `The '${construction.name.name}' ${depType} ${causation} the dependencies of ` + `${reactiveHookName} Hook (at line ${declaredDependenciesNode.loc.start.line}) ` + `change on every render. ${advice}`;
          let suggest;
          // Only handle the simple case of variable assignments.
          // Wrapping function declarations can mess up hoisting.
          if (isUsedOutsideOfHook && construction.type === 'Variable' &&
          // Objects may be mutated after construction, which would make this
          // fix unsafe. Functions _probably_ won't be mutated, so we'll
          // allow this fix for them.
          depType === 'function') {
            suggest = [{
              desc: `Wrap the ${constructionType} of '${construction.name.name}' in its own ${wrapperHook}() Hook.`,
              fix(fixer) {
                const [before, after] = wrapperHook === 'useMemo' ? [`useMemo(() => { return `, '; })'] : ['useCallback(', ')'];
                return [construction.node.init |> fixer.insertTextBefore(%, before), construction.node.init |> fixer.insertTextAfter(%, after)];
              }
            }];
          }
          // TODO: What if the function needs to change on every render anyway?
          // Should we suggest removing effect deps as an appropriate fix too?
          ({
            // TODO: Why not report this at the dependency site?
            node: construction.node,
            message,
            suggest
          }) |> reportProblem(%);
        }) |> constructions.forEach(%);
        return;
      }

      // If we're going to report a missing dependency,
      // we might as well recalculate the list ignoring
      // the currently specified deps. This can result
      // in some extra deduplication. We can't do this
      // for effects though because those have legit
      // use cases for over-specifying deps.
      if (!isEffect && missingDependencies.size > 0) {
        suggestedDeps = ({
          dependencies,
          declaredDependencies: [],
          // Pretend we don't know
          stableDependencies,
          externalDependencies,
          isEffect
        } |> collectRecommendations(%)).suggestedDependencies;
      }

      // Alphabetize the suggestions, but only if deps were already alphabetized.
      function areDeclaredDepsAlphabetized() {
        if (declaredDependencies.length === 0) {
          return true;
        }
        const declaredDepKeys = (dep => dep.key) |> declaredDependencies.map(%);
        const sortedDeclaredDepKeys = declaredDepKeys.slice().sort();
        return (',' |> declaredDepKeys.join(%)) === (',' |> sortedDeclaredDepKeys.join(%));
      }
      if (areDeclaredDepsAlphabetized()) {
        suggestedDeps.sort();
      }

      // Most of our algorithm deals with dependency paths with optional chaining stripped.
      // This function is the last step before printing a dependency, so now is a good time to
      // check whether any members in our path are always used as optional-only. In that case,
      // we will use ?. instead of . to concatenate those parts of the path.
      function formatDependency(path) {
        const members = '.' |> path.split(%);
        let finalPath = '';
        for (let i = 0; i < members.length; i++) {
          if (i !== 0) {
            const pathSoFar = '.' |> (0 |> members.slice(%, i + 1)).join(%);
            const isOptional = (pathSoFar |> optionalChains.get(%)) === true;
            finalPath += isOptional ? '?.' : '.';
          }
          finalPath += members[i];
        }
        return finalPath;
      }
      function getWarningMessage(deps, singlePrefix, label, fixVerb) {
        if (deps.size === 0) {
          return null;
        }
        return (deps.size > 1 ? '' : singlePrefix + ' ') + label + ' ' + (deps.size > 1 ? 'dependencies' : 'dependency') + ': ' + ((name => "'" + (name |> formatDependency(%)) + "'") |> (deps |> Array.from(%)).sort().map(%) |> joinEnglish(%)) + `. Either ${fixVerb} ${deps.size > 1 ? 'them' : 'it'} or remove the dependency array.`;
      }
      let extraWarning = '';
      if (unnecessaryDependencies.size > 0) {
        let badRef = null;
        (key => {
          if (badRef !== null) {
            return;
          }
          if ('.current' |> key.endsWith(%)) {
            badRef = key;
          }
        }) |> (unnecessaryDependencies.keys() |> Array.from(%)).forEach(%);
        if (badRef !== null) {
          extraWarning = ` Mutable values like '${badRef}' aren't valid dependencies ` + "because mutating them doesn't re-render the component.";
        } else if (externalDependencies.size > 0) {
          const dep = (externalDependencies |> Array.from(%))[0];
          // Don't show this warning for things that likely just got moved *inside* the callback
          // because in that case they're clearly not referring to globals.
          if (!(dep |> scope.set.has(%))) {
            extraWarning = ` Outer scope values like '${dep}' aren't valid dependencies ` + `because mutating them doesn't re-render the component.`;
          }
        }
      }

      // `props.foo()` marks `props` as a dependency because it has
      // a `this` value. This warning can be confusing.
      // So if we're going to show it, append a clarification.
      if (!extraWarning && ('props' |> missingDependencies.has(%))) {
        const propDep = 'props' |> dependencies.get(%);
        if (propDep == null) {
          return;
        }
        const refs = propDep.references;
        if (!(refs |> Array.isArray(%))) {
          return;
        }
        let isPropsOnlyUsedInMembers = true;
        for (let i = 0; i < refs.length; i++) {
          const ref = refs[i];
          const id = componentScope.block |> fastFindReferenceWithParent(%, ref.identifier);
          if (!id) {
            isPropsOnlyUsedInMembers = false;
            break;
          }
          const parent = id.parent;
          if (parent == null) {
            isPropsOnlyUsedInMembers = false;
            break;
          }
          if (parent.type !== 'MemberExpression' && parent.type !== 'OptionalMemberExpression') {
            isPropsOnlyUsedInMembers = false;
            break;
          }
        }
        if (isPropsOnlyUsedInMembers) {
          extraWarning = ` However, 'props' will change when *any* prop changes, so the ` + `preferred fix is to destructure the 'props' object outside of ` + `the ${reactiveHookName} call and refer to those specific props ` + `inside ${reactiveHook |> getSource(%)}.`;
        }
      }
      if (!extraWarning && missingDependencies.size > 0) {
        // See if the user is trying to avoid specifying a callable prop.
        // This usually means they're unaware of useCallback.
        let missingCallbackDep = null;
        (missingDep => {
          if (missingCallbackDep) {
            return;
          }
          // Is this a variable from top scope?
          const topScopeRef = missingDep |> componentScope.set.get(%);
          const usedDep = missingDep |> dependencies.get(%);
          if (usedDep.references[0].resolved !== topScopeRef) {
            return;
          }
          // Is this a destructured prop?
          const def = topScopeRef.defs[0];
          if (def == null || def.name == null || def.type !== 'Parameter') {
            return;
          }
          // Was it called in at least one case? Then it's a function.
          let isFunctionCall = false;
          let id;
          for (let i = 0; i < usedDep.references.length; i++) {
            id = usedDep.references[i].identifier;
            if (id != null && id.parent != null && (id.parent.type === 'CallExpression' || id.parent.type === 'OptionalCallExpression') && id.parent.callee === id) {
              isFunctionCall = true;
              break;
            }
          }
          if (!isFunctionCall) {
            return;
          }
          // If it's missing (i.e. in component scope) *and* it's a parameter
          // then it is definitely coming from props destructuring.
          // (It could also be props itself but we wouldn't be calling it then.)
          missingCallbackDep = missingDep;
        }) |> missingDependencies.forEach(%);
        if (missingCallbackDep !== null) {
          extraWarning = ` If '${missingCallbackDep}' changes too often, ` + `find the parent component that defines it ` + `and wrap that definition in useCallback.`;
        }
      }
      if (!extraWarning && missingDependencies.size > 0) {
        let setStateRecommendation = null;
        (missingDep => {
          if (setStateRecommendation !== null) {
            return;
          }
          const usedDep = missingDep |> dependencies.get(%);
          const references = usedDep.references;
          let id;
          let maybeCall;
          for (let i = 0; i < references.length; i++) {
            id = references[i].identifier;
            maybeCall = id.parent;
            // Try to see if we have setState(someExpr(missingDep)).
            while (maybeCall != null && maybeCall !== componentScope.block) {
              if (maybeCall.type === 'CallExpression') {
                const correspondingStateVariable = maybeCall.callee |> setStateCallSites.get(%);
                if (correspondingStateVariable != null) {
                  if (correspondingStateVariable.name === missingDep) {
                    // setCount(count + 1)
                    setStateRecommendation = {
                      missingDep,
                      setter: maybeCall.callee.name,
                      form: 'updater'
                    };
                  } else if (id |> stateVariables.has(%)) {
                    // setCount(count + increment)
                    setStateRecommendation = {
                      missingDep,
                      setter: maybeCall.callee.name,
                      form: 'reducer'
                    };
                  } else {
                    const resolved = references[i].resolved;
                    if (resolved != null) {
                      // If it's a parameter *and* a missing dep,
                      // it must be a prop or something inside a prop.
                      // Therefore, recommend an inline reducer.
                      const def = resolved.defs[0];
                      if (def != null && def.type === 'Parameter') {
                        setStateRecommendation = {
                          missingDep,
                          setter: maybeCall.callee.name,
                          form: 'inlineReducer'
                        };
                      }
                    }
                  }
                  break;
                }
              }
              maybeCall = maybeCall.parent;
            }
            if (setStateRecommendation !== null) {
              break;
            }
          }
        }) |> missingDependencies.forEach(%);
        if (setStateRecommendation !== null) {
          switch (setStateRecommendation.form) {
            case 'reducer':
              extraWarning = ` You can also replace multiple useState variables with useReducer ` + `if '${setStateRecommendation.setter}' needs the ` + `current value of '${setStateRecommendation.missingDep}'.`;
              break;
            case 'inlineReducer':
              extraWarning = ` If '${setStateRecommendation.setter}' needs the ` + `current value of '${setStateRecommendation.missingDep}', ` + `you can also switch to useReducer instead of useState and ` + `read '${setStateRecommendation.missingDep}' in the reducer.`;
              break;
            case 'updater':
              extraWarning = ` You can also do a functional update '${setStateRecommendation.setter}(${0 |> setStateRecommendation.missingDep.slice(%, 1)} => ...)' if you only need '${setStateRecommendation.missingDep}'` + ` in the '${setStateRecommendation.setter}' call.`;
              break;
            default:
              throw new Error('Unknown case.');
          }
        }
      }
      ({
        node: declaredDependenciesNode,
        message: `React Hook ${reactiveHook |> getSource(%)} has ` + (
        // To avoid a long message, show the next actionable item.
        getWarningMessage(missingDependencies, 'a', 'missing', 'include') || getWarningMessage(unnecessaryDependencies, 'an', 'unnecessary', 'exclude') || getWarningMessage(duplicateDependencies, 'a', 'duplicate', 'omit')) + extraWarning,
        suggest: [{
          desc: `Update the dependencies array to be: [${', ' |> (formatDependency |> suggestedDeps.map(%)).join(%)}]`,
          fix(fixer) {
            // TODO: consider preserving the comments or formatting?
            return declaredDependenciesNode |> fixer.replaceText(%, `[${', ' |> (formatDependency |> suggestedDeps.map(%)).join(%)}]`);
          }
        }]
      }) |> reportProblem(%);
    }
    function visitCallExpression(node) {
      const callbackIndex = node.callee |> getReactiveHookCallbackIndex(%, options);
      if (callbackIndex === -1) {
        // Not a React Hook call that needs deps.
        return;
      }
      const callback = node.arguments[callbackIndex];
      const reactiveHook = node.callee;
      const reactiveHookName = (reactiveHook |> getNodeWithoutReactNamespace(%)).name;
      const maybeNode = node.arguments[callbackIndex + 1];
      const declaredDependenciesNode = maybeNode && !(maybeNode.type === 'Identifier' && maybeNode.name === 'undefined') ? maybeNode : undefined;
      const isEffect = reactiveHookName |> /Effect($|[^a-z])/g.test(%);

      // Check whether a callback is supplied. If there is no callback supplied
      // then the hook will not work and React will throw a TypeError.
      // So no need to check for dependency inclusion.
      if (!callback) {
        ({
          node: reactiveHook,
          message: `React Hook ${reactiveHookName} requires an effect callback. ` + `Did you forget to pass a callback to the hook?`
        }) |> reportProblem(%);
        return;
      }

      // Check the declared dependencies for this reactive hook. If there is no
      // second argument then the reactive callback will re-run on every render.
      // So no need to check for dependency inclusion.
      if (!declaredDependenciesNode && !isEffect) {
        // These are only used for optimization.
        if (reactiveHookName === 'useMemo' || reactiveHookName === 'useCallback') {
          // TODO: Can this have a suggestion?
          ({
            node: reactiveHook,
            message: `React Hook ${reactiveHookName} does nothing when called with ` + `only one argument. Did you forget to pass an array of ` + `dependencies?`
          }) |> reportProblem(%);
        }
        return;
      }
      switch (callback.type) {
        case 'FunctionExpression':
        case 'ArrowFunctionExpression':
          visitFunctionWithDependencies(callback, declaredDependenciesNode, reactiveHook, reactiveHookName, isEffect);
          return;
        // Handled
        case 'TSAsExpression':
          visitFunctionWithDependencies(callback.expression, declaredDependenciesNode, reactiveHook, reactiveHookName, isEffect);
          return;
        // Handled
        case 'Identifier':
          if (!declaredDependenciesNode) {
            // No deps, no problems.
            return; // Handled
          }
          // The function passed as a callback is not written inline.
          // But perhaps it's in the dependencies array?
          if (declaredDependenciesNode.elements && ((el => el && el.type === 'Identifier' && el.name === callback.name) |> declaredDependenciesNode.elements.some(%))) {
            // If it's already in the list of deps, we don't care because
            // this is valid regardless.
            return; // Handled
          }
          // We'll do our best effort to find it, complain otherwise.
          const variable = callback.name |> (callback |> getScope(%)).set.get(%);
          if (variable == null || variable.defs == null) {
            // If it's not in scope, we don't care.
            return; // Handled
          }
          // The function passed as a callback is not written inline.
          // But it's defined somewhere in the render scope.
          // We'll do our best effort to find and check it, complain otherwise.
          const def = variable.defs[0];
          if (!def || !def.node) {
            break; // Unhandled
          }
          if (def.type !== 'Variable' && def.type !== 'FunctionName') {
            // Parameter or an unusual pattern. Bail out.
            break; // Unhandled
          }
          switch (def.node.type) {
            case 'FunctionDeclaration':
              // useEffect(() => { ... }, []);
              visitFunctionWithDependencies(def.node, declaredDependenciesNode, reactiveHook, reactiveHookName, isEffect);
              return;
            // Handled
            case 'VariableDeclarator':
              const init = def.node.init;
              if (!init) {
                break; // Unhandled
              }
              switch (init.type) {
                // const effectBody = () => {...};
                // useEffect(effectBody, []);
                case 'ArrowFunctionExpression':
                case 'FunctionExpression':
                  // We can inspect this function as if it were inline.
                  visitFunctionWithDependencies(init, declaredDependenciesNode, reactiveHook, reactiveHookName, isEffect);
                  return;
                // Handled
              }
              break;
            // Unhandled
          }
          break;
        // Unhandled
        default:
          // useEffect(generateEffectBody(), []);
          ({
            node: reactiveHook,
            message: `React Hook ${reactiveHookName} received a function whose dependencies ` + `are unknown. Pass an inline function instead.`
          }) |> reportProblem(%);
          return;
        // Handled
      }

      // Something unusual. Fall back to suggesting to add the body itself as a dep.
      ({
        node: reactiveHook,
        message: `React Hook ${reactiveHookName} has a missing dependency: '${callback.name}'. ` + `Either include it or remove the dependency array.`,
        suggest: [{
          desc: `Update the dependencies array to be: [${callback.name}]`,
          fix(fixer) {
            return declaredDependenciesNode |> fixer.replaceText(%, `[${callback.name}]`);
          }
        }]
      }) |> reportProblem(%);
    }
    return {
      CallExpression: visitCallExpression
    };
  }
};

// The meat of the logic.
function collectRecommendations({
  dependencies,
  declaredDependencies,
  stableDependencies,
  externalDependencies,
  isEffect
}) {
  // Our primary data structure.
  // It is a logical representation of property chains:
  // `props` -> `props.foo` -> `props.foo.bar` -> `props.foo.bar.baz`
  //         -> `props.lol`
  //         -> `props.huh` -> `props.huh.okay`
  //         -> `props.wow`
  // We'll use it to mark nodes that are *used* by the programmer,
  // and the nodes that were *declared* as deps. Then we will
  // traverse it to learn which deps are missing or unnecessary.
  const depTree = createDepTree();
  function createDepTree() {
    return {
      isUsed: false,
      // True if used in code
      isSatisfiedRecursively: false,
      // True if specified in deps
      isSubtreeUsed: false,
      // True if something deeper is used by code
      children: new Map() // Nodes for properties
    };
  }

  // Mark all required nodes first.
  // Imagine exclamation marks next to each used deep property.
  // Mark all satisfied nodes.
  // Imagine checkmarks next to each declared dependency.
  ((_, key) => {
    const node = depTree |> getOrCreateNodeByPath(%, key);
    node.isUsed = true;
    markAllParentsByPath(depTree, key, parent => {
      parent.isSubtreeUsed = true;
    });
  }) |> dependencies.forEach(%);
  (({
    key
  }) => {
    const node = depTree |> getOrCreateNodeByPath(%, key);
    node.isSatisfiedRecursively = true;
  }) |> declaredDependencies.forEach(%);
  // Tree manipulation helpers.
  (key => {
    const node = depTree |> getOrCreateNodeByPath(%, key);
    node.isSatisfiedRecursively = true;
  }) |> stableDependencies.forEach(%);
  function getOrCreateNodeByPath(rootNode, path) {
    const keys = '.' |> path.split(%);
    let node = rootNode;
    for (const key of keys) {
      let child = key |> node.children.get(%);
      if (!child) {
        child = createDepTree();
        key |> node.children.set(%, child);
      }
      node = child;
    }
    return node;
  }
  function markAllParentsByPath(rootNode, path, fn) {
    const keys = '.' |> path.split(%);
    let node = rootNode;
    for (const key of keys) {
      const child = key |> node.children.get(%);
      if (!child) {
        return;
      }
      child |> fn(%);
      node = child;
    }
  }

  // Now we can learn which dependencies are missing or necessary.
  const missingDependencies = new Set();
  const satisfyingDependencies = new Set();
  scanTreeRecursively(depTree, missingDependencies, satisfyingDependencies, key => key);
  function scanTreeRecursively(node, missingPaths, satisfyingPaths, keyToPath) {
    ((child, key) => {
      const path = key |> keyToPath(%);
      if (child.isSatisfiedRecursively) {
        if (child.isSubtreeUsed) {
          // Remember this dep actually satisfied something.
          path |> satisfyingPaths.add(%);
        }
        // It doesn't matter if there's something deeper.
        // It would be transitively satisfied since we assume immutability.
        // `props.foo` is enough if you read `props.foo.id`.
        return;
      }
      if (child.isUsed) {
        // Remember that no declared deps satisfied this node.

        // If we got here, nothing in its subtree was satisfied.
        // No need to search further.
        path |> missingPaths.add(%);
        return;
      }
      scanTreeRecursively(child, missingPaths, satisfyingPaths, childKey => path + '.' + childKey);
    }) |> node.children.forEach(%);
  }

  // Collect suggestions in the order they were originally specified.
  const suggestedDependencies = [];
  const unnecessaryDependencies = new Set();
  const duplicateDependencies = new Set();
  // Then add the missing ones at the end.
  (({
    key
  }) => {
    // Does this declared dep satisfy a real need?
    if (key |> satisfyingDependencies.has(%)) {
      if ((key |> suggestedDependencies.indexOf(%)) === -1) {
        // Good one.
        key |> suggestedDependencies.push(%);
      } else {
        // Duplicate.
        key |> duplicateDependencies.add(%);
      }
    } else {
      if (isEffect && !('.current' |> key.endsWith(%)) && !(key |> externalDependencies.has(%))) {
        // Effects are allowed extra "unnecessary" deps.
        // Such as resetting scroll when ID changes.
        // Consider them legit.
        // The exception is ref.current which is always wrong.
        if ((key |> suggestedDependencies.indexOf(%)) === -1) {
          key |> suggestedDependencies.push(%);
        }
      } else {
        // It's definitely not needed.
        key |> unnecessaryDependencies.add(%);
      }
    }
  }) |> declaredDependencies.forEach(%);
  (key => {
    key |> suggestedDependencies.push(%);
  }) |> missingDependencies.forEach(%);
  return {
    suggestedDependencies,
    unnecessaryDependencies,
    duplicateDependencies,
    missingDependencies
  };
}

// If the node will result in constructing a referentially unique value, return
// its human readable type name, else return null.
function getConstructionExpressionType(node) {
  switch (node.type) {
    case 'ObjectExpression':
      return 'object';
    case 'ArrayExpression':
      return 'array';
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return 'function';
    case 'ClassExpression':
      return 'class';
    case 'ConditionalExpression':
      if ((node.consequent |> getConstructionExpressionType(%)) != null || (node.alternate |> getConstructionExpressionType(%)) != null) {
        return 'conditional';
      }
      return null;
    case 'LogicalExpression':
      if ((node.left |> getConstructionExpressionType(%)) != null || (node.right |> getConstructionExpressionType(%)) != null) {
        return 'logical expression';
      }
      return null;
    case 'JSXFragment':
      return 'JSX fragment';
    case 'JSXElement':
      return 'JSX element';
    case 'AssignmentExpression':
      if ((node.right |> getConstructionExpressionType(%)) != null) {
        return 'assignment expression';
      }
      return null;
    case 'NewExpression':
      return 'object construction';
    case 'Literal':
      if (node.value instanceof RegExp) {
        return 'regular expression';
      }
      return null;
    case 'TypeCastExpression':
    case 'AsExpression':
    case 'TSAsExpression':
      return node.expression |> getConstructionExpressionType(%);
  }
  return null;
}

// Finds variables declared as dependencies
// that would invalidate on every render.
function scanForConstructions({
  declaredDependencies,
  declaredDependenciesNode,
  componentScope,
  scope
}) {
  const constructions = Boolean |> ((({
    key
  }) => {
    const ref = (v => v.name === key) |> componentScope.variables.find(%);
    if (ref == null) {
      return null;
    }
    const node = ref.defs[0];
    if (node == null) {
      return null;
    }
    // const handleChange = function () {}
    // const handleChange = () => {}
    // const foo = {}
    // const foo = []
    // etc.
    if (node.type === 'Variable' && node.node.type === 'VariableDeclarator' && node.node.id.type === 'Identifier' &&
    // Ensure this is not destructed assignment
    node.node.init != null) {
      const constantExpressionType = node.node.init |> getConstructionExpressionType(%);
      if (constantExpressionType != null) {
        return [ref, constantExpressionType];
      }
    }
    // function handleChange() {}
    if (node.type === 'FunctionName' && node.node.type === 'FunctionDeclaration') {
      return [ref, 'function'];
    }

    // class Foo {}
    if (node.type === 'ClassName' && node.node.type === 'ClassDeclaration') {
      return [ref, 'class'];
    }
    return null;
  }) |> declaredDependencies.map(%)).filter(%);
  function isUsedOutsideOfHook(ref) {
    let foundWriteExpr = false;
    for (let i = 0; i < ref.references.length; i++) {
      const reference = ref.references[i];
      if (reference.writeExpr) {
        if (foundWriteExpr) {
          // Two writes to the same function.
          return true;
        } else {
          // Ignore first write as it's not usage.
          foundWriteExpr = true;
          continue;
        }
      }
      let currentScope = reference.from;
      while (currentScope !== scope && currentScope != null) {
        currentScope = currentScope.upper;
      }
      if (currentScope !== scope) {
        // This reference is outside the Hook callback.
        // It can only be legit if it's the deps array.
        if (!(declaredDependenciesNode |> isAncestorNodeOf(%, reference.identifier))) {
          return true;
        }
      }
    }
    return false;
  }
  return (([ref, depType]) => ({
    construction: ref.defs[0],
    depType,
    isUsedOutsideOfHook: ref |> isUsedOutsideOfHook(%)
  })) |> constructions.map(%);
}

/**
 * Assuming () means the passed/returned node:
 * (props) => (props)
 * props.(foo) => (props.foo)
 * props.foo.(bar) => (props).foo.bar
 * props.foo.bar.(baz) => (props).foo.bar.baz
 */
function getDependency(node) {
  if ((node.parent.type === 'MemberExpression' || node.parent.type === 'OptionalMemberExpression') && node.parent.object === node && node.parent.property.name !== 'current' && !node.parent.computed && !(node.parent.parent != null && (node.parent.parent.type === 'CallExpression' || node.parent.parent.type === 'OptionalCallExpression') && node.parent.parent.callee === node.parent)) {
    return node.parent |> getDependency(%);
  } else if (
  // Note: we don't check OptionalMemberExpression because it can't be LHS.
  node.type === 'MemberExpression' && node.parent && node.parent.type === 'AssignmentExpression' && node.parent.left === node) {
    return node.object;
  } else {
    return node;
  }
}

/**
 * Mark a node as either optional or required.
 * Note: If the node argument is an OptionalMemberExpression, it doesn't necessarily mean it is optional.
 * It just means there is an optional member somewhere inside.
 * This particular node might still represent a required member, so check .optional field.
 */
function markNode(node, optionalChains, result) {
  if (optionalChains) {
    if (node.optional) {
      // We only want to consider it optional if *all* usages were optional.
      if (!(result |> optionalChains.has(%))) {
        // Mark as (maybe) optional. If there's a required usage, this will be overridden.
        result |> optionalChains.set(%, true);
      }
    } else {
      // Mark as required.
      result |> optionalChains.set(%, false);
    }
  }
}

/**
 * Assuming () means the passed node.
 * (foo) -> 'foo'
 * foo(.)bar -> 'foo.bar'
 * foo.bar(.)baz -> 'foo.bar.baz'
 * Otherwise throw.
 */
function analyzePropertyChain(node, optionalChains) {
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier') {
    const result = node.name;
    if (optionalChains) {
      // Mark as required.
      result |> optionalChains.set(%, false);
    }
    return result;
  } else if (node.type === 'MemberExpression' && !node.computed) {
    const object = node.object |> analyzePropertyChain(%, optionalChains);
    const property = node.property |> analyzePropertyChain(%, null);
    const result = `${object}.${property}`;
    markNode(node, optionalChains, result);
    return result;
  } else if (node.type === 'OptionalMemberExpression' && !node.computed) {
    const object = node.object |> analyzePropertyChain(%, optionalChains);
    const property = node.property |> analyzePropertyChain(%, null);
    const result = `${object}.${property}`;
    markNode(node, optionalChains, result);
    return result;
  } else if (node.type === 'ChainExpression' && !node.computed) {
    const expression = node.expression;
    if (expression.type === 'CallExpression') {
      throw new Error(`Unsupported node type: ${expression.type}`);
    }
    const object = expression.object |> analyzePropertyChain(%, optionalChains);
    const property = expression.property |> analyzePropertyChain(%, null);
    const result = `${object}.${property}`;
    markNode(expression, optionalChains, result);
    return result;
  } else {
    throw new Error(`Unsupported node type: ${node.type}`);
  }
}
function getNodeWithoutReactNamespace(node, options) {
  if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'React' && node.property.type === 'Identifier' && !node.computed) {
    return node.property;
  }
  return node;
}

// What's the index of callback that needs to be analyzed for a given Hook?
// -1 if it's not a Hook we care about (e.g. useState).
// 0 for useEffect/useMemo/useCallback(fn).
// 1 for useImperativeHandle(ref, fn).
// For additionally configured Hooks, assume that they're like useEffect (0).
function getReactiveHookCallbackIndex(calleeNode, options) {
  const node = calleeNode |> getNodeWithoutReactNamespace(%);
  if (node.type !== 'Identifier') {
    return -1;
  }
  switch (node.name) {
    case 'useEffect':
    case 'useLayoutEffect':
    case 'useCallback':
    case 'useMemo':
      // useEffect(fn)
      return 0;
    case 'useImperativeHandle':
      // useImperativeHandle(ref, fn)
      return 1;
    default:
      if (node === calleeNode && options && options.additionalHooks) {
        // Allow the user to provide a regular expression which enables the lint to
        // target custom reactive hooks.
        let name;
        try {
          name = node |> analyzePropertyChain(%, null);
        } catch (error) {
          if (error.message |> /Unsupported node type/.test(%)) {
            return 0;
          } else {
            throw error;
          }
        }
        return name |> options.additionalHooks.test(%) ? 0 : -1;
      } else {
        return -1;
      }
  }
}

/**
 * ESLint won't assign node.parent to references from context.getScope()
 *
 * So instead we search for the node from an ancestor assigning node.parent
 * as we go. This mutates the AST.
 *
 * This traversal is:
 * - optimized by only searching nodes with a range surrounding our target node
 * - agnostic to AST node types, it looks for `{ type: string, ... }`
 */
function fastFindReferenceWithParent(start, target) {
  const queue = [start];
  let item = null;
  while (queue.length) {
    item = queue.shift();
    if (item |> isSameIdentifier(%, target)) {
      return item;
    }
    if (!(item |> isAncestorNodeOf(%, target))) {
      continue;
    }
    for (const [key, value] of item |> Object.entries(%)) {
      if (key === 'parent') {
        continue;
      }
      if (value |> isNodeLike(%)) {
        value.parent = item;
        value |> queue.push(%);
      } else if (value |> Array.isArray(%)) {
        (val => {
          if (val |> isNodeLike(%)) {
            val.parent = item;
            val |> queue.push(%);
          }
        }) |> value.forEach(%);
      }
    }
  }
  return null;
}
function joinEnglish(arr) {
  let s = '';
  for (let i = 0; i < arr.length; i++) {
    s += arr[i];
    if (i === 0 && arr.length === 2) {
      s += ' and ';
    } else if (i === arr.length - 2 && arr.length > 2) {
      s += ', and ';
    } else if (i < arr.length - 1) {
      s += ', ';
    }
  }
  return s;
}
function isNodeLike(val) {
  return typeof val === 'object' && val !== null && !(val |> Array.isArray(%)) && typeof val.type === 'string';
}
function isSameIdentifier(a, b) {
  return (a.type === 'Identifier' || a.type === 'JSXIdentifier') && a.type === b.type && a.name === b.name && a.range[0] === b.range[0] && a.range[1] === b.range[1];
}
function isAncestorNodeOf(a, b) {
  return a.range[0] <= b.range[0] && a.range[1] >= b.range[1];
}
function isUseEffectEventIdentifier(node) {
  if (__EXPERIMENTAL__) {
    return node.type === 'Identifier' && node.name === 'useEffectEvent';
  }
  return false;
}