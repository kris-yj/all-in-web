import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

const baseUrl = config.apiPath.service;
const urls = {
  getAddr: `${baseUrl}/api/gmp/v1/stream/getAddr`, // 请求开流websocket地址
  getList: `${baseUrl}/api/galaxy/v1/analysis/history/file:list` // 获取打开视频流信息
};
const VideoPlaybackSrv = {
  /**
 * 请求开流websocket地址
 */
  getAddr(params = {}) {
    return MegHttp.httpPost(urls.getAddr, params);
  },
  /**
 * 获取打开视频流信息
 */
  getList(request = {}) {
    return MegHttp.httpPost(urls.getList, request);
  },
};
export default VideoPlaybackSrv;
