/* Automatically generated by './build/add-module.js' */
/* 发布集成环境下 router-view 不同 */
// eslint-disable-next-line consistent-return
const containerFactory = () => {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    return () => import(/* webpackChunkName: "appview" */'@/modules/layout/pages/layout');
  }
};
export default [{
  path: '/open-api',
  component: containerFactory(),
  children: [
    {
      path: '',
      name: 'open-api',
      component: () => import(/* webpackChunkName: "interfaces" */'./pages/open-api')
    },
    {
      path: 'create',
      name: 'open-api-create',
      component: () => import(/* webpackChunkName: "interfaceCreate" */'./pages/open-api-create')
    }
  ]
}];