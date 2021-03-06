/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// const auth = window.config.globalConfig.apiPath.auth; // auth地址

// service path
const urls = {
  'frequencyList': `${baseUrl}/api/kunlun/judge/frequency/list`,
  'frequencyStatistics': `${baseUrl}/api/kunlun/judge/frequency/statistics`,
  'taskDetail': `${baseUrl}/api/kunlun/judge/frequency/resultList/`,
  'personResult': `${baseUrl}/api/kunlun/judge/frequency/personResult/`,
  'cameraList': `${baseUrl}/api/galaxy/v1/device/tree`, // 获取有权限的相机列表
  'addTask': `${baseUrl}/api/kunlun/judge/frequency/add`, // 添加任务
  'deleteTask': `${baseUrl}/api/kunlun/judge/frequency/del/`, // 删除任务
  'cancelTask': `${baseUrl}/api/kunlun/judge/frequency/cancel/`, // 取消任务
  'restartTask': `${baseUrl}/api/kunlun/judge/frequency/restart/`, // 重新开始任务
  'deleteResult': `${baseUrl}/api/kunlun/judge/frequency/delResult`, // 删除单个结果
  'jobDetail': `${baseUrl}/api/kunlun/judge/frequency/`, // 详情
  'taskName': `${baseUrl}/api/kunlun/judge/frequency/nameExist`, // 任务名是否存在
  'modifyJobName': `${baseUrl}/api/kunlun/judge/frequency/modifyJobName/`, // 修改任务名
  'export': `${baseUrl}/api/kunlun/judge/frequency/export`, // 导出
};

// service methods
const FrequencySrv = {
  // 新建任务
  addTask(params = {}) {
    return MegHttp.httpPost(urls.addTask, params);
  },
  // 删除任务
  deleteTask(params = '') {
    return MegHttp.httpGet(urls.deleteTask + params);
  },
  // 取消任务
  cancelTask(params = '') {
    return MegHttp.httpPost(urls.cancelTask + params);
  },
  // 重新开始任务
  restartTask(params = '') {
    return MegHttp.httpPost(urls.restartTask + params);
  },
  // 删除单个结果
  deleteResult(params = {}) {
    return MegHttp.httpGet(urls.deleteResult, params);
  },
  // 频繁出没列表
  getFrequencyList(params = {}) {
    return MegHttp.httpGet(urls.frequencyList, params);
  },
  // 进度统计
  frequencyStatistics(params = {}) {
    return MegHttp.httpGet(urls.frequencyStatistics, params);
  },
  // 任务详情
  taskDetail(params = '') {
    return MegHttp.httpGet(urls.taskDetail + params);
  },
  // 任务人员出现记录
  personResult(params = {}) {
    return MegHttp.httpGet(urls.personResult + params.personId, { groupType: params.groupType });
  },
  /**
  * 获取有权限的相机列表
   */
  cameraList(params = {}) {
    return MegHttp.httpPost(urls.cameraList, params);
  },
  // 任务详情
  jobDetail(params = '') {
    return MegHttp.httpGet(urls.jobDetail + params);
  },
  // 任务名是否存在
  taskName(params) {
    return MegHttp.httpGet(urls.taskName, params);
  },
  // 修改任务名
  modifyJobName(params = {}) {
    return MegHttp.httpPost(urls.modifyJobName + params.jobId, { jobName: params.jobName });
  },
  // 导出
  export(params = {}) {
    return MegHttp.httpPost(urls.export, params);
  },
};

export default FrequencySrv;
