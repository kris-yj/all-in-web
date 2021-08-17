const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const WebpackBar = require('webpackbar');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const portfinder = require('portfinder');

const PORT = process.env.PORT && Number(process.env.PORT);

const devWebpackConfig = {
  mode: 'development',
  entry: ['./src/main.js'],
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    // webpack 4 默认会启用webpack.DefinePlugin 根据mode去定义
    // new webpack.DefinePlugin({
    //   'process.env.NODE_ENV': JSON.stringify('development')
    // // }),
    // new VueLoaderPlugin(),
    // 必须有 webpack.HotModuleReplacementPlugin 才能完全启用 HMR
    new webpack.HotModuleReplacementPlugin(),
    new WebpackBuildNotifierPlugin({
      title: "SST-FE Project Build",
      logo: path.resolve(__dirname, '../public/favicon.ico'),
      suppressSuccess: true
    }),
    // html template
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../public/index.html'),
      inject: true
    }),
  ],
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  }
}

const config = merge(devWebpackConfig, baseWebpackConfig);

module.exports = config;
