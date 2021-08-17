import MegHttp from 'megvii-http';
import config from '@/utils/config.utils';
import store from '@/store';
import { Message } from 'megvii-ui';

const baseUrl = config.apiPath.service;

const urls = {
  addCameraSelectHistory: `${baseUrl}/api/kunlun/judge/camera/record/add`
};

export default function doAddCameraSelectHistory(cameraIds, fn) {
  const reqParams = {
    cameraIds,
    userId: store.getters.user.id,
  };
  MegHttp.httpPost(urls.addCameraSelectHistory, reqParams).then((res) => {
    if (res.code === 0) {
      if (fn) {
        fn.call();
      }
    } else {
      Message.error(res.msg);
    }
  });
}
