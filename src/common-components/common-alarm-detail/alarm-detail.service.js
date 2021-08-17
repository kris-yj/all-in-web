import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
const galaxy = config.apiPath.galaxyService; // 中台
// service path
const urls = {
  deployType: `${baseUrl}/api/kunlun/event/deployTypes:search`, // 查询布控类型
  alarmDetail: (id) => `${baseUrl}/api/kunlun/event/historyAlarms/${id}`, // 查询布控类型
  topSearch: `${galaxy}/api/galaxy/v1/album/passBySearch`, // top3对比结果查询
  getDeployStatus: (albumId, photoId) => `${baseUrl}/api/galaxy/v1/album/${albumId}/photo/${photoId}/move/deploy`, // 查询是否撤控
  moveDeployFace: (albumId, photoId) => `${baseUrl}/api/galaxy/v1/album/${albumId}/photo/${photoId}/move/deploy/`, // 查询是否撤控
  alarmReport: (alarmId) => `${baseUrl}/api/kunlun/event/historyAlarms/${alarmId}/report`, // 报警填报
  alarmUndo: (alarmId) => `${baseUrl}/api/kunlun/event/historyAlarms/${alarmId}/undo`, // 报警撤销
  alarmReceive: (alarmId) => `${baseUrl}/api/kunlun/event/historyAlarms/${alarmId}/receive`, // 报警接收
  alarmArchive: (alarmId) => `${baseUrl}/api/kunlun/event/historyAlarms/${alarmId}/archive`, // 报警存档
  alarmDesignate: (alarmId) => `${baseUrl}/api/kunlun/event/historyAlarms/${alarmId}/designate`, // 派警
  createResult: `${baseUrl}/api/kunlun/event/archives/add`, // 创建战果
  addTemporaries: `${baseUrl}/api/kunlun/event/temporaries:add`, // 添加到暂存架
  deleteTemporaries: `${baseUrl}/api/kunlun/event/temporaries:delete`, // 移出暂存架
  getTracks: (id) => `${baseUrl}/api/kunlun/event/historyAlarms/${id}/track`, // 获取活动轨迹
  getVideo: (id) => `${baseUrl}/api/kunlun/event/historyAlarms/video/${id}`, // 获取历史视频

  faceAnalyze: `${galaxy}/api/galaxy/v1/album/photo:analyze`, // 人脸检测
  multiVerify: `${galaxy}/api/galaxy/v1/album/multiVerify`, // 一键比对

  fetchRemoteFullImage: `${baseUrl}/api/kunlun/search/capture/full`, // 远程拉取全景图
};

// service methods
const alarmDetailSrv = {
  /**
   * 获取远程全景图
   */
  fetchRemoteFullImage(request = {}) {
    return MegHttp.httpGet(urls.fetchRemoteFullImage, request);
  },
  faceAnalyze(request = {}) {
    return MegHttp.httpPost(urls.faceAnalyze, request);
  },
  multiVerify(request = {}) {
    return MegHttp.httpPost(urls.multiVerify, request);
  },
  getDeployTypeList(params = {}) {
    return MegHttp.httpGet(urls.deployType, params);
  },
  getVideo(params = {}) {
    return MegHttp.httpGet(urls.getVideo(params.id));
  },
  topSearch(params = {}) {
    return MegHttp.httpPost(urls.topSearch, params);
  },
  getAlarmDetail(params = {}) {
    return MegHttp.httpGet(urls.alarmDetail(params.id));
  },
  getDeployStatus(params = {}) {
    return MegHttp.httpGet(urls.getDeployStatus(params.albumId, params.photoId), params);
  },
  getTracks(params = {}) {
    return MegHttp.httpGet(urls.getTracks(params.id));
  },
  moveDeployFace(params = {}) {
    return MegHttp.httpPost(urls.moveDeployFace(params.albumId, params.photoId), params);
  },
  alarmUndo(params = {}) {
    return MegHttp.httpPost(urls.alarmUndo(params.alarmId), params);
  },
  alarmReceive(params = {}) {
    return MegHttp.httpPost(urls.alarmReceive(params.alarmId), params);
  },
  alarmArchive(params = {}) {
    return MegHttp.httpPost(urls.alarmArchive(params.alarmId), params);
  },
  alarmDesignate(params = {}) {
    return MegHttp.httpPost(urls.alarmDesignate(params.alarmId), params);
  },
  alarmReport(params = {}) {
    return MegHttp.httpPost(urls.alarmReport(params.alarmId), params);
  },

  createResult(params = {}) {
    return MegHttp.httpPost(urls.createResult, params);
  },
  addTemporaries(params = {}) {
    return MegHttp.httpPost(urls.addTemporaries, params);
  },
  deleteTemporaries(params = {}) {
    return MegHttp.httpPost(urls.deleteTemporaries, params);
  },
};

export default alarmDetailSrv;
