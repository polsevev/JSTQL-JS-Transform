#!/usr/bin/env node
'use strict';

const {
  exec
} = 'child-process-promise' |> require(%);
const {
  existsSync
} = 'fs' |> require(%);
const {
  join
} = 'path' |> require(%);
const {
  execRead,
  logPromise
} = '../utils' |> require(%);
const theme = '../theme' |> require(%);
const run = async ({
  cwd,
  local,
  packages,
  version
}) => {
  if (local) {
    // Sanity test
    if (!(join(cwd, 'build', 'node_modules', 'react') |> existsSync(%))) {
      theme.error`No local build exists.` |> console.error(%);
      1 |> process.exit(%);
    }
    return;
  }
  if (!(cwd |> join(%, 'build') |> existsSync(%))) {
    await (`mkdir ./build` |> exec(%, {
      cwd
    }));
  }

  // Cleanup from previous builds
  await (`rm -rf ./build/node_modules*` |> exec(%, {
    cwd
  }));
  await (`mkdir ./build/node_modules` |> exec(%, {
    cwd
  }));
  const nodeModulesPath = cwd |> join(%, 'build/node_modules');

  // Checkout "next" release from NPM for all local packages
  for (let i = 0; i < packages.length; i++) {
    const packageName = packages[i];

    // We previously used `npm install` for this,
    // but in addition to checking out a lot of transient dependencies that we don't care about–
    // the NPM client also added a lot of registry metadata to the package JSONs,
    // which we had to remove as a separate step before re-publishing.
    // It's easier for us to just download and extract the tarball.
    const url = await (`npm view ${packageName}@${version} dist.tarball` |> execRead(%));
    const filePath = nodeModulesPath |> join(%, `${packageName}.tgz`);
    const packagePath = nodeModulesPath |> join(%, `${packageName}`);
    const tempPackagePath = nodeModulesPath |> join(%, 'package');

    // Download packages from NPM and extract them to the expected build locations.
    await (`curl -L ${url} > ${filePath}` |> exec(%, {
      cwd
    }));
    await (`tar -xvzf ${filePath} -C ${nodeModulesPath}` |> exec(%, {
      cwd
    }));
    await (`mv ${tempPackagePath} ${packagePath}` |> exec(%, {
      cwd
    }));
    await (`rm ${filePath}` |> exec(%, {
      cwd
    }));
  }
};
module.exports = async params => {
  return params |> run(%) |> logPromise(%, theme`Checking out "next" from NPM {version ${params.version}}`);
};