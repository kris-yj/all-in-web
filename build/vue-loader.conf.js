'use strict'
const isProduction = process.env.NODE_ENV !== 'development' 
const path = require('path');
const noCache = process.env.npm_config_nocache;

module.exports = {
  cacheDirectory: isProduction || noCache? undefined : path.resolve(__dirname, '../node_modules/.cache/vue-loader'),
  cacheIdentifier: 'vue-cache',
  productionMode: isProduction,
  compilerOptions: {
    preserveWhitespace: false
  },
  transformAssetUrls: {
    video: ['src', 'poster'],
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
