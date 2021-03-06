/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
// const baseUrl = config.apiPath.service; // 基础地址
// const testUrl1 = 'http://api-insight.cbg.megvii-inc.com/mock/882';

const baseUrl = config.apiPath.service;

// service path
const urls = {
  deployType: `${baseUrl}/api/kunlun/event/deployTypes:search`, // 查询布控类型
  taskList: `${baseUrl}/api/kunlun/event/deployTasks:searchAll`, // 布控任务列表
  albumList: `${baseUrl}/api/galaxy/v1/album/list`, // 查询底库列表
  clusterList: `${baseUrl}/api/kunlun/event/historyAlarms/data:groupCount`, // 手风琴聚类查询
  alarmList: `${baseUrl}/api/kunlun/event/historyAlarms/data:list`, // 手风琴每一项的列表查询

  exportHistory: `${baseUrl}/api/kunlun/event/historyAlarms/data:export`, // 导出数据
  cascadeList: `${baseUrl}/api/face/v6/cascade/registry/getNodeTree`, // 级联布控单位
};

// service methods
const alarmHistorySrv = {
  getDeployTypeList(params = {}) {
    return MegHttp.httpGet(urls.deployType, params);
  },
  getTaskList(params = {}) {
    return MegHttp.httpGet(urls.taskList, params);
  },
  getAlbumList(params = {}) {
    return MegHttp.httpPost(urls.albumList, params);
  },
  getCascadeList(request = {}) {
    return MegHttp.httpGet(urls.cascadeList, request);
  },
  getClusterList(params = {}) {
    return MegHttp.httpPost(urls.clusterList, params);
  },
  exportHistory(params = {}) {
    return MegHttp.httpPost(urls.exportHistory, params);
  },
  getAlarmList(params = {}) {
    return MegHttp.httpPost(urls.alarmList, params);
  },
};

export default alarmHistorySrv;
