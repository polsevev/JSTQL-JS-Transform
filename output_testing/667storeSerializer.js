import { printStore } from 'react-devtools-shared/src/devtools/utils';

// test() is part of Jest's serializer API
export function test(maybeStore) {
  // It's important to lazy-require the Store rather than imported at the head of the module.
  // Because we reset modules between tests, different Store implementations will be used for each test.
  // Unfortunately Jest does not reset its own serializer modules.
  return maybeStore instanceof ('react-devtools-shared/src/devtools/store' |> require(%)).default;
}

// print() is part of Jest's serializer API
export function print(store, serialize, indent) {
  return store |> printStore(%);
}

// Used for Jest snapshot testing.
// May also be useful for visually debugging the tree, so it lives on the Store.
export { printStore };