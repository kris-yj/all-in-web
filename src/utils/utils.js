import router from '@/utils/router.utils';
import config from '@/utils/config.utils';
import { omit } from 'lodash';

/**
 * 加载script脚本
 * path 路径
 */
const loadScript = (path) => new Promise(((resolve, reject) => {
  const script = document.createElement('script');
  try {
    let joinStr = '?r=';
    if (path.indexOf('&') > -1) {
      joinStr = '&r=';
    }
    joinStr += new Date().getTime();
    path += joinStr;
  } catch (e) {
    console.log(e);
  }

  script.src = path;
  script.async = true;
  script.onload = () => {
    resolve();
  };
  script.onerror = () => {
    reject();
  };
  document.body.appendChild(script);
}));
/**
 * 加载css文件
 * path 路径
 */
const loadCss = (path) => new Promise(((resolve, reject) => {
  const link = document.createElement('link');
  link.href = path;
  link.onload = () => {
    resolve();
  };
  link.onerror = () => {
    reject();
  };
  document.getElementsByTagName('head')[0].appendChild(link);
}));

let noFilterEmpty = false; // 控制是否对空字符串进行过滤
let noFilterArr = false; // 控制是否对空数组进行过滤

const tool = () => { };
/**
 *encodeURIComponent编码
 * val:传入待编码val
 *  data 返回编码后的数据
 */
const encodeParams = (val) => {
  const data = encodeURIComponent(JSON.stringify(val));
  return data;
};

/**
 * decodeURIComponent解码
 * val:传入待解码val
 * data 返回解码后的数据
 */
const decodeParams = (val) => {
  const data = decodeURIComponent(val);
  return JSON.parse(data);
};

/**
 * 资源定位符转base64
 * val:传入图片地址（blob或http开头都可以）
 */
const urlToBase64 = (val) => new Promise((resolve) => {
  const ajax = new XMLHttpRequest();
  ajax.open('get', val);
  ajax.send();
  ajax.responseType = 'blob';
  ajax.onreadystatechange = function () {
    if (ajax.readyState === 4 && ajax.status === 200) {
      const fileReader = new FileReader();
      fileReader.onload = function (e) {
        resolve(e.target.result);
      };
      const blob = new Blob([ajax.response], { 'type': 'image/jpeg' });
      fileReader.readAsDataURL(blob);
    }
  };
});
/**
 * base64转资源定位符
 * val:传入图片base64
 */
const base64ToUrl = (dataURI) => new Promise((resolve) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  resolve(URL.createObjectURL(new Blob([ab], { type: mimeString })));
});

/**
 * 获取图片的blob数据
 * url:要下载图片的url
 */
const getBlob = (url) => new Promise((resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = () => {
    if (xhr.status === 200) {
      resolve(xhr.response);
    }
  };
  xhr.send();
});
/**
 * 触发保存动作
 * blob:获取的图片blob数据
 */
const saveAs = (blob, filename) => {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    const body = document.querySelector('body');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    // fix Firefox
    link.style.display = 'none';
    body.appendChild(link);
    link.click();
    body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }
};
/**
 * base64转资源定位符
 * val:传入图片base64
 */
const imgDownload = (url, filename) => {
  getBlob(url).then((blob) => {
    saveAs(blob, filename);
  });
};
/**
   * @param {*对象} obj
   * 遍历处理数据中的 空字符串的方法 删除 空字符串  null  undefined
   */
const deletEmptyStringFn = (obj, initreq) => {
  try {
    if (obj) {
      // 递归调用第一次的时候进行判断是否需要对空字符串过滤
      if (initreq) {
        ({ noFilterEmpty } = obj);
      }
      // 递归调用第一次的时候进行判断是否需要对空字数组过滤
      if (initreq) {
        ({ noFilterArr } = obj);
      }
      Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object') {
          // 如果是数组，并且数组的length为0，从数据结构中删除，不向后端传该字段
          if (Array.isArray(obj[key]) && obj[key].length === 0 && !noFilterArr) {
            delete obj[key];
            return;
          }
          deletEmptyStringFn(obj[key]);
        } else if ((obj[key] === '' && !noFilterEmpty) || obj[key] === null || obj[key] === undefined || key === 'nointcp' || key === 'noFilterArr' || key === 'noFilterEmpty') { // 删除 空字符串  null  undefined
          delete obj[key];
        }
      });
    } else {
      obj = {};
    }
    return obj;
  } catch (e) {
    console.log(e);
  }
  return obj;
};

/**
 *  tooptip防空判断
 *  @param {object} row 当前列data对象
 *  @param {object} column 当前列配置
 *  @param {*} cellValue 当前value值
 */
const tooltipFtr = (row, column, cellValue) => {
  if (!cellValue) {
    return ' ';
  }
  return cellValue;
};
const enlarge = (r, rl, rt, rw, rh) => ({
  leftPixels: r.leftPixels - r.widthPixels * rl,
  topPixels: r.topPixels - r.heightPixels * rt,
  widthPixels: r.widthPixels * rw,
  heightPixels: r.heightPixels * rh
});

