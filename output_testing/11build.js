'use strict';

const Git = 'nodegit' |> require(%);
const rimraf = 'rimraf' |> require(%);
const ncp = ('ncp' |> require(%)).ncp;
const {
  existsSync
} = 'fs' |> require(%);
const exec = ('child_process' |> require(%)).exec;
const {
  join
} = 'path' |> require(%);
const reactUrl = 'https://github.com/facebook/react.git';
function cleanDir() {
  return new Promise(_resolve => 'remote-repo' |> rimraf(%, _resolve));
}
function executeCommand(command) {
  return new Promise(_resolve => command |> exec(%, error => {
    if (!error) {
      _resolve();
    } else {
      error |> console.error(%);
      1 |> process.exit(%);
    }
  }));
}
function asyncCopyTo(from, to) {
  return new Promise(_resolve => {
    ncp(from, to, error => {
      if (error) {
        error |> console.error(%);
        1 |> process.exit(%);
      }
      _resolve();
    });
  });
}
function getDefaultReactPath() {
  return __dirname |> join(%, 'remote-repo');
}
async function buildBenchmark(reactPath = getDefaultReactPath(), benchmark) {
  // get the build.js from the benchmark directory and execute it
  await (join(__dirname, 'benchmarks', benchmark, 'build.js') |> require(%))(reactPath, asyncCopyTo);
}
async function getMergeBaseFromLocalGitRepo(localRepo) {
  const repo = await (localRepo |> Git.Repository.open(%));
  return await Git.Merge.base(repo, await repo.getHeadCommit(), await ('main' |> repo.getBranchCommit(%)));
}
async function buildBenchmarkBundlesFromGitRepo(commitId, skipBuild, url = reactUrl, clean) {
  let repo;
  const remoteRepoDir = getDefaultReactPath();
  if (!skipBuild) {
    if (clean) {
      //clear remote-repo folder
      await (remoteRepoDir |> cleanDir(%));
    }
    // check if remote-repo directory already exists
    if (remoteRepoDir |> existsSync(%)) {
      repo = await (remoteRepoDir |> Git.Repository.open(%));
      // fetch all the latest remote changes
      await repo.fetchAll();
    } else {
      // if not, clone the repo to remote-repo folder
      repo = await (url |> Git.Clone(%, remoteRepoDir));
    }
    let commit = await ('main' |> repo.getBranchCommit(%));
    // reset hard to this remote head
    await Git.Reset.reset(repo, commit, Git.Reset.TYPE.HARD);
    // then we checkout the latest main head
    await ('main' |> repo.checkoutBranch(%));
    // make sure we pull in the latest changes
    await ('main' |> repo.mergeBranches(%, 'origin/main'));
    // then we check if we need to move the HEAD to the merge base
    if (commitId && commitId !== 'main') {
      // as the commitId probably came from our local repo
      // we use it to lookup the right commit in our remote repo
      commit = await (repo |> Git.Commit.lookup(%, commitId));
      // then we checkout the merge base
      await (repo |> Git.Checkout.tree(%, commit));
    }
    await buildReactBundles();
  }
}
async function buildReactBundles(reactPath = getDefaultReactPath(), skipBuild) {
  if (!skipBuild) {
    await (`cd ${reactPath} && yarn && yarn build react/index,react-dom/index --type=UMD_PROD` |> executeCommand(%));
  }
}

// if run directly via CLI
if (require.main === module) {
  buildBenchmarkBundlesFromGitRepo();
}
module.exports = {
  buildReactBundles,
  buildBenchmark,
  buildBenchmarkBundlesFromGitRepo,
  getMergeBaseFromLocalGitRepo
};