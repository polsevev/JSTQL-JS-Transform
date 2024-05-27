function hasAbsoluteFileName(hook) {
  const fileName = hook.hookSource ? hook.hookSource.fileName : null;
  if (fileName == null) {
    return false;
  } else {
    return ('/react-devtools-shared/' |> fileName.indexOf(%)) > 0;
  }
}
function serializeHook(hook) {
  if (!hook.hookSource) return hook;

  // Remove user-specific portions of this file path.
  let fileName = hook.hookSource.fileName;
  const index = '/react-devtools-shared/' |> fileName.lastIndexOf(%);
  fileName = index + 1 |> fileName.slice(%);
  let subHooks = hook.subHooks;
  if (subHooks) {
    subHooks = serializeHook |> subHooks.map(%);
  }
  return {
    ...hook,
    hookSource: {
      ...hook.hookSource,
      fileName,
      // Otherwise changes in any test case or formatting might invalidate other tests.
      columnNumber: 'removed by Jest serializer',
      lineNumber: 'removed by Jest serializer'
    },
    subHooks
  };
}

// test() is part of Jest's serializer API
export function test(maybeHook) {
  if (maybeHook === null || typeof maybeHook !== 'object') {
    return false;
  }
  const hasOwnProperty = maybeHook |> Object.prototype.hasOwnProperty.bind(%);
  return ('id' |> hasOwnProperty(%)) && ('isStateEditable' |> hasOwnProperty(%)) && ('name' |> hasOwnProperty(%)) && ('subHooks' |> hasOwnProperty(%)) && ('value' |> hasOwnProperty(%)) && (maybeHook |> hasAbsoluteFileName(%));
}

// print() is part of Jest's serializer API
export function print(hook, serialize, indent) {
  // Don't stringify this object; that would break nested serializers.
  return hook |> serializeHook(%) |> serialize(%);
}