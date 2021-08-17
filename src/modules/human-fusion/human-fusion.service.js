import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址

// const auth = window.config.globalConfig.apiPath.auth; // auth地址
const urls = {
  bodySearchPath: `${baseUrl}/api/kunlun/judge/profileSearch/body`,
  faceSearchPath: `${baseUrl}/api/kunlun/judge/profileSearch/face`,
  captureDeleteCardPath: `${baseUrl}/api/kunlun/judge/profileSearch/detail/delete`,
  detailCapturePath: `${baseUrl}/api/kunlun/judge/profileSearch/detail/capture`,
  detailTracePath: `${baseUrl}/api/kunlun/judge/profileSearch/detail/trace`,
  detailFootholdPath: `${baseUrl}/api/kunlun/judge/profileSearch/detail/foothold`,
  detailRegularPath: `${baseUrl}/api/kunlun/judge/profileSearch/detail/regular`,
  detailActivityPeriodPath: `${baseUrl}/api/kunlun/judge/profileSearch/detail/activityPeriod`,
  searchCameraPath: `${baseUrl}/api/galaxy/v1/device/cameras/linkCamera:search`,
};

// service methods
const humanFusionSrv = {
  bodySearchList(params = {}) {
    return MegHttp.httpPost(urls.bodySearchPath, params);
  },
  faceSearchList(params = {}) {
    return MegHttp.httpPost(urls.faceSearchPath, params);
  },
  deleteCard(params = {}) {
    return MegHttp.httpPost(urls.captureDeleteCardPath, params);
  },
  detailCapture(params = {}) {
    return MegHttp.httpPost(urls.detailCapturePath, params);
  },
  detailTrace(params = {}) {
    return MegHttp.httpPost(urls.detailTracePath, params);
  },
  detailFoothold(params = {}) {
    return MegHttp.httpPost(urls.detailFootholdPath, params);
  },
  detailRegular(params = {}) {
    return MegHttp.httpPost(urls.detailRegularPath, params);
  },
  detailActivityPeriod(params = {}) {
    return MegHttp.httpPost(urls.detailActivityPeriodPath, params);
  },
  searchCamera(params) {
    return MegHttp.httpPost(urls.searchCameraPath, params);
  },
};

export default humanFusionSrv;
