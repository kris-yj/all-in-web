<template>
  <!-- 设备聚类  -->
  <meg-cluster-layer
    name="clusterLayer"
    :visible="isVisible"
    :style-function="clusterLayerFn">
    <meg-feature-array
      geom-type="Point"
      ref="feature"
      :feature-data="featureGeometryArray">
    </meg-feature-array>
  </meg-cluster-layer>
</template>

<script>
import { clusterLayerFn } from '../styles/common';

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
    // 地图相机点位数据
    featureGeometryArray() {
      return this.mapData(this.data);
    },
  },
  created() {
    this.clusterLayerFn = clusterLayerFn;
  },
  methods: {
    mapData(data) {
      const list = [];
      data.forEach((val) => {
        if (val.lon && val.lat) {
          list.push(
            {
              id: val.id,
              type: 'Point',
              coordinates: [val.lon, val.lat],
              params: { ...val }
            }
          );
        }
      });
      return list;
    },
    /**
     * 外部设置设备数据
     */
    setFeature(data = []) {
      this.$refs.feature.setFeatures(this.mapData(data));
    },
  }
};
</script>

<style lang='scss' scoped>

</style>
