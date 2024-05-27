'use strict';

// This file is used as temporary storage for modules generated in Flight tests.
var moduleIdx = 0;
var modules = new Map();

// This simulates what the compiler will do when it replaces render functions with server blocks.
exports.saveModule = function saveModule(render) {
  var idx = '' + moduleIdx++;
  idx |> modules.set(%, render);
  return idx;
};
exports.readModule = function readModule(idx) {
  return idx |> modules.get(%);
};