/* eslint-disable no-undef */
/* eslint-disable global-require */
/* eslint-disable no-lonely-if */
/* eslint-disable import/no-unresolved */

/**
 * 项目启动文件
 * 单工程多模块版本
 * 模块单独发布，部署
 * portal集成单独发布，部署
 */
import Router from 'vue-router';
import { Message } from 'megvii-ui';
import NProgress from 'nprogress'; // progress bar coms
import _ from 'lodash';
import router, { staticRoutes } from '@/utils/router.utils';
import store from '@/store';
import { loadScript, eventTracking } from '@/utils/utils';
import Layout from '@/modules/layout/pages/layout';
import LayoutSrv from '@/modules/layout/layout.service';
import 'nprogress/nprogress.css'; // progress bar css
import '@/integrate';
import openApiRoute from '@/modules/open-api/open-api.router';
import config from './config.utils';

NProgress.configure({ showSpinner: false });// NProgress Configuration

// 运行环境标识
// eslint-disable-next-line no-unused-vars
const isDev = process.env.NODE_ENV === 'development';
consola.info('process.env.NODE_ENV: ', process.env.NODE_ENV);
// 本地开发已存在的module require context map for dev
let existModulesContextMap = {};

let routes = [];

// 先add默认已确定的路由
router.addRoutes(staticRoutes);

/**
 * dev 获取当前工程下的module，通过require.context方式获取
 */
if (process.env.NODE_ENV === 'development') {
  existModulesContextMap = require('vue-dynamic-modules');
  consola.info('existModulesContextMap for dev: ', existModulesContextMap);
}

/**
 * module router store注册
 * @param {*} asyncModule module
 * @param {*} moduleAlias alias
 * @param {*} modulePath module path 用来初始化子路由
 * @param {*} firstNav 归属的一级导航
 */
const registerModule = (asyncModule, moduleAlias, modulePath, resource, firstNav) => {
  const { registerRouter, registerStore } = window.insightApp.methods;
  // 注册子模块的子路由
  if (asyncModule.routes && asyncModule.routes.length > 0) {
    registerRouter(
      {
        asyncRoutes: asyncModule.routes,
        moduleAlias,
        modulePath,
        moduleResource: resource,
        firstNav
      }
    );
  }

  // 注册子模块的store module
  if (asyncModule.store) {
    registerStore(asyncModule.store);
  }
};

/**
 * 设置当前路由模块对象
 * @param {*} module 模块对象
 */
const setCurrentModule = (module = {}) => {
  store.dispatch('setCurrentModule', module);

  const defaultSystemName = store.getters.systemByType('productName').value || '';
  document.title = module.name || defaultSystemName;
  // 模块（菜单）切换的统计
  eventTracking(module.alias);
  consola.info('module befroe enter: ', module);
};

/**
 * 异步组件加载 for npm run pub，通过load script的形式加载打包好的module var
 * @param {*} loadObj: { moduleAlias, modulePath, firstNav, resolve }
 */
const asyncModuleFactoryForPub = ({
  moduleAlias = '', modulePath = '', firstNav = '', resource
}) => {
  console.log('in promise resolve', moduleAlias, modulePath, firstNav, resource);
  console.log('in promise resolve firstNav', firstNav);

  const modulePublicPath = `${config.root_path}`;
  const moduleVar = `${_.camelCase(moduleAlias)}AsyncModule`;
  let moduleAilasAndSource = `${_.kebabCase(moduleAlias)}`;
  // loader module时候的ailas转换，增加source后缀标识
  if (resource && resource.source && resource.source !== '') {
    moduleAilasAndSource = `${moduleAlias}-${resource.source}`;
  }

  const moduleScriptPath = `${modulePublicPath}/${moduleAilasAndSource}/${moduleVar}.js`;

  // 加载异步组件
  const loadScriptPromise = loadScript(moduleScriptPath);

  return loadScriptPromise.then(() => {
    const asyncModule = window[moduleVar].default;
    consola.success('after fetch asyncModule', asyncModule, firstNav, resource);

    registerModule(asyncModule, moduleAlias, modulePath, resource, firstNav);
    return Promise.resolve(asyncModule.module);
  }).catch((error) => {
    Message.error(`模块${moduleAlias}加载失败，请检查是否正确部署此模块！`);
    consola.error('load async module error: ', error);
    NProgress.done();
    return Promise.reject();
  });
};

/**
 * 异步组件加载 for npm run dev，load本地module
 * @param {*} loadObj: { moduleAlias, modulePath, firstNav, resolve }
 */
