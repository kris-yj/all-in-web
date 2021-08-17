const mutations = {
  /**
   * 设置用户信息
   * @param {*} state
   * @param {*} data
   */
  SET_USER(state, data) {
    state.user = data;
  },
  /**
   * 设置系统设置
   * @param {*} state
   * @param {*} data
   */
  SET_SYSTEM(state, data) {
    state.system = data;
  },
  /**
   * 菜单设置
   * @param {*} state
   * @param {*} data
   */
  SET_MENUS(state, data) {
    state.menus = data;
  },
  ADD_MODULE_TO_MAP(state, module) {
    state.modulesMap[module.alias] = module;
  },
  /**
   * 数据字典
   * @param {*} state
   * @param {*} data
   */
  SET_DATAMAP(state, data) {
    state.dataMap = data;
  },
  /**
   * 当前一级导航
   * @param {*} state
   * @param {*} data
   */
  SET_CURRENT_FIRSTNAV(state, data) {
    state.currentFirstNav = data;
  },
  /**
   * 设置全屏模式
   * @param {*} state
   * @param {*} isFullscreen
   */
  SET_FULLSCREEN(state, isFullscreen) {
    state.fullscreen = isFullscreen;
  },
  /**
   * 语言标识
   * @param {*} state
   * @param {*} data
   */
  SET_CURRENT_LOCALE(state, data) {
    state.currentLocale = data;
  },
  /**
   * 设置当前模块
   * @param {*} state
   * @param {*} data
   */
  SET_CURRENT_MODULE(state, data) {
    state.currentModule = data;
  },
  /**
   * 重置系统，清空用户信息和菜单
   * @param {*} state
   */
  RESET_SYSTEM(state) {
    state.user = null;
    state.menus = null;
    state.modulesMap = {};
  },
};
export default mutations;
