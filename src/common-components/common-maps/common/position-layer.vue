<template>
  <!-- 点位标注图层 -->
  <meg-vector-layer
    :style-function="()=>{}"
    name="featureLayer">
    <!-- 点位标注 -->
    <meg-feature
      :style-function="locationStyleFn"
      :geometry="featureGeomData">
    </meg-feature>
    <!-- 标注绘制手势 -->
    <meg-draw-interaction
      name="drawInteraction"
      draw-type="Point"
      :style-function="()=>{}"
      :active="active"
      @draw-end="onDrawEnd">
    </meg-draw-interaction>
    <!-- 标注移动手势 -->
    <meg-translate-interaction
      name="translateInteraction"
      :active="translateInteractionActive&&isTranslate"
      @trans-end="onTranslateEnd">
    </meg-translate-interaction>
  </meg-vector-layer>
</template>

<script>

import { locationStyleFn } from '../styles/common';

export default {
  model: {
    prop: 'active',
    event: 'change'
  },
  props: {
    featureData: {
      type: Object,
      default: () => ({})
    },
    isTranslate: {
      type: Boolean,
      default: true
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      translateInteractionActive: false,
    };
  },
  computed: {
    featureGeomData() {
      const { lon = '', lat = '' } = this.featureData;
      if (lon && lat) {
        return {
          type: 'Point',
          coordinates: [Number(lon), Number(lat)],
        };
      }
      return undefined;
    }
  },
  created() {
    this.locationStyleFn = locationStyleFn;
  },
  methods: {
    /**
     * 标记结束事件
     */
    onDrawEnd(id, feature, geom) {
      const [outLon, outLat] = geom.geometry.coordinates;
      this.$emit('location-change', { lon: outLon, lat: outLat });
      this.$nextTick(() => {
        this.$emit('change', false);
        this.translateInteractionActive = true;
      });
    },
    /**
     * 开启手动标记
     */
    activeLocation() {
      this.translateInteractionActive = false;
      this.$emit('change', true);
    },
    /**
     * 拖动标记事件
     */
    onTranslateEnd(id, feature, geom) {
      const [outLon, outLat] = geom.geometry.coordinates;
      this.$emit('location-change', { lon: outLon, lat: outLat });
    }
  }
};
</script>

<style lang='scss' scoped>

</style>
