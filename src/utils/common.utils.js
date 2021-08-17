import _ from 'lodash';
import moment from 'moment';

/**
 * @param dateArr: 时间选择组件的起止时间
 * @description 将时间组件的起止时间设置进searchModule
 */
export function getDateValue(dateArr, data = []) {
  if (!dateArr || !dateArr.length) {
    data[0] = '';
    data[1] = '';
  } else {
    data[0] = dateArr[0] ? +new Date(dateArr[0]) : '';
    data[1] = dateArr[1] ? +new Date(dateArr[1]) : '';
  }
  return data;
}
/**
 *
 * @param {*} prev 前一个数组
 * @param {*} next 后一个数组
 * 比对找到两个数组中相同、增加、删除的元素
 */
export function compareArr(prev, next) {
  const tempArr = [];
  const deletedArr = [];
  const tempSameArr = [];
  const prevSameArr = [];
  const increasedArr = [];
  const nextSameArr = [];
  if (Object.prototype.toString.call(prev) === '[object Array]') {
    for (let i = 0; i < next.length; i++) {//eslint-disable-line
      tempArr[next[i].id] = true;
    }
    for (let i = 0; i < prev.length; i++) {//eslint-disable-line
      if (!tempArr[prev[i].id]) {
        deletedArr.push(prev[i]);
      } else {
        tempSameArr[prev[i].id] = true;
        prevSameArr.push(prev[i]);
      }
    }
    for (let i = 0; i < next.length; i++) {//eslint-disable-line
      if (!tempSameArr[next[i].id]) {
        increasedArr.push(next[i]);
      } else {
        nextSameArr.push(next[i]);
      }
    }
  }
  return {
    deletedArr,
    prevSameArr,
    nextSameArr,
    increasedArr
  };
}
/**
 * @param hour:小时数 格式 10:00
 * @description 将小时数转换成整数
 */
export function getHour(hour) {
  return +(hour.split(':')[0]);
}
export function restoreHour(hour) {
  hour += '';
  return hour.length === 1 ? `0${hour}:00` : (hour.length === 2 ? `${hour}:00` : '');//eslint-disable-line
}
/**
 *
 * @param {*} subOrgsTreeMsg
 * @param {*} camerasList
 */
export function createAllTree(subOrgsTreeMsg = [], camerasList = []) {
  const tree = [];
  if (subOrgsTreeMsg.constructor === Array) {
    subOrgsTreeMsg.forEach((item) => {
      const { subOrgs } = item;
      let children = [];
      for (let i = 0; i < camerasList.length; i += 1) {
        if (item.id === camerasList[i].departmentId) {
          camerasList[i].label = camerasList[i].cameraName;
          camerasList[i].flag = 'camera';
          children.push(camerasList[i]);
        }
      }
      if (subOrgs && subOrgs.length > 0) {
        children = children.concat(createAllTree(subOrgs, camerasList));
      }
      tree.push({
        id: item.id,
        label: item.orgName,
        flag: 'dept',
        noStatistics: true,
        children
      });
    });
  }

  return tree;
}
/**
 * @param cameraGetter 获取相机列表
 * @param orgGetter 获取组织列表的树
 * @param cameraParam 相机列表的筛选过滤参数
 * 获取摄像机列表以及摄像机部门树
 */
export function getCamerasList(cameraGetter, orgGetter, cameraParam) {
  let originCameraArr = [];
  if (typeof cameraGetter !== 'function' || typeof orgGetter !== 'function') return Promise.resolve();
  cameraParam = cameraParam || {};
  let subOrgsTree = [];
  const cameraPromise = new Promise((resolve) => {
    cameraGetter(cameraParam).then((res) => {
      if (res.code === 0) {
        originCameraArr = _.cloneDeep(res.data.records);
        resolve(res.data.records);
      }
    });
  });
  const orgPromise = new Promise((resolve) => {
    orgGetter().then((res) => {
      if (res.code === 0) {
        subOrgsTree = [res.data.organization].concat(res.data.shareOrg);
        resolve(subOrgsTree);
      }
    });
  });
  return new Promise((resolve) => {
    Promise.all([orgPromise, cameraPromise]).then((resolveData) => {
      const tree = createAllTree(...resolveData);
      resolve({
        tree,
        cameraList: originCameraArr,
        subOrgsTree
      });// 传回树形列表和相机列表
    });
  });
}

/**
 * 判断字符串是否是 base64
 * @param { String } str
 * @returns true/false
 */
