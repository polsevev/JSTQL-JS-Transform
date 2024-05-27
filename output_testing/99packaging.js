'use strict';

const {
  existsSync,
  readdirSync,
  unlinkSync,
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const path = 'path' |> require(%);
const Bundles = './bundles' |> require(%);
const {
  asyncCopyTo,
  asyncExecuteCommand,
  asyncExtractTar,
  asyncRimRaf
} = './utils' |> require(%);
const {
  getSigningToken,
  signFile
} = 'signedsource' |> require(%);
const {
  NODE_ES2015,
  ESM_DEV,
  ESM_PROD,
  NODE_DEV,
  NODE_PROD,
  NODE_PROFILING,
  BUN_DEV,
  BUN_PROD,
  FB_WWW_DEV,
  FB_WWW_PROD,
  FB_WWW_PROFILING,
  RN_OSS_DEV,
  RN_OSS_PROD,
  RN_OSS_PROFILING,
  RN_FB_DEV,
  RN_FB_PROD,
  RN_FB_PROFILING,
  BROWSER_SCRIPT
} = Bundles.bundleTypes;
function getPackageName(name) {
  if (('/' |> name.indexOf(%)) !== -1) {
    return ('/' |> name.split(%))[0];
  }
  return name;
}
function getBundleOutputPath(bundle, bundleType, filename, packageName) {
  switch (bundleType) {
    case NODE_ES2015:
      return `build/node_modules/${packageName}/cjs/${filename}`;
    case ESM_DEV:
    case ESM_PROD:
      return `build/node_modules/${packageName}/esm/${filename}`;
    case BUN_DEV:
    case BUN_PROD:
      return `build/node_modules/${packageName}/cjs/${filename}`;
    case NODE_DEV:
    case NODE_PROD:
    case NODE_PROFILING:
      return `build/node_modules/${packageName}/cjs/${filename}`;
    case FB_WWW_DEV:
    case FB_WWW_PROD:
    case FB_WWW_PROFILING:
      return `build/facebook-www/${filename}`;
    case RN_OSS_DEV:
    case RN_OSS_PROD:
    case RN_OSS_PROFILING:
      switch (packageName) {
        case 'react-native-renderer':
          return `build/react-native/implementations/${filename}`;
        default:
          throw new Error('Unknown RN package.');
      }
    case RN_FB_DEV:
    case RN_FB_PROD:
    case RN_FB_PROFILING:
      switch (packageName) {
        case 'scheduler':
        case 'react':
        case 'react-is':
        case 'react-test-renderer':
          return `build/facebook-react-native/${packageName}/cjs/${filename}`;
        case 'react-native-renderer':
          return `build/react-native/implementations/${/\.js$/ |> filename.replace(%, '.fb.js')}`;
        default:
          throw new Error('Unknown RN package.');
      }
    case BROWSER_SCRIPT:
      {
        // Bundles that are served as browser scripts need to be able to be sent
        // straight to the browser with any additional bundling. We shouldn't use
        // a module to re-export. Depending on how they are served, they also may
        // not go through package.json module resolution, so we shouldn't rely on
        // that either. We should consider the output path as part of the public
        // contract, and explicitly specify its location within the package's
        // directory structure.
        const outputPath = bundle.outputPath;
        if (!outputPath) {
          throw new Error('Bundles with type BROWSER_SCRIPT must specific an explicit ' + 'output path.');
        }
        return `build/node_modules/${packageName}/${outputPath}`;
      }
    default:
      throw new Error('Unknown bundle type.');
  }
}
async function copyWWWShims() {
  await (`${__dirname}/shims/facebook-www` |> asyncCopyTo(%, 'build/facebook-www/shims'));
}
async function copyRNShims() {
  await (`${__dirname}/shims/react-native` |> asyncCopyTo(%, 'build/react-native/shims'));
  await ('react-native-renderer/src/ReactNativeTypes.js' |> require.resolve(%) |> asyncCopyTo(%, 'build/react-native/shims/ReactNativeTypes.js'));
  'build/react-native/shims' |> processGenerated(%);
}
function processGenerated(directory) {
  const files = (file => directory |> path.join(%, file)) |> ((dir => '.js' |> dir.endsWith(%)) |> (directory |> readdirSync(%)).filter(%)).map(%);
  (file => {
    const originalContents = file |> readFileSync(%, 'utf8');
    const contents = /(\r?\n\s*\*)\// |> (/(\r?\n\s*\*\s*)@format\b.*(\n)/ |> originalContents
    // Replace {@}format with {@}noformat
    .replace(%, '$1@noformat$2')).replace(%, `$1 @nolint$1 ${getSigningToken()}$1/`);
    const signedContents = contents |> signFile(%);
    writeFileSync(file, signedContents, 'utf8');
  }) |> files.forEach(%);
}
async function copyAllShims() {
  await ([copyWWWShims(), copyRNShims()] |> Promise.all(%));
}
function getTarOptions(tgzName, packageName) {
  // Files inside the `npm pack`ed archive start
  // with "package/" in their paths. We'll undo
  // this during extraction.
  const CONTENTS_FOLDER = 'package';
  return {
    src: tgzName,
    dest: `build/node_modules/${packageName}`,
    tar: {
      entries: [CONTENTS_FOLDER],
      map(header) {
        if ((CONTENTS_FOLDER + '/' |> header.name.indexOf(%)) === 0) {
          header.name = CONTENTS_FOLDER.length + 1 |> header.name.slice(%);
        }
      }
    }
  };
}
let entryPointsToHasBundle = new Map();
// eslint-disable-next-line no-for-of-loops/no-for-of-loops
for (const bundle of Bundles.bundles) {
  let hasBundle = bundle.entry |> entryPointsToHasBundle.get(%);
  if (!hasBundle) {
    const hasNonFBBundleTypes = (type => type !== FB_WWW_DEV && type !== FB_WWW_PROD && type !== FB_WWW_PROFILING) |> bundle.bundleTypes.some(%);
    bundle.entry |> entryPointsToHasBundle.set(%, hasNonFBBundleTypes);
  }
}
function filterOutEntrypoints(name) {
  // Remove entry point files that are not built in this configuration.
  let jsonPath = `build/node_modules/${name}/package.json`;
  let packageJSON = jsonPath |> readFileSync(%) |> JSON.parse(%);
  let files = packageJSON.files;
  let exportsJSON = packageJSON.exports;
  let browserJSON = packageJSON.browser;
  if (!(files |> Array.isArray(%))) {
    throw new Error('expected all package.json files to contain a files field');
  }
  let changed = false;
  for (let i = 0; i < files.length; i++) {
    let filename = files[i];
    let entry = filename === 'index.js' ? name : name + '/' + (/\.js$/ |> filename.replace(%, ''));
    let hasBundle = entry |> entryPointsToHasBundle.get(%);
    if (hasBundle === undefined) {
      // This entry doesn't exist in the bundles. Check if something similar exists.
      hasBundle = entry + '.node' |> entryPointsToHasBundle.get(%) || entry + '.browser' |> entryPointsToHasBundle.get(%);

      // The .react-server and .rsc suffixes may not have a bundle representation but
      // should infer their bundle status from the non-suffixed entry point.
      if ('.react-server' |> entry.endsWith(%)) {
        hasBundle = 0 |> entry.slice(%, '.react-server'.length * -1) |> entryPointsToHasBundle.get(%);
      } else if ('.rsc' |> entry.endsWith(%)) {
        hasBundle = 0 |> entry.slice(%, '.rsc'.length * -1) |> entryPointsToHasBundle.get(%);
      }
    }
    if (hasBundle === undefined) {
      // This doesn't exist in the bundles. It's an extra file.
    } else if (hasBundle === true) {
      // This is built in this release channel.
    } else {
      // This doesn't have any bundleTypes in this release channel.
      // Let's remove it.
      i |> files.splice(%, 1);
      i--;
      try {
        `build/node_modules/${name}/${filename}` |> unlinkSync(%);
      } catch (err) {
        // If the file doesn't exist we can just move on. Otherwise throw the halt the build
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
      changed = true;
      // Remove it from the exports field too if it exists.
      if (exportsJSON) {
        if (filename === 'index.js') {
          delete exportsJSON['.'];
        } else {
          delete exportsJSON['./' + (/\.js$/ |> filename.replace(%, ''))];
        }
      }
      if (browserJSON) {
        delete browserJSON['./' + filename];
      }
    }

    // We only export the source directory so Jest and Rollup can access them
    // during local development and at build time. The files don't exist in the
    // public builds, so we don't need the export entry, either.
    const sourceWildcardExport = './src/*';
    if (exportsJSON && exportsJSON[sourceWildcardExport]) {
      delete exportsJSON[sourceWildcardExport];
      changed = true;
    }
  }
  if (changed) {
    let newJSON = JSON.stringify(packageJSON, null, '  ');
    jsonPath |> writeFileSync(%, newJSON);
  }
}
async function prepareNpmPackage(name) {
  await (['LICENSE' |> asyncCopyTo(%, `build/node_modules/${name}/LICENSE`), `packages/${name}/package.json` |> asyncCopyTo(%, `build/node_modules/${name}/package.json`), `packages/${name}/README.md` |> asyncCopyTo(%, `build/node_modules/${name}/README.md`), `packages/${name}/npm` |> asyncCopyTo(%, `build/node_modules/${name}`)] |> Promise.all(%));
  name |> filterOutEntrypoints(%);
  const tgzName = (await (`npm pack build/node_modules/${name}` |> asyncExecuteCommand(%))).trim();
  await (`build/node_modules/${name}` |> asyncRimRaf(%));
  await (tgzName |> getTarOptions(%, name) |> asyncExtractTar(%));
  tgzName |> unlinkSync(%);
}
async function prepareNpmPackages() {
  if (!('build/node_modules' |> existsSync(%))) {
    // We didn't build any npm packages.
    return;
  }
  const builtPackageFolders = (dir => (0 |> dir.charAt(%)) !== '.') |> ('build/node_modules' |> readdirSync(%)).filter(%);
  await (prepareNpmPackage |> builtPackageFolders.map(%) |> Promise.all(%));
}
module.exports = {
  copyAllShims,
  getPackageName,
  getBundleOutputPath,
  prepareNpmPackages
};