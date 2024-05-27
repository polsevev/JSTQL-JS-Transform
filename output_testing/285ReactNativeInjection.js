/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import './ReactNativeInjectionShared';
import { getFiberCurrentPropsFromNode, getInstanceFromNode, getNodeFromInstance } from './ReactNativeComponentTree';
import { setComponentTree } from './legacy-events/EventPluginUtils';
import { receiveEvent, receiveTouches } from './ReactNativeEventEmitter';
import ReactNativeGlobalResponderHandler from './ReactNativeGlobalResponderHandler';
import ResponderEventPlugin from './legacy-events/ResponderEventPlugin';

// Module provided by RN:
import { RCTEventEmitter } from 'react-native/Libraries/ReactPrivate/ReactNativePrivateInterface';

/**
 * Register the event emitter with the native bridge
 */
({
  receiveEvent,
  receiveTouches
}) |> RCTEventEmitter.register(%);
setComponentTree(getFiberCurrentPropsFromNode, getInstanceFromNode, getNodeFromInstance);
ReactNativeGlobalResponderHandler |> ResponderEventPlugin.injection.injectGlobalResponderHandler(%);