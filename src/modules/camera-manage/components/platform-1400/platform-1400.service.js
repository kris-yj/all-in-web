/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

const baseUrl = config.apiPath.service; // 基础地址
const galaxyUrl = config.apiPath.galaxyService; // 中台服务地址

// service path
const urls = {
  'catalog': (id) => `${baseUrl}/api/rainbow/v1/device/platform/ga/tree/${id}`, // 拉取平台相机树
  'queryItemOrgTree': `${galaxyUrl}/api/auth/v5/organizations/queryTree`, // 获取部门树
  'queryItemOrgList': `${galaxyUrl}/api/galaxy/v1/auth/organizations/suggest`, // 获取部门列表
  'selectCamera': `${baseUrl}/api/rainbow/v1/device/platform/ga/cameras:select`, // 选择相机
  'searchCamera': `${baseUrl}/api/rainbow/v1/device/platform/ga/cameras:search`, // 分页查询
  'editCamera': `${baseUrl}/api/rainbow/v1/device/platform/ga/cameras/`, // 相机修改(单个)
  'editCameras': `${baseUrl}/api/rainbow/v1/device/platform/ga/cameras:batchUpdate`, // 相机修改(批量)
  'deleteCamera': `${baseUrl}/api/rainbow/v1/device/platform/ga/cameras:batchDelete`, // 相机删除
  'saveCamera': `${baseUrl}/api/rainbow/v1/device/platform/ga/cameras:sync`, // 相机同步
};

// service methods
const platform1400Srv = {
  /**
   * 获取部门列表
   */
  getDeptList() {
    return MegHttp.httpPost(urls.queryItemOrgList);
  },
  catalog(params = {}) {
    return MegHttp.httpGet(urls.catalog(params.id));
  },
  queryOrganizationTree(params = {}) {
    return MegHttp.httpGet(urls.queryItemOrgTree, params);
  },
  selectCamera(params) {
    return MegHttp.httpPost(urls.selectCamera, params);
  },
  searchCamera(params) {
    return MegHttp.httpPost(urls.searchCamera, params);
  },
  editCamera(obj) {
    return MegHttp.httpPut(`${urls.editCamera}${obj.id}`, obj.data);
  },
  editCameras(params) {
    return MegHttp.httpPost(urls.editCameras, params);
  },
  deleteCamera(params) {
    return MegHttp.httpPost(urls.deleteCamera, params);
  },
  saveCamera(params) {
    return MegHttp.httpPost(urls.saveCamera, params);
  },
};

export default platform1400Srv;