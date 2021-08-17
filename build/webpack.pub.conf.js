'use strict'
const path = require('path');
const chalk = require('chalk')
const merge = require('webpack-merge');
const webpack = require('webpack');
const baseWebpackConfig = require('./webpack.base.conf');
const vueLoaderConfig = require('./vue-loader.conf')
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESBuildPlugin = require('esbuild-minimizer-webpack-plugin').default;
const fs = require("fs");
const _  = require('lodash');
const pkg = require('../package.json');

const systemSource = pkg.clientAppId;
const webpackConfigs = [];

const buildModuleEntry = (moduleName) => {
  const entry = {};
  entry[`${moduleName}AsyncModule`] = `./src/modules/${moduleName}/export.js`;
  return entry;
};

const buildModuleWebpackConfig = (moduleName) => {
  // 打包后的module文件夹名，采用 {module名-clienappid} 的形式
  const moduleFileName = `${moduleName}-${systemSource}`;

  const config = {
    mode: 'production',
    entry: buildModuleEntry(moduleName),
    output: {
      path: path.resolve(__dirname, '../dist/modules'),
      filename: `${moduleFileName}/${_.camelCase(moduleName)}AsyncModule.js`,
      // 路由懒加载
      chunkFilename: `${moduleFileName}/[name].[chunkhash:5].js`,
      library: `${_.camelCase(moduleName)}AsyncModule`
    },
    module: {
      rules: [
        {
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          include: [
            path.resolve(__dirname, "../src")
          ],
          options: {
            // formatter: require('eslint-friendly-formatter'),
            emitWarning: true,
            failOnWarning: false,
            failOnError: true
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoaderConfig
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [
            path.resolve(__dirname, "../src")
          ]
        },
        {
          test: /\.scss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                additionalData: `@import "~@/scss/theme-default/var.scss";`,
                implementation: require('sass'),
                sassOptions: {
                  fiber: false,
                  // indentedSyntax: true // optional
                },
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: `${moduleFileName}/assets/images/[name].[hash:5].[ext]`,
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: `${moduleFileName}/assets/media/[name].[hash:5].[ext]`
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: `${moduleFileName}/assets/fonts/[name].[hash:5].[ext]`
          }
        },
        {
          test: /\.(exe|pdf)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: `${moduleFileName}/assets/files/[name].[ext]`
          }
        }      
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('publish')
      }),
      // new WebpackBar({
      //   name: 'SST-FE Build Tools: publish modules',
      //   color: '#2f54eb'
      // })
    ],
    externals: {
      'vue': 'insightApp.vue',
      '@vue/composition-api': 'insightApp.compositionApi',
      'moment': 'insightApp.moment',
      'lodash': 'insightApp.lodash',
      '@/utils/i18n.utils': 'insightApp.i18nLocale',
      '@/utils/i18n.utils.js': 'insightApp.i18nLocale',
      '@/utils/router.utils': 'insightApp.router',
      '@/store': 'insightApp.store',
      'megvii-ui': 'insightApp.components.megviiUI',
      'megvii-ui-pro': 'insightApp.components.megviiUIPRO',
      'megvii-http': 'insightApp.megviiHttp'
    },
    optimization: {
      namedChunks: true,
      minimize: true,
      minimizer: [
        new ESBuildPlugin()
        // new TerserPlugin({
        //   sourceMap: false,
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
    }
  }
  return merge.strategy({
    'module.rules': 'replace'
  })(baseWebpackConfig, config)
};

// 读取module name，过滤掉layout等
const moduleNames = _.without(fs.readdirSync(path.join(__dirname, '../src/modules')), 'layout', 'common', 'login', 'manage', '.DS_Store');
// console.log('moduleNames...........', moduleNames);

// console.log(chalk.cyan('Modules:'));

moduleNames.forEach((moduleName) => {
  // console.log(chalk(`${moduleName}`))
  const config = buildModuleWebpackConfig(moduleName);
  webpackConfigs.push(config);
  // console.log(config.entry);
});

module.exports = webpackConfigs;
