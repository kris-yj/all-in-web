// vue
import Vue from 'vue';
// import VueCompositionAPI from '@vue/composition-api';
import './utils/composition-api.js';
// megvii-ui-pro 默认依赖megvii-ui，因此megvii-ui不需要单独import和安装使用。
import MegviiUIPRO from 'megvii-ui-pro';
// 系统全局样式scss，主要包含全局的样式变量和组件库样式变量的引入和覆盖
import './scss/index.scss';
// 地图2.0
import MegviiGis from '@megvii-gis/vue-components';
// 播放器
import MegviiVideoPlayer from '@megvii-video-player/vue-player';
// vuex全局数据管理
import store from '@/store';
// vue-router的初始化
import router from '@/utils/router.utils';
// 系统启动方法
import { startupSystem } from '@/utils/startup.utils';
import '@/utils/filter.utils.js';
// 设置http
import '@/utils/http.utils';
// vue-i18n的初始化，后续使用megvii-i18n替换
import { i18n } from '@/utils/i18n.utils';

import PageLayout from '@/components/layout/page-layout';

import App from './app.vue';

import eventTracking from './mixins/event-tracking';

// Vue.use(VueCompositionAPI);

// 内容区page的layout组件，兼容单页形式，全局注册，各个pages不用单独注册即可使用
Vue.component('page-layout', PageLayout);
Vue.mixin(eventTracking);
Vue.use(MegviiUIPRO, {
  i18n: (key, value) => i18n.t(key, value)
});
Vue.use(MegviiGis);
Vue.use(MegviiVideoPlayer);

// Vue.config.performance = true;

// 确保系统配置加载完成（系统配置和字典表加载完成）后再初始化Vue
startupSystem().then((res) => {
  const systemData = res[1];
  // 获取配置的语言标识locale
  const locale = systemData.i18nMessageLang.value || 'zh-CN';

  consola.info('system lang is: ', locale);
  consola.info('clientAppId is: ', clientAppId);

  // 导入对应的语言文件
  // eslint-disable-next-line prefer-template
  import(/* webpackChunkName: "i18n/[request]" */'./i18n/' + locale).then((local) => {
    const { messages, dateTimeFormats } = { ...local.default };
    i18n.setLocale(locale, messages);
    if (dateTimeFormats) {
      i18n.setDateTimeFormats(locale, dateTimeFormats);
    }
    consola.success('i18n messages loaded successful');
    // 语言文件加载成功后，完成Vue的实例初始化，路由拦截等
    new Vue({ // eslint-disable-line
      el: '#app',
      store,
      router,
      i18n,
      components: {
        App
      },
      template: '<App/>'
    });
  });
});

// 打印当前主要依赖库版本，通过webpack.DefinePlugin注入
// eslint-disable-next-line no-undef
console.log('packages info:', pkgInfo);