const asyncModuleFactoryForDev = ({
  moduleAlias = '', modulePath = '', firstNav = '', resource
}) => {
  const moduleContext = existModulesContextMap[moduleAlias];
  let module = null;

  consola.info('Module before fetch asyncModule: ', {
    moduleAlias, modulePath, firstNav
  });

  if (moduleContext) {
    const asyncModule = moduleContext(moduleContext.keys()[0]).default;
    const matchedComponents = router.getMatchedComponents(`/${moduleAlias}`);

    if (typeof matchedComponents[1] === 'function') {
      registerModule(asyncModule, moduleAlias, modulePath, resource, firstNav);
      module = asyncModule.module;
    } else {
      module = asyncModule.module;
    }
  } else {
    module = {
      functional: true,
      render() {
        return (
          <div>
            模块:
            <h2>{ moduleAlias }</h2>
            不在本工程或者没有编译
          </div>
        );
      }
    };
  }
  return Promise.resolve(module);
};

// 异步组件加载分发，根据不同环境dev or pub
const asyncModuleFactory = isDev ? asyncModuleFactoryForDev : asyncModuleFactoryForPub;

/**
 * 根据菜单构建routes
 * @param {*} resources
 */
const buildRoutesByMenus = (resources) => {
  const rootRoute = {
    path: '/',
    component: Layout,
    redirect: `/${resources[0].alias}`,
    children: []
  };
  resources.forEach((firstResource) => {
    // 一级路由alias
    const firstNav = firstResource.alias;

    // 一级导航route基础对象
    const firstRoute = {
      path: `${firstNav}`,
      name: firstNav,
      meta: {
        firstNav,
        moduleResource: firstResource,
        hiddenMenu: false
      }
    };
    // 如果一级导航是MODULE，直接加载，并且设置隐藏菜单
    if (firstResource.resourceType === 'MODULE') {
      firstRoute.component = () => asyncModuleFactory({
        firstNav,
        moduleAlias: firstNav,
        modulePath: `/${firstNav}`,
        resource: firstResource
      });
      // 模块的路由设置拦截
      firstRoute.beforeEnter = (to, from, next) => {
        setCurrentModule(firstResource);
        next();
      };
      firstRoute.meta.hiddenMenu = true;
      firstResource.firstAlias = firstResource.alias;
      // module加入到store中保存
      store.dispatch('addModuleToMap', firstResource);
    }

    // 如果一级导航是CATEGORY
    if (firstResource.resourceType === 'CATEGORY' && firstResource.childPermissions.length > 0) {
      const defaultSecondNav = firstResource.childPermissions[0].alias;
      // 如果有二级路由，设置跳转到第一个二级module和设置子路由
      firstRoute.redirect = `/${defaultSecondNav}`;
      // 子模块
      firstResource.childPermissions.forEach((secondResource) => {
        // 二级路由 二级导航是目录 三级是module
        const secondNav = secondResource.alias;
        const { resourceType, childPermissions } = secondResource;
        // 二级导航是module
        if (resourceType === 'MODULE') {
          const secondNavPath = `/${secondNav === 'file-center' ? 'file-center/:id?' : secondNav}`;
          const secondRoute = {
            name: secondNav,
            path: secondNavPath,
            component: () => asyncModuleFactory({
              moduleAlias: secondNav,
              firstNav,
              modulePath: secondNavPath,
              resource: secondResource
            }),
            meta: {
              firstNav,
              moduleResource: secondResource
            },
            // 模块的路由设置拦截
            beforeEnter: (to, from, next) => {
              setCurrentModule(secondResource);
              next();
            }
          };
          rootRoute.children.push(secondRoute);
          secondResource.firstAlias = firstResource.alias;
          // module加入到store中保存
          store.dispatch('addModuleToMap', secondResource);
        }
        if (childPermissions && childPermissions.length > 0) {
          if (resourceType === 'CATEGORY') {
            const route = {
              path: `${secondNav}`,
              name: secondNav,
              redirect: `/${secondResource.childPermissions[0].alias}`
            };

            rootRoute.children.push(route);
          }
          secondResource.childPermissions.forEach((thirdResource) => {
            if (thirdResource.resourceType === 'MODULE') {
              const thirdNav = thirdResource.alias;
              const thirdRoute = {
                name: thirdNav,
                path: `${thirdNav}`,
                component: () => asyncModuleFactory({
                  moduleAlias: thirdNav,
                  firstNav,
                  modulePath: `/${thirdNav}`,
                  resource: thirdResource
                }),
                meta: {
                  firstNav,
                  moduleResource: thirdResource
                },
                // 模块的路由设置拦截
                beforeEnter: (to, from, next) => {
                  setCurrentModule(thirdResource);
                  next();
                }
              };
              thirdResource.firstAlias = firstResource.alias;
              // module加入到store中保存
              store.dispatch('addModuleToMap', thirdResource);
              rootRoute.children.push(thirdRoute);
            }
          });
        }
      });
    }
    rootRoute.children.push(firstRoute);
  });

  // 本地模块路由，先写死在这里，等本地模块路由方案集成后，马上删除
  const subjectSearchResource = {
    alias: 'subject-search',
    name: '主题检索',
    source: config.clientAppId,
    childPermissions: [],
    permissions: []
  };
  const subjectSearchRoute = {
    path: `${subjectSearchResource.alias}`,
    name: `${subjectSearchResource.alias}`,
    component: () => asyncModuleFactory({
      moduleAlias: subjectSearchResource.alias,
      modulePath: `/${subjectSearchResource.alias}`,
      resource: subjectSearchResource
    }),
    meta: {
      moduleResource: subjectSearchResource
    },
    // 模块的路由设置拦截
    beforeEnter: (to, from, next) => {
      setCurrentModule(subjectSearchResource);
      next();
    }
  };
  rootRoute.children.push(subjectSearchRoute);
  store.dispatch('addModuleToMap', subjectSearchResource);

  // 本地模块路由，先写死在这里，等本地模块路由方案集成后，马上删除
  const shelfTrackAnalysisResource = {
    alias: 'shelf-track-analysis',
    name: '查看轨迹',
    source: config.clientAppId,
    childPermissions: [],
    permissions: []
  };
  const shelfTrackAnalysisRoute = {
    path: `${shelfTrackAnalysisResource.alias}`,
    name: `${shelfTrackAnalysisResource.alias}`,
    component: () => asyncModuleFactory({
      moduleAlias: shelfTrackAnalysisResource.alias,
      modulePath: `/${shelfTrackAnalysisResource.alias}`,
      resource: shelfTrackAnalysisResource
    }),
    meta: {
      moduleResource: shelfTrackAnalysisResource
    },
    // 模块的路由设置拦截
    beforeEnter: (to, from, next) => {
      setCurrentModule(shelfTrackAnalysisResource);
      next();
    }
  };
  rootRoute.children.push(shelfTrackAnalysisRoute);
  store.dispatch('addModuleToMap', shelfTrackAnalysisResource);

  routes.push(rootRoute);
};

