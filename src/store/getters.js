const getters = {
  // 系统设置
  system: (state) => state.system,
  // 根据type返回系统设置
  systemByType: (state) => (type) => state.system[type] || {},
  // 登录用户信息
  user: (state) => state.user,
  // 登录用户所属部门
  userOrg: (state) => state.user && state.user.organization,
  // 数据字典
  dataMap: (state) => state.dataMap,
  // 根据type返回数据字典项
  dataMapByType: (state) => (type) => state.dataMap[type] || {},
  // 全部菜单
  menusList: (state) => {
    if (state.menus) {
      return state.menus.childPermissions;
    }
    return [];
  },
  fullscreen: (state) => state.fullscreen,
  // 头部一级导航
  fistNavs: (state) => {
    const firstNavs = [];
    if (state.menus && state.menus.childPermissions) {
      state.menus.childPermissions.forEach((nav) => {
        if (!nav.hidden) {
          firstNavs.push(nav);
        }
      });
    }
    return firstNavs;
  },
  // 获取一级导航下的二级导航菜单
  navsByFirst: (state) => {
    let navs = [];
    if (state.menus) {
      state.menus.childPermissions.forEach((resource) => {
        if (resource.alias === state.currentFirstNav) {
          navs = resource.childPermissions;
        }
      });
    }
    return navs;
  },
  // 通过模块别名获取当前用户有权限的模块数组,参数为别名数组
  modulesByAlias: (state) => (moduleAlias) => {
    const modules = [];

    if (Array.isArray(moduleAlias)) {
      moduleAlias.forEach((alias) => {
        const module = state.modulesMap[alias];
        if (module) {
          modules.push(module);
        }
      });
      return modules;
    }
    return state.modulesMap[moduleAlias];
  },
  // 通过模块别名获取模块的子权限（按钮权限等）
  // moduleAlias 必须 模块的alias
  // permissionAlias 可选 permissions下某个permission 的 alias
  modulePermissonsByAlias: (state) => (moduleAlias, permissionAlias) => {
    const module = state.modulesMap[moduleAlias];
    if (module) {
      const { permissions } = module;
      if (permissionAlias) {
        let permission;
        permissions.forEach((p) => {
          if (p.alias === permissionAlias) {
            permission = p;
          }
        });
        return permission;
      }
      return module.permissions;
    }
    return [];
  },
  moduleIsExistByAlias: (state) => (moduleAlias) => !!state.modulesMap[moduleAlias]
};
export default getters;
