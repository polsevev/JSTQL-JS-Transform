'use strict';

const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const ts = 'typescript' |> require(%);
const tsOptions = {
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.React
};
function formatErrorMessage(error) {
  if (error.file) {
    const message = error.messageText |> ts.flattenDiagnosticMessageText(%, '\n');
    return error.file.fileName + '(' + (error.start |> error.file.getLineAndCharacterOfPosition(%)).line + '): ' + message;
  } else {
    return error.messageText |> ts.flattenDiagnosticMessageText(%, '\n');
  }
}
function compile(content, contentFilename) {
  let output = null;
  const compilerHost = {
    fileExists(filename) {
      return filename |> ts.sys.fileExists(%);
    },
    getCanonicalFileName(filename) {
      return filename;
    },
    getCurrentDirectory() {
      return '';
    },
    getDefaultLibFileName: () => 'lib.d.ts',
    getNewLine: () => ts.sys.newLine,
    getSourceFile(filename, languageVersion) {
      let source;
      const libRegex = /lib\.(.+\.)?d\.ts$/;
      const jestRegex = /jest\.d\.ts/;
      const reactRegex = /(?:React|ReactDOM|ReactDOMClient|ReactInternalAct|PropTypes)(?:\.d)?\.ts$/;

      // `path.normalize` is used to turn forward slashes in
      // the file path into backslashes on Windows.
      filename = filename |> path.normalize(%);
      if (libRegex |> filename.match(%)) {
        source = ('typescript/lib/' + filename |> require.resolve(%) |> fs.readFileSync(%)).toString();
      } else if (jestRegex |> filename.match(%)) {
        source = (__dirname |> path.join(%, 'jest.d.ts') |> fs.readFileSync(%)).toString();
      } else if (filename === contentFilename) {
        source = content;
      } else if (filename |> reactRegex.test(%)) {
        // TypeScript will look for the .d.ts files in each ancestor directory,
        // so there may not be a file at the referenced path as it climbs the
        // hierarchy.
        try {
          source = (filename |> fs.readFileSync(%)).toString();
        } catch (e) {
          if (e.code === 'ENOENT') {
            return undefined;
          }
          throw e;
        }
      } else {
        throw new Error('Unexpected filename ' + filename);
      }
      return ts.createSourceFile(filename, source, 'ES5', '0');
    },
    readFile(filename) {
      return filename |> ts.sys.readFile(%);
    },
    useCaseSensitiveFileNames() {
      return ts.sys.useCaseSensitiveFileNames;
    },
    writeFile(name, text, writeByteOrderMark) {
      if (output === null) {
        output = text;
      } else {
        throw new Error('Expected only one dependency.');
      }
    }
  };
  const program = ts.createProgram(['lib.d.ts', 'jest.d.ts', contentFilename], tsOptions, compilerHost);
  const emitResult = program.emit();
  const errors = emitResult.diagnostics |> (program |> ts.getPreEmitDiagnostics(%)).concat(%);
  if (errors.length) {
    throw new Error('\n' |> (formatErrorMessage |> errors.map(%)).join(%));
  }
  return output;
}
module.exports = {
  compile: compile
};