<template>
  <div>
    <!--相机标注图层-->
    <meg-vector-layer
      name="pointFeatureLayer"
      :visible="isVisible"
      ref="pointFeatureLayer"
      :style-function="deviceStyleFn">
      <meg-feature-array
        geom-type="Point"
        :feature-data="featureData">
      </meg-feature-array>
      <meg-select-interaction
        name="deviceClicktInteraction"
        select-type="click"
        @select-change="onClick">
      </meg-select-interaction>
      <meg-select-interaction
        name="deviceHoverInteraction"
        select-type="mouse-move"
        :active="true"
        @select-change="onHover">
      </meg-select-interaction>
    </meg-vector-layer>
  </div>
</template>

<script>

import { deviceStyleFn } from '../styles/hx-home-style';

export default {
  props: {

    data: {
      type: Array,
      default: () => []
    },
    isVisible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {

    };
  },
  computed: {

    featureData() {
      const featureArray = this.data.filter((val) => val.lon && val.lat);
      return featureArray.map((item) => ({
        type: 'Point',
        coordinates: [item.lon, item.lat],
        params: item
      }));
    },

  },
  created() {
    this.deviceStyleFn = deviceStyleFn;
  },
  methods: {

    onClick(select) {
      this.$emit('select', select);
    },
    onHover(select) {
      this.$emit('hover', select);
    },

  }
};
</script>

<style lang='scss' scoped>

</style>
