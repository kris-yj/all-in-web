/* Automatically generated by './build/add-module.js' */
import {
  httpGet,
  httpPost,
  httpPatch,
  httpPut,
  httpDelete
} from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const { service: baseUrl, galaxyService: galaxyUrl } = config.apiPath; // 基础地址
// const galaxyUrl = config.apiPath.galaxyBusiness; // 中台服务地址
// const auth = config.apiPath.auth; // auth地址

// service path
const urls = {
  realtimeAnalysisList: `${baseUrl}/api/kunlun/analysis/realtime:search`, // 实时解析任务列表
  statistics: `${baseUrl}/api/kunlun/analysis/realtime/statistics`, // 任务统计
  batchDelete: `${baseUrl}/api/kunlun/analysis/realtime/batchDelete`, // 批量删除
  batchPause: `${baseUrl}/api/kunlun/analysis/realtime/batchPause`, // 批量暂停
  batchResume: `${baseUrl}/api/kunlun/analysis/realtime/batchResume`, // 批量恢复
  pause: `${galaxyUrl}/api/galaxy/v1/analysis/realtime/pause/`, // 暂停
  resume: `${galaxyUrl}/api/galaxy/v1/analysis/realtime/resume/`, // 继续
  edit: `${galaxyUrl}/api/galaxy/v1/analysis/realtime/`, // 编辑
  delete: `${galaxyUrl}/api/galaxy/v1/analysis/realtime/`, // 删除
  monthList: `${galaxyUrl}/api/galaxy/v1/analysis/realtime/month`, // 任务分布月视图
  addTask: `${galaxyUrl}/api/galaxy/v1/analysis/realtime/batchTask`, // 创建实时解析任务
  noAnalysisTree: `${baseUrl}/api/kunlun/analysis/realtime/cameras:noAnalysistree`, // 未解析相机树
  searchOpenVideoInfo: `${galaxyUrl}/api/galaxy/v1/device/cameras:searchOpenVideoInfo`, // 获取打开视频流信息
  getAddr: `${baseUrl}/api/gmp/v1/stream/getAddr`, // 获取视频流地址
  getDetail: `${baseUrl}/api/kunlun/analysis/realtime/`, // 获取任务详情
  cameraStat: `${baseUrl}/api/kunlun/analysis/realtime/cameras/`, // 是否有抓拍和报警
  cameraDeploy: `${baseUrl}/api/kunlun/event/deployTasks/camera/`, // 相机是否关联布控任务
};

// service methods
const realtimeAnalysisSrv = {
  cameraDeploy(id) {
    return httpGet(`${urls.cameraDeploy + id}:contains`);
  },
  cameraStat(id) {
    return httpGet(`${urls.cameraStat + id}/statistics`);
  },
  /**
   * 获取视频流地址
   */
  getDetail(id, params = {}) {
    return httpGet(urls.getDetail + id, params);
  },
  getAddr(params = {}) {
    return httpPost(urls.getAddr, params);
  },
  /**
   * 获取打开视频流信息
   */
  searchOpenVideoInfo(params = {}) {
    return httpGet(urls.searchOpenVideoInfo, params);
  },
  /**
   * 未解析相机树
   */
  noAnalysisTree(params) {
    return httpPost(urls.noAnalysisTree, params, { canCancel: true });
  },
  // 任务分布月视图
  queryTaskMonthList(params = {}) {
    return httpPost(urls.monthList, params);
  },
  /**
   * 实时解析检索
   */
  getRealtimeAnalysisList(params = {}) {
    return httpPost(urls.realtimeAnalysisList, params);
  },
  /**
   * 任务统计
   */
  getStatistics(params) {
    return httpPost(urls.statistics, params);
  },
  /**
   * 批量删除
   */
  batchDelete(params = {}) {
    return httpPost(urls.batchDelete, params);
  },
  /**
   * 批量暂停
   */
  batchPause(params = {}) {
    return httpPost(urls.batchPause, params);
  },
  /**
   * 批量继续
   */
  batchResume(params = {}) {
    return httpPost(urls.batchResume, params);
  },
  /**
   * 暂停
   */
  pause(id) {
    return httpPatch(urls.pause + id);
  },
  /**
   * 继续
   */
  resume(id) {
    return httpPatch(urls.resume + id);
  },
  /**
   * 编辑
   */
  edit(id, params) {
    return httpPut(urls.edit + id, params);
  },
  /**
   * 删除
   */
  delete(id) {
    return httpDelete(urls.delete + id);
  },
  /**
   * 新建任务
   */
  addTask(params) {
    return httpPost(urls.addTask, params);
  }
};

export default realtimeAnalysisSrv;
