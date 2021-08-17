import { createSvgIconStyle, createUniversalStyle } from '@megvii-gis/core-api/lib/Style';

const createHxHomeCameraSvg = function createHxHomeCameraSvg(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 22 22"><defs><style>.cls-map-1{stroke:#7bb8ff;fill:url(#未命名的渐变);}.cls-map-2{fill:#041440;}</style><linearGradient id="未命名的渐变" x1="-279.5" y1="389.71" x2="-279.5" y2="388.75" gradientTransform="matrix(21, 0, 0, -21, 5880.5, 8184.5)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7c8ad1"/><stop offset="0.12" stop-color="#6b9aff"/><stop offset="0.85" stop-color="#0078ff"/><stop offset="1" stop-color="#558bff"/></linearGradient></defs><title>资源 1</title><g id="layer_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><g id="人像卡口icon2"><g id="人像卡口icon"><circle id="椭圆形" class="cls-map-1" cx="11" cy="11" r="10.5"/><path id="合并形状" class="cls-map-2" d="M5.62,12.39a2.13,2.13,0,0,0,.94,1L4.74,14.49,3,11.32l1.52-.9Zm6.9-.51.77,1.49H17V15H12.14l-1.35-2.19ZM13.84,4l2.62,4.71L10,12.56a2.54,2.54,0,0,1-3.6-1L5.12,9.22ZM13.5,7.9l.68,1.19,1.14-.68-.68-1.2Z"/></g></g></g></g></svg>`;
};
const createHxHomeCameraHoverSvg = function createHxHomeCameraHoverSvg(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 20.5 30.8"><defs><style>.cls-map-1{fill:url(#未命名的渐变);}.cls-map-2{fill:#041440;}</style><linearGradient id="未命名的渐变" x1="-44.14" y1="31.78" x2="-44.14" y2="30.82" gradientTransform="matrix(19.95, 0, 0, -30.43, 891.32, 968.35)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7c8ad1"/><stop offset="0.12" stop-color="#6b9aff"/><stop offset="0.85" stop-color="#0078ff"/><stop offset="1" stop-color="#558bff"/></linearGradient></defs><title>人像卡口</title><path id="Shape" class="cls-map-1" d="M20.6,10.7A9.67,9.67,0,0,0,10.8,1h-.2A10,10,0,0,0,.7,11.1v.1a10.88,10.88,0,0,0,.6,3.6,15.39,15.39,0,0,0,.8,1.9c1.2,2.2,3.8,6.2,7.6,12-3.4.1-6.1.6-6.1,1.4s3.1,1.3,7,1.3,7-.6,7-1.3-2.4-1.3-5.9-1.4c3.9-5.8,6.4-9.7,7.7-11.9A11.73,11.73,0,0,0,20.6,10.7Z" transform="translate(-0.6 -0.6)"/><path class="cls-map-2" d="M10.8.6A10.25,10.25,0,0,0,.6,11.1h0a11,11,0,0,0,.8,4A15.39,15.39,0,0,0,2.2,17c1.3,2.4,4.2,6.9,8.5,13.4l.2.3.2-.3c4.3-6.5,7.3-11,8.6-13.4a12.6,12.6,0,0,0,1.4-6A10.5,10.5,0,0,0,10.8.6Zm8.4,16.3h0C17.9,19.2,15,23.6,10.8,30c-4.2-6.4-7-10.8-8.3-13.1-.3-.7-.5-1.3-.8-1.9A13.36,13.36,0,0,1,1,11.1,9.94,9.94,0,0,1,10.8,1a9.92,9.92,0,0,1,9.8,10A13.8,13.8,0,0,1,19.2,16.9Z" transform="translate(-0.6 -0.6)"/><path class="cls-map-2" d="M5,11.7l-1.1-2-1.6.9,1.8,3.2L6,12.7A2.41,2.41,0,0,1,5,11.7Z" transform="translate(-0.6 -0.6)"/><path class="cls-map-2" d="M13.4,3.2l-9,5.3,1.4,2.4c0,.1.1.1.1.2a2.61,2.61,0,0,0,3.6.8L16.1,8Zm-.3,4,1.2-.7L15,7.7l-1.2.7Z" transform="translate(-0.6 -0.6)"/><path class="cls-map-2" d="M16.8,12.3H10.5a.27.27,0,0,0-.3.3v5.2a.32.32,0,0,0,.3.3h6.3c.2,0,.3-.1.4-.3V12.6C17.1,12.5,16.9,12.3,16.8,12.3Zm-1.4.9a.86.86,0,0,1,.8.8.85.85,0,0,1-.8,1,.71.71,0,0,1-.6-.3c-.2-.2-.3-.4-.2-.6A.77.77,0,0,1,15.4,13.2Zm.8,4.1H11V15.6l1.1-1L14,16.3l1.1-1,1.1,1Z" transform="translate(-0.6 -0.6)"/></svg>`;
};
// 图标尺寸常量
const HX_SIZE_CAMERA_WIDTH = 36;
const HX_SIZE_CAMERA_HEIGHT = 36;
const SVG_HX_CAMERA_SELECT = createSvgIconStyle({
  svg: createHxHomeCameraSvg(HX_SIZE_CAMERA_WIDTH, HX_SIZE_CAMERA_HEIGHT, '#104982', '#15330'),
  size: [HX_SIZE_CAMERA_WIDTH, HX_SIZE_CAMERA_HEIGHT]
});
const SVG_HX_CAMERA_HOVER = createSvgIconStyle({
  svg: createHxHomeCameraHoverSvg(HX_SIZE_CAMERA_WIDTH, HX_SIZE_CAMERA_HEIGHT, '#104982', '#15330'),
  size: [HX_SIZE_CAMERA_WIDTH, HX_SIZE_CAMERA_HEIGHT]
});

export const deviceStyleFn = (feature) => {
  const params = feature.get('params');
  if (params && params.selected) {
    return SVG_HX_CAMERA_HOVER;
  }
  return SVG_HX_CAMERA_SELECT;
};

export const deviceSelectStyleFn = () => SVG_HX_CAMERA_HOVER;

// 聚类样式
const STATICLAVEL = [21, 29, 37, 49];
export const hxCreateRadius = (bg = 'rgba(0,120,255,.3)') => {
  const map = {};
  ['single', 'small', 'middle', 'large'].forEach((item, index) => {
    map[item] = createUniversalStyle({
      image: {
        type: 'circle',
        radius: STATICLAVEL[index],
        borderColor: '#0078FF',
        borderWidth: 2,
        backgroundColor: bg
      },
      text: {
        text: ''
      }
    });
  });
  return map;
};
