const quickGetters = {
  // 全部菜单
  menusList: (state, getters, rootState) => {
    if (rootState.menus) {
      return rootState.menus.childPermissions;
    }
    return [];
  }
};

export default quickGetters;
