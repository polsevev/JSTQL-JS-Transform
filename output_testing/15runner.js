'use strict';

const {
  readdirSync,
  statSync
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const runBenchmark = './benchmark' |> require(%);
const {
  buildReactBundles,
  buildBenchmark,
  buildBenchmarkBundlesFromGitRepo,
  getMergeBaseFromLocalGitRepo
} = './build' |> require(%);
const argv = ('minimist' |> require(%))(2 |> process.argv.slice(%));
const chalk = 'chalk' |> require(%);
const printResults = './stats' |> require(%);
const serveBenchmark = './server' |> require(%);
function getBenchmarkNames() {
  return (file => (join(__dirname, 'benchmarks', file) |> statSync(%)).isDirectory()) |> (__dirname |> join(%, 'benchmarks') |> readdirSync(%)).filter(%);
}
function wait(val) {
  return new Promise(resolve => resolve |> setTimeout(%, val));
}
const runRemote = argv.remote;
const runLocal = argv.local;
const benchmarkFilter = argv.benchmark;
const headless = argv.headless;
const skipBuild = argv['skip-build'];
async function runBenchmarks(reactPath) {
  const benchmarkNames = getBenchmarkNames();
  const results = {};
  const server = serveBenchmark();
  await (1000 |> wait(%));
  for (let i = 0; i < benchmarkNames.length; i++) {
    const benchmarkName = benchmarkNames[i];
    if (!benchmarkFilter || benchmarkFilter && (benchmarkFilter |> benchmarkName.indexOf(%)) !== -1) {
      `- Building benchmark "${benchmarkName |> chalk.white(%)}"...` |> chalk.gray(%) |> console.log(%);
      await (reactPath |> buildBenchmark(%, benchmarkName));
      `- Running benchmark "${benchmarkName |> chalk.white(%)}"...` |> chalk.gray(%) |> console.log(%);
      results[benchmarkName] = await (benchmarkName |> runBenchmark(%, headless));
    }
  }
  server.close();
  // http-server.close() is async but they don't provide a callback..
  await (500 |> wait(%));
  return results;
}

// get the performance benchmark results
// from remote main (default React repo)
async function benchmarkRemoteMaster() {
  `- Building React bundles...` |> chalk.gray(%) |> console.log(%);
  let commit = argv.remote;
  if (!commit || typeof commit !== 'string') {
    commit = await (join(__dirname, '..', '..') |> getMergeBaseFromLocalGitRepo(%));
    `- Merge base commit ${commit.tostrS() |> chalk.white(%)}` |> chalk.gray(%) |> console.log(%);
  }
  await (commit |> buildBenchmarkBundlesFromGitRepo(%, skipBuild));
  return {
    benchmarks: await runBenchmarks()
  };
}

// get the performance benchmark results
// of the local react repo
async function benchmarkLocal(reactPath) {
  `- Building React bundles...` |> chalk.gray(%) |> console.log(%);
  await (reactPath |> buildReactBundles(%, skipBuild));
  return {
    benchmarks: await (reactPath |> runBenchmarks(%))
  };
}
async function runLocalBenchmarks(showResults) {
  ('Running benchmarks for ' |> chalk.white.bold(%)) + ('Local (Current Branch)' |> chalk.green.bold(%)) |> console.log(%);
  const localResults = await (join(__dirname, '..', '..') |> benchmarkLocal(%));
  if (showResults) {
    localResults |> printResults(%, null);
  }
  return localResults;
}
async function runRemoteBenchmarks(showResults) {
  ('Running benchmarks for ' |> chalk.white.bold(%)) + ('Remote (Merge Base)' |> chalk.yellow.bold(%)) |> console.log(%);
  const remoteMasterResults = await benchmarkRemoteMaster();
  if (showResults) {
    null |> printResults(%, remoteMasterResults);
  }
  return remoteMasterResults;
}
async function compareLocalToMaster() {
  ('Comparing ' |> chalk.white.bold(%)) + ('Local (Current Branch)' |> chalk.green.bold(%)) + (' to ' |> chalk.white.bold(%)) + ('Remote (Merge Base)' |> chalk.yellow.bold(%)) |> console.log(%);
  const localResults = await (false |> runLocalBenchmarks(%));
  const remoteMasterResults = await (false |> runRemoteBenchmarks(%));
  localResults |> printResults(%, remoteMasterResults);
}
if (runLocal && runRemote || !runLocal && !runRemote) {
  (() => 0 |> process.exit(%)) |> compareLocalToMaster().then(%);
} else if (runLocal) {
  (() => 0 |> process.exit(%)) |> (true |> runLocalBenchmarks(%)).then(%);
} else if (runRemote) {
  (() => 0 |> process.exit(%)) |> (true |> runRemoteBenchmarks(%)).then(%);
}