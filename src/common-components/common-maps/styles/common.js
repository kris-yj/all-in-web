/* eslint-disable camelcase */
import {
  createUniversalStyle, createSvgIconStyle, createCircleStyle, createTextStyle, createLineStyle, createImageIconStyle
} from '@megvii-gis/core-api/lib/Style';
import { createPointGeom } from '@megvii-gis/core-api/lib/Geometry';
import { locationPointStyle } from '@megvii-gis/style-sets';
// -------------通用样式--------------------
const STATICCOLOR = '#3A99F1';

const UNIVERSAL_STYLE = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 11,
    backgroundColor: STATICCOLOR,
  },
  backgroundColor: 'rgba(58,153,241,0.2)',
  borderColor: STATICCOLOR,
  borderWidth: 2,
});

export function universalStyleFn() {
  return UNIVERSAL_STYLE;
}

export function locationStyleFn() {
  return locationPointStyle;
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
      backgroundColor: 'rgba(58,153,241,0.20)'
    },
    backgroundColor: 'rgba(58,153,241,0.20)',
    borderColor: '#2D99FC',
    borderWidth: 5
  });
}

export function lineStyleLayerFn() {
  return createUniversalStyle({
    image: {
      type: 'circle',
      radius: 15,
      backgroundColor: 'rgba(58,153,241,0.2)'
    },
    backgroundColor: 'rgba(58,153,241,0.2)',
    borderColor: STATICCOLOR,
    borderWidth: 3,

  });
}
export function customLineStyleLayerFn() {
  return createUniversalStyle({
    image: {
      type: 'circle',
      radius: 15,
      backgroundColor: 'rgba(245,131,0,0.1)'
    },
    backgroundColor: 'rgba(245,131,0,0.1)',
    borderColor: '#F58300',
    borderWidth: 3,
    lineDash: [3, 8]
  });
}

