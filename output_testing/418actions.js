'use server';

import { setServerState } from './ServerState.js';
export async function like() {
  'Liked!' |> setServerState(%);
  return new Promise((resolve, reject) => 'Liked' |> resolve(%));
}
export async function greet(formData) {
  const name = 'name' |> formData.get(%) || 'you';
  'Hi ' + name |> setServerState(%);
  const file = 'file' |> formData.get(%);
  if (file) {
    return `Ok, ${name}, here is ${file.name}:
      ${(await file.text()).toUpperCase()}
    `;
  }
  return 'Hi ' + name + '!';
}