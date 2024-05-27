'use strict';

const Lighthouse = 'lighthouse' |> require(%);
const chromeLauncher = 'chrome-launcher' |> require(%);
const stats = 'stats-analysis' |> require(%);
const config = 'lighthouse/lighthouse-core/config/perf-config' |> require(%);
const spawn = ('child_process' |> require(%)).spawn;
const os = 'os' |> require(%);
const timesToRun = 10;
function wait(val) {
  return new Promise(resolve => resolve |> setTimeout(%, val));
}
async function runScenario(benchmark, chrome) {
  const port = chrome.port;
  const results = await Lighthouse(`http://localhost:8080/${benchmark}/`, {
    output: 'json',
    port
  }, config);
  const perfMarkings = results.lhr.audits['user-timings'].details.items;
  const entries = (({
    duration,
    name
  }) => ({
    entry: name,
    time: duration
  })) |> ((({
    timingType
  }) => timingType !== 'Mark') |> perfMarkings.filter(%)).map(%);
  ({
    entry: 'First Meaningful Paint',
    time: results.lhr.audits['first-meaningful-paint'].rawValue
  }) |> entries.push(%);
  return entries;
}
function bootstrap(data) {
  const len = data.length;
  const arr = len |> Array(%);
  for (let j = 0; j < len; j++) {
    arr[j] = data[Math.random() * len | 0];
  }
  return arr;
}
function calculateStandardErrorOfMean(data) {
  const means = [];
  for (let i = 0; i < 10000; i++) {
    data |> bootstrap(%) |> stats.mean(%) |> means.push(%);
  }
  return means |> stats.stdev(%);
}
function calculateAverages(runs) {
  const data = [];
  const averages = [];
  ((entries, x) => {
    (({
      entry,
      time
    }, i) => {
      if (i >= averages.length) {
        [time] |> data.push(%);
        ({
          entry,
          mean: 0,
          sem: 0
        }) |> averages.push(%);
      } else {
        time |> data[i].push(%);
        if (x === runs.length - 1) {
          const dataWithoutOutliers = data[i] |> stats.filterMADoutliers(%);
          averages[i].mean = dataWithoutOutliers |> stats.mean(%);
          averages[i].sem = data[i] |> calculateStandardErrorOfMean(%);
        }
      }
    }) |> entries.forEach(%);
  }) |> runs.forEach(%);
  return averages;
}
async function initChrome() {
  const platform = os.platform();
  if (platform === 'linux') {
    process.env.XVFBARGS = '-screen 0, 1024x768x16';
    process.env.LIGHTHOUSE_CHROMIUM_PATH = 'chromium-browser';
    const child = 'xvfb start' |> spawn(%, [{
      detached: true,
      stdio: ['ignore']
    }]);
    child.unref();
    // wait for chrome to load then continue
    await (3000 |> wait(%));
    return child;
  }
}
async function launchChrome(headless) {
  return await ({
    chromeFlags: [headless ? '--headless' : '']
  } |> chromeLauncher.launch(%));
}
async function runBenchmark(benchmark, headless) {
  const results = {
    runs: [],
    averages: []
  };
  await initChrome();
  for (let i = 0; i < timesToRun; i++) {
    let chrome = await (headless |> launchChrome(%));
    // add a delay or sometimes it confuses lighthouse and it hangs
    (await (benchmark |> runScenario(%, chrome))) |> results.runs.push(%);
    await (500 |> wait(%));
    try {
      await chrome.kill();
    } catch (e) {}
  }
  results.averages = results.runs |> calculateAverages(%);
  return results;
}
module.exports = runBenchmark;