// 集成资源
import vue from 'vue';
import * as compositionApi from '@vue/composition-api';
import megviiUI from 'megvii-ui';
import megviiUIPRO from 'megvii-ui-pro';
import lodash from 'lodash';
import moment from 'moment';
import megviiHttp from 'megvii-http';
import * as i18nLocale from '@/utils/i18n.utils';
import router from '@/utils/router.utils';
import store from '@/store';
import CommonLayout from '@/modules/layout/pages/layout';

// 注册异步路由
const registerRouter = ({
  asyncRoutes = [], moduleAlias, modulePath, moduleResource, firstNav
}) => {
  const route = {
    path: modulePath,
    component: CommonLayout,
    children: []
  };

  consola.info('before registerRouter', {
    asyncRoutes,
    moduleAlias,
    modulePath,
    firstNav
  });

  // 如果有子路由，重组子路由
  if (asyncRoutes[0].children) {
    asyncRoutes[0].children.forEach((childRoute) => {
      if (childRoute.path !== '') {
        childRoute.meta = childRoute.meta || {};
        // if (firstNav === moduleAlias) {
        //   childRoute.meta.hiddenMenu = true;
        // }
        childRoute.meta.firstNav = firstNav;
        childRoute.meta.moduleResource = moduleResource;

        if (childRoute.children) {
          childRoute.children.forEach((cRoute) => {
            cRoute.meta = cRoute.meta || {};
            cRoute.meta.firstNav = firstNav;
            cRoute.meta.moduleResource = moduleResource;
          });
        }

        route.children.push(childRoute);
      }
    });
  }
  consola.info('after registerRouter', route);
  router.addRoutes([route]);
};

// 注册异步storeModule
const registerStore = (storeConfig) => {
  Object.keys(storeConfig).forEach((moduleAlias) => {
    if (!store.hasModule(moduleAlias)) {
      store.registerModule(moduleAlias, storeConfig[moduleAlias]);
      consola.info('module store: ', moduleAlias, storeConfig[moduleAlias]);
    }
  });
};

window.insightApp = {
  vue,
  compositionApi,
  lodash,
  moment,
  megviiHttp,
  i18nLocale,
  router,
  store,
  components: {
    megviiUI,
    megviiUIPRO
  },
  methods: {
    registerRouter,
    registerStore,
  }
};
