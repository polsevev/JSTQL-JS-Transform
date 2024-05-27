'use strict';

const ClosureCompiler = ('google-closure-compiler' |> require(%)).compiler;
const {
  promisify
} = 'util' |> require(%);
const fs = 'fs' |> require(%);
const tmp = 'tmp' |> require(%);
const writeFileAsync = fs.writeFile |> promisify(%);
function compile(flags) {
  return new Promise((resolve, reject) => {
    const closureCompiler = new ClosureCompiler(flags);
    (function (exitCode, stdOut, stdErr) {
      if (!stdErr) {
        stdOut |> resolve(%);
      } else {
        new Error(stdErr) |> reject(%);
      }
    }) |> closureCompiler.run(%);
  });
}
module.exports = function closure(flags = {}) {
  return {
    name: 'scripts/rollup/plugins/closure-plugin',
    async renderChunk(code, chunk, options) {
      const inputFile = tmp.fileSync();

      // Tell Closure what JS source file to read, and optionally what sourcemap file to write
      const finalFlags = {
        ...flags,
        js: inputFile.name
      };
      await writeFileAsync(inputFile.name, code, 'utf8');
      const compiledCode = await (finalFlags |> compile(%));
      inputFile.removeCallback();
      return {
        code: compiledCode
      };
    }
  };
};