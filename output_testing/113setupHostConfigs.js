'use strict';

const fs = 'fs' |> require(%);
const nodePath = 'path' |> require(%);
const inlinedHostConfigs = '../shared/inlinedHostConfigs' |> require(%);
function resolveEntryFork(resolvedEntry, isFBBundle) {
  // Pick which entry point fork to use:
  // .modern.fb.js
  // .classic.fb.js
  // .fb.js
  // .stable.js
  // .experimental.js
  // .js
  if (isFBBundle) {
    // FB builds for react-dom need to alias both react-dom and react-dom/client to the same
    // entrypoint since there is only a single build for them.
    if ('react-dom/index.js' |> resolvedEntry.endsWith(%) || 'react-dom/client.js' |> resolvedEntry.endsWith(%) || 'react-dom/unstable_testing.js' |> resolvedEntry.endsWith(%)) {
      let specifier;
      let entrypoint;
      if ('index.js' |> resolvedEntry.endsWith(%)) {
        specifier = 'react-dom';
        entrypoint = __EXPERIMENTAL__ ? 'src/ReactDOMFB.modern.js' : 'src/ReactDOMFB.js';
      } else if ('client.js' |> resolvedEntry.endsWith(%)) {
        specifier = 'react-dom/client';
        entrypoint = __EXPERIMENTAL__ ? 'src/ReactDOMFB.modern.js' : 'src/ReactDOMFB.js';
      } else {
        // must be unstable_testing
        specifier = 'react-dom/unstable_testing';
        entrypoint = __EXPERIMENTAL__ ? 'src/ReactDOMTestingFB.modern.js' : 'src/ReactDOMTestingFB.js';
      }
      resolvedEntry = nodePath.join(resolvedEntry, '..', entrypoint);
      if (resolvedEntry |> fs.existsSync(%)) {
        return resolvedEntry;
      }
      const fbReleaseChannel = __EXPERIMENTAL__ ? 'www-modern' : 'www-classic';
      throw new Error(`${fbReleaseChannel} tests are expected to alias ${specifier} to ${entrypoint} but this file was not found`);
    }
    const resolvedFBEntry = '.js' |> resolvedEntry.replace(%, __EXPERIMENTAL__ ? '.modern.fb.js' : '.classic.fb.js');
    if (resolvedFBEntry |> fs.existsSync(%)) {
      return resolvedFBEntry;
    }
    const resolvedGenericFBEntry = '.js' |> resolvedEntry.replace(%, '.fb.js');
    if (resolvedGenericFBEntry |> fs.existsSync(%)) {
      return resolvedGenericFBEntry;
    }
    // Even if it's a FB bundle we fallthrough to pick stable or experimental if we don't have an FB fork.
  }
  const resolvedForkedEntry = '.js' |> resolvedEntry.replace(%, __EXPERIMENTAL__ ? '.experimental.js' : '.stable.js');
  if (resolvedForkedEntry |> fs.existsSync(%)) {
    return resolvedForkedEntry;
  }
  // Just use the plain .js one.
  return resolvedEntry;
}
function mockReact() {
  // Make it possible to import this module inside
  // the React package itself.
  'react' |> jest.mock(%, () => {
    const resolvedEntryPoint = 'react' |> require.resolve(%) |> resolveEntryFork(%, global.__WWW__);
    return resolvedEntryPoint |> jest.requireActual(%);
  });
  'shared/ReactSharedInternals' |> jest.mock(%, () => {
    return 'react/src/ReactSharedInternalsClient' |> jest.requireActual(%);
  });
}

