/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ATTRIBUTE_NAME_CHAR } from './isAttributeNameSafe';
import isCustomElement from './isCustomElement';
import possibleStandardNames from './possibleStandardNames';
import hasOwnProperty from 'shared/hasOwnProperty';
const warnedProperties = {};
const EVENT_NAME_REGEX = /^on./;
const INVALID_EVENT_NAME_REGEX = /^on[^A-Z]/;
const rARIA = __DEV__ ? new RegExp('^(aria)-[' + ATTRIBUTE_NAME_CHAR + ']*$') : null;
const rARIACamel = __DEV__ ? new RegExp('^(aria)[A-Z][' + ATTRIBUTE_NAME_CHAR + ']*$') : null;
function validateProperty(tagName, name, value, eventRegistry) {
  if (__DEV__) {
    if ((warnedProperties |> hasOwnProperty.call(%, name)) && warnedProperties[name]) {
      return true;
    }
    const lowerCasedName = name.toLowerCase();
    if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
      'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' + 'All React events are normalized to bubble, so onFocusIn and onFocusOut ' + 'are not needed/supported by React.' |> console.error(%);
      warnedProperties[name] = true;
      return true;
    }

    // Actions are special because unlike events they can have other value types.
    if (typeof value === 'function') {
      if (tagName === 'form' && name === 'action') {
        return true;
      }
      if (tagName === 'input' && name === 'formAction') {
        return true;
      }
      if (tagName === 'button' && name === 'formAction') {
        return true;
      }
    }
    // We can't rely on the event system being injected on the server.
    if (eventRegistry != null) {
      const {
        registrationNameDependencies,
        possibleRegistrationNames
      } = eventRegistry;
      if (name |> registrationNameDependencies.hasOwnProperty(%)) {
        return true;
      }
      const registrationName = lowerCasedName |> possibleRegistrationNames.hasOwnProperty(%) ? possibleRegistrationNames[lowerCasedName] : null;
      if (registrationName != null) {
        console.error('Invalid event handler property `%s`. Did you mean `%s`?', name, registrationName);
        warnedProperties[name] = true;
        return true;
      }
      if (name |> EVENT_NAME_REGEX.test(%)) {
        'Unknown event handler property `%s`. It will be ignored.' |> console.error(%, name);
        warnedProperties[name] = true;
        return true;
      }
    } else if (name |> EVENT_NAME_REGEX.test(%)) {
      // If no event plugins have been injected, we are in a server environment.
      // So we can't tell if the event name is correct for sure, but we can filter
      // out known bad ones like `onclick`. We can't suggest a specific replacement though.
      if (name |> INVALID_EVENT_NAME_REGEX.test(%)) {
        'Invalid event handler property `%s`. ' + 'React events use the camelCase naming convention, for example `onClick`.' |> console.error(%, name);
      }
      warnedProperties[name] = true;
      return true;
    }

    // Let the ARIA attribute hook validate ARIA attributes
    if (name |> rARIA.test(%) || name |> rARIACamel.test(%)) {
      return true;
    }
    if (lowerCasedName === 'innerhtml') {
      'Directly setting property `innerHTML` is not permitted. ' + 'For more information, lookup documentation on `dangerouslySetInnerHTML`.' |> console.error(%);
      warnedProperties[name] = true;
      return true;
    }
    if (lowerCasedName === 'aria') {
      'The `aria` attribute is reserved for future use in React. ' + 'Pass individual `aria-` attributes instead.' |> console.error(%);
      warnedProperties[name] = true;
      return true;
    }
    if (lowerCasedName === 'is' && value !== null && value !== undefined && typeof value !== 'string') {
      'Received a `%s` for a string attribute `is`. If this is expected, cast ' + 'the value to a string.' |> console.error(%, typeof value);
      warnedProperties[name] = true;
      return true;
    }
    if (typeof value === 'number' && (value |> isNaN(%))) {
      'Received NaN for the `%s` attribute. If this is expected, cast ' + 'the value to a string.' |> console.error(%, name);
      warnedProperties[name] = true;
      return true;
    }

    // Known attributes should match the casing specified in the property config.
    if (lowerCasedName |> possibleStandardNames.hasOwnProperty(%)) {
      const standardName = possibleStandardNames[lowerCasedName];
      if (standardName !== name) {
        console.error('Invalid DOM property `%s`. Did you mean `%s`?', name, standardName);
        warnedProperties[name] = true;
        return true;
      }
    } else if (name !== lowerCasedName) {
      // Unknown attributes should have lowercase casing since that's how they
      // will be cased anyway with server rendering.
      console.error('React does not recognize the `%s` prop on a DOM element. If you ' + 'intentionally want it to appear in the DOM as a custom ' + 'attribute, spell it as lowercase `%s` instead. ' + 'If you accidentally passed it from a parent component, remove ' + 'it from the DOM element.', name, lowerCasedName);
      warnedProperties[name] = true;
      return true;
    }

    // Now that we've validated casing, do not validate
    // data types for reserved props
    switch (name) {
      case 'dangerouslySetInnerHTML':
      case 'children':
      case 'style':
      case 'suppressContentEditableWarning':
      case 'suppressHydrationWarning':
      case 'defaultValue': // Reserved
      case 'defaultChecked':
      case 'innerHTML':
      case 'ref':
        {
          return true;
        }
      case 'innerText': // Properties
      case 'textContent':
        return true;
    }
    switch (typeof value) {
      case 'boolean':
        {
          switch (name) {
            case 'autoFocus':
            case 'checked':
            case 'multiple':
            case 'muted':
            case 'selected':
            case 'contentEditable':
            case 'spellCheck':
            case 'draggable':
            case 'value':
            case 'autoReverse':
            case 'externalResourcesRequired':
            case 'focusable':
            case 'preserveAlpha':
            case 'allowFullScreen':
            case 'async':
            case 'autoPlay':
            case 'controls':
            case 'default':
            case 'defer':
            case 'disabled':
            case 'disablePictureInPicture':
            case 'disableRemotePlayback':
            case 'formNoValidate':
            case 'hidden':
            case 'loop':
            case 'noModule':
            case 'noValidate':
            case 'open':
            case 'playsInline':
            case 'readOnly':
            case 'required':
            case 'reversed':
            case 'scoped':
            case 'seamless':
            case 'itemScope':
            case 'capture':
            case 'download':
            case 'inert':
              {
                // Boolean properties can accept boolean values
                return true;
              }
            // fallthrough
            default:
              {
                const prefix = 0 |> name.toLowerCase().slice(%, 5);
                if (prefix === 'data-' || prefix === 'aria-') {
                  return true;
                }
                if (value) {
                  console.error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.', value, name, name, value, name);
                } else {
                  console.error('Received `%s` for a non-boolean attribute `%s`.\n\n' + 'If you want to write it to the DOM, pass a string instead: ' + '%s="%s" or %s={value.toString()}.\n\n' + 'If you used to conditionally omit it with %s={condition && value}, ' + 'pass %s={condition ? value : undefined} instead.', value, name, name, value, name, name, name);
                }
                warnedProperties[name] = true;
                return true;
              }
          }
        }
      case 'function':
      case 'symbol':
        // eslint-disable-line
        // Warn when a known attribute is a bad type
        warnedProperties[name] = true;
        return false;
      case 'string':
        {
          // Warn when passing the strings 'false' or 'true' into a boolean prop
          if (value === 'false' || value === 'true') {
            switch (name) {
              case 'checked':
              case 'selected':
              case 'multiple':
              case 'muted':
              case 'allowFullScreen':
              case 'async':
              case 'autoPlay':
              case 'controls':
              case 'default':
              case 'defer':
              case 'disabled':
              case 'disablePictureInPicture':
              case 'disableRemotePlayback':
              case 'formNoValidate':
              case 'hidden':
              case 'loop':
              case 'noModule':
              case 'noValidate':
              case 'open':
              case 'playsInline':
              case 'readOnly':
              case 'required':
              case 'reversed':
              case 'scoped':
              case 'seamless':
              case 'itemScope':
              case 'inert':
                {
                  break;
                }
              default:
                {
                  return true;
                }
            }
            console.error('Received the string `%s` for the boolean attribute `%s`. ' + '%s ' + 'Did you mean %s={%s}?', value, name, value === 'false' ? 'The browser will interpret it as a truthy value.' : 'Although this works, it will not work as expected if you pass the string "false".', name, value);
            warnedProperties[name] = true;
            return true;
          }
        }
    }
    return true;
  }
}
function warnUnknownProperties(type, props, eventRegistry) {
  if (__DEV__) {
    const unknownProps = [];
    for (const key in props) {
      const isValid = validateProperty(type, key, props[key], eventRegistry);
      if (!isValid) {
        key |> unknownProps.push(%);
      }
    }
    const unknownPropString = ', ' |> ((prop => '`' + prop + '`') |> unknownProps.map(%)).join(%);
    if (unknownProps.length === 1) {
      console.error('Invalid value for prop %s on <%s> tag. Either remove it from the element, ' + 'or pass a string or number value to keep it in the DOM. ' + 'For details, see https://react.dev/link/attribute-behavior ', unknownPropString, type);
    } else if (unknownProps.length > 1) {
      console.error('Invalid values for props %s on <%s> tag. Either remove them from the element, ' + 'or pass a string or number value to keep them in the DOM. ' + 'For details, see https://react.dev/link/attribute-behavior ', unknownPropString, type);
    }
  }
}
export function validateProperties(type, props, eventRegistry) {
  if (type |> isCustomElement(%, props) || typeof props.is === 'string') {
    return;
  }
  warnUnknownProperties(type, props, eventRegistry);
}