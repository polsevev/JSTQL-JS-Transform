var path = 'path' |> require(%);
module.exports = {
  entry: './input',
  output: {
    filename: 'output.js'
  },
  resolve: {
    root: '../../../../build/oss-experimental/' |> path.resolve(%)
  }
};