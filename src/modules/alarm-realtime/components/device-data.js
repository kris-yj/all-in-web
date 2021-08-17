// import mockDeviceData from '../../../mock/device';
import alarmRealtimeSrv from '../alarm-realtime.service';

let deviceTree = [];
let deviceList = [];
let deviceTreeResolving = false;
let deviceTreeResolved = false;
let deviceListResolved = false;
let customSettingResolving = false;
let customSettingResolved = false;
let normalDeviceNum = 0;
let totalDeviceNum = 0;
let deviceListRequest = null;

// 设备树resolve队列
const deviceTreeWaitResolveArray = [];
// 设备列表resolver队列
const deviceListWaitResolverArray = [];
// 自定义设置resolver队列
const customSettingWaitResolverArray = [];

// 同步服务器缓存数据
let customCache = {
  map: [],
  videos: [],
  checkPoints: [],
  struct: []
};
// 记录节点详情
const customSetting = {
  map: [],
  videos: [],
  checkPoints: [],
  struct: []
};
// 设置变更回调方法集合
const customChangeCbSet = new Set();

// 过滤设备信息，保证权限
const filterDevice = () => {
  deviceList.forEach((item) => {
    ['map', 'videos', 'checkPoints', 'struct'].forEach((key) => {
      const index = customCache[key].indexOf(item.id);
      if (index >= 0) customSetting[key][index] = item;
    });
  });
};

/**
 * 获取设备树
 */
export async function getStructDeviceTree() {
  const res = await alarmRealtimeSrv.getStructCameraList();
  if (res.code !== 0) return [];
  return res.data;
}

/**
 * 获取设备树
 */
export async function getDeviceTree() {
  // 数据已经完备则直接返回数据
  if (deviceTreeResolved) return deviceTree;
  if (deviceTreeResolving) {
    return new Promise((resolve) => {
      deviceTreeWaitResolveArray.push(resolve);
    });
  }
  // 数据获取状态
  deviceTreeResolving = true;
  deviceListRequest = alarmRealtimeSrv.getCameraListByDepartment({ needLocal: false });
  try {
    const res = await deviceListRequest;
    deviceListRequest = null;
    if (res.code !== 0) return [];
    deviceTreeResolved = true;
    deviceTree = res.data;
    while (deviceTreeWaitResolveArray.length) {
      const resolve = deviceTreeWaitResolveArray.pop();
      resolve(deviceTree);
    }
    return deviceTree;
  } catch (err) {
    if (err.isCancel) console.log('device data req cancel');
    return [];
  }
}

/**
 * 同步设备列表
 * @param {*} list
 */
export function syncDeviceList(list) {
  // 如果数据完备，则不再重新赋值和计算
  if (deviceListResolved) return [totalDeviceNum, normalDeviceNum];

  // 赋值设备列表
  deviceList = list;

  totalDeviceNum = deviceList.filter((item) => item.flag === 'camera').length || 0;
  normalDeviceNum = deviceList.filter((item) => item.flag === 'camera' && item.status.toString() === '0').length || 0;

  deviceListResolved = true;

  while (deviceListWaitResolverArray.length) {
    const resolve = deviceListWaitResolverArray.pop();
    resolve(deviceList);
  }

  return [totalDeviceNum, normalDeviceNum];
}

/**
 * 获取设备列表
 */
export async function getDeviceList() {
  // 如果数据完备，则直接返回
  if (deviceListResolved) return deviceList;

  return new Promise((resolve) => {
    deviceListWaitResolverArray.push(resolve);
  });
}

async function requestCustomSetting() {
  if (customSettingResolved) return (customSetting);
  // 等待设备列表获取
  await getDeviceList();

  if (customSettingResolving) {
    return new Promise((resolve) => {
      customSettingWaitResolverArray.push(resolve);
    });
  }
  customSettingResolving = true;
  const ret = await alarmRealtimeSrv.getCustomSelectSetting();
  if (ret.code === 0) {
    try {
      customCache = JSON.parse(ret.data.config);
      filterDevice();
      customSettingResolved = true;
    } catch (err) {
      console.warn('alarm-realtime device-data customSetting parse err: ', err.message);
    }
  } else {
    console.warn('alarm-realtime device-data customSetting request err: ', ret.message);
  }

  while (customSettingWaitResolverArray.length) {
    const resolve = customSettingWaitResolverArray.pop();
    resolve(customSetting);
  }

  return customSetting;
}

/**
 * 获取用户设置选项
 * @param {*} type
 */
export async function getCustomSetting(type) {
  const setting = await requestCustomSetting();
  return setting[type];
}

/**
 * 设置用户默认选项
 * @param {*} type
 * @param {*} index
 * @param {*} value
 */
export async function setCustomSetting(type, index, value = {}) {
  customChangeCbSet.forEach((cb) => {
    cb(type, index, value, customSetting[type][index]);
  });
  customCache[type][index] = value.id || '';
  customSetting[type][index] = value;
  const ret = await alarmRealtimeSrv.setCustomSelectSetting({
    config: JSON.stringify(customCache)
  });
  return ret.code === 0;
}

/**
 * 监听用户设置变化
 * @param {*} customChangeCb
 */
export function onCustomSettingChange(customChangeCb) {
  if (customChangeCb && typeof customChangeCb === 'function') customChangeCbSet.add(customChangeCb);
}

/**
 * 卸载用户设置监听
 * @param {*} customChangeCb
 */
export function offCustomSettingChange(customChangeCb) {
  customChangeCbSet.delete(customChangeCb);
}

/**
 * 销毁
 */
export function clearDeviceData() {
  deviceTree = [];
  deviceList = [];
  deviceTreeResolving = false;
  deviceTreeResolved = false;
  deviceListResolved = false;
  customSettingResolving = false;
  customSettingResolved = false;
  customChangeCbSet.clear();

  if (deviceListRequest) deviceListRequest.cancel('clear device data');

  // 清理所有未处理的promise
  // console.log(deviceTreeWaitResolveArray.length);
  while (deviceTreeWaitResolveArray.length) {
    const resolve = deviceTreeWaitResolveArray.pop();
    resolve();
  }

  // console.log(deviceListWaitResolverArray.length);
  while (deviceListWaitResolverArray.length) {
    const resolve = deviceListWaitResolverArray.pop();
    resolve();
  }

  // console.log(customSettingWaitResolverArray.length);
  while (customSettingWaitResolverArray.length) {
    const resolve = customSettingWaitResolverArray.pop();
    resolve();
  }
}
