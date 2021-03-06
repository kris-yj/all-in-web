/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';
// path prefix
const baseUrl = config.apiPath.galaxyService;

// service path
const urls = {
  propertyConfig: `${baseUrl}/api/galaxy/v1/system/deploy/dic/search`, // 查询属性字典信息
};

// service methods
const propertySrv = {
  /**
   * 查询属性字典信息
   * @param { params } Object
   */
  propertyConfig(params = {}) {
    return MegHttp.httpGet(urls.propertyConfig, params);
  },
};

export default propertySrv;
