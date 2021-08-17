/**
 * 静态 module 下的路由配置
 * 1. 每个静态 module 路由配置是完整的 vue-router的 route 配置对象，静态 module 的路由，初始化系统路由映射之前完整加载到 vue-router 中。
 */

export default [
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ './pages/login')
  },
  {
    path: '/autologin',
    component: () => import(/* webpackChunkName: "auto-login" */ './pages/auto-login')
  }
];
