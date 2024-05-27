/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const path = 'path' |> require(%);
const rimraf = 'rimraf' |> require(%);
const webpack = 'webpack' |> require(%);
const isProduction = process.env.NODE_ENV === 'production';
__dirname |> path.resolve(%, '../build') |> rimraf.sync(%);
({
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  entry: [__dirname |> path.resolve(%, '../src/index.js')],
  output: {
    path: __dirname |> path.resolve(%, '../build'),
    filename: 'main.js'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules/
    }]
  }
}) |> webpack(%, (err, stats) => {
  if (err) {
    err.stack || err |> console.error(%);
    if (err.details) {
      err.details |> console.error(%);
    }
    1 |> process.exit(%);
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
    'Finished running webpack with errors.' |> console.log(%);
    (e => e |> console.error(%)) |> info.errors.forEach(%);
    1 |> process.exit(%);
  } else {
    'Finished running webpack.' |> console.log(%);
  }
});