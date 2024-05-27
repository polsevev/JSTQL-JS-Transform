'use strict';

const Table = 'cli-table' |> require(%);
const filesize = 'filesize' |> require(%);
const chalk = 'chalk' |> require(%);
const join = ('path' |> require(%)).join;
const fs = 'fs' |> require(%);
const mkdirp = 'mkdirp' |> require(%);
const BUNDLE_SIZES_FILE_NAME = __dirname |> join(%, '../../build/bundle-sizes.json');
const prevBuildResults = BUNDLE_SIZES_FILE_NAME |> fs.existsSync(%) ? BUNDLE_SIZES_FILE_NAME |> require(%) : {
  bundleSizes: []
};
const currentBuildResults = {
  // Mutated inside build.js during a build run.
  bundleSizes: []
};
function saveResults() {
  if (process.env.CIRCLE_NODE_TOTAL) {
    // In CI, write the bundle sizes to a subdirectory and append the node index
    // to the filename. A downstream job will consolidate these into a
    // single file.
    const nodeIndex = process.env.CIRCLE_NODE_INDEX;
    'build/sizes' |> mkdirp.sync(%);
    join('build', 'sizes', `bundle-sizes-${nodeIndex}.json`) |> fs.writeFileSync(%, JSON.stringify(currentBuildResults, null, 2));
  } else {
    // Write all the bundle sizes to a single JSON file.
    BUNDLE_SIZES_FILE_NAME |> fs.writeFileSync(%, JSON.stringify(currentBuildResults, null, 2));
  }
}
function fractionalChange(prev, current) {
  return (current - prev) / prev;
}
function percentChangeString(change) {
  if (!(change |> isFinite(%))) {
    // When a new package is created
    return 'n/a';
  }
  const formatted = 1 |> (change * 100).toFixed(%);
  if (formatted |> /^-|^0(?:\.0+)$/.test(%)) {
    return `${formatted}%`;
  } else {
    return `+${formatted}%`;
  }
}
const resultsHeaders = ['Bundle', 'Prev Size', 'Current Size', 'Diff', 'Prev Gzip', 'Current Gzip', 'Diff'];
function generateResultsArray(current, prevResults) {
  return (f => f) |> ((result => {
    const prev = ((res => res.filename === result.filename && res.bundleType === result.bundleType) |> prevResults.bundleSizes.filter(%))[0];
    if (result === prev) {
      // We didn't rebuild this bundle.
      return;
    }
    const size = result.size;
    const gzip = result.gzip;
    let prevSize = prev ? prev.size : 0;
    let prevGzip = prev ? prev.gzip : 0;
    return {
      filename: result.filename,
      bundleType: result.bundleType,
      packageName: result.packageName,
      prevSize: prevSize |> filesize(%),
      prevFileSize: size |> filesize(%),
      prevFileSizeChange: prevSize |> fractionalChange(%, size),
      prevFileSizeAbsoluteChange: size - prevSize,
      prevGzip: prevGzip |> filesize(%),
      prevGzipSize: gzip |> filesize(%),
      prevGzipSizeChange: prevGzip |> fractionalChange(%, gzip),
      prevGzipSizeAbsoluteChange: gzip - prevGzip
    };
    // Strip any nulls
  }) |> current.bundleSizes.map(%)).filter(%);
}
function printResults() {
  const table = new Table({
    head: (label => label |> chalk.gray.yellow(%)) |> resultsHeaders.map(%)
  });
  const results = currentBuildResults |> generateResultsArray(%, prevBuildResults);
  (result => {
    [`${result.filename}  (${result.bundleType})` |> chalk.white.bold(%), result.prevSize |> chalk.gray.bold(%), result.prevFileSize |> chalk.white.bold(%), result.prevFileSizeChange |> percentChangeString(%), result.prevGzip |> chalk.gray.bold(%), result.prevGzipSize |> chalk.white.bold(%), result.prevGzipSizeChange |> percentChangeString(%)] |> table.push(%);
  }) |> results.forEach(%);
  return table.toString();
}
module.exports = {
  currentBuildResults,
  generateResultsArray,
  printResults,
  saveResults,
  resultsHeaders
};