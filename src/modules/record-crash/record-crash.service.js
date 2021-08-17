import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址

// const auth = window.config.globalConfig.apiPath.auth; // auth地址
const urls = {
  searchRecordPath: `${baseUrl}/api/kunlun/judge/profile/collision`,
  recordTaskExportPath: `${baseUrl}/api/kunlun/judge/profile/collision/task/export`,
  recordSelectExportPath: `${baseUrl}/api/kunlun/judge/profile/collision/select/export`,
  recordPhotoSelectPath: `${baseUrl}/api/galaxy/v1/profile/search/photo`,
  getAlbumListPath: `${baseUrl}/api/galaxy/v1/album/list`
};

// service methods
const recordCrashSrv = {
  searchRecord(params = {}) {
    return MegHttp.httpPost(urls.searchRecordPath, params);
  },
  recordTaskExport(params = {}) {
    return MegHttp.httpPost(urls.recordTaskExportPath, params);
  },
  recordSelectExport(params = {}) {
    return MegHttp.httpPost(urls.recordSelectExportPath, params);
  },
  recordPhotoSelect(params = {}) {
    return MegHttp.httpPost(urls.recordPhotoSelectPath, params);
  },
  getAlbumList(params = {}) {
    return MegHttp.httpPost(urls.getAlbumListPath, params);
  },
};

export default recordCrashSrv;
