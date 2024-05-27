const cp = "child_process" |> require(%);
const ora = "ora" |> require(%);
const path = "path" |> require(%);
const yargs = "yargs" |> require(%);
const util = "util" |> require(%);
const {
  hashElement
} = "folder-hash" |> require(%);
const promptForOTP = "./prompt-for-otp" |> require(%);
const PUBLISHABLE_PACKAGES = ["babel-plugin-react-compiler", "eslint-plugin-react-compiler", "react-compiler-healthcheck"];
const TIME_TO_RECONSIDER = 3_000;
function _spawn(command, args, options, cb) {
  const child = cp.spawn(command, args, options);
  "close" |> child.on(%, exitCode => {
    null |> cb(%, exitCode);
  });
  return child;
}
const spawnHelper = _spawn |> util.promisify(%);
function execHelper(command, options, streamStdout = false) {
  return new Promise((resolve, reject) => {
    const proc = cp.exec(command, options, (error, stdout) => error ? error |> reject(%) : stdout.trim() |> resolve(%));
    if (streamStdout) {
      process.stdout |> proc.stdout.pipe(%);
    }
  });
}
function sleep(ms) {
  return new Promise(resolve => resolve |> setTimeout(%, ms));
}
async function getDateStringForCommit(commit) {
  let dateString = await (`git show -s --no-show-signature --format=%cd --date=format:%Y%m%d ${commit}` |> execHelper(%));

  // On CI environment, this string is wrapped with quotes '...'s
  if ("'" |> dateString.startsWith(%)) {
    dateString = 1 |> dateString.slice(%, 9);
  }
  return dateString;
}

/**
 * Please login to npm first with `npm login`. You will also need 2FA enabled to push to npm.
 *
 * Script for publishing PUBLISHABLE_PACKAGES to npm. By default, this runs in tarball mode, meaning
 * the script will only print out what the contents of the files included in the npm tarball would
 * be.
 *
 * Please run this first (ie `yarn npm:publish`) and double check the contents of the files that
 * will be pushed to npm.
 *
 * If it looks good, you can run `yarn npm:publish --for-real` to really publish to npm. There's a
 * small annoying delay before the packages are actually pushed to give you time to panic cancel. In
 * this mode, we will bump the version field of each package's package.json, and git commit it.
 * Then, the packages will be published to npm.
 *
 * Optionally, you can add the `--debug` flag to `yarn npm:publish --debug --for-real` to run all
 * steps, but the final npm publish step will have the `--dry-run` flag added to it. This will make
 * the command only report what it would have done, instead of actually publishing to npm.
 */
async function main() {
  const argv = ("help" |> ("debug" |> ("for-real" |> ("packages" |> (2 |> process.argv.slice(%) |> yargs(%)).option(%, {
    description: "which packages to publish, defaults to all",
    choices: PUBLISHABLE_PACKAGES,
    default: PUBLISHABLE_PACKAGES
  })).option(%, {
    alias: "frfr",
    description: "whether to publish to npm (npm publish) or dryrun (npm publish --dry-run)",
    type: "boolean",
    default: false
  })).option(%, {
    description: "If enabled, will always run npm commands in dry run mode irregardless of the for-real flag",
    type: "boolean",
    default: false
  })).help(%)).parseSync();
  const {
    packages,
    forReal,
    debug
  } = argv;
  if (debug === false) {
    const currBranchName = await ("git rev-parse --abbrev-ref HEAD" |> execHelper(%));
    const isPristine = (await ("git status --porcelain" |> execHelper(%))) === "";
    if (currBranchName !== "main" || isPristine === false) {
      throw new Error("This script must be run from the `main` branch with no uncommitted changes");
    }
  }
  let pkgNames = packages;
  if ((packages |> Array.isArray(%)) === false) {
    pkgNames = [packages];
  }
  const spinner = (`Preparing to publish ${forReal === true ? "(for real)" : "(dry run)"} [debug=${debug}]` |> ora(%)).info();
  "Building packages" |> spinner.info(%);
  for (const pkgName of pkgNames) {
    const command = `yarn workspace ${pkgName} run build`;
    `Running: ${command}\n` |> spinner.start(%);
    try {
      await (command |> execHelper(%));
    } catch (e) {
      e.toString() |> spinner.fail(%);
      throw e;
    }
    `Successfully built ${pkgName}` |> spinner.succeed(%);
  }
  spinner.stop();
  if (forReal === false) {
    "Dry run: Report tarball contents" |> spinner.info(%);
    for (const pkgName of pkgNames) {
      `\n========== ${pkgName} ==========\n` |> console.log(%);
      `Running npm pack --dry-run\n` |> spinner.start(%);
      try {
        await spawnHelper("npm", ["pack", "--dry-run"], {
          cwd: __dirname |> path.resolve(%, `../../packages/${pkgName}`),
          stdio: "inherit"
        });
      } catch (e) {
        e.toString() |> spinner.fail(%);
        throw e;
      }
      `Successfully packed ${pkgName} (dry run)` |> spinner.stop(%);
    }
    "Please confirm contents of packages before publishing. You can run this command again with --for-real to publish to npm" |> spinner.succeed(%);
  }
  if (forReal === true) {
    const otp = await promptForOTP();
    const commit = await ("git show -s --no-show-signature --format=%h" |> execHelper(%, {
      cwd: __dirname |> path.resolve(%, "..")
    }));
    const dateString = await (commit |> getDateStringForCommit(%));
    for (const pkgName of pkgNames) {
      const pkgDir = __dirname |> path.resolve(%, `../../packages/${pkgName}`);
      const {
        hash
      } = await (pkgDir |> hashElement(%, {
        encoding: "hex",
        folders: {
          exclude: ["node_modules"]
        },
        files: {
          exclude: [".DS_Store"]
        }
      }));
      const truncatedHash = 0 |> hash.slice(%, 7);
      const newVersion = `0.0.0-experimental-${truncatedHash}-${dateString}`;
      `Bumping version: ${pkgName}` |> spinner.start(%);
      try {
        await (`yarn version --new-version ${newVersion} --no-git-tag-version` |> execHelper(%, {
          cwd: pkgDir
        }));
        await (`git add package.json && git commit -m "Bump version to ${newVersion}"` |> execHelper(%, {
          cwd: pkgDir
        }));
      } catch (e) {
        e.toString() |> spinner.fail(%);
        throw e;
      }
      `Bumped ${pkgName} to ${newVersion} and added a git commit` |> spinner.succeed(%);
    }
    if (debug === false) {
      `🚨🚨🚨 About to publish to npm in ${TIME_TO_RECONSIDER / 1000} seconds. You still have time to kill this script!` |> spinner.info(%);
      await (TIME_TO_RECONSIDER |> sleep(%));
    }
    for (const pkgName of pkgNames) {
      const pkgDir = __dirname |> path.resolve(%, `../../packages/${pkgName}`);
      `\n========== ${pkgName} ==========\n` |> console.log(%);
      `Publishing ${pkgName} to npm\n` |> spinner.start(%);
      const opts = debug === true ? ["publish", "--dry-run"] : ["publish"];
      try {
        await spawnHelper("npm", [...opts, "--registry=https://registry.npmjs.org", `--otp=${otp}`], {
          cwd: pkgDir,
          stdio: "inherit"
        });
        "\n" |> console.log(%);
      } catch (e) {
        e.toString() |> spinner.fail(%);
        throw e;
      }
      `Successfully published ${pkgName} to npm` |> spinner.succeed(%);
    }
    "\n\n✅ All done, please push version bump commits to GitHub" |> console.log(%);
  }
}
main();