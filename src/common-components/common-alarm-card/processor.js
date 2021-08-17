import moment from 'moment';
import { getCameraIconName } from './utils';
import crowdPerson from './image/crowd-person.png';
import loadingGif from './image/warn-loading.gif';
/**
 * @description 全量标准数据
 */
// const normalData = {
//   leftImgSrc: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3368116715,626266633&fm=26&gp=0.jpg', // 左侧图片
//   single: false, // 是否单图
//   status: '已确s认', // 右上角状态
//   : 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3368116715,626266633&fm=26&gp=0.jpg', // 右侧图片
//   rightCustom: {
//     component: 'RightCustom',
//     plateType: 'small-new-energy',
//     plateNumber: '京A000125'
//   }, // 需要右侧的slot要填写这个
//   score: 44, // 比分
//   headerLeft: {
//     component: 'Tip',
//     color: 'red',
//     value: '本地布控库',
//     icon: 'folder',
//   }, // header左侧的填写
//   footLeftTop: {
//     component: 'Camera',
//     value: '测试用相机',
//     icon: 'camera_normal'
//   }, //footer 左侧上部
//   footLeftBottom: {
//     component: 'Normal',
//     value: 'camera',
//   },//footer 左侧下部
//   footRightTop: {
//     component: 'Normal',
//     value: moment(1591102478011).format('YYYY-MM-DD HH:mm:ss'),
//   },//footer 右侧上部
//   footRightBottom: {
//     component: 'Normal',
//     value: 'camera',
//   }, //footer 右侧下部
// };

/**
 * @description 人脸报警 卡片数据处理
 * @param {object} data 卡片数据
 * @param {object} alarmLevelColorMap 报警等级颜色map
 * @param {object} alarmProcessStatusMap 报警状态map
 * @returns {object} 处理完成的数据
 */

const faceProcessor = (data, alarmLevelColorMap, alarmProcessStatusMap) => {
  const {
    processStatus,
    albumPhotoUri,
    cropUri,
    bizScore,
    album,
    capturedTime,
    identityCard = '',
    photo,
    camera = {},
    level,
    fileName = '',
    strategyCategory,
  } = data;
  return {
    leftImgSrc: cropUri,
    single: false,
    status: alarmProcessStatusMap[processStatus],
    rightImgSrc: albumPhotoUri === 'loading' ? loadingGif : albumPhotoUri,
    score: bizScore,
    headerLeft: {
      component: 'Tip',
      color: alarmLevelColorMap[level],
      value: album.name,
      icon: 'folder'
    },
    footLeftTop: {
      component: 'Camera',
      value: strategyCategory === 3 ? fileName : camera.name,
      icon: strategyCategory === 3 ? '' : getCameraIconName(camera.type)
    },
    footLeftBottom: {
      component: 'Normal',
      value: moment(capturedTime).format('YYYY-MM-DD HH:mm:ss'),
    },
    footRightTop: {
      component: 'Normal',
      value: photo.name,
    },
    footRightBottom: {
      component: 'Normal',
      value: identityCard,
    },
  };
};

/**
 * @description 人体报警、 机动车报警、 非机动车报警 卡片数据处理
 * @param {object} data 卡片数据
 * @param {object} alarmLevelColorMap 报警等级颜色map
 * @param {object} alarmProcessStatusMap 报警状态map
 * @returns {object} 处理完成的数据
 */
const bodyAndCarProcessor = (data, alarmLevelColorMap, alarmProcessStatusMap) => {
  const {
    processStatus,
    albumPhotoUri,
    cropUri,
    bizScore,
    album,
    capturedTime,
    camera,
    level,
    strategyCategory,
    fileName = '',
  } = data;
  return {
    leftImgSrc: cropUri,
    single: false,
    status: alarmProcessStatusMap[processStatus],
    rightImgSrc: albumPhotoUri === 'loading' ? loadingGif : albumPhotoUri,
    score: bizScore,
    headerLeft: {
      component: 'Tip',
      color: alarmLevelColorMap[level],
      value: album.name,
      icon: 'folder'
    },
    footLeftTop: {
      component: 'Camera',
      value: strategyCategory === 3 ? fileName : camera.name,
      icon: strategyCategory === 3 ? '' : getCameraIconName(camera.type)
    },
    footRightTop: {
      component: 'Normal',
      value: moment(capturedTime).format('YYYY-MM-DD HH:mm:ss'),
    },
  };
};

/**
 * @description 机动车车牌报警车牌报警 卡片数据处理
 * @param {object} data 卡片数据
 * @param {object} alarmLevelColorMap 报警等级颜色map
 * @param {object} alarmProcessStatusMap 报警状态map
 * @returns {object} 处理完成的数据
 */

