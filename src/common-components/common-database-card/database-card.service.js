import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址
// service path
const urls = {
  addTemporaries: `${baseUrl}/api/kunlun/event/temporaries:add`,
  delTemporaries: `${baseUrl}/api/kunlun/event/temporaries:delete`
};

// service methods
const DatabaseCardSrv = {
  addTemporaries(params) {
    return MegHttp.httpPost(urls.addTemporaries, params);
  },
  delTemporaries(params) {
    return MegHttp.httpPost(urls.delTemporaries, params);
  },
};

export default DatabaseCardSrv;
