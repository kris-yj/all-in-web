/* eslint-disable no-underscore-dangle */
import GeometryCollection from 'ol/geom/GeometryCollection';
import FeatureAnimation from 'ol-ext/featureanimation/FeatureAnimation';
import Point from 'ol/geom/Point';
import { createSvgIconStyle } from '@megvii-gis/core-api/lib/Style';
// import { AnimateFactory } from '../../core-api/src/animation';
import {
  TRACE_LINE_STYLE, SPACE_DISTANCE
} from './common';

const arrowSvgString = '<svg xmlns="http://www.w3.org/2000/svg" width="6px" height="6px" viewBox="0 0 72 72"><path fill-rule="evenodd" clip-rule="evenodd" fill="#fff" d="M35.9 65.7L0 41.4V6.3l35.9 24.4L72 6.3v35.1z"/></svg>';

const lineSytleCache = {};

function getStyle(factor, evt) {
  const ret = [];
  const geometry = evt.feature.getGeometry();
  let index = 0;
  geometry.forEachSegment((start, end) => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx) + Math.PI / 2;

    // 通过像素计算arrow的数量而不是通过geom的间隔
    const startPos = evt.map.getPixelFromCoordinate(start);
    const endPos = evt.map.getPixelFromCoordinate(end);
    // console.log(startPos, endPos);
    const totalPixelDistance = Math.sqrt(
      ((endPos[0] - startPos[0]) ** 2)
        + ((endPos[1] - startPos[1]) ** 2),
    );

    const arrowCount = Math.ceil(totalPixelDistance / SPACE_DISTANCE);

    const geomSpanX = arrowCount === 1 ? (end[0] - start[0]) / 2 : (end[0] - start[0]) / arrowCount;
    const geomSpanY = arrowCount === 1 ? (end[1] - start[1]) / 2 : (end[1] - start[1]) / arrowCount;

    const drawNum = arrowCount === 1 ? 2 : arrowCount;

    const arrowStyle = lineSytleCache[rotation] ? lineSytleCache[rotation]
      : lineSytleCache[rotation] = createSvgIconStyle({
        svg: arrowSvgString,
        size: [6, 6],
        rotation: -rotation
      });
    const [x, y] = evt.map.getSize();

    for (let i = 1; i < drawNum + 1; i += 1) {
      const arrowPos = [start[0] + (i - 1 + factor) * geomSpanX, start[1] + (i - 1 + factor) * geomSpanY];
      // arrows
      const pixel = evt.map.getPixelFromCoordinate(arrowPos);
      // console.info(pixel);
      if (pixel[0] < x && pixel[0] > 0 && pixel[1] < y && pixel[1] > 0) {
        const style = arrowStyle.clone();
        const pointGeom = new Point(arrowPos);
        // style.setGeometry(pointGeom);
        if (!ret[index]) ret[index] = [[], []];
        if (ret[index][0].length === 0) ret[index][0].push(style);
        ret[index][1].push(pointGeom);
      }
    }
    index += 1;
  });
  // console.info(ret);
  return ret;
}

export default class CustomLineAnimate extends FeatureAnimation {
  animate(e) {
    // eslint-disable-next-line no-underscore-dangle
    const factor = this.easing_(e.elapsed);
    e.style = [...TRACE_LINE_STYLE];
    this.drawGeom_(e, e.geom);
    const ret = getStyle(factor, e);
    ret.forEach(([styles, geoms]) => {
      e.style = styles;
      this.drawGeom_(e, new GeometryCollection(geoms));
    });
    return (e.time <= this.duration_);
  }
}
