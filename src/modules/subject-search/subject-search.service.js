/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// const auth = config.apiPath.auth; // auth地址
// const galaxyUrl = config.apiPath.galaxyService; // 中台服务地址

// service path
const urls = {
  aggCapture: `${baseUrl}/api/kunlun/judge/subject/aggCapture`, // 聚合抓拍结果
  queryCapture: `${baseUrl}/api/kunlun/judge/subject/queryCapture`, // 检索抓拍结果
  batchExport: `${baseUrl}/api/kunlun/judge/subject/batch:exportCapture`, // 批量导出抓拍
  export: `${baseUrl}/api/kunlun/judge/subject/several:exportCapture`, // 导出抓拍
};

// service methods
const subjectSearchSrv = {
  // 查询抓拍列表
  queryCapture(params = {}) {
    return MegHttp.httpPost(urls.queryCapture, params);
  },
  // 聚合抓拍结果
  queryAggCapture(params = {}) {
    return MegHttp.httpPost(urls.aggCapture, params);
  },
  // 批量导出抓拍
  batchExport(params = {}) {
    return MegHttp.httpPost(urls.batchExport, params);
  },
  // 导出抓拍
  export(params = {}) {
    return MegHttp.httpPost(urls.export, params);
  },
};

export default subjectSearchSrv;
