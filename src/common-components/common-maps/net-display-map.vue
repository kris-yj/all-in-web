<template>
  <map-wrap
    ref="mapView"
    @zoom-changed="zoomChanged"
    :cursor="isCursor"
    auto-fit-layer="highRegionLayer"
    is-zoom>
    <region-layer
      name="highRegionLayer"
      ref="netInteraction"
      :data="netArray"
      :is-auto-select="false"
      :select-id="selectId"
      @hover="onHoverChange"
      @select="onSelectChange"></region-layer>
    <region-layer
      :is-visible="isRegion"
      name="regionLayer"
      ref="regionInteraction"
      :is-auto-select="false"
      :select-id="selectId"
      :data="regionArray"
      @hover="onHoverChange"
      @select="onSelectChange"
      :z-index="1"></region-layer>
    <camera-layer
      ref="cameraLayer"
      :is-visible="isDevice&&!isMerge"></camera-layer>
    <!-- 设备聚类  -->
    <device-merge-layer
      ref="deviceMergeLayer"
      :is-visible="isMerge"></device-merge-layer>
    <template v-slot:overlay>
      <!-- 详情弹窗 -->
      <meg-overlay
        auto-move-center
        name="detailOverlay"
        :params="detailInfo"
        :options="freeInfoOverlayOptions"
        :visible="!!detailInfoOverlayPosition"
        :position="detailInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        :params="freeInfo"
        :options="freeInfoOverlayOptions"
        :visible="!!freeInfoOverlayPosition"
        :position="freeInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
    <!-- 地图控件插槽 -->
    <template slot="control">
      <slot name="control"></slot>
    </template>
  </map-wrap>
</template>

<script>
import { calcBBox } from '@megvii-gis/calc-api';
import { regionStyleLayerFn, regionSelectStyleLayerFn, regionHoverStyleLayerFn } from './styles/common';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import regionLayer from './common/region-layer';
// eslint-disable-next-line import/no-unresolved
import CameraLayer from './common/camera-layer';
import DeviceMergeLayer from './common/device-merge-layer';

export default {
  components: {
    MapWrap,
    regionLayer,
    CameraLayer,
    DeviceMergeLayer
  },
  props: {
    regionData: {
      type: Array,
      default: () => []
    },
    netArray: {
      type: Array,
      default: () => []
    },
    /**
     * 是否显示高关注区域
     */
    isRegion: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示设备图层
     */
    isDevice: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      regionStyleLayerFn,
      regionSelectStyleLayerFn,
      regionHoverStyleLayerFn,

      freeInfoOverlayOptions: {
        offset: [0, -35],
      },
      freeInfo: { features: [] },
      freeInfoOverlayPosition: undefined,

      detailInfo: { features: [] },
      detailInfoOverlayPosition: undefined,
      isCursor: false,
      isPending: false,
      limitMergeZoom: 12,
      zoom: 13
    };
  },
  computed: {
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    },
    selectId() {
      return this.detailInfo.id;
    },
    regionArray() {
      return this.regionData.map((item) => ({
        ...item,
        id: item.params && item.params.id
      }));
    }
  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    const { clusterThreshold, zoom } = this.options;
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;
  },
  methods: {
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    /**
     * 外部设置设备数据
     */
    setFeature(data) {
      this.$refs.cameraLayer.setFeature(data);
      this.$refs.deviceMergeLayer.setFeature(data);
    },
    onSelectChange(select) {
      if (select && !this.isPending) {
        this.detailInfo = select.params;
        this.detailInfoOverlayPosition = select.centerPosition;
        setTimeout(() => {
          this.isPending = false;
        }, 0);
        this.isPending = true;
      }
    },
    selectFeature(featureId) {
      let type = 'net';
      let feature = this.netArray.find((item) => item.id === featureId);
      if (!feature) {
        type = 'region';
        feature = this.regionData.find((item) => item.id === featureId);
      }
      if (!feature) return;
      this.hideFreeOverlay();
      const bbox = calcBBox([{ type: 'Polygon', coordinates: feature.coordinates }]);
      const [, rightBottom, leftTop] = bbox.coordinates[0];
      this.$refs.mapView.fitForExtent([...leftTop, ...rightBottom]);
      this.$refs[`${type}Interaction`].select(featureId);
    },
    // 鼠标移上
    onHoverChange(select) {
      if (select) {
        this.freeInfo = select.params;
        this.freeInfoOverlayPosition = select.centerPosition;
        this.isCursor = true;
      } else {
        this.freeInfoOverlayPosition = undefined;
        this.isCursor = false;
      }
    },

    /**
     * 隐藏overlay弹窗
     */
    hideFreeOverlay() {
      this.freeInfoOverlayPosition = undefined;
      this.detailInfoOverlayPosition = undefined;
      this.$refs.netInteraction.$refs.selectInteraction.cancelSelect();
      this.$refs.regionInteraction.$refs.selectInteraction.cancelSelect();
      this.freeInfoData = {};
    },

  }
};
</script>

<style lang='scss' scoped>

</style>
