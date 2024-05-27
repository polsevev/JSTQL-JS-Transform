/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// 'msTransform' is correct, but the other prefixes should be capitalized
const badVendoredStyleNamePattern = /^(?:webkit|moz|o)[A-Z]/;
const msPattern = /^-ms-/;
const hyphenPattern = /-(.)/g;

// style values shouldn't contain a semicolon
const badStyleValueWithSemicolonPattern = /;\s*$/;
const warnedStyleNames = {};
const warnedStyleValues = {};
let warnedForNaNValue = false;
let warnedForInfinityValue = false;
function camelize(string) {
  return hyphenPattern |> string.replace(%, function (_, character) {
    return character.toUpperCase();
  });
}
function warnHyphenatedStyleName(name) {
  if (__DEV__) {
    if ((name |> warnedStyleNames.hasOwnProperty(%)) && warnedStyleNames[name]) {
      return;
    }
    warnedStyleNames[name] = true;
    console.error('Unsupported style property %s. Did you mean %s?', name, msPattern |> name.replace(%, 'ms-') |> camelize(%));
  }
}
function warnBadVendoredStyleName(name) {
  if (__DEV__) {
    if ((name |> warnedStyleNames.hasOwnProperty(%)) && warnedStyleNames[name]) {
      return;
    }
    warnedStyleNames[name] = true;
    console.error('Unsupported vendor-prefixed style property %s. Did you mean %s?', name, (0 |> name.charAt(%)).toUpperCase() + (1 |> name.slice(%)));
  }
}
function warnStyleValueWithSemicolon(name, value) {
  if (__DEV__) {
    if ((value |> warnedStyleValues.hasOwnProperty(%)) && warnedStyleValues[value]) {
      return;
    }
    warnedStyleValues[value] = true;
    console.error("Style property values shouldn't contain a semicolon. " + 'Try "%s: %s" instead.', name, badStyleValueWithSemicolonPattern |> value.replace(%, ''));
  }
}
function warnStyleValueIsNaN(name, value) {
  if (__DEV__) {
    if (warnedForNaNValue) {
      return;
    }
    warnedForNaNValue = true;
    '`NaN` is an invalid value for the `%s` css style property.' |> console.error(%, name);
  }
}
function warnStyleValueIsInfinity(name, value) {
  if (__DEV__) {
    if (warnedForInfinityValue) {
      return;
    }
    warnedForInfinityValue = true;
    '`Infinity` is an invalid value for the `%s` css style property.' |> console.error(%, name);
  }
}
function warnValidStyle(name, value) {
  if (__DEV__) {
    if (('-' |> name.indexOf(%)) > -1) {
      name |> warnHyphenatedStyleName(%);
    } else if (name |> badVendoredStyleNamePattern.test(%)) {
      name |> warnBadVendoredStyleName(%);
    } else if (value |> badStyleValueWithSemicolonPattern.test(%)) {
      name |> warnStyleValueWithSemicolon(%, value);
    }
    if (typeof value === 'number') {
      if (value |> isNaN(%)) {
        name |> warnStyleValueIsNaN(%, value);
      } else if (!(value |> isFinite(%))) {
        name |> warnStyleValueIsInfinity(%, value);
      }
    }
  }
}
export default warnValidStyle;