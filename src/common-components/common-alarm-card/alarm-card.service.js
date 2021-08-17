import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// service path
const urls = {
  addTemporaries: `${baseUrl}/api/kunlun/event/temporaries:add`, // 添加到暂存架
  deleteTemporaries: `${baseUrl}/api/kunlun/event/temporaries:delete`, // 移出暂存架
};

// service methods
const alarmDetailSrv = {
  addTemporaries(params = {}) {
    return MegHttp.httpPost(urls.addTemporaries, params);
  },
  deleteTemporaries(params = {}) {
    return MegHttp.httpPost(urls.deleteTemporaries, params);
  },
};

export default alarmDetailSrv;
