<template>
  <meg-vector-layer
    name="transformLayer"
    :style-function="customLineStyleLayerFn">
    <meg-static-feature
      :geometry="geometry">
    </meg-static-feature>
    <meg-transform-interaction
      name="transformInteraction"
      :can-translate="false"
      :can-rotate="false"
      @transform-end="onDrawEnd"
      :active="!!feature">
    </meg-transform-interaction>
  </meg-vector-layer>
</template>

<script>
import { calcDegreeToLength } from '@megvii-gis/calc-api';
import {
  customLineStyleLayerFn
} from '../styles/common';

export default {
  props: {
    feature: {
      type: [Array, undefined],
      default: undefined
    }
  },
  data() {
    return {

    };
  },
  computed: {
    geometry() {
      if (this.feature) {
        return {
          'type': 'Polygon',
          'coordinates': [this.feature]
        };
      }
      return undefined;
    }
  },
  created() {
    this.customLineStyleLayerFn = customLineStyleLayerFn;
  },
  methods: {
    onDrawEnd(id, feature, featureGeom) {
      const { coordinates } = featureGeom.geometry;
      const [leftTop, , rightBottom] = coordinates[0];
      const width = calcDegreeToLength(rightBottom[0] - leftTop[0]);
      const height = calcDegreeToLength(leftTop[1] - rightBottom[1]);
      this.$emit('on-draw-end', {
        width,
        height
      });
    }
  }
};
</script>

<style lang='scss' scoped>

</style>
