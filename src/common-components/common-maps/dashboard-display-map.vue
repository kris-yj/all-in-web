<template>
  <!-- 综合态势地图 -->
  <map-wrap
    :theme="2"
    :cursor="isCursor"
    @zoom-changed="zoomChanged"
    ref="map">
    <!-- 抓拍态势地图 -->
    <heatmap-layer
      :is-visible="isCaptureMap&&!isHeatMapLayerVisible"
      :data="captureData"
      name="captureHeatmapLayer"></heatmap-layer>
    <cluster-layer
      :is-visible="isCaptureMap&&isHeatMapLayerVisible"
      :is-hx="true"
      name="clusteLayer"
      :data="captureData"></cluster-layer>
    <!-- 人员聚类地图 -->
    <cluster-layer
      name="databaseLayer"
      :data="personnelData"
      :is-database="true"
      :is-visible="isPersonnelMap&&isHeatMapLayerVisible"></cluster-layer>
    <!-- 高关注区域地图 -->
    <region-layer
      name="highLayer"
      :is-visible="isRegionMap&&isHeatMapLayerVisible"
      :data="regionData"
      ref="region"
      @hover="onHoverChange"
      @select="onSelectChange"></region-layer>
    <!-- 设备态势地图 -->
    <device-layer
      ref="device"
      :data="featureArray"
      @hover="onDeviceHover"
      @select="onDeviceSelect"
      :is-visible="isDeviceMap&&isHeatMapLayerVisible"></device-layer>
    <template v-slot:overlay>
      <!-- hover弹窗 -->
      <meg-overlay
        name="hoverOverlay"
        :auto-move-center="false"
        :params="hoverData"
        :options="deviceOptions"
        :visible="hoverVisible&&isHeatMapLayerVisible"
        :position="hoverPosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- 设备hover弹窗 -->
      <meg-overlay
        name="deviceHoverOverlay"
        :auto-move-center="false"
        :params="deviceHoverData"
        :options="deviceOptions"
        :visible="deviceHoverVisible&&isHeatMapLayerVisible"
        :position="deviceHoverPosition">
        <template v-slot:default="{params}">
          <slot
            name="deviceHover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- 设备点击弹窗 -->
      <meg-overlay
        name="deviceOverlay"
        :auto-move-center="false"
        :params="deviceSelectData"
        :options="freeInfoOverlayOptions"
        :visible="deviceOverlayVisible&&isHeatMapLayerVisible"
        :position="deviceOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="deviceSelect"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        auto-move-center
        :params="freeInfoData"
        :options="freeInfoOverlayOptions"
        :visible="freeInfoOverlayVisible&&isHeatMapLayerVisible"
        :position="freeInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
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
// eslint-disable-next-line import/no-unresolved
import deviceLayer from './common/device-layer';

export default {
  name: 'PositionDisplayMap',
  components: {
    ClusterLayer,
    HeatmapLayer,
    MapWrap,
    regionLayer,
    deviceLayer
  },
  props: {
    captureData: {
      type: Array,
      default: () => []
    },
    deviceData: {
      type: Array,
      default: () => []
    },
    personnelData: {
      type: Array,
      default: () => []
    },
    regionData: {
      type: Array,
      default: () => []
    },
    isDeviceMap: {
      type: Boolean,
      default: false
    },
    isPersonnelMap: {
      type: Boolean,
      default: false
    },
    isCaptureMap: {
      type: Boolean,
      default: false
    },
    isRegionMap: {
      type: Boolean,
      default: false
    },
    limitZoom: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      freeInfoOverlayOptions: {
        offset: [0, -35],
      },
      zoom: 8,
      deviceOptions: {
        offset: [0, -35],
        className: 'overlay-z-index'
      },
      // 区域详情
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,
      freeInfoData: {},

      // 区域hover
      hoverData: {},
      hoverVisible: false,
      hoverPosition: undefined,

      deviceSelectData: {},
      deviceOverlayVisible: false,
      deviceOverlayPosition: undefined,

      deviceHoverData: {},
      deviceHoverVisible: false,
      deviceHoverPosition: undefined,

      isCursor: false
    };
  },
  computed: {
    /**
     * 控制是否显示热力图和设备图层
     */
    isHeatMapLayerVisible() {
      return this.zoom > this.limitZoom;
    },
    featureArray() {
      return this.deviceData.map((item) => ({
        ...item,
        selected: item.id === this.deviceSelectData.id
      }));
    }
  },
  methods: {
    /**
     * 区域选中
     */
    onSelectChange(select) {
      if (select) {
        this.$emit('select-region', {
          ...select.params,
          centerPosition: select.centerPosition
        });
      }
    },
    showFreeOverlay(data = {}) {
      this.freeInfoData = { ...data };
      this.freeInfoOverlayPosition = data.centerPosition;
      this.freeInfoOverlayVisible = true;
    },
    hideFreeOverlay() {
      this.freeInfoOverlayVisible = false;
      this.$refs.region.cancelSelect();
    },
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    /**
     * 鼠标移上区域+事件
     */
    onHoverChange(select) {
      if (select) {
        this.hoverVisible = true;
        this.hoverPosition = select.centerPosition;
        this.hoverData = select.params;
        this.isCursor = true;
      } else {
        this.isCursor = false;
        this.hoverVisible = false;
      }
    },

    /**
     * 设备hover
     */
    onDeviceHover(select) {
      if (select) {
        this.deviceHoverVisible = true;
        this.deviceHoverPosition = select.featureGeom.lastPosition;
        this.deviceHoverData = select.params;
        this.isCursor = true;
      } else {
        this.deviceHoverVisible = false;
        this.isCursor = false;
      }
    },
    /**
     * 设备选中
     */
    onDeviceSelect(select) {
      if (select) {
        this.$emit('select-device', select.params);
      }
    },
    /**
     * 隐藏设备选中overlay
     */
    hideDeviceOverlay() {
      this.deviceOverlayVisible = false;
    },
    /**
     * 显示设备选中overlay
     */
    showDeviceOverlay(feature = { lon: '', lat: '' }) {
      const { lon, lat } = feature;
      this.deviceOverlayPosition = [lon, lat];
      this.deviceOverlayVisible = true;
      this.deviceSelectData = feature;
    }
  }
};
</script>
<style>
.overlay-z-index {
  z-index: -1;
}
</style>