// 图片扩选(扩选后超出图片边界则超出部分放弃，其他不变)
const FaceRect2Face = (rect) => enlarge(rect, 0.5, 0.6, 2.0, 2.0);
const EnlargeRect = (r, widthScale, heightScale) => enlarge(
  r,
  (widthScale - 1) / 2,
  (heightScale - 1) / 2,
  widthScale,
  heightScale
);
  /**
 * 根据坐标点对图片进行裁切.
 * @param {base64} sourceBase64Data - 需要裁剪的源图片的base64.
 * @param {Object} rect - 裁剪坐标.
 * @param {Number}} widthScale - 宽度缩放值，入库时可能使用，一般不需指定.
 * @param {Number}} heightScale - 高度缩放值，入库时可能使用，一般不需指定.
 * @returns {base64} 裁剪出的图片的base64.
 */
const getExactImg = (sourceBase64Data, rect, widthScale = 0.8, heightScale = 0.8) =>
  // 因为是异步方法，取消4.x版本的回调模式，使用Promise
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    img.onload = function () {
      // 根据算法更新（扩大）有效坐标范围
      const tempArr = FaceRect2Face(EnlargeRect(rect, widthScale, heightScale));
      // 边缘检测，防止经过更新的坐标数据超出图片外
      if (tempArr.leftPixels < 0) {
        tempArr.widthPixels += tempArr.leftPixels;
        tempArr.leftPixels = 0;
      }
      if (tempArr.topPixels < 0) {
        tempArr.heightPixels += tempArr.topPixels;
        tempArr.topPixels = 0;
      }
      if (tempArr.topPixels + tempArr.heightPixels > img.height) {
        tempArr.heightPixels = img.height - tempArr.topPixels;
      }
      if (tempArr.leftPixels + tempArr.widthPixels > img.width) {
        tempArr.widthPixels = img.width - tempArr.leftPixels;
      }
      canvas.width = tempArr.widthPixels > img.width ? img.width : tempArr.widthPixels;
      canvas.height = tempArr.heightPixels > img.height ? img.height : tempArr.heightPixels;
      // canvas原生方法，具体参数意义请查看canvas相关api
      ctx.drawImage(img, tempArr.leftPixels, tempArr.topPixels, tempArr.widthPixels, tempArr.heightPixels, 0, 0, tempArr.widthPixels, tempArr.heightPixels);
      resolve(canvas.toDataURL('image/png', 1));
    };
    img.src = sourceBase64Data;
  });

