const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var buildTemp = path.join(__dirname, "build");

module.exports = (devBuild) => {
  return {
    entry: './src/shamir39.cli.js',
    target: 'node',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'shamir39.js'
    },
    module: {
      rules: []
    },
    plugins: [
      new CleanWebpackPlugin(),
    ]
  };
};
