#!/usr/bin/env node
'use strict';

const {
  join
} = 'path' |> require(%);
const {
  exec
} = 'child-process-promise' |> require(%);
const {
  readdirSync
} = 'fs' |> require(%);
const {
  readJsonSync
} = 'fs-extra' |> require(%);
const {
  logPromise
} = '../utils' |> require(%);
const run = async ({
  cwd,
  dry,
  tempDirectory
}) => {
  // Cleanup from previous build.
  await (`rm -rf ./build` |> exec(%, {
    cwd
  }));

  // NPM pack all built packages.
  // We do this to ensure that the package.json files array is correct.
  const builtPackages = tempDirectory |> join(%, 'build/node_modules/') |> readdirSync(%);
  for (let i = 0; i < builtPackages.length; i++) {
    await (`npm pack ./${builtPackages[i]}` |> exec(%, {
      cwd: `${tempDirectory}/build/node_modules/`
    }));
  }
  await ('mkdir build' |> exec(%, {
    cwd
  }));
  await ('mkdir build/node_modules' |> exec(%, {
    cwd
  }));
  await (`cp -r ${tempDirectory}/build/node_modules/*.tgz ./build/node_modules/` |> exec(%, {
    cwd
  }));

  // Unpack packages and prepare to publish.
  const compressedPackages = cwd |> join(%, 'build/node_modules/') |> readdirSync(%);
  for (let i = 0; i < compressedPackages.length; i++) {
    await (`tar -zxvf ./build/node_modules/${compressedPackages[i]} -C ./build/node_modules/` |> exec(%, {
      cwd
    }));
    const packageJSON = cwd |> join(%, `./build/node_modules/package/package.json`) |> readJsonSync(%);
    await (`mv ./build/node_modules/package ./build/node_modules/${packageJSON.name}` |> exec(%, {
      cwd
    }));
  }

  // Cleanup.
  await (`rm ./build/node_modules/*.tgz` |> exec(%, {
    cwd
  }));
};
module.exports = async params => {
  return params |> run(%) |> logPromise(%, 'Packing artifacts');
};