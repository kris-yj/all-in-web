// 轨迹追踪和目标分析轨迹分析将数组拍平
const flatten = (arr) => {
  const results = [];
  for (let i = 0; i < arr.length; i += 1) {
    const {
      listResults, displayName, count, proportion
    } = arr[i];
    for (let j = 0; j < listResults.length; j += 1) {
      if (listResults[j].latitude && listResults[j].longitude) {
        results.push({
          ...listResults[j],
          displayName,
          count,
          proportion: proportion || '',
          lat: listResults[j].latitude,
          lon: listResults[j].longitude
        });
      }
    }
  }
  return results;
};
// 相机icon
const CAMERA_ICON = `<svg version="1.1" color="#FFFFFF #46A653 #46A653" id="图层_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 72 72" style="enable-background:new 0 0 72 72;" xml:space="preserve">
<g>
<path fill="#46A653" d="M14.7,33c-1.1-2.8-1.7-5.8-1.7-8.8C12.9,11.4,23.1,1.1,35.9,1S58.9,11.1,59,23.9c0.4,3.5-0.7,7.9-3.2,13.4
C52.6,42.5,46,52.5,36,67.2c-9.9-14.6-16.4-24.6-19.5-29.9C15.8,35.8,15.2,34.3,14.7,33z"/>
<path fill="#19805F" d="M54.9,36.9C51.8,42,45.5,51.6,36,65.4c-9.4-13.9-15.7-23.5-18.6-28.6c-0.7-1.5-1.3-2.9-1.8-4.2
C12.2,24.4,14,15,20.3,8.7c6.2-6.3,15.7-8.2,23.9-4.9s13.6,11.3,13.7,20.2V24C58.3,27.3,57.3,31.6,54.9,36.9z M60,23.8
C59.9,10.6,49.1-0.1,35.9,0C22.6,0.1,11.9,10.9,12,24.1c0,3.1,0.6,6.2,1.8,9.1c0.5,1.5,1.2,3,1.9,4.4c2.9,5.1,9.2,14.7,18.5,28.4
c-8,0.2-14.1,1.4-14.1,3c0,1.6,7.2,3,16,3s16-1.3,16-3c0-1.5-6.2-2.8-14.1-3c9.4-13.8,15.8-23.3,18.8-28.4l0.1-0.1
C59.3,32.2,60.4,27.6,60,23.8z"/>
<path fill="#FFFFFF" d="M47,33c1.1,0,2-0.9,2-2c0-1.1-0.9-2-2-2s-2,0.9-2,2C45,32.1,45.9,33,47,33z M49,38L49,38l0.1-2.3l-2.6-2.2
l-2.6,2.2L39.6,32L37,34.2V38H49z M50.2,27c0.2,0,0.4,0.1,0.6,0.2c0.2,0.1,0.2,0.3,0.2,0.5v11.6c0,0.4-0.4,0.7-0.8,0.7H35.8
c-0.4,0-0.8-0.3-0.8-0.7V27.7c0-0.4,0.4-0.7,0.8-0.7H50.2z M41.8,15.8l1.6,2.7l2.7-1.6l-1.6-2.7L41.8,15.8z M42.6,7l6.2,10.8
l-15.2,8.8c-1.4,0.8-3.1,1-4.7,0.6c-1.6-0.4-3-1.5-3.8-2.9L22,18.9L42.6,7z M23.2,26.5c0.5,0.9,1.3,1.7,2.2,2.3l-4.3,2.5L17,24.1
l3.6-2.1L23.2,26.5z"/>
</g>
</svg>`;
//  脸，人，机，非，机动车牌，非机动车牌
const categoriesName = {
  1: {
    name: '人脸',
    label: 'compareFaceSets'
  },
  2: {
    name: '人体',
    label: 'compareBodySets'
  },
  3: {
    name: '机动车',
    label: 'compareMotorSets'
  },
  4: {
    name: '非机动车',
    label: 'compareNonMotorSets'
  },
  5: {
    name: '机动车车牌',
    label: 'compareMotorLicenseSets'
  },
  6: {
    name: '非机动车车牌',
    label: 'compareNonMotorLicenseSets'
  },
};

export {
  flatten,
  CAMERA_ICON,
  categoriesName
};
