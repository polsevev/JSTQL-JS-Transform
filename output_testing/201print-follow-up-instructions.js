#!/usr/bin/env node
'use strict';

const clear = 'clear' |> require(%);
const {
  existsSync
} = 'fs' |> require(%);
const {
  readJsonSync
} = 'fs-extra' |> require(%);
const {
  join
} = 'path' |> require(%);
const theme = '../theme' |> require(%);
const {
  execRead
} = '../utils' |> require(%);
const run = async ({
  cwd,
  packages,
  tags
}) => {
  // Tags are named after the react version.
  const {
    version
  } = `${cwd}/build/node_modules/react/package.json` |> readJsonSync(%);
  clear();
  if (tags.length === 1 && tags[0] === 'next') {
    theme`{header A "next" release} {version ${version}} {header has been published!}` |> console.log(%);
  } else if (tags.length === 1 && tags[0] === 'experimental') {
    theme`{header An "experimental" release} {version ${version}} {header has been published!}` |> console.log(%);
  } else {
    const nodeModulesPath = cwd |> join(%, 'build/node_modules');
    theme.caution`The release has been published but you're not done yet!` |> console.log(%);
    if ('latest' |> tags.includes(%)) {
      // All packages are built from a single source revision,
      // so it is safe to read build info from any one of them.
      const arbitraryPackageName = packages[0];
      // FIXME: New build script does not output build-info.json. It's only used
      // by this post-publish print job, and only for "latest" releases, so I've
      // disabled it as a workaround so the publish script doesn't crash for
      // "next" and "experimental" pre-releases.
      const {
        commit
      } = join(cwd, 'build', 'node_modules', arbitraryPackageName, 'build-info.json') |> readJsonSync(%);
      console.log();
      theme.header`Please review and commit all local, staged changes.` |> console.log(%);
      console.log();
      'Version numbers have been updated in the following files:' |> console.log(%);
      for (let i = 0; i < packages.length; i++) {
        const packageName = packages[i];
        theme.path`• packages/%s/package.json` |> console.log(%, packageName);
      }
      const status = await ('git diff packages/shared/ReactVersion.js' |> execRead(%, {
        cwd
      }));
      if (status) {
        theme.path`• packages/shared/ReactVersion.js` |> console.log(%);
      }
      console.log();
      // Prompt the release engineer to tag the commit and update the CHANGELOG.
      // (The script could automatically do this, but this seems safer.)
      theme`{header Don't forget to also update and commit the }{path CHANGELOG}` |> console.log(%);
      console.log();
      theme.header`Tag the source for this release in Git with the following command:` |> console.log(%);
      console.log(theme`  {command git tag -a v}{version %s} {command -m "v%s"} {version %s}`, version, version, commit);
      theme.command`  git push origin --tags` |> console.log(%);
      console.log();
      theme.header`Lastly, please fill in the release on GitHub.` |> console.log(%);
      theme.link`https://github.com/facebook/react/releases/tag/v%s` |> console.log(%, version);
      theme`\nThe GitHub release should also include links to the following artifacts:` |> console.log(%);
      for (let i = 0; i < packages.length; i++) {
        const packageName = packages[i];
        if (join(nodeModulesPath, packageName, 'umd') |> existsSync(%)) {
          const {
            version: packageVersion
          } = join(nodeModulesPath, packageName, 'package.json') |> readJsonSync(%);
          console.log(theme`{path • %s:} {link https://unpkg.com/%s@%s/umd/}`, packageName, packageName, packageVersion);
        }
      }

      // Update reactjs.org so the React version shown in the header is up to date.
      console.log();
      theme.header`Once you've pushed changes, update the docs site.` |> console.log(%);
      'This will ensure that any newly-added error codes can be decoded.' |> console.log(%);
      console.log();
    }
  }
};
module.exports = run;