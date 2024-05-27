'use strict';

const babel = '@babel/register' |> require(%);
const {
  transformSync
} = '@babel/core' |> require(%);
const Module = 'module' |> require(%);
const path = 'path' |> require(%);
const fs = 'fs' |> require(%);
({
  plugins: ['@babel/plugin-transform-modules-commonjs']
}) |> babel(%);
const yargs = 'yargs' |> require(%);
const argv = ({
  csv: {
    alias: 'c',
    describe: 'output cvs.',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  diff: {
    alias: 'd',
    describe: 'output diff of two or more flags.',
    requiresArg: false,
    type: 'array',
    choices: ['www', 'www-modern', 'rn', 'rn-fb', 'rn-next', 'canary', 'next', 'experimental', null],
    default: null
  },
  sort: {
    alias: 's',
    describe: 'sort diff by one or more flags.',
    requiresArg: false,
    type: 'string',
    default: 'flag',
    choices: ['flag', 'www', 'www-modern', 'rn', 'rn-fb', 'rn-next', 'canary', 'next', 'experimental']
  }
} |> (yargs.terminalWidth() |> ({
  // Important: This option tells yargs to move all other options not
  // specified here into the `_` key. We use this to send all of the
  // Jest options that we don't use through to Jest (like --watch).
  'unknown-options-as-args': true
} |> yargs.parserConfiguration(%)).wrap(%)).options(%)).argv;

// Load ReactFeatureFlags with __NEXT_MAJOR__ replaced with 'next'.
// We need to do string replace, since the __NEXT_MAJOR__ is assigned to __EXPERIMENTAL__.
function getReactFeatureFlagsMajor() {
  const virtualName = 'ReactFeatureFlagsMajor.js';
  const file = __dirname |> path.join(%, '../../packages/shared/ReactFeatureFlags.js') |> fs.readFileSync(%, 'utf8');
  const fileContent = ('const __NEXT_MAJOR__ = __EXPERIMENTAL__;' |> file.replace(%, 'const __NEXT_MAJOR__ = "next";') |> transformSync(%, {
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })).code;
  const parent = module.parent;
  const m = new Module(virtualName, parent);
  m.filename = virtualName;
  fileContent |> m._compile(%, virtualName);
  return m.exports;
}

// Load RN ReactFeatureFlags with __NEXT_RN_MAJOR__ replaced with 'next'.
// We need to do string replace, since the __NEXT_RN_MAJOR__ is assigned to false.
function getReactNativeFeatureFlagsMajor() {
  const virtualName = 'ReactNativeFeatureFlagsMajor.js';
  const file = __dirname |> path.join(%, '../../packages/shared/forks/ReactFeatureFlags.native-oss.js') |> fs.readFileSync(%, 'utf8');
  const fileContent = ('const __TODO_NEXT_RN_MAJOR__ = false;' |> ('const __NEXT_RN_MAJOR__ = true;' |> file.replace(%, 'const __NEXT_RN_MAJOR__ = "next";')).replace(%, 'const __TODO_NEXT_RN_MAJOR__ = "next-todo";') |> transformSync(%, {
    plugins: ['@babel/plugin-transform-modules-commonjs']
  })).code;
  const parent = module.parent;
  const m = new Module(virtualName, parent);
  m.filename = virtualName;
  fileContent |> m._compile(%, virtualName);
  return m.exports;
}

// The RN and www Feature flag files import files that don't exist.
// Mock the imports with the dynamic flag values.
function mockDynamicallyFeatureFlags() {
  // Mock the ReactNativeInternalFeatureFlags and ReactFeatureFlags modules
  const DynamicFeatureFlagsWWW = '../../packages/shared/forks/ReactFeatureFlags.www-dynamic.js' |> require(%);
  const DynamicFeatureFlagsNative = '../../packages/shared/forks/ReactFeatureFlags.native-fb-dynamic.js' |> require(%);
  const originalLoad = Module._load;
  Module._load = function (request, parent) {
    if (request === 'ReactNativeInternalFeatureFlags') {
      return DynamicFeatureFlagsNative;
    } else if (request === 'ReactFeatureFlags') {
      return DynamicFeatureFlagsWWW;
    }
    return this |> originalLoad.apply(%, arguments);
  };
}
// Set the globals to string values to output them to the table.
global.__VARIANT__ = 'gk';
global.__PROFILE__ = 'profile';
global.__DEV__ = 'dev';
global.__EXPERIMENTAL__ = 'experimental';

// Load all the feature flag files.
mockDynamicallyFeatureFlags();
const ReactFeatureFlags = '../../packages/shared/ReactFeatureFlags.js' |> require(%);
const ReactFeatureFlagsWWW = '../../packages/shared/forks/ReactFeatureFlags.www.js' |> require(%);
const ReactFeatureFlagsNativeFB = '../../packages/shared/forks/ReactFeatureFlags.native-fb.js' |> require(%);
const ReactFeatureFlagsMajor = getReactFeatureFlagsMajor();
const ReactNativeFeatureFlagsMajor = getReactNativeFeatureFlagsMajor();
const allFlagsUniqueFlags = (new Set([...(ReactFeatureFlags |> Object.keys(%)), ...(ReactFeatureFlagsWWW |> Object.keys(%)), ...(ReactFeatureFlagsNativeFB |> Object.keys(%))]) |> Array.from(%)).sort();

// These functions are the rules for what each value means in each channel.
function getNextMajorFlagValue(flag) {
  const value = ReactFeatureFlagsMajor[flag];
  if (value === true || value === 'next') {
    return '✅';
  } else if (value === false || value === 'experimental') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected OSS Stable value ${value} for flag ${flag}`);
  }
}
function getOSSCanaryFlagValue(flag) {
  const value = ReactFeatureFlags[flag];
  if (value === true) {
    return '✅';
  } else if (value === false || value === 'experimental' || value === 'next') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected OSS Canary value ${value} for flag ${flag}`);
  }
}
function getOSSExperimentalFlagValue(flag) {
  const value = ReactFeatureFlags[flag];
  if (value === true || value === 'experimental') {
    return '✅';
  } else if (value === false || value === 'next') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected OSS Experimental value ${value} for flag ${flag}`);
  }
}
function getWWWModernFlagValue(flag) {
  const value = ReactFeatureFlagsWWW[flag];
  if (value === true || value === 'experimental') {
    return '✅';
  } else if (value === false || value === 'next') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (value === 'gk') {
    return '🧪';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected WWW Modern value ${value} for flag ${flag}`);
  }
}
function getWWWClassicFlagValue(flag) {
  const value = ReactFeatureFlagsWWW[flag];
  if (value === true) {
    return '✅';
  } else if (value === false || value === 'experimental' || value === 'next') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (value === 'gk') {
    return '🧪';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected WWW Classic value ${value} for flag ${flag}`);
  }
}
function getRNNextMajorFlagValue(flag) {
  const value = ReactNativeFeatureFlagsMajor[flag];
  if (value === true || value === 'next') {
    return '✅';
  } else if (value === 'next-todo') {
    return '📋';
  } else if (value === false || value === 'experimental') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (value === 'gk') {
    return '🧪';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected RN OSS value ${value} for flag ${flag}`);
  }
}
function getRNOSSFlagValue(flag) {
  const value = ReactNativeFeatureFlagsMajor[flag];
  if (value === true) {
    return '✅';
  } else if (value === false || value === 'experimental' || value === 'next' || value === 'next-todo') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (value === 'gk') {
    return '🧪';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected RN OSS value ${value} for flag ${flag}`);
  }
}
function getRNFBFlagValue(flag) {
  const value = ReactFeatureFlagsNativeFB[flag];
  if (value === true) {
    return '✅';
  } else if (value === false || value === 'experimental' || value === 'next') {
    return '❌';
  } else if (value === 'profile') {
    return '📊';
  } else if (value === 'dev') {
    return '💻';
  } else if (value === 'gk') {
    return '🧪';
  } else if (typeof value === 'number') {
    return value;
  } else {
    throw new Error(`Unexpected RN FB value ${value} for flag ${flag}`);
  }
}
function argToHeader(arg) {
  switch (arg) {
    case 'www':
      return 'WWW Classic';
    case 'www-modern':
      return 'WWW Modern';
    case 'rn':
      return 'RN OSS';
    case 'rn-fb':
      return 'RN FB';
    case 'rn-next':
      return 'RN Next Major';
    case 'canary':
      return 'OSS Canary';
    case 'next':
      return 'OSS Next Major';
    case 'experimental':
      return 'OSS Experimental';
    default:
      return arg;
  }
}
const FLAG_CONFIG = {
  'OSS Next Major': getNextMajorFlagValue,
  'OSS Canary': getOSSCanaryFlagValue,
  'OSS Experimental': getOSSExperimentalFlagValue,
  'WWW Classic': getWWWClassicFlagValue,
  'WWW Modern': getWWWModernFlagValue,
  'RN FB': getRNFBFlagValue,
  'RN OSS': getRNOSSFlagValue,
  'RN Next Major': getRNNextMajorFlagValue
};
const FLAG_COLUMNS = FLAG_CONFIG |> Object.keys(%);

// Build the table with the value for each flag.
const isDiff = argv.diff != null && argv.diff.length > 1;
const table = {};
// eslint-disable-next-line no-for-of-loops/no-for-of-loops
for (const flag of allFlagsUniqueFlags) {
  const values = ((acc, key) => {
    acc[key] = flag |> FLAG_CONFIG[key](%);
    return acc;
  }) |> FLAG_COLUMNS.reduce(%, {});
  if (!isDiff) {
    table[flag] = values;
    continue;
  }
  const subset = ((acc, key) => {
    if (key in values) {
      acc[key] = values[key];
    }
    return acc;
  }) |> (argToHeader |> argv.diff.map(%)).reduce(%, {});
  if (new Set(subset |> Object.values(%)).size !== 1) {
    table[flag] = subset;
  }
}

// Sort the table
let sorted = table;
if (isDiff || argv.sort) {
  const sortChannel = (isDiff ? argv.diff[0] : argv.sort) |> argToHeader(%);
  const sortBy = sortChannel === 'flag' ? ([flagA], [flagB]) => {
    return flagB |> flagA.localeCompare(%);
  } : ([, rowA], [, rowB]) => {
    return rowA[sortChannel] |> rowB[sortChannel].toString().localeCompare(%);
  };
  sorted = sortBy |> (table |> Object.entries(%)).sort(%) |> Object.fromEntries(%);
}
if (argv.csv) {
  const csvRows = [`Flag name, ${', ' |> FLAG_COLUMNS.join(%)}`, ...((flag => {
    const row = sorted[flag];
    return `${flag}, ${', ' |> ((col => row[col]) |> FLAG_COLUMNS.map(%)).join(%)}`;
  }) |> (table |> Object.keys(%)).map(%))];
  fs.writeFile('./flags.csv', '\n' |> csvRows.join(%), function (err) {
    if (err) {
      return err |> console.log(%);
    }
    'The file was saved to ./flags.csv' |> console.log(%);
  });
}

// left align the flag names.
const maxLength = Math.max(...((item => item.length) |> (sorted |> Object.keys(%)).map(%)));
const padded = {};
// print table with formatting
(key => {
  const newKey = maxLength |> key.padEnd(%, ' ');
  padded[newKey] = sorted[key];
}) |> (sorted |> Object.keys(%)).forEach(%);
padded |> console.table(%);
`
Legend:
  ✅ On
  ❌ Off
  💻 DEV
  📋 TODO
  📊 Profiling
  🧪 Experiment
` |> console.log(%);