export function deviceStyleFn(feature) {
  const params = feature.get('params');
  if (!params) {
    return DEVICE_COMMON_NORMAL_STYLE;
  }
  const type = params.type ? params.type.toString() : '0';
  const status = params.status ? params.status.toString() : '0';
  switch (type) {
    case '1':
    case '4':
      if (params && params.selected) {
        return DEVICE_VIDEO_ACTIVE_STYLE;
      }
      switch (status) {
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
      switch (status) {
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
      switch (status) {
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
export function deviceSelectStyleFn(feature) {
  const params = feature.get('params');
  if (!params) {
    return DEVICE_COMMON_ACTIVE_STYLE;
  }
  const type = params.type ? params.type.toString() : '0';
  switch (type) {
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

// -------------轨迹节点---------------

const START_NODE_WIDTH = 48;
const START_NODE_HEIGHT = 48;
const START_NODE_COLOR = '#00a947';
const createTraceStartNodeCHSvg = (width, height, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 72 72"><style>.start-node{fill:#fff}</style><path fill="${color}" d="M36 0C24.4 0 15 9.2 15 20.5c0 4 1.2 7.7 3.2 10.8.1.1.1.3.2.4 2.2 3.7 7.3 8.1 10.6 12.2 4.3 5.3 6.6 9.9 6.6 9.9.1.1.2.1.4.2.2 0 .3 0 .5-.2 0 0 1.9-4.3 5.9-9.2 3.6-4.4 9.2-9.1 11.4-12.9.1-.1.1-.2.2-.3 2-3.2 3.2-6.9 3.2-10.9C57 9.2 47.6 0 36 0z"/><path d="M43.3 17.1v-4.3h-6.4v-2h8.5V19h-6.2v4.7c0 .8.2.9 1.2.9h3.2c.9 0 1-.5 1.2-3.2.5.4 1.3.7 1.9.9-.3 3.5-.8 4.4-2.9 4.4H40c-2.3 0-3-.6-3-2.9v-6.7h6.3zm-11 6.8v4.4c1.3.5 2.9.6 4.9.6h9.9c-.3.5-.7 1.5-.8 2.2h-9c-4.7 0-7.5-.7-9.3-3.7-.3 1.7-.7 3.3-1.2 4.5-.4-.3-1.3-.8-1.9-1 1.3-2.4 1.5-6.2 1.6-10.4l2 .2c0 1.1-.1 2.1-.1 3.1.5 1.5 1.1 2.6 1.9 3.4v-8.3h-4.8v-2h4.3v-2.6h-3.7v-2h3.7V9.8h2.1v2.5h3.6v2h-3.6v2.6h4.2v2h-3.8V22h3.6v1.9h-3.6z" class="start-node"/><circle cx="36" cy="63" r="6.7" class="start-node"/><path fill="${color}" fill-rule="evenodd" d="M36 72c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-3c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6z" clip-rule="evenodd"/></svg>`;

const END_NODE_WIDTH = 48;
const END_NODE_HEIGHT = 48;
const END_NODE_COLOR = '#bf2b2b';
const createTraceEndNodeCHSvg = (width, height, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 72 72"><style>.end-node{fill:#fff}</style><path fill="${color}" d="M36 0C24.4 0 15 9.2 15 20.5c0 4 1.2 7.7 3.2 10.8.1.1.1.3.2.4 2.2 3.7 7.3 8.1 10.6 12.2 4.3 5.3 6.6 9.9 6.6 9.9.1.1.2.1.4.2.2 0 .3 0 .5-.2 0 0 1.9-4.3 5.9-9.2 3.6-4.4 9.2-9.1 11.4-12.9.1-.1.1-.2.2-.3 2-3.2 3.2-6.9 3.2-10.9C57 9.2 47.6 0 36 0z"/><path d="M26 30.7l-.4-2.1c2.1-.3 5.4-1 8.4-1.5l.2 1.9c-2.9.6-5.9 1.3-8.2 1.7zm9.3-2.4l1.2-1.5c3.1.8 6.9 2.3 9 3.5L44.2 32c-2-1.3-5.8-2.8-8.9-3.7zm2.6-4.1l1.2-1.4c1.7.6 3.8 1.7 5 2.5l-1.3 1.6c-1.1-.9-3.2-2.1-4.9-2.7zm.4-9.4c.6 1.1 1.4 2.1 2.4 3 .9-.9 1.8-1.9 2.4-3h-4.8zm6.3-2l1.4.8c-.9 2.1-2.2 4-3.8 5.6 1.6 1.2 3.5 2.3 5.4 2.9-.5.4-1.1 1.3-1.4 1.8-2-.8-3.8-1.9-5.5-3.4-1.8 1.5-3.8 2.6-5.8 3.4-.2-.5-.9-1.4-1.4-1.8 2-.7 4-1.8 5.6-3.1-.8-.8-1.5-1.8-2.1-2.7-.7.7-1.4 1.5-2.2 2.1-.3-.4-.7-.9-1.2-1.2-1.3 2.1-2.9 4.2-4.4 6l4.3-.6c0 .6 0 1.4.1 1.9-5.9.9-6.7 1.1-7.3 1.4-.1-.4-.4-1.4-.7-2 .5-.1 1.1-.6 1.8-1.5.4-.4 1.2-1.4 2.1-2.7-2.5.3-3.1.4-3.4.6-.1-.4-.4-1.5-.7-2 .4-.1.8-.7 1.4-1.4.5-.7 2.2-3.6 3.1-6.4l2.1.9c-1 2.4-2.4 4.8-3.7 6.8l2.5-.2c.5-.8 1-1.6 1.4-2.5l1.7 1.1c2.1-1.8 3.5-4 4.3-5.9l2.3.4c-.3.6-.6 1.3-1 1.9h4.7l.4-.2z" class="end-node"/><circle cx="36" cy="63" r="6.7" class="end-node"/><path fill="${color}" fill-rule="evenodd" d="M36 72c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-3c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6z" clip-rule="evenodd"/></svg>`;

// const createTraceNodeENSvg = (width, height, color) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${height}px" viewBox="0 0 72 72"><circle cx="36" cy="63" r="6.7" fill="#fff"/><path fill="${color}" fill-rule="evenodd" d="M36 72c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm0-3c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6z" clip-rule="evenodd"/><path fill="${color}" d="M36 0C24.4 0 15 9.2 15 20.5c0 4 1.2 7.7 3.2 10.8.1.1.1.3.2.4 2.2 3.7 7.3 8.1 10.6 12.2 4.3 5.3 6.6 9.9 6.6 9.9.1.1.2.1.4.2.2 0 .3 0 .5-.2 0 0 1.9-4.3 5.9-9.2 3.6-4.4 9.2-9.1 11.4-12.9.1-.1.1-.2.2-.3 2-3.2 3.2-6.9 3.2-10.9C57 9.2 47.6 0 36 0z"/><circle cx="36" cy="21" r="9" fill="#fff" fill-rule="evenodd" clip-rule="evenodd"/></svg>`;

const START_NODE_STYLE_CH = createSvgIconStyle({
  svg: createTraceStartNodeCHSvg(START_NODE_WIDTH, START_NODE_HEIGHT, START_NODE_COLOR),
  size: [START_NODE_WIDTH, START_NODE_HEIGHT],
  anchor: [0.5, 0.9],
});

const createTraceStartEndNodeSvg = `<svg width="48" height="45" viewBox="0 0 62 58" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>编组 4</title>
    <defs>
        <linearGradient x1="0%" y1="50%" x2="94.3402655%" y2="50%" id="linearGradient-1">
            <stop stop-color="#FF0000" offset="0%"></stop>
            <stop stop-color="#DB1E26" offset="53.1925762%"></stop>
            <stop stop-color="#597FC4" offset="53.6649157%"></stop>
            <stop stop-color="#0F64FF" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="播放状态" transform="translate(-437.000000, -458.000000)">
            <g id="编组-4" transform="translate(437.000000, 458.000000)">
                <circle id="椭圆形" stroke="url(#linearGradient-1)" stroke-width="4" fill="#FFFFFF" cx="31" cy="44" r="12"></circle>
                <g id="编组">
                    <path d="M2,0 L32,0 L32,0 L34,28 L2,28 C0.8954305,28 1.3527075e-16,27.1045695 0,26 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" id="形状结合" fill="#1583E7"></path>
                    <path d="M27,0 L60,0 C61.1045695,-2.02906125e-16 62,0.8954305 62,2 L62,26 C62,27.1045695 61.1045695,28 60,28 L34,28 L34,28 L27,0 Z" id="矩形备份" fill="#F20B0D"></path>
                </g>
                <text id="终" font-family="NotoSansHans-Bold, Noto Sans S Chinese" font-size="12" font-weight="bold" fill="#FFFFFF">
                    <tspan x="40" y="18">终</tspan>
                </text>
                <text id="起" font-family="NotoSansHans-Bold, Noto Sans S Chinese" font-size="12" font-weight="bold" fill="#FFFFFF">
                    <tspan x="9" y="18">起</tspan>
                </text>
            </g>
        </g>
    </g>
</svg>`;
const START_END_NODE_STYLE = createSvgIconStyle({
  svg: createTraceStartEndNodeSvg,
  size: [48, 45],
  anchor: [0.5, 0.80]
});

// todo:兼容国际化
// const START_NODE_STYLE_EN = createSvgIconStyle({
//   svg: createTraceNodeENSvg(START_NODE_WIDTH, START_NODE_HEIGHT, START_NODE_COLOR),
//   size: [START_NODE_WIDTH, START_NODE_HEIGHT],
//   anchor: [0.5, 0.9],
// });

const END_NODE_STYLE_CH = createSvgIconStyle({
  svg: createTraceEndNodeCHSvg(END_NODE_WIDTH, END_NODE_HEIGHT, END_NODE_COLOR),
  size: [END_NODE_WIDTH, END_NODE_HEIGHT],
  anchor: [0.5, 0.9],
});

// 移动的菱形物体目标
const createVehicleSvg = (size) => `<svg width="${size[0]}" height="${size[1]}" viewBox="0 0 36 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<title>编组 6备份</title>
<defs>
    <filter x="-27.3%" y="-50.0%" width="154.5%" height="200.0%" filterUnits="objectBoundingBox" id="filter-1">
        <feGaussianBlur stdDeviation="1" in="SourceGraphic"></feGaussianBlur>
    </filter>
    <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-2">
        <stop stop-color="#05BE28" offset="0%"></stop>
        <stop stop-color="#1B832F" offset="100%"></stop>
    </linearGradient>
    <linearGradient x1="50%" y1="0.259137502%" x2="50%" y2="99.7433885%" id="linearGradient-3">
        <stop stop-color="#26DD49" offset="0%"></stop>
        <stop stop-color="#24CB44" offset="46.8941215%"></stop>
        <stop stop-color="#23C242" offset="100%"></stop>
    </linearGradient>
</defs>
<g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="典型界面备份-3" transform="translate(-1685.000000, -566.000000)">
        <g id="编组-6备份" transform="translate(1685.000000, 566.000000)">
            <ellipse id="椭圆形" fill="#035D05" opacity="0.7" filter="url(#filter-1)" cx="17.5" cy="54" rx="5.5" ry="3"></ellipse>
            <path d="M11.6498578,37 L24.002644,37 C24.113101,37 24.202644,37.0895431 24.202644,37.2 C24.202644,37.2309854 24.1954446,37.261547 24.1816136,37.2892742 L18.7339489,48.2103022 C18.4874249,48.704513 17.8869407,48.9053029 17.3927298,48.658779 C17.1991111,48.5621974 17.0420407,48.4054225 16.9450949,48.2119859 L11.4710566,37.289611 C11.4215658,37.1908618 11.4614977,37.0706896 11.5602468,37.0211988 C11.5880617,37.0072586 11.6187452,37 11.6498578,37 Z" id="路径-2" fill="url(#linearGradient-2)"></path>
            <rect id="矩形" fill="url(#linearGradient-3)" x="0" y="0" width="36" height="35" rx="5"></rect>
            <path d="M16.340678,6.37012073 L16.4960452,6.70242798 L15.8745763,6.53295128 L15.1785311,6.9549815 L14.7932203,7.61959601 L13.789548,8.37725655 L12.7081921,10.0620543 L13.0189266,9.97897752 L12.7081921,10.5472229 C12.7081921,10.5472229 12.6025424,10.686792 12.5590395,11.4976217 L12.7920904,11.4145449 L12.6367232,12.19879 L12.7920904,12.0891286 L12.869774,13.0860504 L13.1028249,14.0829721 L12.7175141,14.2524488 L12.4844633,14.8439557 L12.9474576,16.6982302 L13.3327684,17.0305375 L13.6435028,17.0305375 L14.1841808,18.9712119 L14.5694915,19.8152723 L14.6471751,21.6695468 C14.6471751,21.6695468 14.1468927,23.8494824 12.7175141,24.2848049 C11.2881356,24.7201274 10.3341808,25.251819 8.7059322,25.6339723 C7.62457627,25.8865259 7,26.5677557 7,28 L29,28 C29,28 28.8228814,26.3384637 27.7570621,25.8865259 C26.2033898,25.2219113 24.3607345,24.8896041 23.049435,24.3678817 C22.020904,23.9724361 21.1850282,21.58647 21.1850282,21.58647 L21.1073446,19.6457956 L21.3403955,18.9811811 L21.9618644,16.7048764 L22.1949153,16.7879532 L22.5056497,16.5353997 L22.8909605,14.9336787 L22.8132768,14.1760182 L22.4279661,13.9234646 L22.9686441,11.8166366 C22.9686441,11.8166366 22.6579096,9.11830173 20.8836158,8.36064119 C19.9712021,6.85462266 18.3942549,5.96173441 16.7166667,6.00125967 L17.179661,6.59276659 L16.340678,6.37012073 Z" id="Shape" fill="#FFFFFF" fill-rule="nonzero"></path>
        </g>
    </g>
</g>
</svg>`;

const size = [36, 60];
const vehicleStyle = createSvgIconStyle({
  svg: createVehicleSvg(size),
  size,
  anchor: [0.5, 0.91]
});

// todo:兼容国际化
// const END_NODE_STYLE_EN = createSvgIconStyle({
//   svg: createTraceNodeENSvg(END_NODE_WIDTH, END_NODE_HEIGHT, END_NODE_COLOR),
//   size: [END_NODE_WIDTH, END_NODE_HEIGHT],
//   anchor: [0.5, 0.9],
// });

const TRACE_NODE_CIRCLE_1 = createCircleStyle({
  radius: 12,
  backgroundColor: '#fff',
});

const TRACE_NODE_CIRCLE_2 = createCircleStyle({
  radius: 10,
  backgroundColor: '#fff',
  borderWidth: 2,
  borderColor: STATICCOLOR,
});

const TRACE_NODE_TEXT = createTextStyle({
  text: '',
  color: STATICCOLOR,
});

const TRACE_NODE_HOVER_CIRCLE_1 = createCircleStyle({
  radius: 13,
  backgroundColor: '#fff',
  borderWidth: 2,
  borderColor: STATICCOLOR,
});

const TRACE_NODE_HOVER_CIRCLE_2 = createCircleStyle({
  radius: 10,
  backgroundColor: STATICCOLOR,
});

const TRACE_NODE_HOVER_TEXT = createTextStyle({
  text: '',
  color: '#fff',
  font: 'bold 12px sans-serif',
});

const traceNodeTextStyleCache = {};
const createTraceNodeTextStyle = (index) => {
  if (!index) return TRACE_NODE_TEXT;
  if (traceNodeTextStyleCache[index]) return traceNodeTextStyleCache[index];
  traceNodeTextStyleCache[index] = createTextStyle({
    text: index.toString(),
    color: STATICCOLOR,
    font: 'bold 12px sans-serif',
  });
  // traceNodeTextStyleCache[index].setText(index.toString());
  return traceNodeTextStyleCache[index];
};

const traceNodeHoverTextStyleCache = {};
const createTraceNodeHoverTextStyle = (index) => {
  if (!index) return TRACE_NODE_HOVER_TEXT;
  if (traceNodeHoverTextStyleCache[index]) return traceNodeHoverTextStyleCache[index];
  traceNodeHoverTextStyleCache[index] = createTextStyle({
    text: index.toString(),
    color: '#fff',
    font: 'bold 12px sans-serif',
  });
  return traceNodeHoverTextStyleCache[index];
};

export function traceNodeStyleFn(feature) {
  const params = feature.get('params');
  if (params.start_end) return START_END_NODE_STYLE;
  if (params.start) return START_NODE_STYLE_CH;
  if (params.end) return END_NODE_STYLE_CH;
  const textStyle = createTraceNodeTextStyle(params.index);
  return [
    TRACE_NODE_CIRCLE_1,
    TRACE_NODE_CIRCLE_2,
    textStyle,
  ];
}

export function traceNodeSelectFn(feature) {
  const params = feature.get('params');
  if (params.start_end) return START_END_NODE_STYLE;
  if (params.start) return START_NODE_STYLE_CH;
  if (params.end) return END_NODE_STYLE_CH;
  if (params.rotate) return vehicleStyle;
  const textStyle = createTraceNodeHoverTextStyle(params.index);
  return [
    TRACE_NODE_HOVER_CIRCLE_1,
    TRACE_NODE_HOVER_CIRCLE_2,
    textStyle,
  ];
}

// ------------轨迹线条---------------
const TRACE_LINE_ARROW_WIDTH = 6;
const TRACE_LINE_ARROW_HEIGHT = 6;
const TRACE_LINE_ARROW_COLOR = 'rgba(255,255,255,0.7)';

const createTraceLineArrowSvg = (width, height, color) => `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 72 72"><path fill-rule="evenodd" clip-rule="evenodd" fill="${color}" d="M35.9 65.7L0 41.4V6.3l35.9 24.4L72 6.3v35.1z"/></svg>`;

export const TRACE_LINE_ARROW_STYLE = createSvgIconStyle({
  svg: createTraceLineArrowSvg(
    TRACE_LINE_ARROW_WIDTH,
    TRACE_LINE_ARROW_HEIGHT,
    TRACE_LINE_ARROW_COLOR,
  ),
  size: [TRACE_LINE_ARROW_WIDTH, TRACE_LINE_ARROW_HEIGHT],
});

function colorMap(color = []) {
  const [R, G, B] = color;
  const color1 = `rgba(${R},${G},${B},1)`;
  const color2 = `rgba(${R - 50},${G - 50},${B - 50},1)`;
  const color3 = `rgba(${R - 75},${G - 75},${B - 75},1)`;
  // const color_4 = `rgba(${R},${G},${B},0.1)`; // todo: 颜色待定
  const color4 = 'rgba(255,255,255,1)';
  return [color1, color2, color3, color4];
}

const TRACE_COLOR_ARRAY = colorMap([58, 153, 241]);

export const TRACE_LINE_STYLE = createLineStyle({
  width: 6,
  borderWidth: 1,
  borderColor: TRACE_COLOR_ARRAY[1],
  color: TRACE_COLOR_ARRAY[0],
});

function createTraceLineStyle(color = []) {
  if (!color || color.length < 3) return undefined;
  const colors = colorMap(color);
  return createLineStyle({
    width: 6,
    borderWidth: 1,
    borderColor: colors[1],
    color: colors[0],
  });
}

export const SPACE_DISTANCE = 80;

export function traceLineStyleFn(feature, num, map) {
  if (!map.isRendered()) return undefined;
  // * 当前上下文bind到map对象上，直接调用了this上的方法
  // * 实际该方法是无此上下文的
  const geometry = feature.getGeometry();
  // console.info(num, map.getPixelFromCoordinate);

  const params = feature.get('params');
  let styles = [...TRACE_LINE_STYLE];
  if (params && params.color) {
    const colors = createTraceLineStyle(params.color);
    styles = [...colors];
  }

  geometry.forEachSegment((start, end) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx) + Math.PI / 2;

    // 通过像素计算arrow的数量而不是通过geom的间隔
    const startPos = map.getPixelFromCoordinate(start);
    const endPos = map.getPixelFromCoordinate(end);
    const totalPixelDistance = Math.sqrt(
      ((endPos[0] - startPos[0]) ** 2)
      + ((endPos[1] - startPos[1]) ** 2),
    );

    const arrowCount = Math.ceil(totalPixelDistance / SPACE_DISTANCE);

    const geomSpanX = arrowCount === 1 ? (end[0] - start[0]) / 2 : (end[0] - start[0]) / arrowCount;
    const geomSpanY = arrowCount === 1 ? (end[1] - start[1]) / 2 : (end[1] - start[1]) / arrowCount;

    const drawNum = arrowCount === 1 ? 2 : arrowCount;

    const arrowStyle = createUniversalStyle({
      // geometry: createPointGeom(arrowPos),
      image: {
        type: 'svgIcon',
        svg: createTraceLineArrowSvg(
          TRACE_LINE_ARROW_WIDTH,
          TRACE_LINE_ARROW_HEIGHT,
          'white',
        ),
        size: [TRACE_LINE_ARROW_WIDTH, TRACE_LINE_ARROW_HEIGHT],
        rotation: -rotation,
      },
    });

    for (let i = 1; i < drawNum; i += 1) {
      const arrowPos = [start[0] + i * geomSpanX, start[1] + i * geomSpanY];
      // arrows
      const style = arrowStyle.clone();
      style.setGeometry(createPointGeom(arrowPos));
      styles.push(style);
    }
  });
  return styles;
}

/** 防控单元样式 */
const SMALLREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)'
  },
  backgroundColor: 'rgba(255,255,255,0.5)',
  borderColor: 'rgba(116,178,244,1)',
  borderWidth: 2
});
const MIDDLEREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(241,170,0,0.4)'
  },
  backgroundColor: 'rgba(241,170,0,0.4)',
  borderColor: 'rgba(241,170,0,0)',
  borderWidth: 0
});
const HIGHREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(245,131,0,0.4)'
  },
  backgroundColor: 'rgba(245,131,0,0.4)',
  borderColor: 'rgba(245,131,0,0)',
  borderWidth: 0
});

