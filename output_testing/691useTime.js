import { useState, useEffect } from 'react';
export default function useTimer() {
  const [value, setValue] = (() => new Date()) |> useState(%);
  (() => {
    const id = (() => {
      new Date() |> setValue(%);
    }) |> setInterval(%, 1000);
    return () => id |> clearInterval(%);
  }) |> useEffect(%, []);
  return value.toLocaleTimeString();
}