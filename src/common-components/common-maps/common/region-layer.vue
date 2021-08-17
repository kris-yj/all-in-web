<template>
  <!-- 高关注区域地图 -->
  <meg-vector-layer
    :name="name"
    :visible="isVisible"
    :style-function="regionStyleLayerFn"
    v-bind="$attrs">
    <meg-feature-array
      geom-type="Polygon"
      :feature-data="regionGeomData">
    </meg-feature-array>
    <meg-select-interaction
      :name="`${name}HoverInteraction`"
      select-type="mouse-move"
      :active-style-function="regionHoverStyleLayerFn"
      @select-change="onHoverChange">
    </meg-select-interaction>
    <meg-select-interaction
      ref="selectInteraction"
      :name="`${name}SelectInteraction`"
      select-type="single-click"
      :active-style-function="isAutoSelect ? regionSelectStyleLayerFn : regionStyleLayerFn"
      @select-change="onSelectChange">
    </meg-select-interaction>
  </meg-vector-layer>
</template>

<script>
import { calcBBox } from '@megvii-gis/calc-api';
import {
  regionStyleLayerFn,
  regionHoverStyleLayerFn,
  regionSelectStyleLayerFn
} from '../styles/common';

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: 'highRegionLayer'
    },
    isAutoSelect: {
      type: Boolean,
      default: true
    },
    selectId: {
      type: [String, Number],
      default: undefined
    }
  },
  computed: {
    regionGeomData() {
      const features = this.data.filter((item) => item.coordinates && item.coordinates !== '[]');
      return features.map((item) => ({
        params: this.selectId ? { ...item, selected: this.selectId === item.id } : item,
        coordinates: item.coordinates
      }));
    },
  },
  watch: {
    selectId: 'select'
  },
  created() {
    const level = {
      middle: this.$store.getters.systemByType('wisdomMiddleScoreLevelThreshold').value,
      high: this.$store.getters.systemByType('wisdomHighScoreLevelThreshold').value
    };
    this.regionStyleLayerFn = (features) => regionStyleLayerFn(features, level);
    this.regionSelectStyleLayerFn = (features) => regionSelectStyleLayerFn(features, level);
    this.regionHoverStyleLayerFn = (features) => regionHoverStyleLayerFn(features, level);
  },
  methods: {
    onSelectChange(select) {
      if (select) {
        const bbox = calcBBox([select.featureGeom.geometry]);
        const [,, leftTop, rightTop] = bbox.coordinates[0];
        select.centerPosition = [(rightTop[0] + leftTop[0]) / 2, leftTop[1]];
      }
      this.$emit('select', select);
    },
    onHoverChange(select) {
      if (select) {
        const bbox = calcBBox([select.featureGeom.geometry]);
        const [,, leftTop, rightTop] = bbox.coordinates[0];
        select.centerPosition = [(rightTop[0] + leftTop[0]) / 2, leftTop[1]];
      }
      this.$emit('hover', select);
    },
    /**
     * 通过params中id选中区域
     */
    select(id) {
      if (id) this.$refs.selectInteraction.select(id);
    },
    cancelSelect() {
      this.$refs.selectInteraction.cancelSelect();
    },
  }
};
</script>

<style lang='scss' scoped>

</style>
