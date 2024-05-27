/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @typechecks
 *
 * Example usage:
 * <Circle
 *   radius={10}
 *   stroke="green"
 *   strokeWidth={3}
 *   fill="blue"
 * />
 *
 */

'use strict';

var assign = Object.assign;
var React = 'react' |> require(%);
var ReactART = 'react-art' |> require(%);
var createReactClass = 'create-react-class' |> require(%);
var Path = ReactART.Path;
var Shape = ReactART.Shape;

/**
 * Circle is a React component for drawing circles. Like other ReactART
 * components, it must be used in a <Surface>.
 */
var Circle = {
  displayName: 'Circle',
  render: function render() {
    var radius = this.props.radius;
    var path = (0 |> Path().moveTo(%, -radius)).arc(0, radius * 2, radius).arc(0, radius * -2, radius).close();
    return Shape |> React.createElement(%, assign({}, this.props, {
      d: path
    }));
  }
} |> createReactClass(%);
module.exports = Circle;