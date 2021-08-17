<template>
  <!-- 手动 标记地图-->
  <!-- 定位地图 -->
  <map-wrap
    ref="mapView"
    :is-zoom="isZoom">
    <position-modify
      ref="layer"
      v-model="drawInteractionActive"
      @location-change="onDrawEnd"
      :feature-data="featureData"></position-modify>
    <!-- 地图控件插槽 -->
    <template
      slot="control">
      <slot name="control"></slot>
      <meg-button
        v-if="!(featureData.lon&&featureData.lat)&&controlVisible"
        @click.native.stop="activeLocation"
        class="position-select">
        手动标记
      </meg-button>
      <meg-button
        v-if="(featureData.lon&&featureData.lat)&&controlVisible"
        @click.native.stop="clearLocation"
        class="position-select">
        清除标记
      </meg-button>
    </template>
  </map-wrap>
</template>

<script>

// eslint-disable-next-line import/no-unresolved
import PositionModify from './common/position-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  components: {
    PositionModify,
    MapWrap
  },
  props: {
    featureData: {
      type: Object,
      default: () => {}
    },
    isZoom: {
      type: Boolean,
      default: true
    },
    controlVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      drawInteractionActive: false,
    };
  },
  watch: {
    featureData(val = {}) {
      if (val.lon && val.lat) {
        this.$nextTick(() => {
          this.$refs.mapView.fitForLayer();
        });
      }
    }
  },
  created() {
  },
  methods: {
    /**
     * 标记结束事件
     */
    onDrawEnd({ lon = '', lat = '' }) {
      this.$emit('location-change', { lon, lat });
    },
    /**
     * 开启手动标记
     */
    activeLocation() {
      this.drawInteractionActive = true;
    },
    /*
    * 设置缩放级别
    * @param {level: 级别}
    * @return
    * */
    setZoomLevel(level) {
      this.$refs.mapView.animate({
        zoom: level
      });
    },
    /**
     * 清除标记
     */
    clearLocation() {
      this.$emit('clear-location');
    },

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
