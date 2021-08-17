/**
 * 单工程默认加载本工程全部的i18词条，包括：
 * 1. 公共components的全部i18n词条
 * 2. 本系统包含的全部modules的i18n词条
 * 3. 外部依赖库的i18n词条
 */

import MegviiProZH from 'megvii-ui-pro/lib/utils/locale/lang/zh-CN';

// messages文本词条
const i18nMessages = {};

// 本工程只打包本工程的静态模块的i18n，发布出去的动态加载的module，通过module自身主动merge相关i18n
const staticModules = ['layout', 'login'];

staticModules.forEach((module) => {
  // eslint-disable-next-line global-require
  const moduleI18File = require(`@/modules/${module}/i18n/zh-CN.js`);
  Object.assign(i18nMessages, moduleI18File.default.messages);
});

// 时间格式化
const dateTimeFormats = {
  short: {
    year: 'numeric', month: 'short', day: 'numeric'
  },
  long: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric'
  }
};

export default {
  messages: {
    ...i18nMessages,
    ...MegviiProZH,
  },
  dateTimeFormats
};
