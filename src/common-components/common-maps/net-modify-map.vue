<template>
  <!-- 手动 标记地图-->
  <!-- 定位地图 -->
  <map-wrap
    ref="mapView"
    :auto-fit-layer="feature.length ? 'transformLayer' : ''"
    is-zoom>
    <position-modify
      ref="layer"
      :is-translate="false"
      v-model="drawInteractionActive"
      @location-change="onDrawEnd"></position-modify>
    <transform-layer
      name="transformLayer"
      :feature="feature"
      @on-draw-end="onChangeSize"></transform-layer>
    <!-- 地图控件插槽 -->
    <template slot="control">
      <slot name="control"></slot>
    </template>
  </map-wrap>
</template>

<script>
import { calcDestination } from '@megvii-gis/calc-api';
// eslint-disable-next-line import/no-unresolved
import PositionModify from './common/position-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import TransformLayer from './common/transform-layer';

export default {
  components: {
    PositionModify,
    MapWrap,
    TransformLayer
  },
  props: {
    feature: {
      type: Array,
      default: () => []
    },
    // 初始尺寸
    initSize: {
      type: Array,
      default: () => [20, 20]
    }
  },
  data() {
    return {
      drawInteractionActive: false
    };
  },
  computed: {
  },
  watch: {
    feature(newValue) {
      if (newValue.length) {
        this.$nextTick(() => {
          this.$refs.mapView.fitForLayer();
        });
      }
    }
  },
  methods: {
    /**
     * 标记结束事件
     */
    onDrawEnd({ lon = '', lat = '' }) {
      const coordinates = this.getInitCoordinates([lon, lat], this.initSize);
      this.$emit('location-change', { lon, lat });
      this.onChangeSize(coordinates);
    },
    /**
     * 获取初始矩形的坐标集
     * @param {Array} center 中心点坐标
     */
    getInitCoordinates(center, size) {
      const [width, height] = size;
      const top = calcDestination(center, height / 2, 0).coordinates;
      const bottom = calcDestination(center, height / 2, 180).coordinates;
      const left = calcDestination(center, width / 2, -90).coordinates;
      const right = calcDestination(center, width / 2, 90).coordinates;
      const leftTop = [left[0], top[1]];
      const rightTop = [right[0], top[1]];
      const rightBottom = [right[0], bottom[1]];
      const leftBottom = [left[0], bottom[1]];

      return [leftTop, rightTop, rightBottom, leftBottom, leftTop];
    },
    /**
     * 开启手动标记
     */
    activeLocation() {
      this.drawInteractionActive = true;
    },
    /**
     * 清除标记
     */
    clearLocation() {
      this.$emit('clear-location');
    },
    onChangeSize(coordinates, size) {
      this.$emit('on-change-size', coordinates, size);
    }

  }
};
</script>

<style lang='scss' scoped>
.position-select {
  position: absolute;
  right: 53px;
  top: 8px;
  z-index: 100;
}
</style>
