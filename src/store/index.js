/**
 * 工程全局共享数据管理 vuex store
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { utils } from '@/utils/utils';
import shelf from '@/components/temporary-shelf/store';
import quickNavigation from '@/components/quick-navigation/store';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

Vue.use(Vuex);

const routeQuery = utils.parseQuery(window.location.hash.split('?')[1]);

const store = new Vuex.Store({
  state: {
    dataMap: null, // 数据字典
    system: null, // 系统设置
    user: null, // 用户信息
    menus: null, // 菜单
    modulesMap: {}, // 当前系统模块
    currentFirstNav: 'alarm', // 当前一级导航
    currentModule: null, // 当前系统模块
    currentLocale: 'zh-CN', // 当前系统语言
    fullscreen: false, // 全屏模式
    pageType: routeQuery.pageType || '' // 当前页面类型，兼容新设计单页single page layout，默认为带菜单的layout布局
  },
  actions,
  mutations,
  getters,
  modules: {
    shelf,
    quickNavigation
  }
});

export default store;
