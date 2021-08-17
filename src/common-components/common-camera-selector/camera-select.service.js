/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';
// path prefix
const galaxyUrl = config.apiPath.galaxyService;
const baseUrl = config.apiPath.service; // 基础地址

// service path
const urls = {
  camerasTree: `${galaxyUrl}/api/galaxy/v1/device/tree`, // 查询相机树
  labels: `${galaxyUrl}/api/galaxy/v1/device/cameras:labels`, // 查询相机标签
  places: `${galaxyUrl}/api/galaxy/v1/device/places/listAll`, // 查询相机区域
  keyUnits: `${galaxyUrl}/api/galaxy/v1/device/cameras:units`, // 查询重点单位
  captureCount: `${galaxyUrl}/api/galaxy/v1/capture/dashboard/count`, // 查询抓拍数
  cameraInfo: `${galaxyUrl}/api/galaxy/v1/device/cameras/`, // 获取今日抓拍总数和最近的抓拍信息
  cameraDetail: `${baseUrl}/api/kunlun/analysis/realtime/cameras/`,
  cameraVideo: `${galaxyUrl}/api/galaxy/v1/device/cameras:searchOpenVideoInfo`, // 获取相机视频流地址
  iotUrl: `${galaxyUrl}/api/gmp/v1/stream/getAddr`, // 请求开流websocket地址
  historyList: `${baseUrl}/api/kunlun/judge/camera/record/query`, // 现价筛选历史记录
  deleteHistoryList: `${baseUrl}/api/kunlun/judge/camera/record/{id}`, // 删除用户相机检索历史
};
// service methods
const CameraSelectSrv = {
  /**
  * 查询相机树
  */
  getCamerasTree(request = {}) {
    return MegHttp.httpPost(urls.camerasTree, request);
  },
  /**
  * 查询相机标签
  */
  getLabels(request = {}) {
    return MegHttp.httpGet(urls.labels, request);
  },
  /**
  * 查询相机区域
  */
  getPlaces(request = {}) {
    return MegHttp.httpGet(urls.places, request);
  },
  /**
  * 查询重点单位
  */
  getKeyUnits(request = {}) {
    return MegHttp.httpGet(urls.keyUnits, request);
  },
  /**
   * 查询抓拍数
   */
  getCaptureCount(request = {}) {
    return MegHttp.httpPost(urls.captureCount, request);
  },
  /**
  * 查询相机详情
  */
  getCameraInfo(request = {}) {
    return MegHttp.httpPost(urls.cameraInfo + request.id, request);
  },
  /**
   * 查询相机状态
   */
  getCameraDetail(request = {}) {
    return MegHttp.httpGet(urls.cameraDetail + request.id);
  },
  /**
  * 查询相机视频流地址
  */
  getCameraVideo(request = {}) {
    return MegHttp.httpGet(urls.cameraVideo, request);
  },
  /**
  * 查询相机视频流地址
  */
  getIotUrl(request = {}) {
    return MegHttp.httpPost(urls.iotUrl, request);
  },
  /**
  * 查询相机筛选历史记录
  */
  getCameraSelectHistoryList(request = {}) {
    return MegHttp.httpPost(urls.historyList, request);
  },
  /**
   * 删除相机检索历史
   */
  deleteCameraSelectHistoryList(id) {
    return MegHttp.httpDelete(urls.deleteHistoryList.replace(/{id}/, id));
  }

};

export default CameraSelectSrv;
