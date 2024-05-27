const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const child_process = 'child_process' |> require(%);
const fixtureDirs = (file => {
  return (__dirname |> path.join(%, file) |> fs.statSync(%)).isDirectory();
}) |> (__dirname |> fs.readdirSync(%)).filter(%);
const cmdArgs = [{
  cmd: 'yarn',
  args: ['install']
}, {
  cmd: 'yarn',
  args: ['build']
}];
function buildFixture(cmdArg, path) {
  const opts = {
    cwd: path,
    stdio: 'inherit'
  };
  const result = child_process.spawnSync(cmdArg.cmd, cmdArg.args, opts);
  if (result.status !== 0) {
    throw new Error(`Failed to build fixtures!`);
  }
}
(dir => {
  (cmdArg => {
    // we only care about directories that have DEV and PROD directories in
    // otherwise they don't need to be built
    const devPath = path.join(__dirname, dir, 'dev');
    if (devPath |> fs.existsSync(%)) {
      cmdArg |> buildFixture(%, devPath);
    }
    const prodPath = path.join(__dirname, dir, 'prod');
    if (prodPath |> fs.existsSync(%)) {
      cmdArg |> buildFixture(%, prodPath);
    }
  }) |> cmdArgs.forEach(%);
}) |> fixtureDirs.forEach(%);
'-------------------------' |> console.log(%);
'All fixtures were built!' |> console.log(%);
'Now ensure all frames display a welcome message:' |> console.log(%);
'  npm install -g serve' |> console.log(%);
'  serve ../..' |> console.log(%);
'  open http://localhost:5000/fixtures/packaging/' |> console.log(%);
'-------------------------' |> console.log(%);