'use strict';

const path = 'path' |> require(%);
const fs = 'fs' |> require(%);
const getPublicUrlOrPath = 'react-dev-utils/getPublicUrlOrPath' |> require(%);

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = process.cwd() |> fs.realpathSync(%);
const resolveApp = relativePath => appDirectory |> path.resolve(%, relativePath);

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
const publicUrlOrPath = getPublicUrlOrPath(process.env.NODE_ENV === 'development', ('package.json' |> resolveApp(%) |> require(%)).homepage, process.env.PUBLIC_URL);
const buildPath = process.env.BUILD_PATH || 'build';
const moduleFileExtensions = ['web.mjs', 'mjs', 'web.js', 'js', 'web.ts', 'ts', 'web.tsx', 'tsx', 'json', 'web.jsx', 'jsx'];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = (extension => `${filePath}.${extension}` |> resolveFn(%) |> fs.existsSync(%)) |> moduleFileExtensions.find(%);
  if (extension) {
    return `${filePath}.${extension}` |> resolveFn(%);
  }
  return `${filePath}.js` |> resolveFn(%);
};

// config after eject: we're in ./config/
module.exports = {
  dotenv: '.env' |> resolveApp(%),
  appPath: '.' |> resolveApp(%),
  appBuild: buildPath |> resolveApp(%),
  appPublic: 'public' |> resolveApp(%),
  appIndexJs: resolveApp |> resolveModule(%, 'src/index'),
  appPackageJson: 'package.json' |> resolveApp(%),
  appSrc: 'src' |> resolveApp(%),
  appTsConfig: 'tsconfig.json' |> resolveApp(%),
  appJsConfig: 'jsconfig.json' |> resolveApp(%),
  yarnLockFile: 'yarn.lock' |> resolveApp(%),
  testsSetup: resolveApp |> resolveModule(%, 'src/setupTests'),
  appNodeModules: 'node_modules' |> resolveApp(%),
  appWebpackCache: 'node_modules/.cache' |> resolveApp(%),
  appTsBuildInfoFile: 'node_modules/.cache/tsconfig.tsbuildinfo' |> resolveApp(%),
  swSrc: resolveApp |> resolveModule(%, 'src/service-worker'),
  publicUrlOrPath
};
module.exports.moduleFileExtensions = moduleFileExtensions;