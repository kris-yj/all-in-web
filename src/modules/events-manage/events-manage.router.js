/**
* module下的路由配置
* 1. 每个 module 的默认根路由直接映射到当前 module 下 pages 下的主 module 单文件组件，在startup中配置完成。
* 1. 此文件只放置 module 下的子路由配置，形式和 vue-router 定制的 route 对象格式保持一致，但是只需要配置children属性即可。供 export.js 导出模块，
*    系统加载 module 后通过 addRoutes 配置进router系统。
* 2. 如果当前 module 没有子路由，此文件返回空数组，在 module 导出文件 export.js 中可以直接引入此文件或者不引入。
*/

export default [
  {
    children: [
      {
        path: 'events-detail',
        name: 'eventsDetail',
        component: () => import(/* webpackChunkName: "events-detail" */'./pages/events-detail'),
        redirect: 'events-detail/related-identity',
        children: [
          {
            path: 'related-identity',
            name: 'relatedIdentity',
            component: () => import(/* webpackChunkName: "" */'./pages/related-identity')
          },
          {
            path: 'clue-library',
            name: 'clueLibrary',
            component: () => import(/* webpackChunkName: "" */'./pages/clue-library')
          },
          {
            path: 'address-analysis',
            name: 'addressAnalysis',
            component: () => import(/* webpackChunkName: "" */'./pages/address-analysis')
          },
          {
            path: 'track-analysis',
            name: 'trackAnalysis',
            component: () => import(/* webpackChunkName: "" */'./pages/track-analysis')
          },
          {
            path: 'activity-regular',
            name: 'activityRegular',
            component: () => import(/* webpackChunkName: "" */'./pages/activity-regular')
          },
          {
            path: 'judge-process',
            name: 'judgeProcess',
            component: () => import(/* webpackChunkName: "" */'./pages/judge-process')
          },
        ]
      }
    ]
  }
];