const plateProcessor = (data, alarmLevelColorMap, alarmProcessStatusMap) => {
  const {
    processStatus,
    cropUri,
    album,
    capturedTime,
    camera,
    level,
    bizProperties,
    strategyCategory,
    fileName = '',
  } = data;
  return {
    leftImgSrc: cropUri,
    single: false,
    status: alarmProcessStatusMap[processStatus],
    rightImgSrc: '',
    score: '',
    rightCustom: {
      component: 'RightCustom',
      plateNumber: bizProperties.license_plate_text.showValue,
      plateType: bizProperties.license_plate_color.showValue,
      row: bizProperties.license_plate_style.showValue,
      size: 'small'
    },
    headerLeft: {
      component: 'Tip',
      color: alarmLevelColorMap[level],
      value: album.name,
      icon: 'folder'
    },
    footLeftTop: {
      component: 'Camera',
      value: strategyCategory === 3 ? fileName : camera.name,
      icon: strategyCategory === 3 ? '' : getCameraIconName(camera.type)
    },
    footRightTop: {
      component: 'Normal',
      value: moment(capturedTime).format('YYYY-MM-DD HH:mm:ss'),
    },
  };
};
/**
 * @description 非机动车车牌报警 卡片数据处理
 * @param {object} data 卡片数据
 * @param {object} alarmLevelColorMap 报警等级颜色map
 * @param {object} alarmProcessStatusMap 报警状态map
 * @returns {object} 处理完成的数据
 */

const noCarPlateProcessor = (data, alarmLevelColorMap, alarmProcessStatusMap) => {
  const {
    processStatus,
    cropUri,
    album,
    capturedTime,
    camera,
    level,
    bizProperties,
    strategyCategory,
    fileName = '',
  } = data;
  return {
    leftImgSrc: cropUri,
    single: false,
    status: alarmProcessStatusMap[processStatus],
    rightImgSrc: '',
    score: '',
    rightCustom: {
      component: 'RightCustom',
      plateNumber: bizProperties.license_plate_text.showValue,
      plateType: '',
      row: '',
      size: 'small'
    },
    headerLeft: {
      component: 'Tip',
      color: alarmLevelColorMap[level],
      value: album.name,
      icon: 'folder'
    },
    footLeftTop: {
      component: 'Camera',
      value: strategyCategory === 3 ? fileName : camera.name,
      icon: strategyCategory === 3 ? '' : getCameraIconName(camera.type)
    },
    footRightTop: {
      component: 'Normal',
      value: moment(capturedTime).format('YYYY-MM-DD HH:mm:ss'),
    },
  };
};

/**
 * @description 检测报警及自定义报警 卡片数据处理
 * @param {object} data 卡片数据
 * @param {object} alarmLevelColorMap 报警等级颜色map
 * @param {object} alarmProcessStatusMap 报警状态map
 * @returns {object} 处理完成的数据
 */

const commonProcessor = (data, alarmLevelColorMap, alarmProcessStatusMap) => {
  const {
    processStatus,
    capturedTime,
    camera = {},
    cropUri,
    level,
  } = data;
  return {
    leftImgSrc: cropUri || crowdPerson,
    single: true,
    status: alarmProcessStatusMap[processStatus],
    headerLeft: {
      component: 'Tip',
      value: data.strategyTypeName,
      icon: 'info',
      color: alarmLevelColorMap[level]
    },
    footLeftTop: {
      component: 'Camera',
      value: camera.name,
      icon: getCameraIconName(camera.type)
    },
    footRightTop: {
      component: 'Normal',
      value: moment(capturedTime).format('YYYY-MM-DD HH:mm:ss'),
    },
  };
};

/**
 * @description 卡片数据处理 根据类型分类处理
 * @param {object} data 卡片数据
 * @param {object} alarmLevelColorMap 报警等级颜色map
 * @param {object} alarmProcessStatusMap 报警状态map
 * @returns {object} 处理完成的数据
 */

const getProcessorResult = (data, alarmLevelColorMap, alarmProcessStatusMap) => {
  switch (Number(data.strategyTypeId)) {
    case 1:
      return faceProcessor(data, alarmLevelColorMap, alarmProcessStatusMap);
    case 2:
    case 3:
    case 4:
      return bodyAndCarProcessor(data, alarmLevelColorMap, alarmProcessStatusMap);
    case 5:
      return plateProcessor(data, alarmLevelColorMap, alarmProcessStatusMap);
    case 6:
      return noCarPlateProcessor(data, alarmLevelColorMap, alarmProcessStatusMap);
    default:
      return commonProcessor(data, alarmLevelColorMap, alarmProcessStatusMap);
  }
};

export default getProcessorResult;
