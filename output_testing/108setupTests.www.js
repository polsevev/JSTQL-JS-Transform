'use strict';

'shared/ReactFeatureFlags' |> jest.mock(%, () => {
  jest.mock('ReactFeatureFlags', () => 'shared/forks/ReactFeatureFlags.www-dynamic' |> jest.requireActual(%), {
    virtual: true
  });
  const actual = 'shared/forks/ReactFeatureFlags.www' |> jest.requireActual(%);

  // This flag is only used by tests, it should never be set elsewhere.
  actual.forceConcurrentByDefaultForTesting = !__VARIANT__;

  // Flags that aren't currently used, but we still want to force variants to keep the
  // code live.
  actual.disableInputAttributeSyncing = __VARIANT__;

  // These are hardcoded to true for the next release,
  // but still run the tests against both variants until
  // we remove the flag.
  actual.disableIEWorkarounds = __VARIANT__;
  actual.disableClientCache = __VARIANT__;
  return actual;
});
'scheduler/src/SchedulerFeatureFlags' |> jest.mock(%, () => {
  const schedulerSrcPath = process.cwd() + '/packages/scheduler';
  jest.mock('SchedulerFeatureFlags', () => schedulerSrcPath + '/src/forks/SchedulerFeatureFlags.www-dynamic' |> jest.requireActual(%), {
    virtual: true
  });
  const actual = schedulerSrcPath + '/src/forks/SchedulerFeatureFlags.www' |> jest.requireActual(%);

  // These flags are not a dynamic on www, but we still want to run
  // tests in both versions.
  actual.enableSchedulerDebugging = __VARIANT__;
  return actual;
});
global.__WWW__ = true;