import { i18n } from '@/utils/i18n.utils';
import { formatTime } from './utils';
import fullImageEmpty from './image/full-image-empty.svg';
import crowdPerson from './image/crowd-person-full.png';

const getCommonInfo = (data, map = {}) => {
  const {
    capturedTime,
    camera = {},
    album = {},
    strategies = [],
    alarmNo,
    strategyTypeName,
    resultStatus = '',
    captureId = '',
    right = '',
    level = '',
    fullUri = '',
    cascadeName = '',
    grabCount = '',
    processStatus,
    policeTime = '',
    receiveTime = '',
    receiveUser = '',
    designateTime = '',
    policeUser = '',
    reportTime = '',
    reportUser = '',
    reportContent = '',
    strategyCategory,
    fileName = '',
    alarmType = '',

    ext = {},
    strategyTypeId, // 给携图跳转用
    bizProperties = {}, // 这里比较特殊，除了人脸报警之外，其他都需要这个
  } = data;
  const fullParams = {
    genre: 3,
    source: 0,
    photo: fullUri,
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
    cameraId: camera.id || '',
    alarmType
  };
  return {
    // 画框信息
    // rectValueToNumber,
    // 全景图信息
    isShowFaceReact: fullUri !== '',
    fullUrl: fullUri || fullImageEmpty,
    fullParams,
    alarmType,
    srcType: album.srcType,
    // 报警信息
    alarmLevel: map.realtimeLevelMap[level],
    alarmColor: map.alarmLevelColorMap[level],
    alarmTime: formatTime(capturedTime),
    alarmNo,
    strategyTypeName,
    captureId, // 这个给加入底库使用的字段
    strategyTypeId, // 携图跳转用

    // 位置信息
    cameraLabel: strategyCategory === 3 ? i18n.t('文件') : i18n.t('相机'),
    cameraName: strategyCategory === 3 ? fileName : camera.name,
    placeName: camera.placeName,
    unitName: camera.unitName,
    cascadeName,

    // 业务信息
    strategies,
    strategyName: strategies[0] ? strategies[0].strategyName : '',
    deployTime: strategies[0] ? formatTime(strategies[0].createTime) : '',
    status: map.alarmProcessStatusMap[processStatus],
    processStatus,
    resultStatus,
    grabCount,
    realText: map.realTruthMap[right],
    right,
    alarmResult: map.realtimeResultMap[resultStatus],
    countName: map.countTypeMap[resultStatus],

    // 处理详情
    receiveTime,
    formatReceiveTime: formatTime(receiveTime),
    receiveUser,
    designateTime,
    formatDesignateTime: formatTime(designateTime),
    policeTime,
    formatPoliceTime: formatTime(policeTime),
    policeUser,
    reportTime,
    formatReportTime: formatTime(reportTime),
    reportUser,
    reportContent,
    completedUser: ext.completedUser ? ext.completedUser : '',
    completedTime: ext.completedTime ? formatTime(ext.completedTime) : '',

    // 属性信息
    properties: bizProperties,
    cameraTypeName: map.cameraTypeMap[camera.type],
    lon: Number(camera.lon),
    lat: Number(camera.lat),
  };
};
/**
 * @description 处理人脸识别布控报警
 * @param {any}
 * @returns
 */
