/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// const auth = config.apiPath.auth; // auth地址
// const galaxyUrl = config.apiPath.galaxyService; // 中台服务地址

// service path
const urls = {
  aggCapture: `${baseUrl}/api/kunlun/judge/portrait/aggCapture`, // 聚合结果
  queryCapture: `${baseUrl}/api/kunlun/judge/portrait/queryCapture`, // 抓拍结果
  batchExport: `${baseUrl}/api/kunlun/judge/portrait/batch:exportCapture`, // 批量导出
  export: `${baseUrl}/api/kunlun/judge/portrait/several:exportCapture`, // 导出多条抓拍结果
};

// service methods
const portraitSearchSrv = {
  // 查询抓拍列表
  queryCapture(params = {}) {
    return MegHttp.httpPost(urls.queryCapture, params);
  },
  // 聚合接口
  aggCapture(params = {}) {
    return MegHttp.httpPost(urls.aggCapture, params);
  },
  // 批量导出
  batchExport(params = {}) {
    return MegHttp.httpPost(urls.batchExport, params);
  },
  // 导出多条抓拍结果
  export(params = {}) {
    return MegHttp.httpPost(urls.export, params);
  },
};

export default portraitSearchSrv;
