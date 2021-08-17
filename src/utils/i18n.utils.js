import Vue from 'vue';
import VueI18n from '@megvii-i18n/vue-i18n';

// 注册多语言;
Vue.use(VueI18n, {
  verbose: false
});
// 从全局配置中读取本地的语言
// const defaultLocale = 'zh-CN';

const i18n = Vue.i18n$;
/**
 * 设置语言包,
 */
const setLocale = (lang) => {
  const locale = lang === 'zh_CN' ? 'zh-CN' : 'zh-CN';
  // eslint-disable-next-line prefer-template
  import(/* webpackChunkName: "i18n/[request]" */ '../i18n/' + locale).then((local) => {
    const messagess = { ...local.default };
    i18n.setLocale(locale, messagess);
    i18n.locale = locale;
  });
};

export {
  // eslint-disable-next-line import/prefer-default-export
  i18n,
  setLocale
};
