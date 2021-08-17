import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址

// const auth = window.config.globalConfig.apiPath.auth; // auth地址
const urls = {
  searchRecordPath: `${baseUrl}/api/kunlun/judge/profile/track`,
  recordTaskExportPath: `${baseUrl}/api/kunlun/judge/profile/track/task/export`,
  recordSelectExportPath: `${baseUrl}/api/kunlun/judge/profile/track/select/export`,
  getAlbumListPath: `${baseUrl}/api/galaxy/v1/album/list`,
  getPhotoTreePath: `${baseUrl}/api/galaxy/v1/device/tree`, // 查询相机树
};

// service methods
const trackAnalysisSrv = {
  searchRecord(params = {}) {
    return MegHttp.httpPost(urls.searchRecordPath, params);
  },
  recordTaskExport(params = {}) {
    return MegHttp.httpPost(urls.recordTaskExportPath, params);
  },
  recordSelectExport(params = {}) {
    return MegHttp.httpPost(urls.recordSelectExportPath, params);
  },
  getAlbumList(params = {}) {
    return MegHttp.httpPost(urls.getAlbumListPath, params);
  },
  getPhotoTree(params = {}) {
    return MegHttp.httpPost(urls.getPhotoTreePath, params);
  },
};

export default trackAnalysisSrv;
