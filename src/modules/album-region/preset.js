/* Automatically generated by './build/add-module.js' */
/**
 * Automatically generated by './build/add-module.js'
 * 用处：此文件作为 module 加载前的 preset 前置执行文件
 * 位置：module 导出文件 export 最前面import，可以放置一些需要 module 加载前执行的 preset 前置代码
 * 例如：国际化的词条融合等
 */

import merge from 'lodash/merge';
import { i18n } from '@/utils/i18n.utils';

// 完成module所依赖的国际化map，包括module自身依赖的国际化（ module/i18n/ ）和 本工程依赖的全部公共components依赖的国际化（ src/components/i18n ）
const i18nMap = {};

const requireI18nFiles = require.context('./i18n', true, /.js$/);
const requireComponentsI18nFiles = require.context('@/components/i18n', true, /.js$/);
const requireCommonComponentsI18nFiles = require.context('@/common-components/i18n', true, /.js$/);

[requireI18nFiles, requireComponentsI18nFiles, requireCommonComponentsI18nFiles].forEach((mod) => {
  mod.keys().forEach((fileName) => {
    const moduleI18n = mod(fileName).default;
    i18nMap[moduleI18n.lang] = merge(i18nMap[moduleI18n.lang] || {}, moduleI18n);
  });
});

// 根据当前加载的语言环境，加载解析module之前 merge i18n语言文件
i18n.mergeLocaleMessage(i18n.locale, i18nMap[i18n.locale].messages);

consola.success('Module album-region i18n merged: ', i18n.locale, i18nMap[i18n.locale].messages);
