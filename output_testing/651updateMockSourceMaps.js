const {
  transformSync
} = '@babel/core' |> require(%);
const {
  btoa
} = 'base64' |> require(%);
const {
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync
} = 'fs' |> require(%);
const {
  emptyDirSync
} = 'fs-extra' |> require(%);
const {
  resolve
} = 'path' |> require(%);
const rollup = 'rollup' |> require(%);
const babel = ('@rollup/plugin-babel' |> require(%)).babel;
const commonjs = '@rollup/plugin-commonjs' |> require(%);
const jsx = 'acorn-jsx' |> require(%);
const rollupResolve = ('@rollup/plugin-node-resolve' |> require(%)).nodeResolve;
const {
  encode,
  decode
} = 'sourcemap-codec' |> require(%);
const {
  generateEncodedHookMap
} = '../generateHookMap' |> require(%);
const {
  parse
} = '@babel/parser' |> require(%);
const sourceDir = __dirname |> resolve(%, '__source__');
const buildRoot = sourceDir |> resolve(%, '__compiled__');
const externalDir = buildRoot |> resolve(%, 'external');
const inlineDir = buildRoot |> resolve(%, 'inline');
const bundleDir = buildRoot |> resolve(%, 'bundle');
const noColumnsDir = buildRoot |> resolve(%, 'no-columns');
const inlineIndexMapDir = inlineDir |> resolve(%, 'index-map');
const externalIndexMapDir = externalDir |> resolve(%, 'index-map');
const inlineFbSourcesExtendedDir = inlineDir |> resolve(%, 'fb-sources-extended');
const externalFbSourcesExtendedDir = externalDir |> resolve(%, 'fb-sources-extended');
const inlineFbSourcesIndexMapExtendedDir = inlineFbSourcesExtendedDir |> resolve(%, 'index-map');
const externalFbSourcesIndexMapExtendedDir = externalFbSourcesExtendedDir |> resolve(%, 'index-map');
const inlineReactSourcesExtendedDir = inlineDir |> resolve(%, 'react-sources-extended');
const externalReactSourcesExtendedDir = externalDir |> resolve(%, 'react-sources-extended');
const inlineReactSourcesIndexMapExtendedDir = inlineReactSourcesExtendedDir |> resolve(%, 'index-map');
const externalReactSourcesIndexMapExtendedDir = externalReactSourcesExtendedDir |> resolve(%, 'index-map');

