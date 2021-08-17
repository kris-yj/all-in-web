'use strict'

const path = require('path');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.base.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESBuildPlugin = require('esbuild-minimizer-webpack-plugin').default;

const appDir = 'all-in';

const webpackConfig = {
  mode: 'production',
  entry: {
    app: ['./src/main.js']
  },
  output: {
    path: path.resolve(__dirname, `../dist/${appDir}`),
    filename: 'js/[name].[chunkhash:5].js',
    // 路由懒加载
    chunkFilename: 'js/[name].[chunkhash:3].js',
    publicPath: ''
  },
  devtool: 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../public/index.html'),
      inject: true
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash:3].css",
      // chunkFilename: "css/[name].[contenthash:3].css"
    }),
    new OptimizeCssAssetsPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../public'),
        // to: 'static',
        toType: 'dir',
        ignore: [
          '.DS_Store'
        ]
      }
    ]),
    // new WebpackBar({
    //   name: 'SST-FE Build Tools',
    //   color: '#2f54eb'
    // })
  ],
  optimization: {
    namedChunks: true,
    minimize: true,
    minimizer: [
      new ESBuildPlugin()
      // new TerserPlugin({
      //   sourceMap: true,
      //   extractComments: false,
      //   cache: false,
      //   parallel: true,
      //   terserOptions: {
      //     // turn off flags with small gains to speed up minification
      //     arrows: false,
      //     collapse_vars: false, // 0.3kb
      //     comparisons: false,
      //     computed_props: false,
      //     hoist_funs: false,
      //     hoist_props: false,
      //     hoist_vars: false,
      //     inline: false,
      //     loops: false,
      //     negate_iife: false,
      //     properties: false,
      //     reduce_funcs: false,
      //     reduce_vars: false,
      //     switches: false,
      //     toplevel: false,
      //     typeofs: false,
      //     // a few flags with noticable gains/speed ratio
      //     // numbers based on out of the box vendor bundle
      //     booleans: true, // 0.7kb
      //     if_return: true, // 0.4kb
      //     sequences: true, // 0.7kb
      //     unused: true, // 2.3kb
      //     // required features to drop conditional branches
      //     conditionals: true,
      //     dead_code: true,
      //     evaluate: true,
      //     drop_console: false,
      //     drop_debugger: true,
      //     pure_funcs: ['console.log']
      //   }
      // }),
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: `chunk-vendors`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: `chunk-common`,
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  }
};

module.exports = merge(baseWebpackConfig, webpackConfig);
