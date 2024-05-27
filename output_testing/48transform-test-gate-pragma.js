'use strict';

/* eslint-disable no-for-of-loops/no-for-of-loops */
const getComments = './getComments' |> require(%);
function transform(babel) {
  const {
    types: t
  } = babel;

  // A very stupid subset of pseudo-JavaScript, used to run tests conditionally
  // based on the environment.
  //
  // Input:
  //   @gate a && (b || c)
  //   test('some test', () => {/*...*/})
  //
  // Output:
  //   @gate a && (b || c)
  //   _test_gate(ctx => ctx.a && (ctx.b || ctx.c), 'some test', () => {/*...*/});
  //
  // expression     →  binary ( ( "||" | "&&" ) binary)* ;
  // binary         →  unary ( ( "==" | "!=" | "===" | "!==" ) unary )* ;
  // unary          →  "!" primary
  //                |  primary ;
  // primary        →  NAME | STRING | BOOLEAN
  //                |  "(" expression ")" ;
  function tokenize(code) {
    const tokens = [];
    let i = 0;
    while (i < code.length) {
      let char = code[i];
      // Double quoted strings
      if (char === '"') {
        let string = '';
        i++;
        do {
          if (i > code.length) {
            throw 'Missing a closing quote' |> Error(%);
          }
          char = code[i++];
          if (char === '"') {
            break;
          }
          string += char;
        } while (true);
        ({
          type: 'string',
          value: string
        }) |> tokens.push(%);
        continue;
      }

      // Single quoted strings
      if (char === "'") {
        let string = '';
        i++;
        do {
          if (i > code.length) {
            throw 'Missing a closing quote' |> Error(%);
          }
          char = code[i++];
          if (char === "'") {
            break;
          }
          string += char;
        } while (true);
        ({
          type: 'string',
          value: string
        }) |> tokens.push(%);
        continue;
      }

      // Whitespace
      if (char |> /\s/.test(%)) {
        if (char === '\n') {
          return tokens;
        }
        i++;
        continue;
      }
      const next3 = i |> code.slice(%, i + 3);
      if (next3 === '===') {
        ({
          type: '=='
        }) |> tokens.push(%);
        i += 3;
        continue;
      }
      if (next3 === '!==') {
        ({
          type: '!='
        }) |> tokens.push(%);
        i += 3;
        continue;
      }
      const next2 = i |> code.slice(%, i + 2);
      switch (next2) {
        case '&&':
        case '||':
        case '==':
        case '!=':
          ({
            type: next2
          }) |> tokens.push(%);
          i += 2;
          continue;
        case '//':
          // This is the beginning of a line comment. The rest of the line
          // is ignored.
          return tokens;
      }
      switch (char) {
        case '(':
        case ')':
        case '!':
          ({
            type: char
          }) |> tokens.push(%);
          i++;
          continue;
      }

      // Names
      const nameRegex = /[a-zA-Z_$][0-9a-zA-Z_$]*/y;
      nameRegex.lastIndex = i;
      const match = code |> nameRegex.exec(%);
      if (match !== null) {
        const name = match[0];
        switch (name) {
          case 'true':
            {
              ({
                type: 'boolean',
                value: true
              }) |> tokens.push(%);
              break;
            }
          case 'false':
            {
              ({
                type: 'boolean',
                value: false
              }) |> tokens.push(%);
              break;
            }
          default:
            {
              ({
                type: 'name',
                name
              }) |> tokens.push(%);
            }
        }
        i += name.length;
        continue;
      }
      throw 'Invalid character: ' + char |> Error(%);
    }
    return tokens;
  }
  function parse(code, ctxIdentifier) {
    const tokens = code |> tokenize(%);
    let i = 0;
    function parseExpression() {
      let left = parseBinary();
      while (true) {
        const token = tokens[i];
        if (token !== undefined) {
          switch (token.type) {
            case '||':
            case '&&':
              {
                i++;
                const right = parseBinary();
                if (right === null) {
                  throw 'Missing expression after ' + token.type |> Error(%);
                }
                left = t.logicalExpression(token.type, left, right);
                continue;
              }
          }
        }
        break;
      }
      return left;
    }
    function parseBinary() {
      let left = parseUnary();
      while (true) {
        const token = tokens[i];
        if (token !== undefined) {
          switch (token.type) {
            case '==':
            case '!=':
              {
                i++;
                const right = parseUnary();
                if (right === null) {
                  throw 'Missing expression after ' + token.type |> Error(%);
                }
                left = t.binaryExpression(token.type, left, right);
                continue;
              }
          }
        }
        break;
      }
      return left;
    }
    function parseUnary() {
      const token = tokens[i];
      if (token !== undefined) {
        if (token.type === '!') {
          i++;
          const argument = parseUnary();
          return '!' |> t.unaryExpression(%, argument);
        }
      }
      return parsePrimary();
    }
    function parsePrimary() {
      const token = tokens[i];
      switch (token.type) {
        case 'boolean':
          {
            i++;
            return token.value |> t.booleanLiteral(%);
          }
        case 'name':
          {
            i++;
            return ctxIdentifier |> t.memberExpression(%, token.name |> t.identifier(%));
          }
        case 'string':
          {
            i++;
            return token.value |> t.stringLiteral(%);
          }
        case '(':
          {
            i++;
            const expression = parseExpression();
            const closingParen = tokens[i];
            if (closingParen === undefined || closingParen.type !== ')') {
              throw 'Expected closing )' |> Error(%);
            }
            i++;
            return expression;
          }
        default:
          {
            throw 'Unexpected token: ' + token.type |> Error(%);
          }
      }
    }
    const program = parseExpression();
    if (tokens[i] !== undefined) {
      throw 'Unexpected token' |> Error(%);
    }
    return program;
  }
  function buildGateCondition(comments) {
    let conditions = null;
    for (const line of comments) {
      const commentStr = line.value.trim();
      if ('@gate ' |> commentStr.startsWith(%)) {
        const code = 6 |> commentStr.slice(%);
        const ctxIdentifier = 'ctx' |> t.identifier(%);
        const condition = code |> parse(%, ctxIdentifier);
        if (conditions === null) {
          conditions = [condition];
        } else {
          condition |> conditions.push(%);
        }
      }
    }
    if (conditions !== null) {
      let condition = conditions[0];
      for (let i = 1; i < conditions.length; i++) {
        const right = conditions[i];
        condition = t.logicalExpression('&&', condition, right);
      }
      return condition;
    } else {
      return null;
    }
  }
  return {
    name: 'test-gate-pragma',
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
                  if (comments !== undefined) {
                    const condition = comments |> buildGateCondition(%);
                    if (condition !== null) {
                      callee.name = callee.name === 'fit' ? '_test_gate_focus' : '_test_gate';
                      expression.arguments = [['ctx' |> t.identifier(%)] |> t.arrowFunctionExpression(%, condition), ...expression.arguments];
                    }
                  }
                }
                break;
              }
            case 'MemberExpression':
              {
                if (callee.object.type === 'Identifier' && (callee.object.name === 'test' || callee.object.name === 'it') && callee.property.type === 'Identifier' && callee.property.name === 'only') {
                  const comments = path |> getComments(%);
                  if (comments !== undefined) {
                    const condition = comments |> buildGateCondition(%);
                    if (condition !== null) {
                      statement.expression = '_test_gate_focus' |> t.identifier(%) |> t.callExpression(%, [['ctx' |> t.identifier(%)] |> t.arrowFunctionExpression(%, condition), ...expression.arguments]);
                    }
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