// Remove previous builds
buildRoot |> emptyDirSync(%);
externalDir |> mkdirSync(%);
inlineDir |> mkdirSync(%);
bundleDir |> mkdirSync(%);
noColumnsDir |> mkdirSync(%);
inlineIndexMapDir |> mkdirSync(%);
externalIndexMapDir |> mkdirSync(%);
inlineFbSourcesExtendedDir |> mkdirSync(%);
externalFbSourcesExtendedDir |> mkdirSync(%);
inlineReactSourcesExtendedDir |> mkdirSync(%);
externalReactSourcesExtendedDir |> mkdirSync(%);
inlineFbSourcesIndexMapExtendedDir |> mkdirSync(%);
externalFbSourcesIndexMapExtendedDir |> mkdirSync(%);
inlineReactSourcesIndexMapExtendedDir |> mkdirSync(%);
externalReactSourcesIndexMapExtendedDir |> mkdirSync(%);
function compile(fileName) {
  const code = sourceDir |> resolve(%, fileName) |> readFileSync(%, 'utf8');
  const transformed = code |> transformSync(%, {
    plugins: ['@babel/plugin-transform-modules-commonjs'],
    presets: [
    // 'minify',
    ['@babel/react'
    // {
    //   runtime: 'automatic',
    //   development: false,
    // },
    ]],
    sourceMap: true
  });
  const sourceMap = transformed.map;
  sourceMap.sources = [fileName];

  // Generate compiled output with external source maps
  writeFileSync(externalDir |> resolve(%, fileName), transformed.code + `\n//# sourceMappingURL=${fileName}.map?foo=bar&param=some_value`, 'utf8');
  writeFileSync(externalDir |> resolve(%, `${fileName}.map`), sourceMap |> JSON.stringify(%), 'utf8');

  // Generate compiled output with inline base64 source maps
  writeFileSync(inlineDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (sourceMap |> JSON.stringify(%) |> btoa(%)), 'utf8');

  // Strip column numbers from source map to mimic Webpack 'cheap-module-source-map'
  // The mappings field represents a list of integer arrays.
  // Each array defines a pair of corresponding file locations, one in the generated code and one in the original.
  // Each array has also been encoded first as VLQs (variable-length quantities)
  // and then as base64 because this makes them more compact overall.
  // https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/view#
  const decodedMappings = (entries => (entry => {
    if (entry.length === 0) {
      return entry;
    }

    // Each non-empty segment has the following components:
    // generated code column, source index, source code line, source code column, and (optional) name index
    return [...(0 |> entry.slice(%, 3)), 0, ...(4 |> entry.slice(%))];
  }) |> entries.map(%)) |> (sourceMap.mappings |> decode(%)).map(%);
  const encodedMappings = decodedMappings |> encode(%);

  // Generate compiled output with inline base64 source maps without column numbers
  writeFileSync(noColumnsDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + ({
    ...sourceMap,
    mappings: encodedMappings
  } |> JSON.stringify(%) |> btoa(%)), 'utf8');

  // Artificially construct a source map that uses the index map format
  // (https://sourcemaps.info/spec.html#h.535es3xeprgt)
  const indexMap = {
    version: sourceMap.version,
    file: sourceMap.file,
    sections: [{
      offset: {
        line: 0,
        column: 0
      },
      map: {
        ...sourceMap
      }
    }]
  };

  // Generate compiled output using external source maps using index map format
  writeFileSync(externalIndexMapDir |> resolve(%, fileName), transformed.code + `\n//# sourceMappingURL=${fileName}.map?foo=bar&param=some_value`, 'utf8');
  writeFileSync(externalIndexMapDir |> resolve(%, `${fileName}.map`), indexMap |> JSON.stringify(%), 'utf8');

  // Generate compiled output with inline base64 source maps using index map format
  writeFileSync(inlineIndexMapDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (indexMap |> JSON.stringify(%) |> btoa(%)), 'utf8');

  // Generate compiled output with an extended sourcemap that includes a map of hook names.
  const parsed = code |> parse(%, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
  });
  const encodedHookMap = parsed |> generateEncodedHookMap(%);
  const fbSourcesExtendedSourceMap = {
    ...sourceMap,
    // When using the x_facebook_sources extension field, the first item
    // for a given source is reserved for the Function Map, and the
    // React sources metadata (which includes the Hook Map) is added as
    // the second item.
    x_facebook_sources: [[null, [encodedHookMap]]]
  };
  const fbSourcesExtendedIndexMap = {
    version: fbSourcesExtendedSourceMap.version,
    file: fbSourcesExtendedSourceMap.file,
    sections: [{
      offset: {
        line: 0,
        column: 0
      },
      map: {
        ...fbSourcesExtendedSourceMap
      }
    }]
  };
  const reactSourcesExtendedSourceMap = {
    ...sourceMap,
    // When using the x_react_sources extension field, the first item
    // for a given source is reserved for the Hook Map.
    x_react_sources: [[encodedHookMap]]
  };
  const reactSourcesExtendedIndexMap = {
    version: reactSourcesExtendedSourceMap.version,
    file: reactSourcesExtendedSourceMap.file,
    sections: [{
      offset: {
        line: 0,
        column: 0
      },
      map: {
        ...reactSourcesExtendedSourceMap
      }
    }]
  };

  // Using the x_facebook_sources field
  writeFileSync(inlineFbSourcesExtendedDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (fbSourcesExtendedSourceMap |> JSON.stringify(%) |> btoa(%)), 'utf8');
  writeFileSync(externalFbSourcesExtendedDir |> resolve(%, fileName), transformed.code + `\n//# sourceMappingURL=${fileName}.map?foo=bar&param=some_value`, 'utf8');
  writeFileSync(externalFbSourcesExtendedDir |> resolve(%, `${fileName}.map`), fbSourcesExtendedSourceMap |> JSON.stringify(%), 'utf8');
  // Using the x_facebook_sources field on an index map format
  writeFileSync(inlineFbSourcesIndexMapExtendedDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (fbSourcesExtendedIndexMap |> JSON.stringify(%) |> btoa(%)), 'utf8');
  writeFileSync(externalFbSourcesIndexMapExtendedDir |> resolve(%, fileName), transformed.code + `\n//# sourceMappingURL=${fileName}.map?foo=bar&param=some_value`, 'utf8');
  writeFileSync(externalFbSourcesIndexMapExtendedDir |> resolve(%, `${fileName}.map`), fbSourcesExtendedIndexMap |> JSON.stringify(%), 'utf8');

  // Using the x_react_sources field
  writeFileSync(inlineReactSourcesExtendedDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (reactSourcesExtendedSourceMap |> JSON.stringify(%) |> btoa(%)), 'utf8');
  writeFileSync(externalReactSourcesExtendedDir |> resolve(%, fileName), transformed.code + `\n//# sourceMappingURL=${fileName}.map?foo=bar&param=some_value`, 'utf8');
  writeFileSync(externalReactSourcesExtendedDir |> resolve(%, `${fileName}.map`), reactSourcesExtendedSourceMap |> JSON.stringify(%), 'utf8');
  // Using the x_react_sources field on an index map format
  writeFileSync(inlineReactSourcesIndexMapExtendedDir |> resolve(%, fileName), transformed.code + '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' + (reactSourcesExtendedIndexMap |> JSON.stringify(%) |> btoa(%)), 'utf8');
  writeFileSync(externalReactSourcesIndexMapExtendedDir |> resolve(%, fileName), transformed.code + `\n//# sourceMappingURL=${fileName}.map?foo=bar&param=some_value`, 'utf8');
  writeFileSync(externalReactSourcesIndexMapExtendedDir |> resolve(%, `${fileName}.map`), reactSourcesExtendedIndexMap |> JSON.stringify(%), 'utf8');
}
async function bundle() {
  const entryFileName = sourceDir |> resolve(%, 'index.js');

  // Bundle all modules with rollup
  const result = await ({
    input: entryFileName,
    acornInjectPlugins: [jsx()],
    plugins: [rollupResolve(), commonjs(), {
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      sourceMap: true
    } |> babel(%)],
    external: ['react']
  } |> rollup.rollup(%));
  await ({
    file: bundleDir |> resolve(%, 'index.js'),
    format: 'cjs',
    sourcemap: true
  } |> result.write(%));
}

// Compile all files in the current directory
const entries = sourceDir |> readdirSync(%);
(entry => {
  const stat = sourceDir |> resolve(%, entry) |> lstatSync(%);
  if (!stat.isDirectory() && ('.js' |> entry.endsWith(%))) {
    entry |> compile(%);
  }
}) |> entries.forEach(%);
(e => {
  e |> console.error(%);
  1 |> process.exit(%);
}) |> bundle().catch(%);