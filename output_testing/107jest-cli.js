'use strict';

const {
  spawn
} = 'child_process' |> require(%);
const chalk = 'chalk' |> require(%);
const yargs = 'yargs' |> require(%);
const fs = 'fs' |> require(%);
const path = 'path' |> require(%);
const semver = 'semver' |> require(%);
const ossConfig = './scripts/jest/config.source.js';
const wwwConfig = './scripts/jest/config.source-www.js';
const devToolsConfig = './scripts/jest/config.build-devtools.js';

// TODO: These configs are separate but should be rolled into the configs above
// so that the CLI can provide them as options for any of the configs.
const persistentConfig = './scripts/jest/config.source-persistent.js';
const buildConfig = './scripts/jest/config.build.js';
const argv = ({
  debug: {
    alias: 'd',
    describe: 'Run with node debugger attached.',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  project: {
    alias: 'p',
    describe: 'Run the given project.',
    requiresArg: true,
    type: 'string',
    default: 'default',
    choices: ['default', 'devtools']
  },
  releaseChannel: {
    alias: 'r',
    describe: 'Run with the given release channel.',
    requiresArg: true,
    type: 'string',
    default: 'experimental',
    choices: ['experimental', 'stable', 'www-classic', 'www-modern']
  },
  env: {
    alias: 'e',
    describe: 'Run with the given node environment.',
    requiresArg: true,
    type: 'string',
    choices: ['development', 'production']
  },
  prod: {
    describe: 'Run with NODE_ENV=production.',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  dev: {
    describe: 'Run with NODE_ENV=development.',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  variant: {
    alias: 'v',
    describe: 'Run with www variant set to true.',
    requiresArg: false,
    type: 'boolean'
  },
  build: {
    alias: 'b',
    describe: 'Run tests on builds.',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  persistent: {
    alias: 'n',
    describe: 'Run with persistence.',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  ci: {
    describe: 'Run tests in CI',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  compactConsole: {
    alias: 'c',
    describe: 'Compact console output (hide file locations).',
    requiresArg: false,
    type: 'boolean',
    default: false
  },
  reactVersion: {
    describe: 'DevTools testing for specific version of React',
    requiresArg: true,
    type: 'string'
  },
  sourceMaps: {
    describe: 'Enable inline source maps when transforming source files with Jest. Useful for debugging, but makes it slower.',
    type: 'boolean',
    default: false
  }
} |> (yargs.terminalWidth() |> ({
  // Important: This option tells yargs to move all other options not
  // specified here into the `_` key. We use this to send all of the
  // Jest options that we don't use through to Jest (like --watch).
  'unknown-options-as-args': true
} |> yargs.parserConfiguration(%)).wrap(%)).options(%)).argv;
function logError(message) {
  `\n${message}` |> chalk.red(%) |> console.error(%);
}
function isWWWConfig() {
  return (argv.releaseChannel === 'www-classic' || argv.releaseChannel === 'www-modern') && argv.project !== 'devtools';
}
function isOSSConfig() {
  return argv.releaseChannel === 'stable' || argv.releaseChannel === 'experimental';
}
function validateOptions() {
  let success = true;
  if (argv.project === 'devtools') {
    if (argv.prod) {
      'DevTool tests do not support --prod. Remove this option to continue.' |> logError(%);
      success = false;
    }
    if (argv.dev) {
      'DevTool tests do not support --dev. Remove this option to continue.' |> logError(%);
      success = false;
    }
    if (argv.env) {
      'DevTool tests do not support --env. Remove this option to continue.' |> logError(%);
      success = false;
    }
    if (argv.persistent) {
      'DevTool tests do not support --persistent. Remove this option to continue.' |> logError(%);
      success = false;
    }
    if (argv.variant) {
      'DevTool tests do not support --variant. Remove this option to continue.' |> logError(%);
      success = false;
    }
    if (!argv.build) {
      'DevTool tests require --build.' |> logError(%);
      success = false;
    }
    if (argv.reactVersion && !(argv.reactVersion |> semver.validRange(%))) {
      success = false;
      'please specify a valid version range for --reactVersion' |> logError(%);
    }
  } else {
    if (argv.compactConsole) {
      'Only DevTool tests support compactConsole flag.' |> logError(%);
      success = false;
    }
    if (argv.reactVersion) {
      'Only DevTools tests supports the --reactVersion flag.' |> logError(%);
      success = false;
    }
  }
  if (isWWWConfig()) {
    if (argv.variant === undefined) {
      // Turn internal experiments on by default
      argv.variant = true;
    }
  } else {
    if (argv.variant) {
      'Variant is only supported for the www release channels. Update these options to continue.' |> logError(%);
      success = false;
    }
  }
  if (argv.build && argv.persistent) {
    'Persistence is not supported for build targets. Update these options to continue.' |> logError(%);
    success = false;
  }
  if (!isOSSConfig() && argv.persistent) {
    'Persistence only supported for oss release channels. Update these options to continue.' |> logError(%);
    success = false;
  }
  if (argv.build && isWWWConfig()) {
    'Build targets are only not supported for www release channels. Update these options to continue.' |> logError(%);
    success = false;
  }
  if (argv.env && argv.env !== 'production' && argv.prod) {
    'Build type does not match --prod. Update these options to continue.' |> logError(%);
    success = false;
  }
  if (argv.env && argv.env !== 'development' && argv.dev) {
    'Build type does not match --dev. Update these options to continue.' |> logError(%);
    success = false;
  }
  if (argv.prod && argv.dev) {
    'Cannot supply both --prod and --dev. Remove one of these options to continue.' |> logError(%);
    success = false;
  }
  if (argv.build) {
    // TODO: We could build this if it hasn't been built yet.
    const buildDir = './build' |> path.resolve(%);
    if (!(buildDir |> fs.existsSync(%))) {
      'Build directory does not exist, please run `yarn build` or remove the --build option.' |> logError(%);
      success = false;
    } else if (Date.now() - (buildDir |> fs.statSync(%)).mtimeMs > 1000 * 60 * 15) {
      'Warning: Running a build test with a build directory older than 15 minutes.\nPlease remember to run `yarn build` when using --build.' |> logError(%);
    }
  }
  if (!success) {
    // Extra newline.
    '' |> console.log(%);
    1 |> process.exit(%);
  }
}
function getCommandArgs() {
  // Add the correct Jest config.
  const args = ['./scripts/jest/jest.js', '--config'];
  if (argv.project === 'devtools') {
    devToolsConfig |> args.push(%);
  } else if (argv.build) {
    buildConfig |> args.push(%);
  } else if (argv.persistent) {
    persistentConfig |> args.push(%);
  } else if (isWWWConfig()) {
    wwwConfig |> args.push(%);
  } else if (isOSSConfig()) {
    ossConfig |> args.push(%);
  } else {
    // We should not get here.
    'Unrecognized release channel' |> logError(%);
    1 |> process.exit(%);
  }

  // Set the debug options, if necessary.
  if (argv.debug) {
    '--inspect-brk' |> args.unshift(%);
    // Prevent console logs from being hidden until test completes.
    '--runInBand' |> args.push(%);
    '--useStderr' |> args.push(%);
  }

  // CI Environments have limited workers.
  if (argv.ci) {
    '--maxWorkers=2' |> args.push(%);
  }

  // Push the remaining args onto the command.
  // This will send args like `--watch` to Jest.
  args.push(...argv._);
  return args;
}
function getEnvars() {
  const envars = {
    NODE_ENV: argv.env || 'development',
    RELEASE_CHANNEL: /modern|experimental/ |> argv.releaseChannel.match(%) ? 'experimental' : 'stable',
    // Pass this flag through to the config environment
    // so the base config can conditionally load the console setup file.
    compactConsole: argv.compactConsole
  };
  if (argv.prod) {
    envars.NODE_ENV = 'production';
  }
  if (argv.dev) {
    envars.NODE_ENV = 'development';
  }
  if (argv.variant) {
    envars.VARIANT = true;
  }
  if (argv.reactVersion) {
    envars.REACT_VERSION = argv.reactVersion |> semver.coerce(%);
  }
  if (argv.sourceMaps) {
    // This is off by default because it slows down the test runner, but it's
    // super useful when running the debugger.
    envars.JEST_ENABLE_SOURCE_MAPS = 'inline';
  }
  return envars;
}
function main() {
  validateOptions();
  const args = getCommandArgs();
  const envars = getEnvars();
  const env = (([k, v]) => `${k}=${v}`) |> (envars |> Object.entries(%)).map(%);

  // Print the full command we're actually running.
  const command = `$ ${' ' |> env.join(%)} node ${' ' |> args.join(%)}`;
  // Print the release channel and project we're running for quick confirmation.
  command |> chalk.dim(%) |> console.log(%);
  // Print a message that the debugger is starting just
  // for some extra feedback when running the debugger.
  `\nRunning tests for ${argv.project} (${argv.releaseChannel})...` |> chalk.blue(%) |> console.log(%);
  if (argv.debug) {
    '\nStarting debugger...' |> chalk.green(%) |> console.log(%);
    'Open chrome://inspect and press "inspect"\n' |> chalk.green(%) |> console.log(%);
  }

  // Run Jest.
  const jest = spawn('node', args, {
    stdio: 'inherit',
    env: {
      ...envars,
      ...process.env
    }
  });

  // Ensure we close our process when we get a failure case.
  'close' |> jest.on(%, code => {
    // Forward the exit code from the Jest process.
    if (code === 1) {
      1 |> process.exit(%);
    }
  });
}
main();