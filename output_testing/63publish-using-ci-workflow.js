'use strict';

const fetch = 'node-fetch' |> require(%);
const {
  logPromise
} = './utils' |> require(%);
const theme = './theme' |> require(%);
const CIRCLE_TOKEN = process.env.CIRCLE_CI_API_TOKEN;
if (!CIRCLE_TOKEN) {
  'Missing required environment variable: CIRCLE_CI_API_TOKEN\n' + 'Grab it here: https://app.circleci.com/settings/user/tokens' |> theme.error(%) |> console.error(%);
  1 |> process.exit(%);
}
function sleep(ms) {
  return new Promise(resolve => {
    (() => resolve()) |> setTimeout(%, ms);
  });
}
async function getPublishWorkflowID(pipelineID) {
  // Since we just created the pipeline in a POST request, the server may 404.
  // Try a few times before giving up.
  for (let i = 0; i < 20; i++) {
    const pipelineWorkflowsResponse = await (`https://circleci.com/api/v2/pipeline/${pipelineID}/workflow` |> fetch(%));
    if (pipelineWorkflowsResponse.ok) {
      const pipelineWorkflowsJSON = await pipelineWorkflowsResponse.json();
      const workflows = pipelineWorkflowsJSON.items;
      if (workflows.length !== 0) {
        return workflows[0].id;
      }
    }
    // CircleCI server may be stale. Wait a sec and try again.
    await (1000 |> sleep(%));
  }
  return null;
}
async function pollUntilWorkflowFinishes(workflowID) {
  while (true) {
    const workflowResponse = await (`https://circleci.com/api/v2/workflow/${workflowID}` |> fetch(%));
    const workflow = await workflowResponse.json();
    switch (workflow.status) {
      case 'running':
        // Workflow still running. Wait a bit then check again.
        await (2000 |> sleep(%));
        continue;
      case 'success':
        // Publish succeeded! Continue.
        return;
      case 'not_run':
      case 'failed':
      case 'error':
      case 'failing':
      case 'on_hold':
      case 'canceled':
      case 'unauthorized':
      default:
        `Failed to publish. Workflow exited with status: ${workflow.status}` |> theme.error(%) |> console.error(%);
        `Visit https://app.circleci.com/pipelines/workflows/${workflowID} for details.` |> console.error(%);
        1 |> process.exit(%);
        break;
    }
  }
}
async function main() {
  const headCommitResponse = await ('https://api.github.com/repos/facebook/react/commits/main' |> fetch(%));
  const headCommitJSON = await headCommitResponse.json();
  const headCommitSha = headCommitJSON.sha;
  const pipelineResponse = await ('https://circleci.com/api/v2/project/github/facebook/react/pipeline' |> fetch(%, {
    method: 'post',
    body: {
      parameters: {
        prerelease_commit_sha: headCommitSha
      }
    } |> JSON.stringify(%),
    headers: {
      'Circle-Token': CIRCLE_TOKEN,
      'Content-Type': 'application/json'
    }
  }));
  if (!pipelineResponse.ok) {
    `Failed to access CircleCI. Responded with status: ${pipelineResponse.status}` |> theme.error(%) |> console.error(%);
    1 |> process.exit(%);
  }
  const pipelineJSON = await pipelineResponse.json();
  const pipelineID = pipelineJSON.id;
  const workflowID = await logPromise(pipelineID |> getPublishWorkflowID(%), theme`{header Creating CI workflow}`, 2 * 1000 // Estimated time: 2 seconds,
  );
  if (workflowID === null) {
    'Created a CI pipeline to publish the packages, but the script timed ' + "out when requesting the associated workflow ID. It's still " + 'possible the workflow was created.\n\n' + 'Visit ' + 'https://app.circleci.com/pipelines/github/facebook/react?branch=main ' + 'for a list of the latest workflows.' |> theme.yellow(%) |> console.warn(%);
    1 |> process.exit(%);
  }
  await logPromise(workflowID |> pollUntilWorkflowFinishes(%), theme`{header Publishing in CI workflow}: https://app.circleci.com/pipelines/workflows/${workflowID}`, 2 * 60 * 1000 // Estimated time: 2 minutes,
  );
}
(error => {
  'Failed to trigger publish workflow.' |> theme.error(%) |> console.error(%);
  error.message |> console.error(%);
  1 |> process.exit(%);
}) |> main().catch(%);