/**
 * 获取数据字典表
 */
const getDataMapList = () => new Promise((resolve) => {
  LayoutSrv.getDataMapList().then((res) => {
    if (res.code === 0) {
      store.dispatch('setDataMap', res.data).then(() => {
        resolve(res.data);
      });
    } else {
      resolve(res.data);
    }
  });
});

/**
 * 获取系统配置信息
 */
const getSystemInfo = () => new Promise((resolve, reject) => {
  LayoutSrv.getSystemInfo().then((res) => {
    if (res.code === 0) {
      if (res.data.i18nMessageLang) {
        // res.data.i18nMessageLang.value = 'en-US';
        const locale = res.data.i18nMessageLang.value;
        store.dispatch('setCurrentLocale', locale);
      }
      store.dispatch('setSystem', res.data).then(() => {
        resolve(res.data);
      });
      resolve(res.data);
    } else {
      reject();
    }
  });
});

/**
 * 获取用户信息
 */
const getUserProfile = () => new Promise((resolve, reject) => {
  LayoutSrv.getUserProfile().then((res) => {
    if (res.code === 0) {
      store.dispatch('setUser', res.data).then(() => {
        resolve(res.data);
      });
    } else {
      reject();
    }
  });
});

/**
 *  菜单过滤
 * @param {*} menus
 */
const menusFilter = (menus) => {
  const { isDual, dualPlatformType, dualScene } = store.state.system;
  if (isDual.value === 'true'
  && dualPlatformType.value === '1'
  && dualScene.value === '3') {
    // let { childPermissions } = menus;
    const exceptMenus = ['realtime-analysis', 'videotape-analysis', 'path-trace', 'cloudbridge'];

    menus.childPermissions = menus.childPermissions.filter((p) => !exceptMenus.includes(p.alias));

    menus.childPermissions.forEach((permission) => {
      if (permission.childPermissions) {
        permission.childPermissions = permission.childPermissions.filter((p) => !exceptMenus.includes(p.alias));
      }
    });
  }
  return menus;
};

