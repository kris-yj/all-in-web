<template>
  <meg-vector-layer
    :name="name"
    :visible="isVisible"
    :style-function="customLineStyleLayerFn">
    <meg-static-feature
      :geometry="regionGeomData">
    </meg-static-feature>
  </meg-vector-layer>
</template>

<script>
import {
  customLineStyleLayerFn
} from '../styles/common';

export default {
  props: {
    regionData: {
      type: Object,
      default: () => {}
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: 'featureLayer'
    }
  },

  computed: {
    regionGeomData() {
      return {
        type: 'Polygon',
        coordinates: this.regionData.coordinates
      };
    },
  },
  created() {
    this.customLineStyleLayerFn = customLineStyleLayerFn;
  }
};
</script>
