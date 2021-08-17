/*
 * @Author: your name
 * @Date: 2020-12-16 18:57:42
 * @LastEditTime: 2021-06-25 14:32:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \opensourcesd:\workspace\all-in-web\src\utils\config.utils.js
 */
// 接口地址
const ROOT_PATH = `${window.location.origin.replace(/:\d+/, '')}`;
// 是否是https
const IS_HTTPS = /https/.test(`${window.location.protocol}`);

// 全局配置
const config = {
  'clientAppId': clientAppId, // 系统标识
  root_path: ROOT_PATH,
  apiPath: {
    galaxyService: `${ROOT_PATH}`,
    service: `${ROOT_PATH}`,
    // socketUrl: `${IS_HTTPS ? 'wss' : 'ws'}://10.122.100.208:29026/websocket/kunlun/event/realtimeAlarms`,
    socketUrl: `${IS_HTTPS ? 'wss' : 'ws'}://${window.location.host}/websocket/kunlun/event/realtimeAlarms`,
    baseWebSocketUrl: `${IS_HTTPS ? 'wss' : 'ws'}://${window.location.host}/`
  }
};

// 开发环境下mock地址，当前工程对接银河中台2.0
if (process.env.NODE_ENV === 'development') {
  // 中台2.0 mock api地址
  config.apiPath.galaxyService = 'http://10.122.100.115';
  // 一体化业务开发mock api地址
  config.apiPath.service = 'http://10.122.100.115';
}

// 集成发布模式下config配置不写入window全局下
if (process.env.NODE_ENV !== 'publish') {
  (function(window) { //eslint-disable-line
    window.config = {
      globalConfig: {
        clientAppId: config.clientAppId
      }
    };
  }(window));
}

export default config;
