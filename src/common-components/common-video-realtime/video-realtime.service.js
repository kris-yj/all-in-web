import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

const galaxyUrl = config.apiPath.galaxyService;

const urls = {
  cameraVideo: `${galaxyUrl}/api/galaxy/v1/device/cameras:searchOpenVideoInfo`, // 获取相机视频流地址
  iotUrl: `${galaxyUrl}/api/gmp/v1/stream/getAddr`, // 请求开流websocket地址
};
const VideoRealtimeSrv = {
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
};
export default VideoRealtimeSrv;
