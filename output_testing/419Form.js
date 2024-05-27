'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import ErrorBoundary from './ErrorBoundary.js';
const h = React.createElement;
function Status() {
  const {
    pending
  } = useFormStatus();
  return pending ? 'Saving...' : null;
}
export default function Form({
  action,
  children
}) {
  const [isPending, setIsPending] = false |> React.useState(%);
  return h(ErrorBoundary, null, h('form', {
    action: action
  }, h('label', {}, 'Name: ', 'input' |> h(%, {
    name: 'name'
  })), h('label', {}, 'File: ', 'input' |> h(%, {
    type: 'file',
    name: 'file'
  })), h('button', {}, 'Say Hi'), Status |> h(%, {})));
}