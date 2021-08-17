/* Automatically generated by './build/add-module.js' */
import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';

// path prefix
const baseUrl = config.apiPath.service; // 基础地址

// service path
const urls = {
  addTemporarys: `${baseUrl}/api/kunlun/event/temporaries:add`, // 加入暂存架
  delTemporarys: `${baseUrl}/api/kunlun/event/temporaries:delete`, // 移出暂存架

};

// service methods
const DatabaseDetailSrv = {
  /**
 * 加入暂存架
 */
  addTemporarys(params = {}) {
    return MegHttp.httpPost(urls.addTemporarys, params);
  },
  /**
* 移出暂存架
*/
  delTemporarys(params = {}) {
    return MegHttp.httpPost(urls.delTemporarys, params);
  },
};

export default DatabaseDetailSrv;