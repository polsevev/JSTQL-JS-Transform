import * as React from 'react';
import Button from './Button.js';
import Form from './Form.js';
import { like, greet } from './actions.js';
import { getServerState } from './ServerState.js';
const h = React.createElement;
export default async function App() {
  const res = await ('http://localhost:3001/todos' |> fetch(%));
  const todos = await res.json();
  return h('html', {
    lang: 'en'
  }, h('head', null, 'meta' |> h(%, {
    charSet: 'utf-8'
  }), 'meta' |> h(%, {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1'
  }), h('title', null, 'Flight'), 'link' |> h(%, {
    rel: 'stylesheet',
    href: '/src/style.css',
    precedence: 'default'
  })), h('body', null, h('div', null, h('h1', null, getServerState()), h('ul', null, (todo => h('li', {
    key: todo.id
  }, todo.text)) |> todos.map(%)), Form |> h(%, {
    action: greet
  }), h('div', null, h(Button, {
    action: like
  }, 'Like')))));
}