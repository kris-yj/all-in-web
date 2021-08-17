/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
// const baseUrl = config.apiPath.service; // 基础地址
const galaxyUrl = config.apiPath.galaxyService; // 中台服务地址
// const auth = config.apiPath.auth; // auth地址

// service path
const urls = {
  resourceMonitor: `${galaxyUrl}/api/galaxy/v1/analysis/resource/monitor`, // 解析服务资源监控
};

// service methods
const realtimeAnalysisSrv = {
  /**
   * 获取解析资源数据
   */
  getLastResouce(params = {}) {
    return MegHttp.httpGet(urls.resourceMonitor, params);
  },
};

export default realtimeAnalysisSrv;