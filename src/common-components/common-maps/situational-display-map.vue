<template>
  <!-- 综合态势地图 -->
  <map-wrap
    ref="map"
    :theme="2"
    :auto-fit-layer="autoFitLayer">
    <!-- 抓拍态势地图 -->
    <heatmap-layer
      :is-visible="isCaptureMap"
      :data="captureData"
      name="captureHeatmapLayer"></heatmap-layer>
    <!-- 报警态势地图 -->
    <heatmap-layer
      :is-visible="isAlarmMap"
      :data="alarmData"
      name="alarmHeatmapLayer"></heatmap-layer>
    <!-- 人员聚类地图 -->
    <!-- <overlay-list
      :data="clusterData"
      :max-feature-num="200"
      :is-visible="isPersonnelMap">
      <template v-slot:list="{params}">
        <slot
          name="list"
          :params="params"></slot>
      </template>
    </overlay-list> -->
    <cluster-layer
      name="clusterLayer"
      :data="clusterData"
      :is-visible="isPersonnelMap"></cluster-layer>
    <!-- 高关注区域地图 -->
    <region-layer
      name="highLayer"
      :is-visible="isHighMap"
      :data="regionData"
      @hover="onHoverChange"
      @select="onSelectChange"></region-layer>
    <template v-slot:overlay>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        auto-move-center
        :params="freeInfoData"
        :options="freeInfoOverlayOptions"
        :visible="freeInfoOverlayVisible&&isHighMap"
        :position="freeInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- hover弹窗 -->
      <meg-overlay
        name="hoverOverlay"
        :auto-move-center="false"
        :params="hoverData"
        :options="freeInfoOverlayOptions"
        :visible="hoverVisible&&isHighMap"
        :position="hoverPosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
    <template v-slot:control>
      <slot name="control"></slot>
    </template>
  </map-wrap>
</template>
<script>
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import ClusterLayer from './common/cluster-layer';
// eslint-disable-next-line import/no-unresolved
import HeatmapLayer from './common/heatmap-layer';
// eslint-disable-next-line import/no-unresolved
import regionLayer from './common/region-layer';

export default {
  name: 'PositionDisplayMap',
  components: {
    ClusterLayer,
    HeatmapLayer,
    MapWrap,
    regionLayer
  },
  props: {
    captureData: {
      type: Array,
      default: () => []
    },
    alarmData: {
      type: Array,
      default: () => []
    },
    clusterData: {
      type: Array,
      default: () => []
    },
    regionData: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'capture'
    }
  },
  data() {
    return {
      freeInfoOverlayOptions: {
        offset: [0, -30],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,
      freeInfoData: {},

      hoverData: {},
      hoverVisible: false,
      hoverPosition: undefined
    };
  },
  computed: {

    autoFitLayer() {
      const layers = {
        capture: 'captureHeatmapLayer',
        alarm: 'alarmHeatmapLayer',
        personnel: 'clusterLayer',
        high: 'highLayer'
      };
      return layers[this.type];
    },

    isCaptureMap() {
      return this.type === 'capture';
    },
    isAlarmMap() {
      return this.type === 'alarm';
    },
    isPersonnelMap() {
      return this.type === 'personnel';
    },
    isHighMap() {
      return this.type === 'high';
    }
  },
  watch: {
    type() {
      this.$nextTick(() => {
        console.log(this.autoFitLayer);
        // this.$refs.map.fitForLayer();
      });
    }
  },
  methods: {
    onSelectChange(select) {
      if (select) {
        this.freeInfoOverlayVisible = true;
        this.freeInfoOverlayPosition = select.centerPosition;
        this.freeInfoData = select.params;
      } else {
        this.freeInfoOverlayVisible = false;
      }
    },
    /**
     * 鼠标移上设备事件
     */
    onHoverChange(select) {
      if (select) {
        this.hoverVisible = true;
        this.hoverPosition = select.centerPosition;
        this.hoverData = select.params;
      } else {
        this.hoverVisible = false;
      }
    }
  }
};
</script>
