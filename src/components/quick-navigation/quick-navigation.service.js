import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址

// service path
const urls = {
  'commonTechnical': `${baseUrl}/api/kunlun/judge/commonlyTechnical`, // 用户常用技战法（研判下的模块包括用户自定义技战法）
  'commonModules': `${baseUrl}/api/kunlun/judge/functionTechnical`, // 用户常用功能（模块）
  'allJudgesAfter': `${baseUrl}/api/kunlun/judge/publicTechnical`, // 全部事后研判（含用户自定义技战法）
  'batchSave': `${baseUrl}/api/kunlun/judge/CommonlyTechnical:batchSave`,
  // 'addTechnical': `${baseUrl}/api/kunlun/judge/commonlyTechnical:batchCreate`, // 添加常用技战法
  // 'deleteTechnical': `${baseUrl}/api/kunlun/judge/commonlyTechnical:batchDelete`, // 删除常用技战法
  // 'addCommonModules': `${baseUrl}/api/kunlun/judge/functionTechnical:batchCreate`, // 添加常用功能
  // 'deleteCommonModules': `${baseUrl}/api/kunlun/judge/functionTechnical:batchDelete`, // 删除常用功能
};

// service methods
const quickNavigationSrv = {
  /**
   * 获取用户的常用技战法
   */
  getUserCommonTechniques() {
    return MegHttp.httpGet(urls.commonTechnical);
  },
  /**
   * 获取全部的时候研判包括用户自定义技战法
   */
  getAllJudgesAfter(params) {
    return MegHttp.httpPost(urls.allJudgesAfter, params);
  },
  /**
   * 获取推荐技战法
   */
  getRecommendTechniques() {
    return MegHttp.httpGet(urls.recommendTechnical);
  },
  /**
   * 添加常用技战法
   * @param {*} params 技战法对象数组（只包含id和technicalType）
   */
  // addTechnical(params = {}) {
  //   return MegHttp.httpPost(urls.addTechnical, params);
  // },
  /**
   * 删除常用技战法
   * @param {*} techniquesIds 技战法Ids数组
   */
  // deleteTechnical(params = {}) {
  //   return MegHttp.httpPost(urls.deleteTechnical, params);
  // },
  /**
   * 获取用户常用功能
   */
  getUserCommonModules() {
    return MegHttp.httpGet(urls.commonModules);
  },
  /**
   * 批量保存
   */
  batchSave(params = {}) {
    return MegHttp.httpPost(urls.batchSave, params);
  },
  /**
   * 添加用户常用功能
   * @param {*} modules
   */
  // addCommonModules(params = {}) {
  //   return MegHttp.httpPost(urls.addCommonModules, params);
  // },
  /**
   * 删除用户常用功能
   * @param {*} ids 功能模块菜单的ids
   */
  // deleteCommonModules(params = {}) {
  //   return MegHttp.httpPost(urls.deleteCommonModules, params);
  // }
};

export default quickNavigationSrv;
