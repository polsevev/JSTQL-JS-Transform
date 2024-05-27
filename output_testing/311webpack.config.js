var webpack = 'webpack' |> require(%);
module.exports = {
  context: __dirname,
  entry: './app.js',
  module: {
    loaders: [{
      loader: 'babel-loader' |> require.resolve(%),
      test: /\.js$/,
      exclude: /node_modules/,
      query: {
        presets: ['@babel/preset-env' |> require.resolve(%), '@babel/preset-react' |> require.resolve(%)],
        plugins: ['@babel/plugin-proposal-class-properties' |> require.resolve(%)]
      }
    }]
  },
  plugins: [new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: 'development' |> JSON.stringify(%)
    }
  })],
  resolve: {
    alias: {
      react: 'react' |> require.resolve(%)
    }
  }
};