const parseQuery = (query) => {
  const res = {};

  query = query && query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach((param) => {
    const parts = param.replace(/\+/g, ' ').split('=');
    const key = window.decodeURIComponent(parts.shift());
    const val = parts.length > 0
      ? window.decodeURIComponent(parts.join('='))
      : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res;
};
// 研判模块下用到的颜色取色
const pickColorForJudge = (index) => {
  const colors = ['#5195EA', '#867FEB', '#EFA723', '#70B699', '#55B0D5', '#6B82E4',
    '#C17ADC', '#6B82E4', '#5195EA', '#867FEB', '#70B699', '#55B0D5', '#6B82E4'];
  return colors[index % colors.length] ? colors[index % colors.length] : colors[0];
};

/**
 * @description 将字节数据转换成合适的单位大小
 * @param {Number} bytes 字节大小
 * @returns {String} 修改单位后的数据表示
 */
const bytesToSize = function (bytes) {
  if (Number.isNaN(bytes)) {
    return '';
  }
  const symbols = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let exp = Math.floor(Math.log(bytes) / Math.log(2));
  if (exp < 1) {
    exp = 0;
  }
  const i = Math.floor(exp / 10);
  bytes = bytes / Math.pow(2, 10 * i); // eslint-disable-line
  if (bytes.toString().length > bytes.toFixed(2).toString().length) {
    bytes = bytes.toFixed(2);
  }
  return `${bytes} ${symbols[i]}`;
};

const utils = {
  tool,
  encodeParams,
  decodeParams,
  urlToBase64,
  base64ToUrl,
  deletEmptyStringFn,
  imgDownload,
  tooltipFtr,
  getExactImg,
  parseQuery,
  pickColorForJudge,
  bytesToSize
};

/**
 * 通过新开tab页打开地址
 */
export function openByNewTab(url) {
  const a = document.createElement('a');
  a.setAttribute('target', '_blank');
  a.setAttribute('href', url);
  a.setAttribute('rel', 'noopener noreferrer');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * 模块跳转
 * @param {*} moduleInfo
 */
const switchToModule = (moduleInfo) => {
  const {
    module, child, query, params, replace, pageType, isBlank
  } = moduleInfo;

  const routeQuey = query || {};

  if (pageType) {
    routeQuey.pageType = pageType;
  }

  // pageType下子路由（子页面）当前页面的跳转pageType参数处理
  const routeQuery = utils.parseQuery(window.location.hash.split('?')[1]);
  if (routeQuery.pageType && !isBlank) {
    routeQuey.pageType = routeQuery.pageType;
  }

  // module info 对象模板，供router resolved使用
  const modulePathInfo = {
    query: routeQuey,
    params,
    replace
  };
  // 无论是跳转到module还是module里的子页面，都先解析module，判断module是否存在
  const { resolved } = router.resolve({
    name: module
  });

  consola.info('switch to module resolve module', module, resolved);

  // 先判断module是否在当前系统中存在
  if (resolved.matched.length === 0) {
    consola.error('module is not exist: ', module);
    return;
  }

  // 如果是跳转到子页面，module info上追加child
  if (child) {
    modulePathInfo.path = `${resolved.path}/${child}`;
  } else {
    modulePathInfo.path = `${resolved.path}`;
  }

  const modulePath = router.resolve(modulePathInfo);

  consola.info('switch to module...', modulePathInfo, modulePath);

  if (isBlank) {
    // window.open(modulePath.href);
    openByNewTab(modulePath.href);
  } else if (modulePath.route.name) {
    router.push({
      name: modulePath.route.name,
      params: modulePathInfo.params,
      query: routeQuey,
      replace: modulePathInfo.replace
    });
  } else {
    router.push({
      ...modulePathInfo,
      path: modulePath.route.fullPath,
    });
  }
};

/**
 * 通过module和child获取当前module和child的路由信息
 * @param {*} moduleInfo
 */
const getModulePathInfo = (moduleInfo) => {
  const {
    module, child
  } = moduleInfo;

  const modulePathInfo = {};

  if (child) {
    modulePathInfo.path = `${module}/${child}`;
  } else {
    modulePathInfo.name = module;
  }

  const modulePath = router.resolve(modulePathInfo);

  return modulePath;
};

export {
  loadScript,
  loadCss,
  utils,
  switchToModule,
  getModulePathInfo,
};

export function eventTracking(moduleAlias, eventId, ext) {
  let apiPath = `${config.apiPath.service}/api/v1/exergy/eventTracking`;

  if (process.env.NODE_ENV === 'development') {
    apiPath = 'http://api-insight.cbg.megvii-inc.com/mock/1690/api/v1/exergy/eventTracking';
  }

  const tag = `${projName}.${projVersion}${moduleAlias ? `.${moduleAlias}` : ''}${eventId ? `.${eventId}` : ''}`; // eslint-disable-line
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${apiPath}?tag=${tag}&ext=${JSON.stringify(ext || {})}`, true);
  xhr.send(null);
}

/**
 * @description 通过小弹窗的方式打开新页面
 * @param {Object} routeOpt 路由配置
 * @param {Object} options 弹窗配置
 */
export function openModuleByWindow(routeOpt, options) {
  const route = router.resolve(routeOpt);
  const selfOption = ['center'];
  const defaultOpt = {
    toolbar: 'no',
    titlebar: 'no',
    location: 'no',
    directories: 'no',
    status: 'no',
    menubar: 'no',
    scrollbars: 'yes',
    resizable: 'no',
    width: 1000,
    height: 500
  };
  const mergeOpt = { ...defaultOpt, ...omit(options, selfOption) };
  if (options.center) {
    const { width, height } = mergeOpt;
    mergeOpt.top = (window.screen.height - 30 - height) / 2;
    mergeOpt.left = (window.screen.width - 10 - width) / 2;
  }
  const optStr = Object.keys(mergeOpt).reduce((str, key, index) => {
    let prefix = '';
    if (index > 0) {
      prefix = ', ';
    }
    str += `${prefix}${key}=${mergeOpt[key]}`;
    return str;
  }, '');
  const moduleWin = window.open(route.href,
    '_blank',
    optStr);
  return moduleWin;
}

/**
 * @description 打开引导页
 * @param {Object} routeOpt 基本路由配置
 */
export function openGuideModule(routeOpt = {}) {
  const defaultOpt = { name: 'guide' };
  window.guideWindow = openModuleByWindow({ ...defaultOpt, ...routeOpt }, { center: true });
}
/**
 * @description background不支持插入元素，所以只能用其他办法实现效果。。
 * @description 部分页面需要在无数据时显示的background下面，添加一行可以跳转至引导页的文字，由于background组件不提供属性插入元素，只能以element作为判断
 * @description 若在外层添加文字，并以absolute定位，不能确定背景图的具体高度和位置，且有些公共组件需要添加跳转文字时，需修改对应的公共组件内容，以伪元素和事件回调实现，可在外层绑定事件完成功能
 * @param {Object} $event 事件event
 */
// export function openGuideByBgText($event) {
//   const systemCode = store.getters.systemByType('systemCode');
//   if (!systemCode || systemCode.value !== 'wisdom') return;
//   if (!$event) return;
//   const $ = document.querySelector.bind(document);
//   const boxEle = $('.meg-background__content');
//   if (!boxEle || $event.target !== boxEle) return;
//   const { name } = router.currentRoute;
//   const opt = { query: { name } };
//   openGuideModule(opt);
// }