/** 防控单元hover样式 */
const SMALLHOVERREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(81,149,234,0.2)'
  },
  backgroundColor: 'rgba(81,149,234,0.2)',
  borderColor: 'rgba(61,149,241,1)',
  borderWidth: 2
});
const MIDDLEHOVERREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(241,170,0,0.2)'
  },
  backgroundColor: 'rgba(241,170,0,0.2)',
  borderColor: 'rgba(241,170,0,1)',
  borderWidth: 2
});
const HIGHHOVERREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(245,131,0,0.2)'
  },
  backgroundColor: 'rgba(245,131,0,0.2)',
  borderColor: 'rgba(245,131,0,1)',
  borderWidth: 2
});
/** 防控单元select样式 */
const SMALLSELECTREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(81,149,234,0.2)'
  },
  backgroundColor: 'rgba(81,149,234,0.2)',
  borderColor: 'rgba(81,149,234,1)',
  borderWidth: 4
});
const MIDDLESELECTREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(241,170,0,0.2)'
  },
  backgroundColor: 'rgba(241,170,0,0.2)',
  borderColor: 'rgba(241,170,0,1)',
  borderWidth: 4
});
const HIGHSELECTREGION = createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: 'rgba(245,131,0,0.4)'
  },
  backgroundColor: 'rgba(245,131,0,0.4)',
  borderColor: 'rgba(245,131,0,1)',
  borderWidth: 4
});

