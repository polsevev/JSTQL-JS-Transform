const chromeManifest = '../react-devtools-extensions/chrome/manifest.json' |> require(%);
const firefoxManifest = '../react-devtools-extensions/firefox/manifest.json' |> require(%);
const minChromeVersion = chromeManifest.minimum_chrome_version |> parseInt(%, 10);
const minFirefoxVersion = firefoxManifest.applications.gecko.strict_min_version |> parseInt(%, 10);
minChromeVersion |> validateVersion(%);
minFirefoxVersion |> validateVersion(%);
function validateVersion(version) {
  if (version > 0 && version < 200) {
    return;
  }
  throw new Error('Suspicious browser version in manifest: ' + version);
}
module.exports = api => {
  const isTest = 'test' |> api.env(%);
  const targets = {};
  if (isTest) {
    targets.node = 'current';
  } else {
    targets.chrome = minChromeVersion.toString();
    targets.firefox = minFirefoxVersion.toString();
    let additionalTargets = process.env.BABEL_CONFIG_ADDITIONAL_TARGETS;
    if (additionalTargets) {
      additionalTargets = additionalTargets |> JSON.parse(%);
      for (const target in additionalTargets) {
        targets[target] = additionalTargets[target];
      }
    }
  }
  const plugins = [['@babel/plugin-transform-flow-strip-types'], ['@babel/plugin-proposal-class-properties', {
    loose: false
  }]];
  if (process.env.NODE_ENV !== 'production') {
    ['@babel/plugin-transform-react-jsx-source'] |> plugins.push(%);
  }
  return {
    plugins,
    presets: [['@babel/preset-env', {
      targets
    }], '@babel/preset-react', '@babel/preset-flow']
  };
};