import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// service path
const urls = {
  addTemporaries: `${baseUrl}/api/kunlun/event/temporaries:add`,
  deleteTemporaries: `${baseUrl}/api/kunlun/event/temporaries:delete`
};

// service methods
const commonCardSrv = {
  addTemporaries(params) {
    return MegHttp.httpPost(urls.addTemporaries, params);
  },
  deleteTemporaries(params) {
    return MegHttp.httpPost(urls.deleteTemporaries, params);
  },
};

export default commonCardSrv;