export const regionStyleLayerFn = (feature, level = { high: 7, middle: 4 }) => {
  const params = feature.get('params');
  const { selected } = params;
  if (params.level < level.middle) {
    return selected ? SMALLSELECTREGION : SMALLREGION;
  }
  if (params.level < level.high) {
    return selected ? MIDDLESELECTREGION : MIDDLEREGION;
  }
  return selected ? HIGHSELECTREGION : HIGHREGION;
};
export const regionHoverStyleLayerFn = (feature, level = { high: 7, middle: 4 }) => {
  const params = feature.get('params');
  if (params.level < level.middle) {
    return SMALLHOVERREGION;
  }
  if (params.level < level.high) {
    return MIDDLEHOVERREGION;
  }
  return HIGHHOVERREGION;
};
export const regionSelectStyleLayerFn = (feature, level = { high: 7, middle: 4 }) => {
  const params = feature.get('params');
  if (params.level < level.middle) {
    return SMALLSELECTREGION;
  }
  if (params.level < level.high) {
    return MIDDLESELECTREGION;
  }
  return HIGHSELECTREGION;
};

/** 重点单位标注 */

// 重点单位图标svg
const createUnitSvg = function (width, height, innerColor, outerColor = '#fff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 29.05 42.5"><defs><style>.cls-map-1{fill:${outerColor};}.cls-map-2{fill:${innerColor};}.cls-map-3,.cls-map-4{fill:none;}.cls-map-4{fill-rule:evenodd;}</style></defs><title>资源 2</title><g id="图层_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><ellipse class="cls-map-2" cx="14.5" cy="40.67" rx="9.74" ry="1.83"/><path class="cls-map-1" d="M2,19.67c.29.81.65,1.68,1.07,2.58,1.78,3.1,5.62,9,11.4,17.54,5.86-8.55,9.78-14.45,11.64-17.54,1.46-3.19,2.09-5.85,1.86-7.86A13.5,13.5,0,0,0,1,14.5a13.29,13.29,0,0,0,1,5.15Z"/><path class="cls-map-2" d="M29,14.33A14.5,14.5,0,1,0,1.09,20a29.16,29.16,0,0,0,1.13,2.69C4.07,26,8.06,32.08,14.09,41l.41.61.41-.6C21,32.07,25.08,26,27,22.71,28.58,19.31,29.25,16.47,29,14.33ZM14.5,39.79C8.72,31.26,4.88,25.35,3.1,22.25c-.42-.9-.78-1.77-1.07-2.58v0A13.29,13.29,0,0,1,1,14.5a13.5,13.5,0,0,1,27-.11c.23,2-.4,4.67-1.86,7.86C24.28,25.34,20.36,31.24,14.5,39.79Z"/><rect class="cls-map-3" x="9.79" y="9.6" width="1.6" height="1.6"/><polygon class="cls-map-3" points="12.99 13.6 12.99 15.2 14.59 15.2 14.59 13.6 12.99 13.6 12.99 13.6"/><polygon class="cls-map-3" points="9.79 13.6 9.79 15.2 11.39 15.2 11.39 13.6 9.79 13.6 9.79 13.6"/><rect class="cls-map-3" x="12.99" y="9.6" width="1.6" height="1.6"/><rect class="cls-map-3" x="16.99" y="14.4" width="3.2" height="6.4"/><path class="cls-map-2" d="M22.59,20.8h-.8V13.41c0-.44-.08-.61-.52-.61H17V7.71c0-.44-.08-.51-.52-.51H7.9c-.43,0-.51.07-.51.51V20.8h-.8v1.6h16Zm-11.2-1.6H9.79V17.6h1.6Zm0-4H9.79V13.6h1.6Zm0-4H9.79V9.6h1.6Zm3.2,8H13V17.6h1.6Zm0-4H13V13.6h1.6Zm0-4H13V9.6h1.6Zm5.6,9.6H17V14.4h3.2Z"/><polyline class="cls-map-4" points="22.59 7.2 22.59 22.4 6.59 22.4"/></g></g></svg>`;
};

