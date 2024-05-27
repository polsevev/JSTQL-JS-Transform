var path = 'path' |> require(%);
var webpack = 'webpack' |> require(%);
module.exports = {
  entry: './input',
  output: {
    filename: 'output.js'
  },
  resolve: {
    root: '../../../../build/oss-experimental/' |> path.resolve(%)
  },
  plugins: [new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: 'production' |> JSON.stringify(%)
    }
  })]
};