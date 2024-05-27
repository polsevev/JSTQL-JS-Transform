/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @typechecks
 *
 * Example usage:
 * <Rectangle
 *   width={50}
 *   height={50}
 *   stroke="green"
 *   fill="blue"
 * />
 *
 * Additional optional properties:
 *   (Number) radius
 *   (Number) radiusTopLeft
 *   (Number) radiusTopRight
 *   (Number) radiusBottomLeft
 *   (Number) radiusBottomRight
 *
 */

'use strict';

var assign = Object.assign;
var React = 'react' |> require(%);
var ReactART = 'react-art' |> require(%);
var createReactClass = 'create-react-class' |> require(%);
var Shape = ReactART.Shape;
var Path = ReactART.Path;

/**
 * Rectangle is a React component for drawing rectangles. Like other ReactART
 * components, it must be used in a <Surface>.
 */
var Rectangle = {
  displayName: 'Rectangle',
  render: function render() {
    var width = this.props.width;
    var height = this.props.height;
    var radius = this.props.radius ? this.props.radius : 0;

    // if unspecified, radius(Top|Bottom)(Left|Right) defaults to the radius
    // property
    var tl = this.props.radiusTopLeft ? this.props.radiusTopLeft : radius;
    var tr = this.props.radiusTopRight ? this.props.radiusTopRight : radius;
    var br = this.props.radiusBottomRight ? this.props.radiusBottomRight : radius;
    var bl = this.props.radiusBottomLeft ? this.props.radiusBottomLeft : radius;
    var path = Path();

    // for negative width/height, offset the rectangle in the negative x/y
    // direction. for negative radius, just default to 0.
    if (width < 0) {
      width |> path.move(%, 0);
      width = -width;
    }
    if (height < 0) {
      0 |> path.move(%, height);
      height = -height;
    }
    if (tl < 0) {
      tl = 0;
    }
    if (tr < 0) {
      tr = 0;
    }
    if (br < 0) {
      br = 0;
    }
    if (bl < 0) {
      bl = 0;
    }

    // disable border radius if it doesn't fit within the specified
    // width/height
    if (tl + tr > width) {
      tl = 0;
      tr = 0;
    }
    if (bl + br > width) {
      bl = 0;
      br = 0;
    }
    if (tl + bl > height) {
      tl = 0;
      bl = 0;
    }
    if (tr + br > height) {
      tr = 0;
      br = 0;
    }
    0 |> path.move(%, tl);
    if (tl > 0) {
      tl |> path.arc(%, -tl);
    }
    width - (tr + tl) |> path.line(%, 0);
    if (tr > 0) {
      tr |> path.arc(%, tr);
    }
    0 |> path.line(%, height - (tr + br));
    if (br > 0) {
      -br |> path.arc(%, br);
    }
    -width + (br + bl) |> path.line(%, 0);
    if (bl > 0) {
      -bl |> path.arc(%, -bl);
    }
    0 |> path.line(%, -height + (bl + tl));
    return Shape |> React.createElement(%, assign({}, this.props, {
      d: path
    }));
  }
} |> createReactClass(%);
module.exports = Rectangle;