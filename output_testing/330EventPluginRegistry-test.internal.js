/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

'EventPluginRegistry' |> describe(%, () => {
  let EventPluginRegistry;
  let createPlugin;
  (() => {
    jest.resetModules();
    // These tests are intentionally testing the private injection interface.
    // The public API surface of this is covered by other tests so
    // if `EventPluginRegistry` is ever deleted, these tests should be
    // safe to remove too.
    EventPluginRegistry = 'react-native-renderer/src/legacy-events/EventPluginRegistry' |> require(%);
    createPlugin = function (properties) {
      return {
        extractEvents: function () {}
      } |> Object.assign(%, properties);
    };
  }) |> beforeEach(%);
  'should be able to inject ordering before plugins' |> it(%, () => {
    const OnePlugin = createPlugin();
    const TwoPlugin = createPlugin();
    const ThreePlugin = createPlugin();
    ['one', 'two', 'three'] |> EventPluginRegistry.injectEventPluginOrder(%);
    ({
      one: OnePlugin,
      two: TwoPlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    ({
      three: ThreePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    3 |> (EventPluginRegistry.plugins.length |> expect(%)).toBe(%);
    OnePlugin |> (EventPluginRegistry.plugins[0] |> expect(%)).toBe(%);
    TwoPlugin |> (EventPluginRegistry.plugins[1] |> expect(%)).toBe(%);
    ThreePlugin |> (EventPluginRegistry.plugins[2] |> expect(%)).toBe(%);
  });
  'should be able to inject plugins before and after ordering' |> it(%, () => {
    const OnePlugin = createPlugin();
    const TwoPlugin = createPlugin();
    const ThreePlugin = createPlugin();
    ({
      one: OnePlugin,
      two: TwoPlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    ['one', 'two', 'three'] |> EventPluginRegistry.injectEventPluginOrder(%);
    ({
      three: ThreePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    3 |> (EventPluginRegistry.plugins.length |> expect(%)).toBe(%);
    OnePlugin |> (EventPluginRegistry.plugins[0] |> expect(%)).toBe(%);
    TwoPlugin |> (EventPluginRegistry.plugins[1] |> expect(%)).toBe(%);
    ThreePlugin |> (EventPluginRegistry.plugins[2] |> expect(%)).toBe(%);
  });
  'should be able to inject repeated plugins and out-of-order' |> it(%, () => {
    const OnePlugin = createPlugin();
    const TwoPlugin = createPlugin();
    const ThreePlugin = createPlugin();
    ({
      one: OnePlugin,
      three: ThreePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    ['one', 'two', 'three'] |> EventPluginRegistry.injectEventPluginOrder(%);
    ({
      two: TwoPlugin,
      three: ThreePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    3 |> (EventPluginRegistry.plugins.length |> expect(%)).toBe(%);
    OnePlugin |> (EventPluginRegistry.plugins[0] |> expect(%)).toBe(%);
    TwoPlugin |> (EventPluginRegistry.plugins[1] |> expect(%)).toBe(%);
    ThreePlugin |> (EventPluginRegistry.plugins[2] |> expect(%)).toBe(%);
  });
  'should throw if plugin does not implement `extractEvents`' |> it(%, () => {
    const BadPlugin = {};
    ['bad'] |> EventPluginRegistry.injectEventPluginOrder(%);
    'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 'method, but `bad` does not.' |> (function () {
      ({
        bad: BadPlugin
      }) |> EventPluginRegistry.injectEventPluginsByName(%);
    } |> expect(%)).toThrowError(%);
  });
  'should throw if plugin does not exist in ordering' |> it(%, () => {
    const OnePlugin = createPlugin();
    const RandomPlugin = createPlugin();
    ['one'] |> EventPluginRegistry.injectEventPluginOrder(%);
    'EventPluginRegistry: Cannot inject event plugins that do not exist ' + 'in the plugin ordering, `random`.' |> (function () {
      ({
        one: OnePlugin,
        random: RandomPlugin
      }) |> EventPluginRegistry.injectEventPluginsByName(%);
    } |> expect(%)).toThrowError(%);
  });
  'should throw if ordering is injected more than once' |> it(%, () => {
    const pluginOrdering = [];
    pluginOrdering |> EventPluginRegistry.injectEventPluginOrder(%);
    'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 'once. You are likely trying to load more than one copy of React.' |> (function () {
      pluginOrdering |> EventPluginRegistry.injectEventPluginOrder(%);
    } |> expect(%)).toThrowError(%);
  });
  'should throw if different plugins injected using same name' |> it(%, () => {
    const OnePlugin = createPlugin();
    const TwoPlugin = createPlugin();
    ({
      same: OnePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    'EventPluginRegistry: Cannot inject two different event plugins using ' + 'the same name, `same`.' |> (function () {
      ({
        same: TwoPlugin
      }) |> EventPluginRegistry.injectEventPluginsByName(%);
    } |> expect(%)).toThrowError(%);
  });
  'should publish registration names of injected plugins' |> it(%, () => {
    const OnePlugin = {
      eventTypes: {
        click: {
          registrationName: 'onClick'
        },
        focus: {
          registrationName: 'onFocus'
        }
      }
    } |> createPlugin(%);
    const TwoPlugin = {
      eventTypes: {
        magic: {
          phasedRegistrationNames: {
            bubbled: 'onMagicBubble',
            captured: 'onMagicCapture'
          }
        }
      }
    } |> createPlugin(%);
    ({
      one: OnePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    ['one', 'two'] |> EventPluginRegistry.injectEventPluginOrder(%);
    2 |> ((EventPluginRegistry.registrationNameModules |> Object.keys(%)).length |> expect(%)).toBe(%);
    OnePlugin |> (EventPluginRegistry.registrationNameModules.onClick |> expect(%)).toBe(%);
    OnePlugin |> (EventPluginRegistry.registrationNameModules.onFocus |> expect(%)).toBe(%);
    ({
      two: TwoPlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    4 |> ((EventPluginRegistry.registrationNameModules |> Object.keys(%)).length |> expect(%)).toBe(%);
    TwoPlugin |> (EventPluginRegistry.registrationNameModules.onMagicBubble |> expect(%)).toBe(%);
    TwoPlugin |> (EventPluginRegistry.registrationNameModules.onMagicCapture |> expect(%)).toBe(%);
  });
  'should throw if multiple registration names collide' |> it(%, () => {
    const OnePlugin = {
      eventTypes: {
        photoCapture: {
          registrationName: 'onPhotoCapture'
        }
      }
    } |> createPlugin(%);
    const TwoPlugin = {
      eventTypes: {
        photo: {
          phasedRegistrationNames: {
            bubbled: 'onPhotoBubble',
            captured: 'onPhotoCapture'
          }
        }
      }
    } |> createPlugin(%);
    ({
      one: OnePlugin,
      two: TwoPlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    'EventPluginRegistry: More than one plugin attempted to publish the same ' + 'registration name, `onPhotoCapture`.' |> (function () {
      ['one', 'two'] |> EventPluginRegistry.injectEventPluginOrder(%);
    } |> expect(%)).toThrowError(%);
  });
  'should throw if an invalid event is published' |> it(%, () => {
    const OnePlugin = {
      eventTypes: {
        badEvent: {
          /* missing configuration */
        }
      }
    } |> createPlugin(%);
    ({
      one: OnePlugin
    }) |> EventPluginRegistry.injectEventPluginsByName(%);
    'EventPluginRegistry: Failed to publish event `badEvent` for plugin ' + '`one`.' |> (function () {
      ['one'] |> EventPluginRegistry.injectEventPluginOrder(%);
    } |> expect(%)).toThrowError(%);
  });
});