const faceProcessor = (data, map = {}) => {
  const {
    photo,
    album,
    bizScore,
    camera = {},
    strategyCategory,
    albumPhotoUri,
    cropUri,
    alarmType,
    relationUri,
    identityType = '',
    identityCard = '',
    cascadeId = '',
    cascadeName = '',
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    detectType,
    capturedTime,
  } = data;

  const obj = {
    leftTopRight: 'PersonBox', // PersonBox CarBox PlateBox
    leftTop: 'ThreeImage', // TwoImage OneImage ThreeImage
    showTrack: true,
    leftImgSrc: cropUri,
    leftImgSrcBody: relationUri,
    rightImgSrc: albumPhotoUri,
    score: bizScore,
    single: false,
    platformType: album.platformType,
    // 底库详情部分
    tabGroup: [1, 3, 4], // 1 , 2 , 3 ,4
    alarmInfoComponent: 'AlarmInfo',
    albumPhotoName: photo.name,
    criminalNumber: photo.criminalNumber,
    cardTypeName: map.cardTypeMap[identityType],
    identityType,
    cardNo: identityCard,
    cascadeId,
    cascadeName,
    albumName: album.name,
    nationName: map.nationMap[photo.nation.code],
    genderName: map.genderMap[photo.gender],
    photoBirthday: photo.birthday,
    addrName: map.originMap[photo.addr.code],
    photoRemark: photo.cmnt,
    monitorReason: photo.monitorReason,
    albumContact: photo.contact,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    alarmTimes: realAlarmTimes + historyAlarmTimes + offlineAlarmTimes,
    currentMoveStatus: 999,

    cardInfo: [],
    detectType,

    // 携图跳转相关参数配置
    photoId: photo.photoId,
    albumId: album.albumId,
  };

  const commonInfo = getCommonInfo(data, map);

  let rectValueToNumber = {};
  if (data.captureLocator && data.captureLocator.fullLocator) {
    const {
      heightPixels = '',
      leftPixels = '',
      topPixels = '',
      widthPixels = ''
    } = data.captureLocator.fullLocator;
    rectValueToNumber = {
      'heightPixels': Number(heightPixels),
      'leftPixels': Number(leftPixels),
      'topPixels': Number(topPixels),
      'widthPixels': Number(widthPixels)
    };
  }

  const faceParams = {
    type: [0],
    genre: 0,
    source: 0,
    photo: cropUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  const bodyParams = {
    type: [1],
    genre: 2,
    source: 0,
    photo: relationUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  const albumParams = {
    type: [0],
    genre: 0,
    source: 0,
    platformType: album.platformType,
    alarmType,
    photo: albumPhotoUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  return {
    ...commonInfo,
    rectValueToNumber,
    albumParams,
    bodyParams,
    faceParams,
    ...obj
  };
};

/**
 * @description 处理人体识别布控报警
 * @param {any}
 * @returns
 */
const bodyProcessor = (data, map = {}) => {
  const {
    photo,
    album,
    camera = {},
    strategyCategory,
    bizScore,
    capturedTime,
    albumPhotoUri,
    cropUri,
    relationUri = '',
    identityType = '',
    identityCard = '',
    cascadeId = '',
    alarmType = '',
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    detectType,
  } = data;

  const obj = {
    leftTopRight: 'PersonBox', // PersonBox CarBox PlateBox
    leftTop: 'ThreeImage', // TwoImage OneImage ThreeImage
    showTrack: true,

    leftImgSrc: relationUri,
    leftImgSrcBody: cropUri,
    rightImgSrc: albumPhotoUri,
    score: bizScore,
    single: false,

    // 底库详情部分
    tabGroup: [1, 2, 3], // 1 , 2 , 3 ,4
    alarmInfoComponent: 'AlarmInfo',
    albumPhotoName: photo.name,
    criminalNumber: photo.criminalNumber,
    cardTypeName: map.cardTypeMap[identityType],
    identityType,
    cardNo: identityCard,
    cascadeId,
    albumName: album.name,
    nationName: map.nationMap[photo.nation.code],
    genderName: map.genderMap[photo.gender],
    photoBirthday: photo.birthday,
    addrName: map.originMap[photo.addr.code],
    photoRemark: photo.cmnt,
    monitorReason: photo.monitorReason,
    albumContact: photo.contact,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    alarmTimes: realAlarmTimes + historyAlarmTimes + offlineAlarmTimes,
    currentMoveStatus: 999,

    detectType,

    // 携图跳转相关参数配置
    photoId: photo.photoId,
    albumId: album.albumId,
  };
  const commonInfo = getCommonInfo(data, map);
  let rectValueToNumber = {};
  if (data.captureLocator && data.captureLocator.fullLocator) {
    const {
      heightPixels = '',
      leftPixels = '',
      topPixels = '',
      widthPixels = ''
    } = data.captureLocator.fullLocator;
    rectValueToNumber = {
      'heightPixels': Number(heightPixels),
      'leftPixels': Number(leftPixels),
      'topPixels': Number(topPixels),
      'widthPixels': Number(widthPixels)
    };
  }

  const faceParams = {
    type: [0],
    genre: 0,
    source: 0,
    photo: relationUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  const bodyParams = {
    type: [1],
    genre: 2,
    source: 0,
    photo: cropUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  const albumParams = {
    type: [1],
    genre: 0,
    source: 0,
    photo: albumPhotoUri,
    alarmType,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };

  return {
    ...commonInfo,
    albumParams,
    bodyParams,
    faceParams,
    rectValueToNumber,
    ...obj
  };
};
/**
 * @description 处理机动车、非机动车识别布控报警
 * @param {any}
 * @returns
 */
const carProcessor = (data, map = {}) => {
  const {
    photo,
    album,
    bizScore,
    camera = {},
    strategyCategory,
    albumPhotoUri,
    cropUri,
    alarmType,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    capturedTime,
    detectType,
  } = data;

  const obj = {
    leftTopRight: 'CarBox', // PersonBox CarBox PlateBox
    leftTop: 'ThreeImage', // TwoImage OneImage ThreeImage

    leftImgSrc: cropUri,
    rightImgSrc: albumPhotoUri,
    score: bizScore,
    single: false,

    // 底库详情部分
    tabGroup: [1, 2, 3], // 1 , 2 , 3 ,4
    alarmInfoComponent: 'AlarmInfoSimple',
    albumName: album.name,
    carNo: photo.carNo,
    photoRemark: photo.cmnt,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    alarmTimes: realAlarmTimes + historyAlarmTimes + offlineAlarmTimes,
    currentMoveStatus: 999,

    detectType,

    // 携图跳转相关参数配置
    photoId: photo.photoId,
    albumId: album.albumId,
  };
  const commonInfo = getCommonInfo(data, map);
  let rectValueToNumber = {};
  if (data.captureLocator && data.captureLocator.fullLocator) {
    const {
      heightPixels = '',
      leftPixels = '',
      topPixels = '',
      widthPixels = ''
    } = data.captureLocator.fullLocator;
    rectValueToNumber = {
      'heightPixels': Number(heightPixels),
      'leftPixels': Number(leftPixels),
      'topPixels': Number(topPixels),
      'widthPixels': Number(widthPixels)
    };
  }

  const albumParams = {
    type: [detectType],
    genre: 0,
    source: 0,
    alarmType,
    photo: albumPhotoUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  const carParams = {
    type: [detectType],
    genre: 0,
    source: 0,
    photo: cropUri,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  return {
    ...commonInfo,
    rectValueToNumber,
    albumParams,
    carParams,
    ...obj
  };
};
/**
 * @description 处理机动车车牌识别布控报警
 * @param {any}
 * @returns
 */
const carPlateProcessor = (data, map = {}) => {
  const {
    photo,
    album,
    bizScore,
    alarmType,
    cropUri,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    detectType,
    captureId,
    camera = {},
    strategyCategory,
    capturedTime,
    bizProperties,
  } = data;

  const obj = {
    leftTopRight: 'PlateBox', // PersonBox CarBox PlateBox
    leftTop: 'ThreeImage', // TwoImage OneImage ThreeImage

    leftImgSrc: cropUri,
    rightImgSrc: '',
    score: bizScore,
    single: false,

    rightCustom: {
      plateNumber: bizProperties.license_plate_text.showValue,
      plateType: bizProperties.license_plate_color.showValue,
      row: bizProperties.license_plate_style.showValue,
      size: 'small'
    },

    // 底库详情部分
    tabGroup: [1, 2, 3], // 1 , 2 , 3 ,4
    alarmInfoComponent: 'AlarmInfoSimple',
    albumName: album.name,
    carNo: photo.carNo,
    photoRemark: photo.cmnt,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    alarmTimes: realAlarmTimes + historyAlarmTimes + offlineAlarmTimes,
    currentMoveStatus: 999,

    detectType,

    // 携图跳转相关参数配置
    photoId: photo.photoId,
    albumId: album.albumId,
  };
  const commonInfo = getCommonInfo(data, map);
  let rectValueToNumber = {};
  if (data.captureLocator && data.captureLocator.fullLocator) {
    const {
      heightPixels = '',
      leftPixels = '',
      topPixels = '',
      widthPixels = ''
    } = data.captureLocator.fullLocator;
    rectValueToNumber = {
      'heightPixels': Number(heightPixels),
      'leftPixels': Number(leftPixels),
      'topPixels': Number(topPixels),
      'widthPixels': Number(widthPixels)
    };
  }

  const plateParams = {
    type: [detectType],
    genre: 0,
    source: 0,
    photo: cropUri,
    alarmType,
    id: captureId,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  return {
    ...commonInfo,
    plateParams,
    rectValueToNumber,
    ...obj
  };
};
/**
 * @description 处理非机动车车牌识别布控报警
 * @param {any}
 * @returns
 */
const noCarPlateProcessor = (data, map = {}) => {
  const {
    photo,
    album,
    bizScore,
    cropUri,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    detectType,
    captureId,
    camera = {},
    alarmType = '',
    strategyCategory,
    capturedTime,
    bizProperties,
  } = data;

  const obj = {
    leftTopRight: 'PlateBox', // PersonBox CarBox PlateBox
    leftTop: 'ThreeImage', // TwoImage OneImage ThreeImage

    leftImgSrc: cropUri,
    rightImgSrc: '',
    score: bizScore,
    single: false,

    rightCustom: {
      plateNumber: bizProperties.license_plate_text.showValue,
      plateType: '',
      row: '',
      size: { 'font-size': '18px' }
    },

    // 底库详情部分
    tabGroup: [1, 2, 3], // 1 , 2 , 3 ,4
    alarmInfoComponent: 'AlarmInfoSimple',
    albumName: album.name,
    carNo: photo.carNo,
    photoRemark: photo.cmnt,
    realAlarmTimes,
    historyAlarmTimes,
    offlineAlarmTimes,
    alarmTimes: realAlarmTimes + historyAlarmTimes + offlineAlarmTimes,
    currentMoveStatus: 999,

    detectType,

    // 携图跳转相关参数配置
    photoId: photo.photoId,
    albumId: album.albumId,
  };
  const commonInfo = getCommonInfo(data, map);
  let rectValueToNumber = {};
  if (data.captureLocator && data.captureLocator.fullLocator) {
    const {
      heightPixels = '',
      leftPixels = '',
      topPixels = '',
      widthPixels = ''
    } = data.captureLocator.fullLocator;
    rectValueToNumber = {
      'heightPixels': Number(heightPixels),
      'leftPixels': Number(leftPixels),
      'topPixels': Number(topPixels),
      'widthPixels': Number(widthPixels)
    };
  }

  const plateParams = {
    type: [detectType],
    genre: 0,
    source: 0,
    photo: cropUri,
    id: captureId,
    alarmType,
    cameraId: camera.id || '',
    capturedTime: strategyCategory === 3 ? '' : capturedTime,
  };
  return {
    ...commonInfo,
    plateParams,
    rectValueToNumber,
    ...obj
  };
};
/**
 * @description 处理人群聚集报警布控报警
 * @param {any}
 * @returns
 */
const throngProcessor = (data, map = {}) => {
  const {
    detectType,
    bodyCrowdCount,
    bodyCrowdEndTime,
    bodyCrowdStartTime,
    fullUri = '',
  } = data;

  const obj = {
    leftTop: 'OneImage', // TwoImage OneImage ThreeImage
    infoNarrow: true, // 控制information 组件 左侧宽度
    tabGroup: [2, 3], // 1 , 2 , 3 ,4
    nowProperties: [
      {
        name: i18n.t('聚集人数'),
        value: `${bodyCrowdCount}${i18n.t('人')}`,
      },
      {
        name: i18n.t('聚集时间'),
        value: `${Math.floor((bodyCrowdEndTime - bodyCrowdStartTime) / (60 * 1000))}${i18n.t('分钟')}`,
      },
    ],
    fullUrl: fullUri || crowdPerson,
    detectType,
  };
  const commonInfo = getCommonInfo(data, map);
  return {
    ...commonInfo,
    rectValueToNumber: {},
    ...obj
  };
};
/**
 * @description 处理普通检测报警布控报警
 * @param {any}
 * @returns
 */
const detectionProcessor = (data, map = {}) => {
  const {
    cropUri,
    detectType,
    captureId,
    alarmType,
    camera,
    capturedTime,
  } = data;

  const obj = {
    leftTop: 'TwoImage', // TwoImage OneImage ThreeImage
    leftImgSrc: cropUri,
    infoNarrow: true, // 控制information 组件 左侧宽度
    // 底库详情部分
    tabGroup: [2, 3], // 1 , 2 , 3 ,4
    alarmType,
    detectType,
  };
  let rectValueToNumber = {};
  if (data.captureLocator && data.captureLocator.fullLocator) {
    const {
      heightPixels = '',
      leftPixels = '',
      topPixels = '',
      widthPixels = ''
    } = data.captureLocator.fullLocator;
    rectValueToNumber = {
      'heightPixels': Number(heightPixels),
      'leftPixels': Number(leftPixels),
      'topPixels': Number(topPixels),
      'widthPixels': Number(widthPixels)
    };
  }

  const commonInfo = getCommonInfo(data, map);
  const captureParams = {
    genre: 0,
    source: 0,
    photo: cropUri,
    id: captureId,
    cameraId: camera.id || '',
    capturedTime,
    alarmType,
    type: [detectType]
  };
  return {
    ...commonInfo,
    captureParams,
    alarmType,
    rectValueToNumber,
    ...obj
  };
};
/**
 * @description 处理数据合计
 * @param {object} data 详情数据
 * @param {object} maps 各种字典表的map 集合
 * @returns
 */
const getProcessorResult = (data, map = {}) => {
  switch (Number(data.strategyTypeId)) {
    case 1:
      return faceProcessor(data, map);
    case 2:
      return bodyProcessor(data, map);
    case 3:
    case 4:
      return carProcessor(data, map);
    case 5:
      return carPlateProcessor(data, map);
    case 6:
      return noCarPlateProcessor(data, map);
    case 9:
      return throngProcessor(data, map);
    default:
      return detectionProcessor(data, map);
  }
};

export default getProcessorResult;