export const isBase64 = (str) => {
  if (str === '' || str.trim() === '') { return false; }
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

/**
 * 资源定位符转base64
 * val:传入图片地址（blob或http开头都可以）
 */
export const urlToBase64 = (val) => new Promise((resolve) => {
  if (isBase64(val)) {
    resolve(val);
    return;
  }
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
export function getAlbumGroup(albumGetter, params = {}) {
  let albumData = [];
  return new Promise((resolve) => {
    if (Object.keys(params).length > 0) {
      albumGetter({ ...{ authLevel: 1, type: [2] }, ...params }).then((res) => {
        if (res.code === 0) {
          const groups = res.data;
          const tempObj = [{
            id: 0,
            label: '全部',
            flag: 'all',
            noStatistics: true,
            children: groups
          }];
          groups.forEach((item) => {
            item.flag = 'group';
            item.label = item.name;
          });
          albumData = tempObj;
        }
        resolve(albumData);
      });
    } else {
      albumGetter({ authLevel: 1, type: [2] }).then((res) => {
        if (res.code === 0) {
          const groups = res.data;
          const tempObj = {
            id: 0,
            label: '全部',
            flag: 'all',
            noStatistics: true,
            children: []
          };
          albumData = {
            faceSets: [{ ...tempObj, children: [] }],
            bodySets: [{ ...tempObj, children: [] }],
            motorSets: [{ ...tempObj, children: [] }],
            nonMotorSets: [{ ...tempObj, children: [] }],
            motorLicenseSets: [{ ...tempObj, children: [] }],
            nonMotorLicenseSets: [{ ...tempObj, children: [] }],
          };
          const setsMap = {
            '1': 'faceSets', '2': 'bodySets', '31': 'motorSets', '32': 'nonMotorSets', '41': 'motorLicenseSets', '42': 'nonMotorLicenseSets'
          };
          groups.forEach((item) => {
            item.flag = 'group';
            item.label = item.name;
            if (+item.deployObject === 1 || +item.deployObject === 2) item.carType = '';
            const key = setsMap[item.deployObject + item.carType];
            albumData[key][0].children.push(item);
          });
        }
        resolve(albumData);
      });
    }
  });
}

/**
 * 根据时间日期组件，获取组装好的startTime endTime对象格式
 * @param { Array } timeArr 时间数组
 * @returns {startTime:'', endTime: ''}
 */
export const getTimeRange = (timeArr) => {
  const time = {
    startTime: '',
    endTime: '',
  };
  // 开始时间，结束时间
  if (timeArr && timeArr.length === 2) {
    try {
      time.startTime = new Date(timeArr[0]).getTime();
      time.endTime = new Date(timeArr[1]).getTime();
    } catch (err) {
      console.log(err);
    }
  }
  return time;
};
/**
 * 格式化字典表
 * 以code为key 返回map
 * @param  { Array } arr 需要格式化的数组 必须有code和value字段
 * @param  { String } key 为key的字段
 * @param  { String } value 为value的字段
 */
export const formatMap = (arr = [], key = 'code', value = 'value') => {
  const map = {};
  arr.forEach((item) => {
    map[item[key]] = item[value] || item;
  });
  return map;
};
// roi区域切换像素
export const roiToRecognitionArea = (videoData, roiArr = []) => {
  const { width, height } = videoData;
  const recognitionArea = {
    occlusionAreas: [],
    viewports: []
  };
  roiArr.forEach((item) => {
    if (item.visible) {
      recognitionArea.viewports.push({
        heightPixels: parseInt(item.height * height) + 1,//eslint-disable-line
        widthPixels: parseInt(item.width * width) + 1, //eslint-disable-line
        topPixels: parseInt(item.top * height) - 1 < 0 ? 0 : parseInt(item.top * height) - 1,//eslint-disable-line
        leftPixels: parseInt(item.left * width) - 1 < 0 ? 0 : parseInt(item.left * width) - 1,//eslint-disable-line
      });
    } else {
      recognitionArea.occlusionAreas.push({
        heightPixels: parseInt(item.height * height) + 1,//eslint-disable-line
        widthPixels: parseInt(item.width * width) + 1, //eslint-disable-line
        topPixels: parseInt(item.top * height) - 1 < 0 ? 0 : parseInt(item.top * height) - 1,//eslint-disable-line
        leftPixels: parseInt(item.left * width) - 1 < 0 ? 0 : parseInt(item.left * width) - 1,//eslint-disable-line
      });
    }
  });
  return recognitionArea;
};
// 像素切换roi区域
export const recognitionAreaToRoi = (videoData, roiArea = {}) => {
  const { viewports, occlusionAreas } = roiArea;
  const { width, height } = videoData;
  const roiArr = [];
  if (viewports) {
    viewports.forEach((item) => {
      roiArr.push({
        height: parseFloat(item.heightPixels / height),
        width: parseFloat(item.widthPixels / width),
        left: parseFloat(item.leftPixels / width),
        top: parseFloat(item.topPixels / height),
        visible: true
      });
    });
  }
  if (occlusionAreas) {
    occlusionAreas.forEach((item) => {
      roiArr.push({
        height: parseFloat(item.heightPixels / height),
        width: parseFloat(item.widthPixels / width),
        left: parseFloat(item.leftPixels / width),
        top: parseFloat(item.topPixels / height),
        visible: false
      });
    });
  }
  return roiArr;
};
// 轨迹追踪和目标分析轨迹分析将数组拍平
export const flatten = (arr) => {
  const results = [];
  for (let i = 0; i < arr.length; i += 1) {
    const {
      listResults, displayCount, count, proportion
    } = arr[i];
    for (let j = 0; j < listResults.length; j += 1) {
      if (listResults[j].latitude && listResults[j].longitude) {
        results.push({
          ...listResults[j], displayCount, count, proportion
        });
      }
    }
  }
  return results;
};

export const trim = (str) => str.replace(/(^\s*)|(\s*$)/g, '');

export const getLastNDays = (n) => {
  let time = [+moment().subtract(n - 1, 'day').startOf('day').toDate(), +moment().endOf('day').toDate()];
  if (n === 1) time = [+moment().startOf('day').toDate(), +moment().endOf('day').toDate()];
  return time;
};

const utils = {
  getCamerasList,
  getDateValue,
  getHour,
  restoreHour,
  getAlbumGroup,
  compareArr,
  createAllTree,
  formatMap,
  roiToRecognitionArea,
  recognitionAreaToRoi,
  flatten,
  trim
};

const install = function (Vue) {
  if (install.installed) return;
  Vue.prototype.$vsrUtils = utils;
};

export default {
  install
};
