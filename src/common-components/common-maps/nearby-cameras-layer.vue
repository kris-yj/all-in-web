<template>
  <div v-if="showNearbyCamerasLayers">
    <meg-vector-layer
      name="nearbyCamerasVectorLayer"
      :style-function="iconStyleFn"
      :visible="!isShowNearbyCameras">
      <meg-feature-array
        geom-type="Point"
        :feature-data="featureData">
      </meg-feature-array>
    </meg-vector-layer>
    <!-- 视频icon展示 -->
    <meg-vector-layer
      name="nearbyActiveCamerasVectorLayer"
      :style-function="iconActiveStyleFn"
      :visible="isShowNearbyCameras">
      <meg-feature-array
        geom-type="Point"
        :feature-data="featureData">
      </meg-feature-array>
    </meg-vector-layer>
    <!-- 半径可变的圆 -->
    <meg-vector-layer
      name="circleVectorLayer"
      :style-function="circleStyleFn"
      :visible="isShowNearbyCameras">
      <meg-feature-array
        geom-type="Circle"
        :feature-data="circleData">
      </meg-feature-array>
      <meg-modify-interaction
        name="modifyInteraction"
        :snap-pixel="50"
        :custom="true"
        :active="isShowNearbyCameras"
        @modify-end="modifyEndHandler">
      </meg-modify-interaction>
    </meg-vector-layer>
  </div>
</template>

<script>
import { createUniversalStyle } from '@megvii-gis/core-api/lib/Style';
import { videoCameraStyleFn, videoCameraStyle, videoCameraActiveStyle } from '@megvii-gis/style-sets';
import { calcIsPointInPolygon } from '@megvii-gis/calc-api';

const styleLayerFn = () => createUniversalStyle({
  image: {
    type: 'circle',
    radius: 15,
    backgroundColor: '#0198FB'
  },
  backgroundColor: 'rgba(1,152,251,0.25)',
  borderColor: '#0198FB',
  borderWidth: 3
});

const iconStyleFn = (feature) => {
  const params = feature.get('params');
  const color = '#BF2B2B';
  if (params.alarm) {
    return videoCameraStyleFn({
      width: 28,
      height: 28,
      color: '#fff',
      borderColor: color,
      backgroundColor: color
    });
  }
  return params.selected ? videoCameraActiveStyle : videoCameraStyle;
};
const iconActiveStyleFn = (feature) => {
  const params = feature.get('params');
  const color = 'rgb(16, 73, 160)';
  if (params.alarm) {
    return videoCameraStyleFn({
      width: 28,
      height: 28,
      color: '#fff',
      borderColor: color,
      backgroundColor: color
    });
  }
  return params.selected ? videoCameraActiveStyle : videoCameraStyle;
};

export default {
  props: {
    alarmData: {
      type: Array,
      default: () => []
    },
    isShowNearbyCameras: {
      type: Boolean,
      default: false
    },
    showNearbyCamerasLayers: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      iconStyleFn,
      iconActiveStyleFn,
      circleStyleFn: styleLayerFn,
      featureData: []
    };
  },
  created() {
    this.featureData = this.alarmData.map((item) => ({
      coordinates: [item.lon, item.lat],
      params: { ...item }
    }));
    // TODO: 附近视频mock点
    this.featureData.push(
      { coordinates: [116.361033, 39.961961760], params: {} },
      { coordinates: [116.459416943, 39.9662938], params: {} }
    );
    // 圆数据
    this.circleData = this.alarmData.map((item) => ({
      coordinates: {
        center: [item.lon, item.lat],
        radius: 3
      }
    }));
  },
  methods: {
    modifyEndHandler(id, feature, featureGeom) {
      this.featureData = this.getFeaturesInCircle(featureGeom.geometry);
    },

    getFeaturesInCircle(geometry) {
      return this.featureData.map((item) => {
        const isIn = calcIsPointInPolygon({
          type: 'Point',
          coordinates: item.coordinates
        }, geometry);
        item.params.selected = !!isIn;
        return item;
      });
    }
  }
};
</script>

<style scoped>

</style>
