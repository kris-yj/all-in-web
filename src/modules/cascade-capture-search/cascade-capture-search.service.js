/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// const auth = config.apiPath.auth; // auth地址
const galaxyUrl = config.apiPath.galaxyService; // 中台服务地址

// service path
const urls = {
  cascadeSearch: `${baseUrl}/api/kunlun/search/cascade/capture/superior`, // 级联检索
  export: `${galaxyUrl}/api/kunlun/search/cascade/capture/export`, // 级联检索导出
  operationLog: `${baseUrl}/api/galaxy/v1/operationLog/get`, // 检索日志条件查询
  getCascadeTree: `${baseUrl}/api/face/v6/cascade/registry/getNodeTree`, // 获取下级单位
  // full: `${baseUrl}/api/kunlun/search/cascade/capture/full`, // 级联检索拉取全景图
  // export: `${galaxyUrl}/api/kunlun/search/cascade/capture/detail`, // 详情
};

// service methods
const CascadeCaptureSearchSrv = {
  // 级联检索
  cascadeSearch(params = {}) {
    return MegHttp.httpPost(urls.cascadeSearch, params);
  },
  // 聚合接口
  export(params = {}) {
    return MegHttp.httpPost(urls.export, params);
  },
  // 获取多级下级节点树
  getCascadeTree(params = {}) {
    return MegHttp.httpGet(urls.getCascadeTree, params);
  },
  // 检索日志条件查询
  getOperationLog(params = {}) {
    return MegHttp.httpGet(urls.operationLog, params);
  },
};

export default CascadeCaptureSearchSrv;
