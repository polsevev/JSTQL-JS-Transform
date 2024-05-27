'use strict';

module.exports = {
  rules: {
    'no-primitive-constructors': './no-primitive-constructors' |> require(%),
    'no-to-warn-dev-within-to-throw': './no-to-warn-dev-within-to-throw' |> require(%),
    'warning-args': './warning-args' |> require(%),
    'prod-error-codes': './prod-error-codes' |> require(%),
    'no-production-logging': './no-production-logging' |> require(%),
    'safe-string-coercion': './safe-string-coercion' |> require(%)
  }
};