/**
 * 获取菜单
 */
const getMenus = () => new Promise((resolve, reject) => {
  LayoutSrv.getMenus().then((res) => {
    if (res.code === 0) {
      if (res.data.records.length === 0) {
        Message.error('当前登录用户没有分配权限');
        reject();
        return;
      }
      const menusAfterFilter = menusFilter(res.data.records[0]);
      store.dispatch('setMenus', menusAfterFilter).then(() => {
        // 构建菜单路由
        let menus = [];
        if (menusAfterFilter && menusAfterFilter.childPermissions) {
          menus = menusAfterFilter.childPermissions;
        }
        buildRoutesByMenus(menus);
        consola.info('Router routes build: ', routes);
        resolve(routes);
      });
    } else {
      reject();
    }
  });
});

/**
 * 是否存在有效token
 */
const hasToken = () => {
  const token = window.localStorage.getItem('token');
  if (token) {
    return true;
  }
  return false;
};

/**
 * 根据alias判断是否为module
 * @param {*} moduleAlias module alias
 */
const isModule = (moduleAlias) => {
  const moduleArray = store.getters.modulesByAlias([moduleAlias]);
  if (moduleArray.length > 0) {
    return moduleArray[0];
  }
  return false;
};

/**
 * route beforEach 全局路由加载判断
 */
router.beforeEach((to, from, next) => {
  NProgress.start();
  if (to.path === '/login' || to.path === '/autologin') {
    next();
  } else if (!hasToken()) {
    next({ path: '/login' });
  } else {
    // 用户信息和菜单都没有加载
    // eslint-disable-next-line no-lonely-if
    if (!store.state.user || !store.state.menus) {
      Promise.all([getMenus(), getUserProfile()]).then((res) => {
        router.addRoutes(res[0]);
        router.addRoutes(openApiRoute);
        next({ ...to, replace: true });
      }).catch(() => {
        // 如果菜单获取或者用户信息获取失败，跳转到登录页面
        next({ path: '/login' });
      });
    } else if (to.matched.length === 0) {
      const pathArr = to.fullPath.split('/');
      let matchedModuleAlias = '';
      let matchedModulePath = '';
      let modulePos = 1;
      let module;
      for (let i = 1; i < pathArr.length; i += 1) {
        module = isModule(pathArr[i]);
        if (module) {
          // eslint-disable-next-line prefer-destructuring
          setCurrentModule(module);
          matchedModuleAlias = pathArr[i];
          modulePos = i;
          break;
        }
      }
      const firstNav = module ? module.firstAlias : '';
      // 拼接出当前module router path
      if (firstNav === matchedModuleAlias) {
        matchedModulePath = `/${firstNav}`;
      } else {
        matchedModulePath = pathArr.slice(0, modulePos + 1).join('/');
      }
      console.log('child route before asyncModuleFactory', firstNav, module, matchedModuleAlias, matchedModulePath);
      asyncModuleFactory({
        firstNav,
        resource: module,
        moduleAlias: matchedModuleAlias,
        modulePath: matchedModulePath
      }).then(() => {
        consola.info('next........', to);
        next({ ...to, replace: true });
      }).catch(() => {
        next({ path: '/', replace: true });
      });
    } else {
      next();
    }
  }
});

/**
 * router.afterEach
 */
router.afterEach((to) => {
  // finish progress bar
  NProgress.done();
  let moduleAlias = '';
  if (to.meta && to.meta.moduleResource) {
    moduleAlias = to.meta.moduleResource.alias;
  }
  const moduleVar = `${_.camelCase(moduleAlias)}AsyncModule`;
  if (window[`${moduleVar}`]) {
    console.log('router after each delete module object', moduleVar);
    window[`${moduleVar}`] = null;
  }
});
/**
 * 系统启动前置的数据获取：数据字典，系统设置
 */
const startupSystem = () => Promise.all([getDataMapList(), getSystemInfo()]);

/**
 * 重置系统
 * 重置用户信息，重置用户菜单，重置router matcher
 */
const resetSystem = () => {
  consola.info('reset system');
  store.dispatch('resetSystem');
  routes = [];
  const newRouter = new Router({
    routes: staticRoutes
  });
  router.matcher = newRouter.matcher;
};

/**
 *  export 启动和重置
 */
export {
  startupSystem,
  resetSystem
};
