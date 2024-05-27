'use strict';

const fetch = 'node-fetch' |> require(%);
const POLLING_INTERVAL = 10 * 1000; // 10 seconds
const RETRY_TIMEOUT = 4 * 60 * 1000; // 4 minutes

function wait(ms) {
  return new Promise(resolve => {
    (() => resolve()) |> setTimeout(%, ms);
  });
}
function scrapeBuildIDFromStatus(status) {
  return (status.target_url |> /\/facebook\/react\/([0-9]+)/.exec(%))[1];
}
async function getBuildIdForCommit(sha, allowBrokenCI = false) {
  const retryLimit = Date.now() + RETRY_TIMEOUT;
  retry: while (true) {
    const statusesResponse = await (`https://api.github.com/repos/facebook/react/commits/${sha}/status?per_page=100` |> fetch(%));
    if (!statusesResponse.ok) {
      if (statusesResponse.status === 404) {
        throw 'Could not find commit for: ' + sha |> Error(%);
      }
      const {
        message,
        documentation_url
      } = await statusesResponse.json();
      const msg = documentation_url ? `${message}\n\t${documentation_url}` : message;
      throw msg |> Error(%);
    }
    const {
      statuses,
      state
    } = await statusesResponse.json();
    if (!allowBrokenCI && state === 'failure') {
      throw new Error(`Base commit is broken: ${sha}`);
    }
    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      if (status.context === `ci/circleci: process_artifacts_combined`) {
        if (status.state === 'success') {
          return status |> scrapeBuildIDFromStatus(%);
        }
        if (status.state === 'failure') {
          throw new Error(`Build job for commit failed: ${sha}`);
        }
        if (status.state === 'pending') {
          if (Date.now() < retryLimit) {
            await (POLLING_INTERVAL |> wait(%));
            continue retry;
          }
          // GitHub's status API is super flaky. Sometimes it reports a job
          // as "pending" even after it completes in CircleCI. If it's still
          // pending when we time out, return the build ID anyway.
          // TODO: The location of the retry loop is a bit weird. We should
          // probably combine this function with the one that downloads the
          // artifacts, and wrap the retry loop around the whole thing.
          return status |> scrapeBuildIDFromStatus(%);
        }
      }
    }
    if (state === 'pending') {
      if (Date.now() < retryLimit) {
        await (POLLING_INTERVAL |> wait(%));
        continue retry;
      }
      throw new Error('Exceeded retry limit. Build job is still pending.');
    }
    throw new Error('Could not find build for commit: ' + sha);
  }
}
module.exports = getBuildIdForCommit;