import { switchToModule } from '@/utils/utils';

let blobSupported = false;
let paramsLen = 0;
function blobToBinaryString(blobUrl) {
  return new Promise((resolve) => {
    const ajax = new XMLHttpRequest();
    ajax.open('get', blobUrl);
    ajax.send();
    ajax.responseType = 'blob';
    ajax.onreadystatechange = function () {
      if (ajax.readyState === 4 && ajax.status === 200) {
        const fileReader = new FileReader();
        fileReader.onload = function (e) {
          resolve(e.target.result);
        };
        const blob = new Blob([ajax.response], { type: 'application/json; charset=UTF-8' });
        fileReader.readAsText(blob, 'UTF-8');
      }
    };
  });
}
export default class FormatSwitchParams {
  constructor(params) {
    this.params = params || {
      query: {},
      original: false
    };
    this.data = params.query.data || {};
    console.log(params);
    const keys = Object.keys(params.query);
    if (keys.length) {
      keys.forEach((key) => {
        if (key !== 'data') {
          this.data[key] = params.query[key];
        }
      });
    }
    this.dataStr = JSON.stringify(this.data);
    try {
      blobSupported = Boolean(new Blob());
      paramsLen = this.dataStr.length || 0;
    } catch (e) {
      blobSupported = false;
    }
    if (params.original) {
      this.transferObjToUrl();
      return;
    }
    if (blobSupported) {
      this.transferObjToUrl('blob');
    } else {
      if (paramsLen <= 1000) {//eslint-disable-line
        this.transferObjToUrl('url');
      } else {
        this.transferObjToUrl('local');
      }
    }
  }

  transferObjToUrl(type) {
    console.log(this.params, type);
    this.params = {
      ...this.params,
      query: {
        ...this.params.query,
      }
    };
    switch (type) {
      case 'blob':
        const blob = new Blob([this.dataStr], { type: 'application/json; charset=UTF-8' });//eslint-disable-line
        this.blobURL = URL.createObjectURL(blob);
        this.params.query.data = this.blobURL;
        break;
      case 'local':
        localStorage.setItem('transData', this.dataStr);
        this.params.query.data = 'transData';
        break;
      case 'url':
        this.params.query.data = this.dataStr;
        break;
      default:
        this.params.query = this.data;
        break;
    }
    this.params.query.transType = type;
  }

  switchToModule() {
    switchToModule(this.params);
  }
}

export function getOriginalQuery(query, clear = true) {
  console.log(query);
  const { data } = query;
  let binaryStr = null;
  switch (query.transType) {
    case 'blob':
      binaryStr = new Promise((resolve) => {
        blobToBinaryString(data).then((res) => {
          if (clear) URL.revokeObjectURL(data);
          resolve(JSON.parse(res));
        });
      });
      break;
    case 'local':
      binaryStr = new Promise((resolve) => {
        const originData = localStorage.getItem(data);
        if (clear) localStorage.removeItem(data);
        resolve(JSON.parse(originData));
      });
      break;
    case 'url':
      binaryStr = new Promise((resolve) => {
        resolve(JSON.parse(query.data));
      });
      break;
    default:
      binaryStr = new Promise((resolve) => {
        resolve(query);
      });
  }
  const { hash } = window.location;
  const singleMode = hash.indexOf('pageType=single') > -1;
  if (clear && singleMode) {
    const hashName = hash.split('?')[0];
    window.location.hash = singleMode ? `${hashName}?pageType=single` : hashName;
  }
  return binaryStr;
}
