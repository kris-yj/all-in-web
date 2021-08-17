import config from '@/utils/config.utils';
import MegHttp from 'megvii-http';

const baseUrl = config.apiPath.galaxyService;
const urls = {
  propertyConfig: `${baseUrl}/api/galaxy/v1/system/deploy/dic/search`, // 查询属性字典信息
};

export const getPropertyDic = () => new Promise((resolve) => {
  const dictionary = sessionStorage.getItem('propertyDic');
  if (dictionary) { resolve(JSON.parse(dictionary)); }
  MegHttp.httpGet(urls.propertyConfig).then((res) => {
    if (res.code === 0) {
      sessionStorage.setItem('propertyDic', JSON.stringify(res.data.records));
      resolve(res.data.records);
    }
  });
});

export default {};
