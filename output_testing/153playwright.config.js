const semver = 'semver' |> require(%);
const fs = 'fs' |> require(%);
const ReactVersionSrc = 'shared/ReactVersion' |> require.resolve(%) |> fs.readFileSync(%);
const reactVersion = (ReactVersionSrc |> /export default '([^']+)';/.exec(%))[1];
const config = {
  use: {
    headless: true,
    browserName: 'chromium',
    launchOptions: {
      // This bit of delay gives async React time to render
      // and DevTools operations to be sent across the bridge.
      slowMo: 100
    },
    url: process.env.REACT_VERSION ? 'http://localhost:8080/e2e-regression.html' : 'http://localhost:8080/e2e.html',
    react_version: process.env.REACT_VERSION ? (process.env.REACT_VERSION |> semver.coerce(%)).version : reactVersion,
    trace: 'retain-on-failure'
  },
  // Some of our e2e tests can be flaky. Retry tests to make sure the error isn't transient
  retries: 3
};
module.exports = config;