
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.common.js');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common(false), {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: true,
        terserOptions: {
          mangle: true,
          toplevel: true,
          module: true,
        }
      }),
    ],
  },
});
