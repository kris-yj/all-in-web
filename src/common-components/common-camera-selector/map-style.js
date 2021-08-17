/* eslint-disable camelcase */
import { createUniversalStyle, createSvgIconStyle, createTextStyle } from '@megvii-gis/core-api/lib/Style';

// -------------通用样式--------------------
const UNIVERSAL_STYLE = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 11,
    backgroundColor: '#3A99F1',
  },
  backgroundColor: 'rgba(58,153,241,0.2)',
  borderColor: '#3A99F1',
  borderWidth: 2,
});

export function universalStyleFn() {
  return UNIVERSAL_STYLE;
}

// -------------定位点标注------------------
const createLocationSvg = (width, height, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 30 40"><path fill="none" d="M2.19 22.5A14.67 14.67 0 010 14.81V40h15a1.24 1.24 0 01-1-.56zM15 0H0v14.81A14.92 14.92 0 0115 0zM16 39.44a1.24 1.24 0 01-1 .56h15V14.81a14.64 14.64 0 01-2.16 7.65zM15 0a14.92 14.92 0 0115 14.81V0z"/><path d="M15 0A14.92 14.92 0 000 14.81a14.67 14.67 0 002.19 7.7L14 39.44a1.23 1.23 0 002.07 0l11.81-17A14.64 14.64 0 0030 14.81 14.92 14.92 0 0015 0z" fill="${color}"/><ellipse cx="15" cy="15.38" rx="7.5" ry="7.69" fill="#fff"/></svg>`;
const LOCATION_STYLE = createSvgIconStyle({
  svg: createLocationSvg(30, 40, '#f05353'),
  size: [30, 40],
});
export function locationStyleFn() {
  return LOCATION_STYLE;
}

// --------------设备标注点-------------------
const DEVICE_WIDTH = 28;
const DEVICE_HEIGHT = 28;
const DEVICE_COLOR = '#46a653';
const DEVICE_WARNIN_COLOR = '#EE6723';
const DEVICE_OFF_COLOR = '#999999';
const DEVICE_ACTIVE_COLOR = '#46a653';
const DEVICE_BR_COLOR = '#ffffff';
const createImageDeviceNormalSvg = (width, height, color, bg, br) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 72 72"><path d="M14.7,33c-1.1-2.8-1.7-5.8-1.7-8.8C12.9,11.4,23.1,1.1,35.8,1S58.9,11.1,59,23.9c0.4,3.5-0.7,7.9-3.2,13.4 C52.6,42.5,46,52.5,36,67.2c-9.9-14.6-16.4-24.6-19.5-29.9C15.8,35.8,15.2,34.3,14.7,33z" fill="${bg}"/><path d="M54.9,36.9C51.8,42,45.5,51.6,36,65.4c-9.4-13.9-15.7-23.5-18.6-28.6c-0.7-1.5-1.3-2.9-1.8-4.2 C12.1,24.4,14,15,20.2,8.7c6.2-6.3,15.7-8.2,23.9-4.9s13.6,11.3,13.7,20.2V24C58.3,27.3,57.3,31.6,54.9,36.9z M60,23.8 C59.9,10.6,49.1-0.1,35.8,0C22.6,0.1,11.9,10.9,12,24.1c0,3.1,0.6,6.2,1.8,9.1c0.5,1.5,1.2,3,1.9,4.4c2.9,5.1,9.2,14.7,18.5,28.4 c-8,0.2-14.1,1.4-14.1,3c0,1.6,7.2,3,16,3s16-1.3,16-3c0-1.5-6.2-2.8-14.1-3c9.4-13.8,15.8-23.3,18.8-28.4l0.1-0.1 C59.3,32.2,60.4,27.6,60,23.8z" fill="${br}"/><path d="M46.7,34c1.1,0,2.1-0.9,2.1-2.1c0-1.1-0.9-2.1-2.1-2.1c-1.1,0-2,0.9-2,2.1c0,0.5,0.2,1.1,0.6,1.5 C45.7,33.8,46.2,34,46.7,34z M48.7,39.1L48.7,39.1l0.1-2.3l-2.5-2.3l-2.5,2.3L39.5,33l-2.5,2.3v3.8H48.7z M49.9,28 c0.4,0,0.8,0.3,0.8,0.7v11.7c0,0.4-0.4,0.7-0.8,0.7H35.7c-0.4,0-0.8-0.3-0.8-0.7V28.7c0-0.4,0.4-0.7,0.8-0.7H49.9z M41.4,16.9 l1.6,2.8l2.6-1.6L44,15.4L41.4,16.9z M42.2,8l6,10.8l-14.9,8.8c-1.4,0.9-3.1,1.1-4.7,0.7c-1.6-0.4-2.9-1.5-3.7-2.9L22,20L42.2,8z M23,27.5c0.4,1,1.2,1.8,2.1,2.3L21,32.3l-4-7.3l3.5-2.1L23,27.5z" fill="${color}"/></svg>`;
const createVideoDeviceNormalSvg = (width, height, color, bg, br) => `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}px" height="${height}px" viewBox="0 0 72 72"><path d="M14.7,33c-1.1-2.8-1.7-5.8-1.7-8.8C12.9,11.4,23.1,1.1,35.8,1S58.9,11.1,59,23.9c0.4,3.5-0.7,7.9-3.2,13.4 C52.6,42.5,46,52.5,36,67.2c-9.9-14.6-16.4-24.6-19.5-29.9C15.8,35.8,15.2,34.3,14.7,33z" fill="${bg}"/><path d="M54.9,36.9C51.8,42,45.5,51.6,36,65.4c-9.4-13.9-15.7-23.5-18.6-28.6c-0.7-1.5-1.3-2.9-1.8-4.2 C12.1,24.4,14,15,20.2,8.7c6.2-6.3,15.7-8.2,23.9-4.9s13.6,11.3,13.7,20.2V24C58.3,27.3,57.3,31.6,54.9,36.9z M60,23.8 C59.9,10.6,49.1-0.1,35.8,0C22.6,0.1,11.9,10.9,12,24.1c0,3.1,0.6,6.2,1.8,9.1c0.5,1.5,1.2,3,1.9,4.4c2.9,5.1,9.2,14.7,18.5,28.4 c-8,0.2-14.1,1.4-14.1,3c0,1.6,7.2,3,16,3s16-1.3,16-3c0-1.5-6.2-2.8-14.1-3c9.4-13.8,15.8-23.3,18.8-28.4l0.1-0.1 C59.3,32.2,60.4,27.6,60,23.8z" fill="${br}"/><path d="M46.7,33.7c0.1-0.1,0.2-0.3,0.2-0.4c0-0.2-0.1-0.3-0.2-0.4l-6-4.1c-0.2-0.1-0.4-0.1-0.5,0 C40,28.9,40,29.1,40,29.2v8c0,0.2,0.1,0.4,0.3,0.5c0.2,0.1,0.4,0.1,0.5,0L46.7,33.7z M50.3,27c0.4,0,0.7,0.3,0.7,0.7v11.5 c0,0.4-0.4,0.8-0.8,0.8H35.6c-0.4,0-0.7-0.3-0.7-0.7V27.8c0-0.4,0.4-0.8,0.8-0.8H50.3z M40.6,17l1.6,2.8l2.7-1.6l-1.6-2.8L40.6,17z M41.4,8l6.1,10.9l-15.1,8.9c-1.4,0.9-3.1,1.1-4.7,0.7c-1.6-0.4-2.9-1.5-3.7-3L21,20.1L41.4,8z M23.1,27.6c0.5,1,1.2,1.8,2.2,2.3 L21,32.4L17,25.1l3.6-2.1L23.1,27.6z" fill="${color}"/></svg>`;
const createCommonDeviceNormalSvg = (width, height, color, bg, br) => `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  width="${width}px" height="${height}px" viewBox="0 0 72 72"><path d="M14.7,33c-1.1-2.8-1.7-5.8-1.7-8.8C12.9,11.4,23.1,1.1,35.8,1S58.9,11.1,59,23.9c0.4,3.5-0.7,7.9-3.2,13.4 C52.6,42.5,46,52.5,36,67.2c-9.9-14.6-16.4-24.6-19.5-29.9C15.8,35.8,15.2,34.3,14.7,33z" fill="${bg}"/><path d="M54.9,36.9C51.8,42,45.5,51.6,36,65.4c-9.4-13.9-15.7-23.5-18.6-28.6c-0.7-1.5-1.3-2.9-1.8-4.2 C12.1,24.4,14,15,20.2,8.7c6.2-6.3,15.7-8.2,23.9-4.9s13.6,11.3,13.7,20.2V24C58.3,27.3,57.3,31.6,54.9,36.9z M60,23.8 C59.9,10.6,49.1-0.1,35.8,0C22.6,0.1,11.9,10.9,12,24.1c0,3.1,0.6,6.2,1.8,9.1c0.5,1.5,1.2,3,1.9,4.4c2.9,5.1,9.2,14.7,18.5,28.4 c-8,0.2-14.1,1.4-14.1,3c0,1.6,7.2,3,16,3s16-1.3,16-3c0-1.5-6.2-2.8-14.1-3c9.4-13.8,15.8-23.3,18.8-28.4l0.1-0.1 C59.3,32.2,60.4,27.6,60,23.8z" fill="${br}"/><path d="M42.9,28.5l1.5,2.5h7.8v4h-9.9l-3.2-4L42.9,28.5z M43.5,11.9l7,10L33.8,32.9c0,0-3.2,2.1-7.9-1.6L22,26.1 L43.5,11.9z M42.6,20.5l1.6,2.4l2.4-1.6L45,18.9L42.6,20.5z M21.5,28.8c0,0,2.6,4,5.3,4.5l-3.2,2.1l-3.7-5.6L21.5,28.8z" fill-rule="evenodd" clip-rule="evenodd" fill="${color}"/></svg>`;
/**
 * 抓拍机
 */
export const DEVICE_IMAGE_NORMAL_STYLE = createSvgIconStyle({
  svg: createImageDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR, DEVICE_BR_COLOR, DEVICE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IMAGE_ACTIVE_STYLE = createSvgIconStyle({
  svg: createImageDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_BR_COLOR, DEVICE_ACTIVE_COLOR, DEVICE_ACTIVE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IMAGE_OFF_STYLE = createSvgIconStyle({
  svg: createImageDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_OFF_COLOR, DEVICE_BR_COLOR, DEVICE_OFF_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IMAGE_WARNIN_STYLE = createSvgIconStyle({
  svg: createImageDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_WARNIN_COLOR, DEVICE_BR_COLOR, DEVICE_WARNIN_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
/**
 * 视频流相机
 */
export const DEVICE_VIDEO_NORMAL_STYLE = createSvgIconStyle({
  svg: createVideoDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR, DEVICE_BR_COLOR, DEVICE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_ACTIVE_STYLE = createSvgIconStyle({
  svg: createVideoDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_BR_COLOR, DEVICE_ACTIVE_COLOR, DEVICE_ACTIVE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_OFF_STYLE = createSvgIconStyle({
  svg: createVideoDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_OFF_COLOR, DEVICE_BR_COLOR, DEVICE_OFF_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_WARNIN_STYLE = createSvgIconStyle({
  svg: createVideoDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_WARNIN_COLOR, DEVICE_BR_COLOR, DEVICE_WARNIN_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

/**
 * 通用相机
 */
export const DEVICE_COMMON_NORMAL_STYLE = createSvgIconStyle({
  svg: createCommonDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR, DEVICE_BR_COLOR, DEVICE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_COMMON_ACTIVE_STYLE = createSvgIconStyle({
  svg: createCommonDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_BR_COLOR, DEVICE_ACTIVE_COLOR, DEVICE_ACTIVE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_COMMON_OFF_STYLE = createSvgIconStyle({
  svg: createCommonDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_OFF_COLOR, DEVICE_BR_COLOR, DEVICE_OFF_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_COMMON_WARNIN_STYLE = createSvgIconStyle({
  svg: createCommonDeviceNormalSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_WARNIN_COLOR, DEVICE_BR_COLOR, DEVICE_WARNIN_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

export function lineActiveStyleFn() {
  return createUniversalStyle({
    image: {
      type: 'circle',
      radius: 15,
      backgroundColor: '#0000ff'
    },
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#0000ff',
    borderWidth: 5
  });
}

export function lineStyleLayerFn() {
  return createUniversalStyle({
    image: {
      type: 'circle',
      radius: 15,
      backgroundColor: '#FA7D42'
    },
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#FA7D42',
    borderWidth: 5
  });
}

export function deviceStyleFn(feature) {
  const params = feature.get('params');
  if (!params) {
    return DEVICE_COMMON_NORMAL_STYLE;
  }
  switch (params.type.toString()) {
    case '1':
    case '4':
      if (params && params.selected) {
        return DEVICE_VIDEO_ACTIVE_STYLE;
      }
      switch (params.status.toString()) {
        case '1':
        case '5':
        case '0':
          return DEVICE_VIDEO_NORMAL_STYLE;

          // return DEVICE_VIDEO_OFF_STYLE;
        default:
          return DEVICE_VIDEO_WARNIN_STYLE;
      }
    case '2':
    case '3':
    case '11':
    case '12':
    case '13':
    case '14':
    case '15':
      if (params && params.selected) {
        return DEVICE_IMAGE_ACTIVE_STYLE;
      }
      /** 视图库相机特殊处理 */
      if (params.type.toString() === '3') {
        return DEVICE_IMAGE_WARNIN_STYLE;
      }
      switch (params.status.toString()) {
        case '1':
        case '5':
        case '0':
          return DEVICE_IMAGE_NORMAL_STYLE;

          // return DEVICE_IMAGE_OFF_STYLE;
        default:
          return DEVICE_IMAGE_WARNIN_STYLE;
      }
    default:
      if (params && params.selected) {
        return DEVICE_COMMON_ACTIVE_STYLE;
      }
      switch (params.status.toString()) {
        case '1':
        case '5':
        case '0':
          return DEVICE_COMMON_NORMAL_STYLE;

          // return DEVICE_COMMON_OFF_STYLE;
        default:
          return DEVICE_COMMON_WARNIN_STYLE;
      }
  }
}
export function deviceHoverStyleFn() {
  return DEVICE_IMAGE_ACTIVE_STYLE;
}
export function deviceSelectedStyleFn() {
  return DEVICE_IMAGE_ACTIVE_STYLE;
}
export function deviceSelectStyleFn(feature) {
  const params = feature.get('params');
  if (!params) {
    return DEVICE_COMMON_ACTIVE_STYLE;
  }
  switch (params.type.toString()) {
    case '1':
    case '4':
      return DEVICE_VIDEO_ACTIVE_STYLE;
    case '2':
    case '3':
    case '11':
    case '12':
    case '13':
    case '14':
    case '15':
      return DEVICE_IMAGE_ACTIVE_STYLE;
    default:
      return DEVICE_COMMON_ACTIVE_STYLE;
  }
}
const raduisLevel = (number) => {
  let raduis = '';
  if (number > 1000) {
    raduis = 'large';
    number = '>1000';
  } else if (number > 500) {
    raduis = 'middle';
  } else if (number > 100) {
    raduis = 'small';
  } else {
    raduis = 'single';
  }
  return raduis;
};
export const STATICSIZE = {
  single: 1,
  small: 1.2,
  middle: 1.5,
  large: 2
};

export const createText = (text) => createTextStyle({
  text,
  color: '#fff',
  scale: 1
}).getText();
// 聚类样式
const STATICLAVEL = [21, 29, 37, 49];
export const createRadius = (bg = 'rgba(58,153,241,.9)') => {
  const map = {};
  ['single', 'small', 'middle', 'large'].forEach((item, index) => {
    map[item] = createUniversalStyle({
      image: {
        type: 'circle',
        radius: STATICLAVEL[index],
        borderColor: '#fff',
        borderWidth: 0,
        backgroundColor: bg
      },
      text: {
        text: ''
      }
    });
  });
  return map;
};
const radiusNormal = createRadius('rgba(85,98,201,.9)');
export const clusterLayerFn = (feature) => {
  const number = feature.get('features') ? feature.get('features').length : 1;
  const raduis = raduisLevel(number);
  const raduisStyle = radiusNormal[raduis];
  // TO DO 后期API对外暴露 createText
  raduisStyle.setText(createText(`${number}`, STATICSIZE[raduis]));

  return raduisStyle;
};
