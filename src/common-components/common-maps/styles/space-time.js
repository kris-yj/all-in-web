import {
  createSvgIconStyle,
  createUniversalStyle,
  createTextStyle
} from '@megvii-gis/core-api/lib/Style';

// -------------通用样式--------------------i
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

const createLocationSvg = function (width, height, innerColor) {
  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  x="0px"
  y="0px"
  width="${width}px"
  height="${height}px"
  viewBox="0 0 30 40">
  <defs>
    <style>
      .cls-map-1{fill:none;}.cls-map-2{fill:${innerColor};}.cls-map-3{fill:#fff;}
    </style>
  </defs>
  <title>地图坐标</title>
  <path
    class="cls-map-1"
    d="M2.19,22.5A14.67,14.67,0,0,1,0,14.81V40H15a1.24,1.24,0,0,1-1-.56Z"
    transform="translate(0 0)"
  />
  <path
    class="cls-map-1"
    d="M15,0H0V14.81A14.92,14.92,0,0,1,15,0Z"
    transform="translate(0 0)"
  />
  <path
    class="cls-map-1"
    d="M16,39.44A1.24,1.24,0,0,1,15,40H30V14.81a14.64,14.64,0,0,1-2.16,7.65Z"
    transform="translate(0 0)"
  />
  <path
    class="cls-map-1"
    d="M15,0A14.92,14.92,0,0,1,30,14.81V0Z"
    transform="translate(0 0)"
  />
  <path
    class="cls-map-2"
    d="M15,0A14.92,14.92,0,0,0,0,14.81a14.67,14.67,0,0,0,2.19,7.7L14,39.44a1.23,1.23,0,0,0,2.07,0l11.81-17A14.64,14.64,0,0,0,30,14.81,14.92,14.92,0,0,0,15,0Z"
    transform="translate(0 0)"
  />
  <ellipse class="cls-map-3" cx="15" cy="15.38" rx="7.5" ry="7.69" />
</svg>`;
};
const LOCATION_STYLE = createSvgIconStyle({
  svg: createLocationSvg(28, 28, '#f05353'),
  size: [28, 28],
  anchor: [0.5, 1],
});

export function locationStyleFn() {
  return LOCATION_STYLE;
}

const createPositionPointSvg = function (width, height, innerColor) {
  return `<svg width="${width}px" height="${height}px" viewBox="0 0 72 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-position-mark" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M14.6900228,33.42 C13.5692458,30.579838 12.9958322,27.5533004 13.0000228,24.5 C13.0000228,11.5 23.2100228,1 35.8000228,1 C48.3900228,1 58.4100228,11.31 58.6000228,24.2 C59.0000228,27.77 57.9100228,32.33 55.4300228,37.88 C52.2600228,43.23 45.7100228,53.35 35.8000228,68.32 C25.9800228,53.32 19.5400228,43.23 16.4700228,37.78 C15.7800228,36.26 15.1800228,34.77 14.6900228,33.42 Z" id="Combined-Shape-4" fill="#FFFFFF" fill-rule="nonzero"></path>
        <path d="M59.6000209,24.19 C59.4000209,10.9 48.7900209,0 35.8000209,0 C22.8100209,0 12.0000209,11 12.0000209,24.49 C11.9959062,27.6815343 12.6000144,30.8446176 13.7800209,33.81 C14.2800209,35.2 14.8700209,36.69 15.6600209,38.37 C18.4400209,43.37 24.1900209,52.45 32.7100209,65.44 C25.4700209,65.74 20.0200209,66.93 20.0200209,68.44 C20.0200209,70.13 27.1600209,71.51 35.8800209,71.51 C44.6000209,71.51 51.7400209,70.12 51.7400209,68.44 C51.7400209,66.95 46.2900209,65.76 39.0500209,65.44 C47.6800209,52.44 53.5300209,43.44 56.4000209,38.44 L56.5000209,38.34 C58.9100209,32.52 60.0000209,27.76 59.6000209,24.19 Z" id="Shape" fill="${innerColor}" fill-rule="nonzero"></path>
    </g>
</svg>`;
};

const POSITION_STYLE_ACTIVE = createSvgIconStyle({
  svg: createPositionPointSvg(24, 24, '#f05353'),
  size: [24, 24]
});
const POSITION_STYLE_NORMAL = createSvgIconStyle({
  svg: createPositionPointSvg(24, 24, '#3a99f1'),
  size: [24, 24]
});
export function positionPointStyleFn(feature) {
  const params = feature.get('params');
  if (params.active === true) {
    return POSITION_STYLE_ACTIVE;
  }
  return POSITION_STYLE_NORMAL;
}

// -------------设备样式--------------------

const DEVICE_WIDTH = 42;
const DEVICE_HEIGHT = 42;
const DEVICE_COLOR_ON = '#46A653';
const DEVICE_COLOR_OFF = '#999';
const DEVICE_COLOR_EX = '#EE6723'; // 异常
const DEVICE_COLOR_SELECTED = '#21539b';
const createCameraSvg = function (width, height, outerColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 43.7 70.5"><defs><style>.cls-map-1{fill:#fff;}.cls-map-2{fill:#1b1a1a;fill-opacity:0.2;}.cls-map-3{fill:${outerColor};}.cls-map-4{fill:none;stroke:#fff;}.cls-map-5{mask:url(#mask);}</style><mask id="mask" x="18.06" y="20.86" width="15.37" height="13.83" maskUnits="userSpaceOnUse"><g id="mask-2"><polygon id="path-1" class="cls-map-1" points="18.1 20.9 33.4 20.9 33.4 34.7 18.1 34.7 18.1 20.9"/></g></mask></defs><g data-name=""><g data-name=""><g id="monitor-copy-32"><g id="Group"><ellipse id="Oval-2" class="cls-map-2" cx="21.8" cy="67.1" rx="9.4" ry="3.4"/><path id="Shape" class="cls-map-3" d="M21.7.5A21.1,21.1,0,0,0,.5,21.7a19.7,19.7,0,0,0,1.4,6.8c1.1,2.9,19,37.7,19,37.7h.2a1.9,1.9,0,0,0,.7.8c.4,0,.5-.2.8-.8h.2s17.9-34.7,19-37.7a19.7,19.7,0,0,0,1.4-6.8A21.4,21.4,0,0,0,21.7.5"/><path id="Shape-2" data-name="Shape" class="cls-map-4" d="M21.7.5A21.1,21.1,0,0,0,.5,21.7a19.7,19.7,0,0,0,1.4,6.8c1.1,2.9,19,37.7,19,37.7h.2a1.9,1.9,0,0,0,.7.8c.4,0,.5-.2.8-.8h.2s17.9-34.7,19-37.7a19.7,19.7,0,0,0,1.4-6.8A21.4,21.4,0,0,0,21.7.5Z"/></g><g id="Group-2" data-name="Group"><path id="Fill-1" class="cls-map-1" d="M8.3,18.9s1.5,2.3,3,2.6L9.5,22.7,7.3,19.5Z"/><path id="Fill-3" class="cls-map-1" d="M20.6,14.1l1.4-1,.9,1.4-1.4.9Zm-12,3.2,2.2,3.1c2.8,2.1,4.6.9,4.6.9l9.7-6.5L21.1,9Z"/><g id="Group-7"><g class="cls-map-5"><path id="Fill-5" class="cls-map-1" d="M20.5,28.2l2.4-2.4,4.1,4,2.4-2.4,2.4,2.4v2.5H20.5Zm9.7-5.6a1.6,1.6,0,1,1-1.6,1.6A1.6,1.6,0,0,1,30.2,22.6ZM18.8,34.7H32.7a.7.7,0,0,0,.7-.8V21.6a.7.7,0,0,0-.7-.7H18.8a.7.7,0,0,0-.7.7V33.9A.7.7,0,0,0,18.8,34.7Z"/></g></g></g></g></g></g></svg>`;
};
const createVideoSvg = function (width, height, outerColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="${width}px" height="${height}px" viewBox="0 0 43.7 70.5"><defs><style>.cls-map-1{fill:#1b1a1a;fill-opacity:0.2;}.cls-map-2{fill:${outerColor};}.cls-map-3,.cls-map-4{fill:none;}.cls-map-3{stroke:#fff;}.cls-map-5{fill:#fff;}</style></defs><g data-name="图层 2"><g data-name="图层 1"><g id="_-" data-name="-"><g id="Group-9"><ellipse id="Oval-2" class="cls-map-1" cx="21.8" cy="67.1" rx="9.4" ry="3.4"/><path id="Shape" class="cls-map-2" d="M21.7.5A21.1,21.1,0,0,0,.5,21.7a19.7,19.7,0,0,0,1.4,6.8c1.1,2.9,19,37.7,19,37.7h.2a1.9,1.9,0,0,0,.7.8c.4,0,.5-.2.8-.8h.2s17.9-34.7,19-37.7a19.7,19.7,0,0,0,1.4-6.8A21.4,21.4,0,0,0,21.7.5"/><path id="Shape-2" data-name="Shape" class="cls-map-3" d="M21.7.5A21.1,21.1,0,0,0,.5,21.7a19.7,19.7,0,0,0,1.4,6.8c1.1,2.9,19,37.7,19,37.7h.2a1.9,1.9,0,0,0,.7.8c.4,0,.5-.2.8-.8h.2s17.9-34.7,19-37.7a19.7,19.7,0,0,0,1.4-6.8A21.4,21.4,0,0,0,21.7.5Z"/><rect class="cls-map-4" x="20.9" y="13.5" width="1.7" height="1.67" transform="translate(-4.3 14.4) rotate(-33.6)"/><path class="cls-map-5" d="M8.3,18.9l-1,.6,2.2,3.2,1.8-1.2C9.8,21.2,8.3,18.9,8.3,18.9Z"/><path class="cls-map-5" d="M21.1,9,8.6,17.3l2.2,3.1c2.8,2.1,4.6.9,4.6.9l9.7-6.5Zm-.5,5.1,1.4-1,.9,1.4-1.4.9Z"/><path class="cls-map-5" d="M24.9,18.6a8.5,8.5,0,0,0,0,17,8.5,8.5,0,1,0,0-17Zm4.9,9-6.7,4.2a.6.6,0,0,1-.9-.5V22.9a.6.6,0,0,1,.9-.5l6.7,4.2A.6.6,0,0,1,29.8,27.6Z"/></g></g></g></g></svg>`;
};

export const DEVICE_IMAGE_NORMAL_STYLE = createSvgIconStyle({
  svg: createCameraSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_ON),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IMAGE_SELECTED_STYLE = createSvgIconStyle({
  svg: createCameraSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_SELECTED),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IMAGE_OFF_STYLE = createSvgIconStyle({
  svg: createCameraSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_OFF),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IMAGE_EX_STYLE = createSvgIconStyle({
  svg: createCameraSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_EX),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_NORMAL_STYLE = createSvgIconStyle({
  svg: createVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_ON),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_SELECTED_STYLE = createSvgIconStyle({
  svg: createVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_SELECTED),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_OFF_STYLE = createSvgIconStyle({
  svg: createVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_OFF),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_VIDEO_EX_STYLE = createSvgIconStyle({
  svg: createVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_EX),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export function deviceStyleFn(feature) {
  const params = feature.get('params');
  switch (params.type) {
    case 2:
    case 3:
    case 11:
    case 12:
      switch (params.selected) {
        case true:
          return DEVICE_IMAGE_SELECTED_STYLE;
        default:
          switch (String(params.status)) {
            case '0':
              return DEVICE_IMAGE_NORMAL_STYLE;
            case '2':
              return DEVICE_IMAGE_EX_STYLE;
            default:
              return DEVICE_IMAGE_OFF_STYLE;
          }
      }
    default:
      switch (params.selected) {
        case true:
          return DEVICE_VIDEO_SELECTED_STYLE;
        default:
          switch (String(params.status)) {
            case '0':
              return DEVICE_VIDEO_NORMAL_STYLE;
            case '2':
              return DEVICE_VIDEO_EX_STYLE;
            default:
              return DEVICE_VIDEO_OFF_STYLE;
          }
      }
  }
}
export const DEVICE_IMAGE_CENTER_STYLE = createSvgIconStyle({
  svg: createCameraSvg(DEVICE_WIDTH, DEVICE_HEIGHT, 'red'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

export function cameraSpaceTimeStyleFn(feature) {
  const params = feature.get('params');
  if (params.center) {
    return DEVICE_IMAGE_CENTER_STYLE;
  }
  switch (params.type) {
    case 2:
    case 3:
    case 11:
    case 12:
      switch (params.selected) {
        case true:
          return DEVICE_IMAGE_SELECTED_STYLE;
        default:
          switch (String(params.status)) {
            case '0':
              return DEVICE_IMAGE_NORMAL_STYLE;
            case '2':
              return DEVICE_IMAGE_EX_STYLE;
            default:
              return DEVICE_IMAGE_OFF_STYLE;
          }
      }
    default:
      switch (params.selected) {
        case true:
          return DEVICE_VIDEO_SELECTED_STYLE;
        default:
          switch (String(params.status)) {
            case '0':
              return DEVICE_VIDEO_NORMAL_STYLE;
            case '2':
              return DEVICE_VIDEO_EX_STYLE;
            default:
              return DEVICE_VIDEO_OFF_STYLE;
          }
      }
  }
}

const createNewCaptureSvg = function (width, height, innerColor, outerColor) {
  console.log(innerColor, outerColor);
  return `<svg width="${width}px" height="${height}px" viewBox="0 0 72 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-POI/img-抓拍机选中" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M14.7004996,32.9504996 C13.5716291,30.1542468 12.9943572,27.1660163 13.0004996,24.1504996 C12.9176569,11.4479504 23.1479504,1.08334231 35.8504996,1.0004996 C48.5530488,0.917656887 58.9176569,11.1479504 59.0004996,23.8504996 C59.4004996,27.3504996 58.3004996,31.7504996 55.8004996,37.2504996 C52.6004996,42.4504996 46.0004996,52.4504996 36.0004996,67.1504996 C26.1004996,52.5504996 19.6004996,42.5504996 16.5004996,37.2504996 C15.8004996,35.7504996 15.2004996,34.2504996 14.7004996,32.9504996 Z" id="Combined-Shape-10" fill="${outerColor}" fill-rule="nonzero"></path>
        <path d="M60.0004788,23.8337676 C59.9176349,10.5882205 49.1053119,-0.0823062123 35.8504788,0.000478457549 C22.5956456,0.0832631274 11.9176373,10.8880103 12.0004788,24.1335574 C11.9885471,27.2542991 12.6005186,30.3459875 13.8004788,33.2271822 C14.3430088,34.73036 14.9775399,36.1987712 15.7004788,37.6240997 C18.6004788,42.7205268 24.9004788,52.3138013 34.2004788,66.0042034 C26.2004788,66.2040633 20.1004788,67.4032226 20.1004788,69.0021017 C20.1004788,70.6009808 27.3004788,72 36.1004788,72 C44.9004788,72 52.1004788,70.7009107 52.1004788,69.0021017 C52.1004788,67.5031526 45.9004788,66.2040633 38.0004788,66.0042034 C47.4004788,52.2138713 53.8004788,42.7205268 56.8004788,37.6240997 L56.9004788,37.5241698 C59.3004788,32.2278828 60.4004788,27.5711475 60.0004788,23.8337676 Z M54.9004788,36.9245901 C51.8004788,42.0210172 45.5004788,51.6142917 36.0004788,65.4046238 C26.6004788,51.5143617 20.3004788,41.9210872 17.4004788,36.8246602 C16.7004788,35.325711 16.1004788,33.9266918 15.6004788,32.6276026 L15.6004788,32.6276026 C12.1792032,24.4401749 14.0182565,15.0001442 20.2632424,8.69320522 C26.5082284,2.3862662 35.9349067,0.448804118 44.1637861,3.78093437 C52.3926656,7.11306462 57.8105918,15.0615707 57.9004788,23.9336976 L57.9004788,24.0336275 C58.3004788,27.3313156 57.3004788,31.6283031 54.9004788,36.9245901 Z" id="Shape" fill="#46A653" fill-rule="nonzero"></path>
        <path d="M23.2,26.5 L20.6,22 L17,24.1 L21.1,31.3 L25.4,28.8 C24.4754484,28.2422823 23.7160962,27.4484141 23.2,26.5 L23.2,26.5 Z" id="Shape" fill="${innerColor}" fill-rule="nonzero"></path>
        <path d="M42.6,7 L22,18.9 L25.1,24.3 C25.9190161,25.7355353 27.2764883,26.7853701 28.871855,27.2170575 C30.4672218,27.648745 32.168858,27.426669 33.6,26.6 L48.8,17.8 L42.6,7 Z M41.8,15.8 L44.5,14.2 L46.1,16.9 L43.4,18.5 L41.8,15.8 Z" id="Shape" fill="${innerColor}" fill-rule="nonzero"></path>
        <path d="M50.2,27.0007246 L35.8,27.0007246 C35.3892087,26.9830369 35.0369986,27.2912207 35,27.7007246 L35,39.3407246 C35.0369986,39.7502285 35.3892087,40.0584123 35.8,40.0407246 L50.2,40.0407246 C50.6107913,40.0584123 50.9630014,39.7502285 51,39.3407246 L51,27.7407246 C50.9921967,27.5364544 50.9034876,27.3436705 50.7534235,27.2048613 C50.6033595,27.0660521 50.4042581,26.9926112 50.2,27.0007246 L50.2,27.0007246 Z M49,38.0007246 L37,38.0007246 L37,34.2007246 L39.6,32.0007246 L43.9,35.7007246 L46.5,33.5007246 L49.1,35.7007246 L49.1,38.0007246 L49,38.0007246 Z M47,33.0007246 C45.8954305,33.0007246 45,32.1052941 45,31.0007246 C45,29.8961551 45.8954305,29.0007246 47,29.0007246 C48.1045695,29.0007246 49,29.8961551 49,31.0007246 C49,32.1052941 48.1045695,33.0007246 47,33.0007246 Z" id="Shape" fill="${innerColor}" fill-rule="nonzero"></path>
    </g>
  </svg>`;
};
const createNewVideoSvg = function (width, height, innerColor, outerColor) {
  console.log(innerColor, outerColor);
  return `<svg width="${width}px" height="${height}px" viewBox="0 0 72 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-POI/cam-视频流相机" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M14.6900228,33.42 C13.5692458,30.579838 12.9958322,27.5533004 13.0000228,24.5 C13.0000228,11.5 23.2100228,1 35.8000228,1 C48.3900228,1 58.4100228,11.31 58.6000228,24.2 C59.0000228,27.77 57.9100228,32.33 55.4300228,37.88 C52.2600228,43.23 45.7100228,53.35 35.8000228,68.32 C25.9800228,53.32 19.5400228,43.23 16.4700228,37.78 C15.7800228,36.26 15.1800228,34.77 14.6900228,33.42 Z" id="Combined-Shape-4" fill="${outerColor}" fill-rule="nonzero"></path>
        <path d="M23.16,28.56 C23.6403716,29.5189779 24.3959275,30.3128339 25.33,30.84 L21.07,33.42 L17,26.08 L20.57,24 L23.16,28.56 Z M41.43,9 L47.57,19.91 L32.5,28.83 C31.0915519,29.6952307 29.3885417,29.9410744 27.7928904,29.5095104 C26.1972392,29.0779463 24.8503149,28.0072093 24.07,26.55 L21,21.1 L41.43,9 Z M40.64,18 L42.23,20.78 L44.91,19.19 L43.32,16.41 L40.64,18 Z M50.32,28 C50.6932438,28.0108232 50.9901569,28.3165993 50.99,28.69 L50.99,40.2 C50.9846074,40.6340517 50.6340517,40.9846074 50.2,40.99 L35.69,40.99 C35.3111719,40.9846257 35.0053743,40.6788281 35,40.3 L35,28.79 C35.0053926,28.3559483 35.3559483,28.0053926 35.79,28 L50.32,28 Z M46.79,34.69 C46.9153641,34.5763058 46.9825863,34.4120153 46.9728758,34.2430531 C46.9631653,34.0740909 46.877564,33.9185834 46.74,33.82 L40.79,29.75 C40.619196,29.6605914 40.4136814,29.6690255 40.2507779,29.772129 C40.0878743,29.8752325 39.992295,30.0573642 40,30.25 L40,38.25 C40.0035435,38.4381781 40.1013791,38.6119907 40.2604141,38.7126457 C40.4194491,38.8133008 40.6184105,38.8273345 40.79,38.75 L46.79,34.69 Z" id="形状结合" fill="${innerColor}" fill-rule="nonzero"></path>
        <path d="M59.1400037,24 C58.9400037,10.84 48.4400037,0 35.5700037,0 C22.7000037,0 12.0000037,10.9 12.0000037,24.26 C11.9982788,27.4211737 12.598994,30.5537169 13.7700037,33.49 C14.2600037,34.86 14.8500037,36.34 15.6400037,38.01 C18.3900037,42.92 24.0900037,51.96 32.5300037,64.82 C25.3600037,65.11 19.9600037,66.29 19.9600037,67.77 C19.9600037,69.44 27.0300037,70.77 35.6700037,70.77 C44.3100037,70.77 51.3800037,69.4 51.3800037,67.77 C51.3800037,66.3 45.9800037,65.12 38.8100037,64.82 C47.3500037,51.96 53.1500037,43.02 56.0000037,38.11 L56.1000037,38.01 C58.4500037,32.28 59.5300037,27.56 59.1400037,24 Z M54.1400037,37.16 C51.1400037,42.27 44.9100037,51.99 35.5800037,66.03 C26.3500037,52.03 20.1600037,42.26 17.3100037,37.16 C16.6200037,35.69 16.0300037,34.21 15.5400037,32.84 L15.5400037,32.84 C14.4409583,30.1267303 13.8739949,27.227408 13.8700037,24.3 C13.8700037,12.02 23.5900037,2.01 35.4800037,2.01 C47.3700037,2.01 56.9900037,11.83 57.0900037,24.11 C57.4700037,27.47 56.4900037,31.79 54.1300037,37.19 L54.1400037,37.16 Z" id="Shape" fill="#46A653" fill-rule="nonzero"></path>
    </g>
</svg>`;
};

const createStructureSvg = function (width, height, innerColor, outerColor) {
  console.log(innerColor, outerColor);
  return `<svg width="${width}px" height="${height}px" viewBox="0 0 72 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-POI/cam-结构化相机" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M14.6900228,33.42 C13.5692458,30.579838 12.9958322,27.5533004 13.0000228,24.5 C13.0000228,11.5 23.2100228,1 35.8000228,1 C48.3900228,1 58.4100228,11.31 58.6000228,24.2 C59.0000228,27.77 57.9100228,32.33 55.4300228,37.88 C52.2600228,43.23 45.7100228,53.35 35.8000228,68.32 C25.9800228,53.32 19.5400228,43.23 16.4700228,37.78 C15.7800228,36.26 15.1800228,34.77 14.6900228,33.42 Z" id="Combined-Shape-4" fill="${outerColor}" fill-rule="nonzero"></path>
        <path d="M35.0555556,29.6444444 L44.0277778,25.1111111 L53,29.6444444 L53,39.4666667 L44.0277778,44 L35.0555556,39.4666667 L35.0555556,29.6444444 Z M38.0100403,30.1494926 L43.9901275,33.1161669 L49.9702147,30.2185445 L43.9901275,27.2977622 L38.0100403,30.1494926 Z M42.9052571,35.0028683 L37.1566107,32.0831901 L37.1566107,38.2301786 L42.9052571,41.1498568 L42.9052571,35.0028683 Z M45.1502984,35.0028683 L45.1502984,41.1498568 L50.8989449,38.2301786 L50.8989449,32.0831901 L45.1502984,35.0028683 Z M24.6345556,27.4755278 C25.1506944,28.3666111 25.8736667,29.0645556 26.7085556,29.5438611 L22.7787222,31.8043889 L19,25.2815833 L22.2725,23.3988333 L24.6345556,27.4755278 Z M40.9977167,18.0608333 L42.4148556,20.5069444 L44.8694667,19.0945278 L43.4523278,16.6488889 L40.9977167,18.0608333 Z M41.7820778,10 L47.4506333,19.7839722 L33.5413278,27.78625 C30.8303,29.346 27.3637167,28.4204444 25.7983,25.7188611 L22.9644944,20.8266389 L41.7820778,10 Z" id="形状结合" fill="${innerColor}"></path>
        <path d="M59.6000209,24.19 C59.4000209,10.9 48.7900209,0 35.8000209,0 C22.8100209,0 12.0000209,11 12.0000209,24.49 C11.9959062,27.6815343 12.6000144,30.8446176 13.7800209,33.81 C14.2800209,35.2 14.8700209,36.69 15.6600209,38.37 C18.4400209,43.37 24.1900209,52.45 32.7100209,65.44 C25.4700209,65.74 20.0200209,66.93 20.0200209,68.44 C20.0200209,70.13 27.1600209,71.51 35.8800209,71.51 C44.6000209,71.51 51.7400209,70.12 51.7400209,68.44 C51.7400209,66.95 46.2900209,65.76 39.0500209,65.44 C47.6800209,52.44 53.5300209,43.44 56.4000209,38.44 L56.5000209,38.34 C58.9100209,32.52 60.0000209,27.76 59.6000209,24.19 Z M54.5300209,37.45 C51.4600209,42.61 45.2100209,52.45 35.7900209,66.6 C26.5300209,52.45 20.2400209,42.64 17.3700209,37.45 C16.6800209,35.96 16.0800209,34.45 15.5900209,33.09 L15.5900209,33.09 C14.4780771,30.3484457 13.9043036,27.4184659 13.9000209,24.46 C13.9000209,12.07 23.7200209,1.95 35.7100209,1.95 C47.7000209,1.95 57.4200209,11.87 57.5200209,24.26 C57.9200209,27.66 56.9300209,32.03 54.5300209,37.45 Z" id="Shape" fill="#46A653" fill-rule="nonzero"></path>
    </g>
</svg>`;
};

const createIdentifySvg = function (width, height, innerColor, outerColor) {
  console.log(innerColor, outerColor);
  return `<svg width="${width}px" height="${height}px" viewBox="0 0 72 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-POI/img-识别机" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M14.67004,33.11 C13.561136,30.2949411 12.9945165,27.2955899 13.00004,24.27 C13.00004,11.41 23.12004,1 35.59004,1 C48.06004,1 57.98004,11.21 58.18004,24 C58.57004,27.54 57.49004,32.05 55.04004,37.55 C51.90004,42.85 45.42004,52.87 35.60004,67.7 C25.88004,52.87 19.49004,42.85 16.45004,37.45 C15.75004,35.95 15.16004,34.49 14.67004,33.11 Z" id="Combined-Shape-9" fill="${outerColor}" fill-rule="nonzero"></path>
        <path d="M22.966,26.5035 C23.5125,27.447 24.278,28.186 25.162,28.6935 L21.001,31.087 L17,24.1805 L20.465,22.187 L22.966,26.5035 Z M40.2917,16.535 L41.7922,19.125 L44.3912,17.6295 L42.8907,15.04 L40.2917,16.535 Z M41.1222,8 L47.1242,18.3595 L32.3967,26.8325 C29.5262,28.484 25.8557,27.504 24.1982,24.6435 L21.1977,19.4635 L41.1222,8 Z M35.006,26 L38.657106,26 L38.657106,26.9144508 L35.9046654,26.9144508 L35.9046654,29.6571365 L35.006,29.6500253 L35.006,26 Z M47.3427829,26 L50.9998889,26 L50.9998889,29.6571365 L50.0858902,29.6571365 L50.0858902,26.9144508 L47.3427829,26.9144508 L47.3427829,26 Z M35,38.3430857 L35.914221,38.3430857 L35.914221,41.0859937 L38.657106,41.0859937 L38.657106,42 L35,42 L35,38.3430857 Z M50.085779,38.3430857 L51,38.3430857 L51,42 L47.3426717,42 L47.3426717,41.0859937 L50.085779,41.0859937 L50.085779,38.3430857 Z M35.5,33 L50.5,33 C50.7761424,33 51,33.2238576 51,33.5 L51,34.5 C51,34.7761424 50.7761424,35 50.5,35 L35.5,35 C35.2238576,35 35,34.7761424 35,34.5 L35,33.5 C35,33.2238576 35.2238576,33 35.5,33 Z M48.6585886,36 C48.2467409,37.1652243 47.4851726,38.1652473 46.5,38.8739526 L46.5,36 L48.6585886,36 Z M45.5,36 L45.5,39.4559578 C45.180753,39.6024812 44.8464309,39.7218086 44.5,39.8109738 L44.5,36 L45.5,36 Z M43.5,36 L43.5,39.9794631 C43.3351333,39.9930643 43.1683766,40 43,40 C42.8316234,40 42.6648667,39.9930643 42.5,39.9794631 L42.5,36 L43.5,36 Z M41.5,36 L41.5,39.8109738 C41.1535691,39.7218086 40.819247,39.6024812 40.5,39.4559578 L40.5,36 L41.5,36 Z M39.5,36 L39.5,38.8739526 C38.5148274,38.1652473 37.7532591,37.1652243 37.3414114,36 L39.5,36 Z M48.6585886,32 L37.3414114,32 C38.1650842,29.6696153 40.3875623,28 43,28 C45.6124377,28 47.8349158,29.6696153 48.6585886,32 Z" id="形状结合" fill="${innerColor}"></path>
        <path d="M59.1400037,24 C58.9400037,10.84 48.4400037,0 35.5700037,0 C22.7000037,0 12.0000037,10.9 12.0000037,24.26 C11.9982788,27.4211737 12.598994,30.5537169 13.7700037,33.49 C14.2600037,34.86 14.8500037,36.34 15.6400037,38.01 C18.3900037,42.92 24.0900037,51.96 32.5300037,64.82 C25.3600037,65.11 19.9600037,66.29 19.9600037,67.77 C19.9600037,69.44 27.0300037,70.77 35.6700037,70.77 C44.3100037,70.77 51.3800037,69.4 51.3800037,67.77 C51.3800037,66.3 45.9800037,65.12 38.8100037,64.82 C47.3500037,51.96 53.1500037,43.02 56.0000037,38.11 L56.1000037,38.01 C58.4500037,32.28 59.5300037,27.56 59.1400037,24 Z M54.1400037,37.16 C51.1400037,42.27 44.9100037,51.99 35.5800037,66.03 C26.3500037,52.03 20.1600037,42.26 17.3100037,37.16 C16.6200037,35.69 16.0300037,34.21 15.5400037,32.84 L15.5400037,32.84 C14.4409583,30.1267303 13.8739949,27.227408 13.8700037,24.3 C13.8700037,12.02 23.5900037,2.01 35.4800037,2.01 C47.3700037,2.01 56.9900037,11.83 57.0900037,24.11 C57.4700037,27.47 56.4900037,31.79 54.1300037,37.19 L54.1400037,37.16 Z" id="形状结合" fill="#46A653" fill-rule="nonzero"></path>
    </g>
  </svg>`;
};

const createSpaceTimeSvg = function (width, height) {
  return `<svg width="${width}px" height="${height}px" viewBox="0 0 72 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="icon-POI/img-小时空信息" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M35,71.9863792 C16.2468319,71.47492 1.0743153,56.6220714 0.0546167607,38 L3.05961011,38 C4.07376531,54.9645507 17.9039503,68.4763182 35,68.9851378 L35,71.9863792 Z M0.0546167607,34 C1.0743153,15.3779286 16.2468319,0.525079987 35,0.0136208257 L35,3.01486223 C17.9039503,3.52368178 4.07376531,17.0354493 3.05961011,34 L0.0546167607,34 Z M39,0.123221331 C56.8214673,1.59346238 70.9621929,16.0446532 71.9453832,34 L68.9403899,34 C67.9660928,17.7021857 55.1633544,4.59108693 39,3.13452905 L39,0.123221331 Z M71.9453832,38 C70.9621929,55.9553468 56.8214673,70.4065376 39,71.8767787 L39,68.865471 C55.1633544,67.4089131 67.9660928,54.2978143 68.9403899,38 L71.9453832,38 Z" id="形状结合" fill="#46A653"></path>
        <rect id="矩形" fill="#FFFFFF" x="13" y="13" width="46" height="46" rx="23"></rect>
        <path d="M36,13 C48.7025492,13 59,23.2974508 59,36 C59,48.7025492 48.7025492,59 36,59 C23.2974508,59 13,48.7025492 13,36 C13,23.2974508 23.2974508,13 36,13 Z M34.125847,24.0499837 L34.2925135,24.3833193 L33.6258477,24.2166515 L32.8765154,24.6330988 L32.4600716,25.2997701 L31.376962,26.0491087 L30.2107414,27.7153425 L30.5440742,27.6317863 L30.205408,28.1926791 C30.205408,28.1926791 30.0929638,28.329569 30.0445194,29.1313523 L30.2942968,29.0477962 L30.1276304,29.8220238 L30.2942968,29.714023 L30.3774078,30.7135855 L30.6276297,31.713148 L30.2107414,31.8798158 L29.9609639,32.462931 L30.4609632,34.2953882 L30.8774071,34.6287238 L31.2102955,34.6287238 L31.7934058,36.5442927 L32.2098497,37.3771873 L32.2934051,39.210089 C32.2934051,39.210089 31.7547392,41.3634372 30.2107414,41.7918847 C28.7116323,42.208332 27.6378561,42.7478913 25.8796363,43.1247828 C24.7134157,43.3745623 24.1791942,44.1843457 24.1791942,45.6003556 L47.8018281,45.6003556 C47.8018281,45.6003556 47.5956061,43.8314544 46.4538299,43.3745623 C44.78761,42.7083355 42.7885017,42.3749998 41.3725036,41.8754408 C40.2618385,41.4834381 39.3733953,39.1265328 39.3733953,39.1265328 L39.2902843,37.210964 L39.5400617,36.5442927 L40.2067275,34.2953882 L40.4565049,34.3789443 L40.7893933,34.1287203 L41.2058372,32.5464871 L41.1227262,31.7967041 L40.7062824,31.5469246 L41.2893927,29.4642435 C41.2893927,29.4642435 40.9560598,26.7988917 39.0405069,26.0491087 C39.0405069,26.0491087 37.7076199,23.716648 34.5422909,23.716648 L35.0422902,24.2997632 L34.125847,24.0499837 Z" id="抓拍检索" fill="#46A653"></path>
    </g>
</svg>`;
};

// 结构化两个
export const DEVICE_STRUCTURE_STYLE = createSvgIconStyle({
  svg: createStructureSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_ON, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_STRUCTURE_OFF_STYLE = createSvgIconStyle({
  svg: createStructureSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_OFF, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_STRUCTURE_SELECTED_STYLE = createSvgIconStyle({
  svg: createStructureSvg(DEVICE_WIDTH, DEVICE_HEIGHT, '#FFF', DEVICE_COLOR_ON),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

// 识别机两个

export const DEVICE_IDENTIFY_STYLE = createSvgIconStyle({
  svg: createIdentifySvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_ON, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IDENTIFY_OFF_STYLE = createSvgIconStyle({
  svg: createIdentifySvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_OFF, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_IDENTIFY_SELECTED_STYLE = createSvgIconStyle({
  svg: createIdentifySvg(DEVICE_WIDTH, DEVICE_HEIGHT, '#FFF', DEVICE_COLOR_ON),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

// 抓拍机两个

export const DEVICE_CAPTURE_STYLE = createSvgIconStyle({
  svg: createNewCaptureSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_ON, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_CAPTURE_OFF_STYLE = createSvgIconStyle({
  svg: createNewCaptureSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_OFF, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_CAPTURE_SELECTED_STYLE = createSvgIconStyle({
  svg: createNewCaptureSvg(DEVICE_WIDTH, DEVICE_HEIGHT, '#FFF', DEVICE_COLOR_ON),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
// 视频流机两个

export const DEVICE_VIDEO_STYLE = createSvgIconStyle({
  svg: createNewVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_ON, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_NEW_VIDEO_OFF_STYLE = createSvgIconStyle({
  svg: createNewVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, DEVICE_COLOR_OFF, '#FFF'),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});
export const DEVICE_NEW_VIDEO_SELECTED_STYLE = createSvgIconStyle({
  svg: createNewVideoSvg(DEVICE_WIDTH, DEVICE_HEIGHT, '#FFF', DEVICE_COLOR_ON),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 1],
});

// 小时空
export const SPACE_TIME_STYLE = createSvgIconStyle({
  svg: createSpaceTimeSvg(DEVICE_WIDTH, DEVICE_HEIGHT),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 0.5],
});
export const SPACE_TIME_OFF_STYLE = createSvgIconStyle({
  svg: createSpaceTimeSvg(DEVICE_WIDTH, DEVICE_HEIGHT),
  size: [DEVICE_WIDTH, DEVICE_HEIGHT],
  anchor: [0.5, 0.5],
});

export function spaceTimeStyleFn(feature) {
  const params = feature.get('params');
  switch (params.type) {
    case 1:
      return DEVICE_VIDEO_STYLE;
    case 2:
      return DEVICE_CAPTURE_STYLE;
    case 13:
      return DEVICE_IDENTIFY_STYLE;
    case 14:
      return DEVICE_STRUCTURE_STYLE;
    default:
      return DEVICE_CAPTURE_STYLE;
  }
}
export function spaceTimeOfflineStyleFn(feature) {
  const params = feature.get('params');
  switch (params.type) {
    case 1:
      return DEVICE_NEW_VIDEO_OFF_STYLE;
    case 2:
      return DEVICE_CAPTURE_OFF_STYLE;
    case 13:
      return DEVICE_IDENTIFY_OFF_STYLE;
    case 14:
      return DEVICE_STRUCTURE_OFF_STYLE;
    default:
      return DEVICE_NEW_VIDEO_OFF_STYLE;
  }
}
export const styleLayerFn = () => createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: '#1057A2'
  },
  lineDash: [2, 8],
  backgroundColor: 'rgba(70,166,83,0.10)',
  borderColor: '#46A653',
  borderWidth: 2
});

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
