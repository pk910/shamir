const glob = require('glob');
const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

// const generateHTMLPlugins = () => glob.sync('./src/**/*.html').map(
//   dir => new HTMLWebpackPlugin({
//     filename: path.basename(dir), // Output
//     template: dir, // Input
//     inlineSource: '.(js|css)$' // embed all javascript and css inline
//   })
// );

module.exports = {
  node: {
    fs: 'empty',
  },
  entry: ['./src/js/app.js', './src/style/main.scss'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: './src/static/',
        to: './static/',
      },
    ]),
    // ...generateHTMLPlugins(),
    new HTMLWebpackPlugin({
      // filename: path.resolve(__dirname, 'dist') + 'foo.html', // Output
      template: './src/index.html', // Input
      inlineSource: '.(js|css)$' // embed all javascript and css inline
    }),
    new HtmlWebpackInlineSourcePlugin()
  ],
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};