<template>
  <!--团体管控关系档案 地图-->
  <map-wrap
    ref="mapView"
    auto-fit-layer="featureLayer">
    <!-- 人员聚类地图 -->
    <cluster-layer :data="clusterData"></cluster-layer>
    <!-- 标注图层 -->
    <meg-vector-layer
      name="featureLayer"
      :style-function="relationStyleFn">
      <!-- 点位标注 -->
      <meg-feature-array
        geom-type="Point"
        :feature-data="featureData">
      </meg-feature-array>
      <meg-select-interaction
        name="selectInteraction"
        select-type="single-click"
        :active-style-function="relationStyleFn"
        @select-change="onSelectChange">
      </meg-select-interaction>
    </meg-vector-layer>
    <template v-slot:overlay>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        auto-move-center
        :params="freeInfo"
        :options="freeInfoOverlayOptions"
        :visible="freeInfoOverlayVisible"
        :position="freeInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
  </map-wrap>
</template>
<script>

import { DEFAULT_OPTIONS } from '@megvii-gis/core-api/lib/Const';
import {
  relationStyleFn
} from './styles/common';

// eslint-disable-next-line import/no-unresolved
import ClusterLayer from './common/cluster-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  components: {
    ClusterLayer,
    MapWrap
  },
  props: {
    clusterData: {
      type: Array,
      default: () => []
    },
    featureArray: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      options: DEFAULT_OPTIONS,
      freeInfo: {},
      freeInfoOverlayOptions: {
        offset: [0, -20],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,
    };
  },
  computed: {

    featureData() {
      const featureArray = this.featureArray.filter((val) => val.lon && val.lat);
      return featureArray.map((item) => ({
        type: 'Point',
        coordinates: [item.lon, item.lat],
        params: {
          ...item
        }
      }));
    }
  },
  created() {
    this.relationStyleFn = relationStyleFn;
  },
  methods: {
    showFreeOverlay(data = {}) {
      this.freeInfo = { ...data };
      this.freeInfoOverlayPosition = [data.lon, data.lat];
      this.freeInfoOverlayVisible = true;
    },
    hideFreeOverlay() {
      this.freeInfoOverlayVisible = false;
    },
    onSelectChange(select) {
      if (select) {
        this.$emit('select-change', select.params);
      }
    }
  }

};
</script>
<style lang="scss" scoped>
</style>
