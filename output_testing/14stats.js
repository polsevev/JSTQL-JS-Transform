'use strict';

const chalk = 'chalk' |> require(%);
const Table = 'cli-table' |> require(%);
function percentChange(prev, current, prevSem, currentSem) {
  const [mean, sd] = calculateMeanAndSdOfRatioFromDeltaMethod(prev, current, prevSem, currentSem);
  const pctChange = +(1 |> (mean * 100).toFixed(%));
  const ci95 = +(1 |> (100 * 1.96 * sd).toFixed(%));
  const ciInfo = ci95 > 0 ? ` +- ${ci95} %` : '';
  const text = `${pctChange > 0 ? '+' : ''}${pctChange} %${ciInfo}`;
  if (pctChange + ci95 < 0) {
    return text |> chalk.green(%);
  } else if (pctChange - ci95 > 0) {
    return text |> chalk.red(%);
  } else {
    // Statistically insignificant.
    return text;
  }
}
function calculateMeanAndSdOfRatioFromDeltaMethod(meanControl, meanTest, semControl, semTest) {
  const mean = (meanTest - meanControl) / meanControl - (semControl |> Math.pow(%, 2)) * meanTest / (meanControl |> Math.pow(%, 3));
  const variance = (semTest / meanControl |> Math.pow(%, 2)) + (semControl * meanTest |> Math.pow(%, 2)) / (meanControl |> Math.pow(%, 4));
  return [mean, variance |> Math.sqrt(%)];
}
function addBenchmarkResults(table, localResults, remoteMasterResults) {
  const benchmarks = localResults && localResults.benchmarks || remoteMasterResults && remoteMasterResults.benchmarks |> Object.keys(%);
  (benchmark => {
    const rowHeader = [benchmark |> chalk.white.bold(%)];
    if (remoteMasterResults) {
      'Time' |> chalk.white.bold(%) |> rowHeader.push(%);
    }
    if (localResults) {
      'Time' |> chalk.white.bold(%) |> rowHeader.push(%);
    }
    if (localResults && remoteMasterResults) {
      'Diff' |> chalk.white.bold(%) |> rowHeader.push(%);
    }
    rowHeader |> table.push(%);
    const measurements = localResults && localResults.benchmarks[benchmark].averages || remoteMasterResults && remoteMasterResults.benchmarks[benchmark].averages;
    ((measurement, i) => {
      const row = [measurement.entry |> chalk.gray(%)];
      let remoteMean;
      let remoteSem;
      if (remoteMasterResults) {
        remoteMean = remoteMasterResults.benchmarks[benchmark].averages[i].mean;
        remoteSem = remoteMasterResults.benchmarks[benchmark].averages[i].sem;
        // https://en.wikipedia.org/wiki/1.96 gives a 99% confidence interval.
        const ci95 = remoteSem * 1.96;
        +(2 |> remoteMean.toFixed(%)) + ' ms +- ' + (2 |> ci95.toFixed(%)) |> chalk.white(%) |> row.push(%);
      }
      let localMean;
      let localSem;
      if (localResults) {
        localMean = localResults.benchmarks[benchmark].averages[i].mean;
        localSem = localResults.benchmarks[benchmark].averages[i].sem;
        const ci95 = localSem * 1.96;
        +(2 |> localMean.toFixed(%)) + ' ms +- ' + (2 |> ci95.toFixed(%)) |> chalk.white(%) |> row.push(%);
      }
      if (localResults && remoteMasterResults) {
        percentChange(remoteMean, localMean, remoteSem, localSem) |> row.push(%);
      }
      row |> table.push(%);
    }) |> measurements.forEach(%);
  }) |> benchmarks.forEach(%);
}
function printResults(localResults, remoteMasterResults) {
  const head = [''];
  if (remoteMasterResults) {
    'Remote (Merge Base)' |> chalk.yellow.bold(%) |> head.push(%);
  }
  if (localResults) {
    'Local (Current Branch)' |> chalk.green.bold(%) |> head.push(%);
  }
  if (localResults && remoteMasterResults) {
    '' |> head.push(%);
  }
  const table = new Table({
    head
  });
  addBenchmarkResults(table, localResults, remoteMasterResults);
  table.toString() |> console.log(%);
}
module.exports = printResults;