<template>
  <!-- 抓拍统计 热力图 -->
  <map-wrap
    is-zoom
    :plugins="plugins"
    ref="mapView"
    auto-fit-layer="heatmapLayer">
    <heatmap-layer :data="featureData"></heatmap-layer>
    <template v-slot:control>
      <img
        v-show="!!exportImage"
        class="export-image"
        :src="exportImage" />
      <slot name="control"></slot>
    </template>
  </map-wrap>
</template>

<script>
// eslint-disable-next-line import/no-unresolved
import { MegExportControl } from '@megvii-gis/core-class';
import HeatmapLayer from './common/heatmap-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  components: {
    HeatmapLayer,
    MapWrap
  },
  props: {
    featureData: {
      type: Array,
      default: () => ([]),
    },

  },
  data() {
    return {
      plugins: {
        exportPlugin: new MegExportControl()
      },
      exportImage: ''
    };
  },

  watch: {
    featureData() {
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    },
  },
  mounted() {
  },
  created() {
  },

  methods: {
    async export() {
      const image = await this.plugins.exportPlugin.export();
      this.exportImage = image;
    },
    cancelExport() {
      this.exportImage = '';
    }
  }
};
</script>
<style lang='scss' scoped>
.export-image {
  position:absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
</style>
