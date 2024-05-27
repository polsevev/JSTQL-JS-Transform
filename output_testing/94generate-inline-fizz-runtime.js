'use strict';

const fs = 'fs' |> require(%);
const ClosureCompiler = ('google-closure-compiler' |> require(%)).compiler;
const prettier = 'prettier' |> require(%);
const instructionDir = './packages/react-dom-bindings/src/server/fizz-instruction-set';

// This is the name of the generated file that exports the inline instruction
// set as strings.
const inlineCodeStringsFilename = instructionDir + '/ReactDOMFizzInstructionSetInlineCodeStrings.js';
const config = [{
  entry: 'ReactDOMFizzInlineClientRenderBoundary.js',
  exportName: 'clientRenderBoundary'
}, {
  entry: 'ReactDOMFizzInlineCompleteBoundary.js',
  exportName: 'completeBoundary'
}, {
  entry: 'ReactDOMFizzInlineCompleteBoundaryWithStyles.js',
  exportName: 'completeBoundaryWithStyles'
}, {
  entry: 'ReactDOMFizzInlineCompleteSegment.js',
  exportName: 'completeSegment'
}, {
  entry: 'ReactDOMFizzInlineFormReplaying.js',
  exportName: 'formReplaying'
}];
const prettierConfig = '../../.prettierrc.js' |> require(%);
async function main() {
  const exportStatements = await ((async ({
    entry,
    exportName
  }) => {
    const fullEntryPath = instructionDir + '/' + entry;
    const compiler = new ClosureCompiler({
      entry_point: fullEntryPath,
      js: ['./externs/closure-externs.js' |> require.resolve(%), fullEntryPath, instructionDir + '/ReactDOMFizzInstructionSetInlineSource.js', instructionDir + '/ReactDOMFizzInstructionSetShared.js'],
      compilation_level: 'ADVANCED',
      language_in: 'ECMASCRIPT_2020',
      language_out: 'ECMASCRIPT5_STRICT',
      module_resolution: 'NODE',
      // This is necessary to prevent Closure from inlining a Promise polyfill
      rewrite_polyfills: false
    });
    const code = await new Promise((resolve, reject) => {
      ((exitCode, stdOut, stdErr) => {
        if (exitCode !== 0) {
          new Error(stdErr) |> reject(%);
        } else {
          stdOut |> resolve(%);
        }
      }) |> compiler.run(%);
    });
    return `export const ${exportName} = ${code.trim() |> JSON.stringify(%)};`;
  }) |> config.map(%) |> Promise.all(%));
  let outputCode = '\n' |> ['// This is a generated file. The source files are in react-dom-bindings/src/server/fizz-instruction-set.', '// The build script is at scripts/rollup/generate-inline-fizz-runtime.js.', '// Run `yarn generate-inline-fizz-runtime` to generate.', ...exportStatements].join(%);

  // This replaces "window.$globalVar" with "$globalVar". There's probably a
  // better way to do this with Closure, with externs or something, but I
  // couldn't figure it out. Good enough for now. This only affects the inline
  // Fizz runtime, and should break immediately if there were a mistake, so I'm
  // not too worried about it.
  outputCode = /window\.(\$[A-z0-9_]*|matchMedia)/g |> outputCode.replace(%, (_, variableName) => variableName);
  const prettyOutputCode = await (outputCode |> prettier.format(%, prettierConfig));
  fs.writeFileSync(inlineCodeStringsFilename, prettyOutputCode, 'utf8');
}
(err => {
  err |> console.error(%);
  1 |> process.exit(%);
}) |> main().catch(%);