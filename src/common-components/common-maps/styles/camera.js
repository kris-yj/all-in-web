import {
  styleImgFn
} from '@megvii-gis/style-sets';
import cameraDefaultSelect from '../images/default-active.png';
import cameraAnalysisSelect from '../images/default-analysis-active.png';
import camreaDefault from '../images/default.png';
import cameraAnalysis from '../images/default-analysis.png';
import cameraNotAnalysis from '../images/default-noanalysis.png';
import cameraOff from '../images/default-off.png';
import cameraNotAnalysisSelect from '../images/default-noanalysis-active.png';
import cameraOffSelect from '../images/default-off-active.png';

console.log(camreaDefault);

const deviceStyleFn = function ({ image: imageSrc }) {
  return styleImgFn({
    src: imageSrc,
    width: 56,
    height: 56,
    scale: 0.5,
    anchor: [0.5, 1]
  });
};

export const camreaDefaultStyle = deviceStyleFn({
  image: camreaDefault
});

export const cameraAnalysisStyle = deviceStyleFn({
  image: cameraAnalysis
});
export const cameraNotAnalysisStyle = deviceStyleFn({
  image: cameraNotAnalysis
});
export const cameraOffStyle = deviceStyleFn({
  image: cameraOff
});
export const cameraDefaultSelectStyle = deviceStyleFn({
  image: cameraDefaultSelect
});
export const cameraAnalysisSelectStyle = deviceStyleFn({
  image: cameraAnalysisSelect
});
export const cameraNotAnalysisSelectStyle = deviceStyleFn({
  image: cameraNotAnalysisSelect
});
export const cameraOffSelectStyle = deviceStyleFn({
  image: cameraOffSelect
});

export function cameraStyleFn(feature) {
  const params = feature.get('params');
  if (!params) {
    return camreaDefaultStyle;
  }
  const status = params.status ? params.status.toString() : '0';
  const { analysis } = params;

  if (analysis) {
    switch (status) {
      case '0':
      case '5':
        if (params.selected) {
          return cameraAnalysisSelectStyle;
        }
        return cameraAnalysisStyle;
      case '1':
      case '2':
      case '3':
        if (params.selected) {
          return cameraNotAnalysisSelectStyle;
        }
        return cameraNotAnalysisStyle;

      default:
        return cameraAnalysisStyle;
    }
  } else {
    switch (status) {
      case '2':
        if (params.selected) {
          return cameraOffSelectStyle;
        }
        return cameraOffStyle;
      case '0':
      case '1':
      case '3':
      case '5':
        if (params.selected) return cameraDefaultSelectStyle;
        return camreaDefaultStyle;
      default:
        return camreaDefaultStyle;
    }
  }
}

export function cameraSelectStyleFn(feature) {
  const params = feature.get('params');
  if (!params) {
    return cameraDefaultSelectStyle;
  }
  const status = params.status ? params.status.toString() : '0';
  const { analysis } = params;

  switch (status) {
    case '2':
      return cameraOffSelectStyle;
    case '0':
    case '5':
      if (!analysis) {
        return cameraDefaultSelectStyle;
      }
      return cameraAnalysisSelectStyle;
    case '1':
    case '3':
      if (!analysis) {
        return cameraDefaultSelectStyle;
      }
      return cameraNotAnalysisSelectStyle;

    default:
      return cameraDefaultSelectStyle;
  }
}
