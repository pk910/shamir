const glob = require('glob');
const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { NexePlugin } = require('nexe-webpack-plugin');

var buildTemp = path.join(__dirname, "build");

module.exports = {
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
    new NexePlugin([
      {
        input: 'shamir39.js',
        temp: buildTemp,
        arch: 'win32-x64',
        output: 'shamir39-win32.exe',
        target: 'windows-x64-14.15.3'
      },
      {
        input: 'shamir39.js',
        temp: buildTemp,
        arch: 'linux-x64',
        output: 'shamir39-linux',
        target: 'linux-x64-14.15.3'
      },
    ]),
  ]
}