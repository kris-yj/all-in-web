import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';
// path prefix
const baseUrl = config.apiPath.service;
const galaxyUrl = config.apiPath.galaxyService;
const urls = {
  passBySearch: `${baseUrl}/api/galaxy/v1/album/passBySearch`, // 检索详情比对1：3
  getPeerData: `${galaxyUrl}/api/galaxy/v1/capture/extend/peer`, // 获取同行数据
  fetchRemoteFullImage: `${baseUrl}/api/kunlun/search/capture/full`, // 远程拉取全景图
  cascadeFetchRemoteFullImage: `${baseUrl}/api/kunlun/search/cascade/capture/full`, // 级联检索远程拉取全景图
  isArchivesExist: `${baseUrl}/api/galaxy/v1/profile/search/faceId`, // 判断图片是否有一人一档
  getDetail: `${baseUrl}/api/kunlun/search/capture/property/{id}`, // 抓拍详情
  feakerGetDetail: `${baseUrl}/api/kunlun/event/temporaries/capture/{id}`, // 假抓拍详情 线索库使用
  cascadeGetDetail: `${baseUrl}/api/kunlun/search/cascade/capture/detail`, // 级联抓拍详情 级联检索使用
  addTemporaries: `${baseUrl}/api/kunlun/event/temporaries:add`, // 加入暂存架
  delTemporaries: `${baseUrl}/api/kunlun/event/temporaries:delete`, // 移出暂存架
  feedBack: `${baseUrl}/api/kunlun/search/badcase`, // 反馈
  getAddr: `${baseUrl}/api/gmp/v1/stream/getAddr`, // 请求开流websocket地址
  searchOpenVideoInfo: `${baseUrl}/api/galaxy/v1/device/cameras:searchOpenVideoInfo` // 获取打开视频流信息
};
// service methods
const BodyCaptureDetailSrv = {
  /**
 * 反馈
 */
  feedBack(params = {}) {
    return MegHttp.httpPost(urls.feedBack, params);
  },
  /**
 * 检索详情比对1：3
 */
  passBySearch(params = {}) {
    return MegHttp.httpPost(urls.passBySearch, params);
  },
  /**
 * 加入暂存架
 */
  addTemporaries(params = {}) {
    return MegHttp.httpPost(urls.addTemporaries, params);
  },
  /**
 * 移出暂存架
 */
  delTemporaries(params = {}) {
    return MegHttp.httpPost(urls.delTemporaries, params);
  },
  /**
 * 请求开流websocket地址
 */
  getAddr(params = {}) {
    return MegHttp.httpPost(urls.getAddr, params);
  },
  /**
   * 获取打开视频流信息
   */
  searchOpenVideoInfo(request = {}) {
    return MegHttp.httpGet(urls.searchOpenVideoInfo, request);
  },
  /**
   * 抓拍详情
   */
  getDetail(params = {}) {
    return MegHttp.httpGet(urls.getDetail.replace(/{id}/, params.id));
  },
  /**
   * 假抓拍详情
   */
  feakerGetDetail(params = {}) {
    return MegHttp.httpGet(urls.feakerGetDetail.replace(/{id}/, params.id));
  },
  /**
   * 级联抓拍详情
   */
  cascadeGetDetail(params = {}) {
    return MegHttp.httpPost(urls.cascadeGetDetail, params);
  },
  /**
   * 获取远程全景图
   */
  fetchRemoteFullImage(request = {}) {
    return MegHttp.httpGet(urls.fetchRemoteFullImage, request);
  },
  /**
   * 级联检索获取远程全景图
   */
  cascadeFetchRemoteFullImage(request = {}) {
    return MegHttp.httpPost(urls.cascadeFetchRemoteFullImage, request);
  },
  /**
   * 判断图片是否有一人一档
   */
  isArchivesExist(params = {}) {
    return MegHttp.httpPost(urls.isArchivesExist, params);
  },
  /**
   * 获取同行数据
   */
  getPeerData(params = {}) {
    return MegHttp.httpPost(urls.getPeerData, params);
  },
};

export default BodyCaptureDetailSrv;