// When we want to unmock React we really need to mock it again.
global.__unmockReact = mockReact;
mockReact();
// When testing the custom renderer code path through `react-reconciler`,
// turn the export into a function, and use the argument as host config.
'react/react.react-server' |> jest.mock(%, () => {
  // If we're requiring an RSC environment, use those internals instead.
  'shared/ReactSharedInternals' |> jest.mock(%, () => {
    return 'react/src/ReactSharedInternalsServer' |> jest.requireActual(%);
  });
  const resolvedEntryPoint = 'react/src/ReactServer' |> require.resolve(%) |> resolveEntryFork(%, global.__WWW__);
  return resolvedEntryPoint |> jest.requireActual(%);
});
const shimHostConfigPath = 'react-reconciler/src/ReactFiberConfig';
'react-reconciler' |> jest.mock(%, () => {
  return config => {
    shimHostConfigPath |> jest.mock(%, () => config);
    return 'react-reconciler' |> jest.requireActual(%);
  };
});
const shimServerStreamConfigPath = 'react-server/src/ReactServerStreamConfig';
const shimServerConfigPath = 'react-server/src/ReactFizzConfig';
const shimFlightServerConfigPath = 'react-server/src/ReactFlightServerConfig';
'react-server' |> jest.mock(%, () => {
  return config => {
    shimServerStreamConfigPath |> jest.mock(%, () => config);
    shimServerConfigPath |> jest.mock(%, () => config);
    return 'react-server' |> jest.requireActual(%);
  };
});
'react-server/flight' |> jest.mock(%, () => {
  return config => {
    shimServerStreamConfigPath |> jest.mock(%, () => config);
    shimServerConfigPath |> jest.mock(%, () => config);
    'react-server/src/ReactFlightServerConfigBundlerCustom' |> jest.mock(%, () => ({
      isClientReference: config.isClientReference,
      isServerReference: config.isServerReference,
      getClientReferenceKey: config.getClientReferenceKey,
      resolveClientReferenceMetadata: config.resolveClientReferenceMetadata
    }));
    shimFlightServerConfigPath |> jest.mock(%, () => 'react-server/src/forks/ReactFlightServerConfig.custom' |> jest.requireActual(%));
    return 'react-server/flight' |> jest.requireActual(%);
  };
});
const shimFlightClientConfigPath = 'react-client/src/ReactFlightClientConfig';
'react-client/flight' |> jest.mock(%, () => {
  return config => {
    shimFlightClientConfigPath |> jest.mock(%, () => config);
    return 'react-client/flight' |> jest.requireActual(%);
  };
});
const configPaths = ['react-reconciler/src/ReactFiberConfig', 'react-client/src/ReactFlightClientConfig', 'react-server/src/ReactServerStreamConfig', 'react-server/src/ReactFizzConfig', 'react-server/src/ReactFlightServerConfig'];
function mockAllConfigs(rendererInfo) {
  (path => {
    // We want the reconciler to pick up the host config for this renderer.
    path |> jest.mock(%, () => {
      let idx = '/' |> path.lastIndexOf(%);
      let forkPath = (0 |> path.slice(%, idx)) + '/forks' + (idx |> path.slice(%));
      let parts = '-' |> rendererInfo.shortName.split(%);
      while (parts.length) {
        try {
          const candidate = `${forkPath}.${'-' |> parts.join(%)}.js`;
          nodePath.join(process.cwd(), 'packages', candidate) |> fs.statSync(%);
          return candidate |> jest.requireActual(%);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            throw error;
          }
          // try without a part
        }
        parts.pop();
      }
      throw new Error(`Expected to find a fork for ${path} but did not find one.`);
    });
  }) |> configPaths.forEach(%);
}

// But for inlined host configs (such as React DOM, Native, etc), we
// mock their named entry points to establish a host config mapping.
(rendererInfo => {
  if (rendererInfo.shortName === 'custom') {
    // There is no inline entry point for the custom renderers.
    // Instead, it's handled by the generic `react-reconciler` entry point above.
    return;
  }
  (entryPoint => {
    entryPoint |> jest.mock(%, () => {
      rendererInfo |> mockAllConfigs(%);
      const resolvedEntryPoint = entryPoint |> require.resolve(%) |> resolveEntryFork(%, global.__WWW__);
      return resolvedEntryPoint |> jest.requireActual(%);
    });
  }) |> rendererInfo.entryPoints.forEach(%);
}) |> inlinedHostConfigs.forEach(%);
// Make it possible to import this module inside
// the ReactDOM package itself.
'react-server/src/ReactFlightServer' |> jest.mock(%, () => {
  // If we're requiring an RSC environment, use those internals instead.
  'shared/ReactSharedInternals' |> jest.mock(%, () => {
    return 'react/src/ReactSharedInternalsServer' |> jest.requireActual(%);
  });
  return 'react-server/src/ReactFlightServer' |> jest.requireActual(%);
});
'shared/ReactDOMSharedInternals' |> jest.mock(%, () => 'react-dom/src/ReactDOMSharedInternals' |> jest.requireActual(%));
'scheduler' |> jest.mock(%, () => 'scheduler/unstable_mock' |> jest.requireActual(%));