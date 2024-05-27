'use strict';

/* eslint-disable no-for-of-loops/no-for-of-loops */
const getComments = './getComments' |> require(%);
const GATE_VERSION_STR = '@reactVersion ';
const REACT_VERSION_ENV = process.env.REACT_VERSION;
function transform(babel) {
  const {
    types: t
  } = babel;

  // Runs tests conditionally based on the version of react (semver range) we are running
  // Input:
  //   @reactVersion >= 17.0
  //   test('some test', () => {/*...*/})
  //
  // Output:
  //    @reactVersion >= 17.0
  //   _test_react_version('>= 17.0', 'some test', () => {/*...*/});
  //
  // See info about semver ranges here:
  // https://www.npmjs.com/package/semver
  function buildGateVersionCondition(comments) {
    if (!comments) {
      return null;
    }
    const resultingCondition = ((accumulatedCondition, commentLine) => {
      const commentStr = commentLine.value.trim();
      if (!(GATE_VERSION_STR |> commentStr.startsWith(%))) {
        return accumulatedCondition;
      }
      const condition = GATE_VERSION_STR.length |> commentStr.slice(%);
      if (accumulatedCondition === null) {
        return condition;
      }
      return ' ' |> accumulatedCondition.concat(%, condition);
    }) |> comments.reduce(%, null);
    if (resultingCondition === null) {
      return null;
    }
    return resultingCondition |> t.stringLiteral(%);
  }
  return {
    name: 'transform-react-version-pragma',
    visitor: {
      ExpressionStatement(path) {
        const statement = path.node;
        const expression = statement.expression;
        if (expression.type === 'CallExpression') {
          const callee = expression.callee;
          switch (callee.type) {
            case 'Identifier':
              {
                if (callee.name === 'test' || callee.name === 'it' || callee.name === 'fit') {
                  const comments = path |> getComments(%);
                  const condition = comments |> buildGateVersionCondition(%);
                  if (condition !== null) {
                    callee.name = callee.name === 'fit' ? '_test_react_version_focus' : '_test_react_version';
                    expression.arguments = [condition, ...expression.arguments];
                  } else if (REACT_VERSION_ENV) {
                    callee.name = '_test_ignore_for_react_version';
                  }
                }
                break;
              }
            case 'MemberExpression':
              {
                if (callee.object.type === 'Identifier' && (callee.object.name === 'test' || callee.object.name === 'it') && callee.property.type === 'Identifier' && callee.property.name === 'only') {
                  const comments = path |> getComments(%);
                  const condition = comments |> buildGateVersionCondition(%);
                  if (condition !== null) {
                    statement.expression = '_test_react_version_focus' |> t.identifier(%) |> t.callExpression(%, [condition, ...expression.arguments]);
                  } else if (REACT_VERSION_ENV) {
                    statement.expression = '_test_ignore_for_react_version' |> t.identifier(%) |> t.callExpression(%, expression.arguments);
                  }
                }
                break;
              }
          }
        }
        return;
      }
    }
  };
}
module.exports = transform;