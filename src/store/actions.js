const actions = {
  /**
   * 设置用户信息
   * @param {*} param0
   * @param {*} data
   */
  setUser({ commit }, data) {
    commit('SET_USER', data);
  },
  /**
   * 设置系统设置
   * @param {*} param0
   * @param {*} data
   */
  setSystem({ commit }, data) {
    commit('SET_SYSTEM', data);
  },
  /**
   * 设置菜单
   * @param {*} param0
   * @param {*} data
   */
  setMenus({ commit }, data) {
    commit('SET_MENUS', data);
  },
  /**
   * module集合
   * @param {*} param0
   * @param {*} module
   */
  addModuleToMap({ commit }, module) {
    commit('ADD_MODULE_TO_MAP', module);
  },
  /**
   * 设置数据字典
   * @param {*} param0
   * @param {*} data
   */
  setDataMap({ commit }, data) {
    commit('SET_DATAMAP', data);
  },
  /**
   * 设置一级导航
   * @param {*} param0
   * @param {*} data
   */
  setCurrentFirstNav({ commit }, data) {
    commit('SET_CURRENT_FIRSTNAV', data);
  },
  /**
   * 设置全屏模式
   * @param {*} param0
   * @param {*} isFullscreen
   */
  setFullscreen({ commit }, isFullscreen) {
    commit('SET_FULLSCREEN', isFullscreen);
  },
  /**
   * 语言环境
   * @param {*} param0
   * @param {*} data
   */
  setCurrentLocale({ commit }, data) {
    commit('SET_CURRENT_LOCALE', data);
  },
  /**
   * 设置当前模块
   * @param {*} param0
   * @param {*} data
   */
  setCurrentModule({ commit }, data) {
    commit('SET_CURRENT_MODULE', data);
  },
  /**
   * 重置系统
   * @param {*} param0
   */
  resetSystem({ commit }) {
    commit('RESET_SYSTEM');
  },
};
export default actions;
