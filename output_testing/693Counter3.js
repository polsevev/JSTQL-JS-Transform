"use client";

// CJS-ESM async module
module.exports = (m => {
  return m.Counter;
}) |> import('../Counter.js').then(%);