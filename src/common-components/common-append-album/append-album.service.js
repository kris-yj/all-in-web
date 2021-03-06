/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';
// path prefix
const baseUrl = config.apiPath.service;
const galaxy = config.apiPath.galaxyService; // 中台
// service path
const urls = {
  'albumList': `${galaxy}/api/galaxy/v1/album/list`, // 获取底库选择列表
  'singleSearch': `${galaxy}/api/galaxy/v1/album/monitorSearch`, // 功能同单人检索但不记录日志
  'monitor': `${baseUrl}/api/galaxy/v1/album/photo:oneClickMonitor`, // 一键布控
  'getAlbumPhotoInfo': (photoId) => `${galaxy}/api/galaxy/v1/album/photo/${photoId}` // 获取底库人像信息
};

const DeploySrv = {
  /**
  * 获取底库选择列表
  */
  albumList(params = {}) {
    return MegHttp.httpPost(urls.albumList, params);
  },
  // -------------------------------------------
  /**
  * 单人检索
  */
  singleSearch(params = {}) {
    return MegHttp.httpPost(urls.singleSearch, params);
  },
  /**
  * 一键布控
  */
  monitor(params = {}) {
    return MegHttp.httpPost(urls.monitor, params);
  },
  /**
  * 获取底库人像信息
  */
  getAlbumPhotoInfo(params = {}) {
    return MegHttp.httpGet(urls.getAlbumPhotoInfo(params.photoId), params);
  },
};
export default DeploySrv;
