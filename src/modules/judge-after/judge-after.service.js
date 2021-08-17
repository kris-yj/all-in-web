/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// const auth = config.apiPath.auth; // auth地址

// service path
const urls = {
  'allJudgesAfter': `${baseUrl}/api/kunlun/judge/publicTechnical`, // 全部事后研判（含用户自定义技战法）
  'createCustomTechnique': `${baseUrl}/api/kunlun/judge/technical`, // 新建自定义技战法
  'editCustomTechnique': `${baseUrl}/api/kunlun/judge/technical`, // 编辑自定义技战法
  'customTechniqueById': `${baseUrl}/api/kunlun/judge/technical`, // 查询自定义技战法
  'deleteCustomTechnique': `${baseUrl}/api/kunlun/judge/technical`, // 删除自定义技战法
  'checkTechniqueName': `${baseUrl}/api/kunlun/judge/technical/checkName`, // 检查战法标签是否重名
};

// service methods
const judgeAfterSrv = {
  /**
   * 获取全部的时候研判包括用户自定义技战法
   */
  getAllJudgesAfter(params) {
    return MegHttp.httpPost(urls.allJudgesAfter, params);
  },
  /**
   * 新建自定义技战法
   * @param {*} newCustomTechnique 自定义技战法
   */
  createCustomTechnique(newCustomTechnique = {}) {
    return MegHttp.httpPost(urls.createCustomTechnique, newCustomTechnique);
  },
  /**
   * 编辑自定义技战法
   * @param {*} customTechnique 自定义技战法
   */
  editCustomTechnique(customTechnique = {}) {
    return MegHttp.httpPut(urls.editCustomTechnique, customTechnique);
  },
  /**
   * 根据id查询自定义技战法
   * @param {*} id 自定义技战法id
   */
  getCustomTechniqueById(id = '') {
    return MegHttp.httpGet(`${urls.customTechniqueById}/${id}`);
  },
  /**
   * 删除自定义技战法
   * @param {*} id
   */
  deleteCustomTechnique(id = '') {
    return MegHttp.httpDelete(`${urls.deleteCustomTechnique}/${id}`);
  },
  /**
   * 战法标签是否重名
   * @param {*} params
   */
  checkTechniqueName(params = {}) {
    return MegHttp.httpPost(urls.checkTechniqueName, params);
  }
};

export default judgeAfterSrv;