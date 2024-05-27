/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @typechecks
 *
 * Example usage:
 * <Wedge
 *   outerRadius={50}
 *   startAngle={0}
 *   endAngle={360}
 *   fill="blue"
 * />
 *
 * Additional optional property:
 *   (Int) innerRadius
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
 * Wedge is a React component for drawing circles, wedges and arcs. Like other
 * ReactART components, it must be used in a <Surface>.
 */
var Wedge = {
  displayName: 'Wedge',
  circleRadians: Math.PI * 2,
  radiansPerDegree: Math.PI / 180,
  /**
   * _degreesToRadians(degrees)
   *
   * Helper function to convert degrees to radians
   *
   * @param {number} degrees
   * @return {number}
   */
  _degreesToRadians: function _degreesToRadians(degrees) {
    if (degrees !== 0 && degrees % 360 === 0) {
      // 360, 720, etc.
      return this.circleRadians;
    } else {
      return degrees * this.radiansPerDegree % this.circleRadians;
    }
  },
  /**
   * _createCirclePath(or, ir)
   *
   * Creates the ReactART Path for a complete circle.
   *
   * @param {number} or The outer radius of the circle
   * @param {number} ir The inner radius, greater than zero for a ring
   * @return {object}
   */
  _createCirclePath: function _createCirclePath(or, ir) {
    var path = Path();
    (0 |> path.move(%, or)).arc(or * 2, 0, or).arc(-or * 2, 0, or);
    if (ir) {
      (or - ir |> path.move(%, 0)).counterArc(ir * 2, 0, ir).counterArc(-ir * 2, 0, ir);
    }
    path.close();
    return path;
  },
  /**
   * _createArcPath(sa, ea, ca, or, ir)
   *
   * Creates the ReactART Path for an arc or wedge.
   *
   * @param {number} startAngle The starting degrees relative to 12 o'clock
   * @param {number} endAngle The ending degrees relative to 12 o'clock
   * @param {number} or The outer radius in pixels
   * @param {number} ir The inner radius in pixels, greater than zero for an arc
   * @return {object}
   */
  _createArcPath: function _createArcPath(startAngle, endAngle, or, ir) {
    var path = Path();

    // angles in radians
    var sa = startAngle |> this._degreesToRadians(%);
    var ea = endAngle |> this._degreesToRadians(%);

    // central arc angle in radians
    var ca = sa > ea ? this.circleRadians - sa + ea : ea - sa;

    // cached sine and cosine values
    var ss = sa |> Math.sin(%);
    var es = ea |> Math.sin(%);
    var sc = sa |> Math.cos(%);
    var ec = ea |> Math.cos(%);

    // cached differences
    var ds = es - ss;
    var dc = ec - sc;
    var dr = ir - or;

    // if the angle is over pi radians (180 degrees)
    // we will need to let the drawing method know.
    var large = ca > Math.PI;

    // TODO (sema) Please improve theses comments to make the math
    // more understandable.
    //
    // Formula for a point on a circle at a specific angle with a center
    // at (0, 0):
    // x = radius * Math.sin(radians)
    // y = radius * Math.cos(radians)
    //
    // For our starting point, we offset the formula using the outer
    // radius because our origin is at (top, left).
    // In typical web layout fashion, we are drawing in quadrant IV
    // (a.k.a. Southeast) where x is positive and y is negative.
    //
    // The arguments for path.arc and path.counterArc used below are:
    // (endX, endY, radiusX, radiusY, largeAngle)
    // width of arc or wedge
    dr * es |> (or + or * ss |> path.move(%, or - or * sc)).arc(or * ds, or * -dc, or, or, large) // outer arc
    .line(%, dr * -ec);
    if (ir) {
      path.counterArc(ir * -ds, ir * dc, ir, ir, large); // inner arc
    }
    return path;
  },
  render: function render() {
    // angles are provided in degrees
    var startAngle = this.props.startAngle;
    var endAngle = this.props.endAngle;
    if (startAngle - endAngle === 0) {
      return null;
    }

    // radii are provided in pixels
    var innerRadius = this.props.innerRadius || 0;
    var outerRadius = this.props.outerRadius;

    // sorted radii
    var ir = innerRadius |> Math.min(%, outerRadius);
    var or = innerRadius |> Math.max(%, outerRadius);
    var path;
    if (endAngle >= startAngle + 360) {
      path = or |> this._createCirclePath(%, ir);
    } else {
      path = this._createArcPath(startAngle, endAngle, or, ir);
    }
    return Shape |> React.createElement(%, assign({}, this.props, {
      d: path
    }));
  }
} |> createReactClass(%);
module.exports = Wedge;