/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// HttpUtils from insight-utils, HttpUtils.get or HttpUtils.post

// path prefix
// const mockUrl = 'http://api-insight.cbg.megvii-inc.com/mock/714'; // 基础地址
const baseUrl = config.apiPath.service; // 基础地址
// const auth = window.config.globalConfig.apiPath.auth; // auth地址

// service path
const urls = {
  emitRemoteFullImage: `${baseUrl}/api/kunlun/setup/forward/capture/remote/full`, // 触发设置远程拉取全景图
  fetchRemoteFullImage: `${baseUrl}/api/kunlun/setup/forward/capture/full/remote`, // 远程拉取全景图
};

// service methods
const FocusGroupSrv = {
  /**
   * 触发获取远程全景图
   * @param {Object} request
   */
  emitRemoteFullImage(request = {}) {
    return MegHttp.httpGet(urls.emitRemoteFullImage, request);
  },
  /**
   * 获取远程全景图
   * @param {Object} request
   */
  fetchRemoteFullImage(request = {}) {
    return MegHttp.httpGet(urls.fetchRemoteFullImage, request);
  }
};

export default FocusGroupSrv;
