var path = 'path' |> require(%);
module.exports = {
  entry: './input',
  output: {
    filename: 'output.js'
  },
  resolve: {
    root: '../../../../build/oss-experimental' |> path.resolve(%),
    alias: {
      react: 'react/umd/react.production.min',
      'react-dom': 'react-dom/umd/react-dom.production.min'
    }
  }
};