// 重点单位选中图标svg
const createUnitActiveSvg = function (width, height, innerColor, outerColor = '#fff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 29.05 42.5"><defs><style>.cls-map-1{fill:${innerColor};}.cls-map-2{fill:${outerColor};}.cls-map-3,.cls-map-4{fill:none;}.cls-map-4{fill-rule:evenodd;}</style></defs><title>资源 2</title><g id="图层_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><ellipse class="cls-map-1" cx="14.5" cy="40.67" rx="9.74" ry="1.83"/><path class="cls-map-1" d="M2,19.67c.29.81.65,1.68,1.07,2.58,1.78,3.1,5.62,9,11.4,17.54,5.86-8.55,9.78-14.45,11.64-17.54,1.46-3.19,2.09-5.85,1.86-7.86A13.5,13.5,0,0,0,1,14.5a13.29,13.29,0,0,0,1,5.15Z"/><path class="cls-map-1" d="M29,14.33A14.5,14.5,0,1,0,1.09,20a29.16,29.16,0,0,0,1.13,2.69C4.07,26,8.06,32.08,14.09,41l.41.61.41-.6C21,32.07,25.08,26,27,22.71,28.58,19.31,29.25,16.47,29,14.33ZM14.5,39.79C8.72,31.26,4.88,25.35,3.1,22.25c-.42-.9-.78-1.77-1.07-2.58v0A13.29,13.29,0,0,1,1,14.5a13.5,13.5,0,0,1,27-.11c.23,2-.4,4.67-1.86,7.86C24.28,25.34,20.36,31.24,14.5,39.79Z"/><rect class="cls-map-3" x="9.79" y="9.6" width="1.6" height="1.6"/><polygon class="cls-map-3" points="12.99 13.6 12.99 15.2 14.59 15.2 14.59 13.6 12.99 13.6 12.99 13.6"/><polygon class="cls-map-3" points="9.79 13.6 9.79 15.2 11.39 15.2 11.39 13.6 9.79 13.6 9.79 13.6"/><rect class="cls-map-3" x="12.99" y="9.6" width="1.6" height="1.6"/><rect class="cls-map-3" x="16.99" y="14.4" width="3.2" height="6.4"/><path class="cls-map-2" d="M22.59,20.8h-.8V13.41c0-.44-.08-.61-.52-.61H17V7.71c0-.44-.08-.51-.52-.51H7.9c-.43,0-.51.07-.51.51V20.8h-.8v1.6h16Zm-11.2-1.6H9.79V17.6h1.6Zm0-4H9.79V13.6h1.6Zm0-4H9.79V9.6h1.6Zm3.2,8H13V17.6h1.6Zm0-4H13V13.6h1.6Zm0-4H13V9.6h1.6Zm5.6,9.6H17V14.4h3.2Z"/><polyline class="cls-map-4" points="22.59 7.2 22.59 22.4 6.59 22.4"/></g></g></svg>`;
};
const DEVICE_UNIT_NORMAL_STYLE = createSvgIconStyle({
  svg: createUnitSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

const DEVICE_UNIT_ACTIVE_STYLE = createSvgIconStyle({
  svg: createUnitActiveSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
// 重点单位正常标注
export function unitStyleFn(feature) {
  const params = feature.get('params');
  if (params && params.selected) {
    return DEVICE_UNIT_ACTIVE_STYLE;
  }
  return DEVICE_UNIT_NORMAL_STYLE;
}

// 重点单位Active标注
export function unitActiveStyleFn() {
  return DEVICE_UNIT_ACTIVE_STYLE;
}

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

const radiusNormal = createRadius('rgba(85,98,201,.9)');
const radiusHover = createRadius('rgba(106,130,221,.9)');
const radiusSelect = createRadius('rgba(53,67,168,.9)');

export const clusterLayerFn = (feature) => {
  const number = feature.get('features') ? feature.get('features').length : 1;
  const raduis = raduisLevel(number);
  const raduisStyle = radiusNormal[raduis];
  // TO DO 后期API对外暴露 createText
  raduisStyle.setText(createText(`${number}`, STATICSIZE[raduis]));

  return raduisStyle;
};
export const clusterHoverLayerFn = (feature) => {
  const number = feature.get('features') ? feature.get('features').length : 1;
  const raduis = raduisLevel(number);
  const raduisStyle = radiusHover[raduis];
  // TO DO 后期API对外暴露 createText
  raduisStyle.setText(createText(`${number}`, STATICSIZE[raduis]));

  return raduisStyle;
};
export const clusterSelectLayerFn = (feature) => {
  const number = feature.get('features') ? feature.get('features').length : 1;
  const raduis = raduisLevel(number);
  const raduisStyle = radiusSelect[raduis];
  // TO DO 后期API对外暴露 createText
  raduisStyle.setText(createText(`${number}`, STATICSIZE[raduis]));

  return raduisStyle;
};

// 半圆节点
export function circleStyleFn() {
  return createUniversalStyle({
    image: {
      type: 'circle',
      radius: 15,
      backgroundColor: STATICCOLOR
    },
    backgroundColor: 'rgba(58,153,241,0.2',
    borderColor: STATICCOLOR,
    borderWidth: 3
  });
}

// 图标尺寸常量
const HX_SIZE_CAMERA_WIDTH = 36;
const HX_SIZE_CAMERA_HEIGHT = 36;
const createHxCameraSvg = function createHxCameraSvg(width, height, innerColor, outerColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 72 72"><defs><style>.cls-map-1{fill:${innerColor};}.cls-map-2{fill:${outerColor};}.cls-map-3{fill:#fff;}</style></defs><path id="Combined-Shape-5" class="cls-map-1" d="M36,68.68c9.95-14.58,16.93-25.1,20.32-30.57,2.64-5.75,3.74-10.25,3.33-13.82a23.66,23.66,0,0,0-47.33.31,23.86,23.86,0,0,0,1.75,9h0c.68,1.77,1.26,3.14,1.85,4.41C19,43.4,25.59,53.42,36,68.68ZM12.41,34.27h0Z"/><path class="cls-map-2" d="M60.5,24.28A24.52,24.52,0,0,0,36,0H35.8A24.49,24.49,0,0,0,11.42,24.6a24.63,24.63,0,0,0,1.81,9.35c.72,1.85,1.29,3.23,1.91,4.53,2.94,5,9,14.32,18.5,28.32-4.68.27-8.17,1.31-8.17,2.56C25.46,70.82,30.18,72,36,72s10.54-1.18,10.54-2.63c0-1.26-3.52-2.3-8.22-2.57,9-13.18,15.43-22.92,18.77-28.32C59.8,32.58,60.92,27.9,60.5,24.28ZM36.24,66.73h-.53c-9.83-14.48-16.07-24-19-29.07-.56-1.19-1.12-2.54-1.83-4.37a22.9,22.9,0,0,1-1.68-8.69A22.73,22.73,0,0,1,35.81,1.76H36A22.79,22.79,0,0,1,58.75,24.39c.38,3.39-.68,7.76-3.21,13.26C52.19,43.06,45.53,53.11,36.24,66.73Z"/><g id="icon-抓拍检索"><polygon id="Shape" class="cls-map-3" points="24.12 18.75 22.76 18.74 22.76 13.24 28.28 13.24 28.28 14.62 24.12 14.62 24.12 18.75"/><polygon id="Shape-2" data-name="Shape" class="cls-map-3" points="49.24 18.75 47.86 18.75 47.86 14.62 43.72 14.62 43.72 13.24 49.24 13.24 49.24 18.75"/><polygon id="Shape-3" data-name="Shape" class="cls-map-3" points="28.28 39.72 22.76 39.72 22.76 34.2 24.14 34.2 24.14 38.34 28.28 38.34 28.28 39.72"/><polygon id="Shape-4" data-name="Shape" class="cls-map-3" points="49.24 39.72 43.72 39.72 43.72 38.34 47.86 38.34 47.86 34.2 49.24 34.2 49.24 39.72"/><path id="Shape-5" data-name="Shape" class="cls-map-3" d="M34.44,16.82l.14.27L34,17l-.63.34-.35.54-.91.6-1,1.34.28-.07-.28.45s-.1.11-.13.76l.21-.07-.14.62.14-.09.07.81.21.81-.35.13-.21.47.42,1.47.35.27H32l.49,1.54.35.67L32.9,29s-.45,1.74-1.75,2.08S29,31.9,27.5,32.2c-1,.2-1.43.86-1.43,2H45.93s-.17-1.43-1.13-1.8c-1.4-.54-3.08-.81-4.27-1.21-.93-.32-1.68-2.21-1.68-2.21l-.07-1.54L39,26.9l.56-1.81.21.07.28-.2.35-1.28-.07-.6-.35-.2.49-1.68s-.28-2.15-1.89-2.75a4.47,4.47,0,0,0-3.78-1.88l.42.47Z"/></g></svg>`;
};

const SVG_HX_CAMERA_SELECT = {
  svg: createHxCameraSvg(HX_SIZE_CAMERA_WIDTH, HX_SIZE_CAMERA_HEIGHT, '#104982', '#15330'),
  size: [HX_SIZE_CAMERA_WIDTH, HX_SIZE_CAMERA_HEIGHT]
};
// 档案 关系人员标注

const STYLE_HX_CAMERA_SELECT = createSvgIconStyle(SVG_HX_CAMERA_SELECT);

export const relationStyleFn = () => STYLE_HX_CAMERA_SELECT;

// 档案 轨迹分析地图

const cross_node_active = 'data:image/png;base64,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';
const cross_node_normal = 'data:image/png;base64,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';
const colorNodeStyleCache = {};
function createTraceNodeStyle(color = []) {
  if (!color || color.length < 3) return undefined;
  const colorKey = color.join('#');
  if (colorNodeStyleCache[colorKey]) return colorNodeStyleCache[colorKey];
  const [, , color_3, color_4] = colorMap(color);
  // 正常点位
  const normalRing = createCircleStyle({
    radius: 4,
    borderWidth: 2,
    borderColor: color_3,
    backgroundColor: '#fff',
  });
  // 激活点位
  const activeRing1 = createCircleStyle({
    radius: 10,
    backgroundColor: color_3,
  });
  const activeRing2 = createCircleStyle({
    radius: 6,
    backgroundColor: color_4,
  });

  const activeRing3 = createCircleStyle({
    radius: 3,
    backgroundColor: color_3,
  });

  colorNodeStyleCache[colorKey] = {
    normalStyle: normalRing,
    activeStyle: [
      activeRing1,
      activeRing2,
      activeRing3
    ]
  };
  return colorNodeStyleCache[colorKey];
}
const STYLE_CROSS_NODE_NORMAL = createImageIconStyle({
  src: cross_node_normal,
  size: [44, 44],
  anchor: [0.5, 0.5],
  scale: 0.5,
  rotateWithView: false
});
const STYLE_CROSS_NODE_ACTIVE = createImageIconStyle({
  src: cross_node_active,
  size: [44, 44],
  anchor: [0.5, 0.5],
  scale: 0.5,
  rotateWithView: false
});
export function trackNodeStyleFn(feature) {
  const {
    cross, color, start, end
  } = feature.get('params');
  if (start) return START_NODE_STYLE_CH;
  if (end) return END_NODE_STYLE_CH;
  const { normalStyle } = createTraceNodeStyle(color);
  return cross ? STYLE_CROSS_NODE_NORMAL : normalStyle;
}
export function trackNodeSelectFn(feature) {
  const {
    cross, color, start, end
  } = feature.get('params');
  if (start) return START_NODE_STYLE_CH;
  if (end) return END_NODE_STYLE_CH;
  const { activeStyle } = createTraceNodeStyle(color);
  return cross ? STYLE_CROSS_NODE_ACTIVE : activeStyle;
}
