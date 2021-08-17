<template>
  <!-- 热力图图层 -->
  <meg-heatmap-layer
    :visible="isVisible"
    :name="name"
    :radius="15"
    :blur="16">
    <!-- 热力标注 -->
    <meg-feature-array
      :feature-data="heatmapData">
    </meg-feature-array>
  </meg-heatmap-layer>
</template>

<script>

export default {
  props: {
    isVisible: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      default: 'heatmapLayer'
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

    };
  },
  computed: {
    heatmapData() {
      const featureArray = this.data.filter((item) => item.lat && item.lon);
      return featureArray.map((item) => ({
        coordinates: [item.lon, item.lat],
        params: { weight: item.weight },
      }));
    }
  },
  created() {
  }
};
</script>

<style lang='scss' scoped>

</style>
