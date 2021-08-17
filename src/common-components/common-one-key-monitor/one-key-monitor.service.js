import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// service path
const urls = {
  deptTree: `${baseUrl}/api/galaxy/v1/auth/organizations/queryTree`, // 部门树
  personTree: `${baseUrl}/api/galaxy/v1/auth/organizations/queryOrgTreeAndUser`, // 部门树
  oneKey: `${baseUrl}/api/kunlun/event/deployTasks:oneKey`, // 一键布控
  surveillanceNameCheck: `${baseUrl}/api/kunlun/event/deployTasks:repeat`, // 布控任务名称是否重复
};

// service methods
const oneKeyMonitorSrv = {
  getDeptTree(params = {}) {
    return MegHttp.httpGet(urls.deptTree, params);
  },
  getPersonTree(params = {}) {
    return MegHttp.httpGet(urls.personTree, params);
  },
  deploy(params = {}) {
    return MegHttp.httpPost(urls.oneKey, params);
  },
  checkSurveillanceTaskName(params = {}) {
    return MegHttp.httpPost(urls.surveillanceNameCheck, params);
  },
};

export default oneKeyMonitorSrv;
