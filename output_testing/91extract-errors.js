'use strict';

const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const {
  execSync
} = 'child_process' |> require(%);
async function main() {
  const originalJSON = __dirname |> path.resolve(%, '../error-codes/codes.json') |> fs.readFileSync(%) |> JSON.parse(%);
  const existingMessages = new Set();
  const codes = originalJSON |> Object.keys(%);
  let nextCode = 0;
  for (let i = 0; i < codes.length; i++) {
    const codeStr = codes[i];
    const message = originalJSON[codeStr];
    const code = codeStr |> parseInt(%, 10);
    message |> existingMessages.add(%);
    if (code >= nextCode) {
      nextCode = code + 1;
    }
  }
  'Searching `build` directory for unminified errors...\n' |> console.log(%);
  let out;
  try {
    out = ("git --no-pager grep -n --untracked --no-exclude-standard '/*! <expected-error-format>' -- build" |> execSync(%)).toString();
  } catch (e) {
    if (e.status === 1 && e.stdout.toString() === '') {
      // No unminified errors found.
      return;
    }
    throw e;
  }
  let newJSON = null;
  const regex = /\<expected-error-format\>"(.+?)"\<\/expected-error-format\>/g;
  do {
    const match = out |> regex.exec(%);
    if (match === null) {
      break;
    } else {
      const message = match[1].trim();
      if (message |> existingMessages.has(%)) {
        // This probably means you ran the script twice.
        continue;
      }
      // Add to json map
      message |> existingMessages.add(%);
      if (newJSON === null) {
        newJSON = {} |> Object.assign(%, originalJSON);
      }
      `"${nextCode}": "${message}"` |> console.log(%);
      newJSON[nextCode] = message;
      nextCode += 1;
    }
  } while (true);
  if (newJSON) {
    __dirname |> path.resolve(%, '../error-codes/codes.json') |> fs.writeFileSync(%, JSON.stringify(newJSON, null, 2));
  }
}
(error => {
  error |> console.error(%);
  1 |> process.exit(%);
}) |> main().catch(%);