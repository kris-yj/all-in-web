<template>
  <!--事件档案 详情轨迹地图-->
  <map-wrap
    is-zoom
    auto-fit-layer="mapOverlayList"
    @zoom-changed="zoomChanged"
    @ready="ready">
    <camera-layer
      :is-visible="!isMerge"
      :data="featureArray"></camera-layer>
    <!-- 设备聚类  -->
    <device-merge-layer
      :data="featureArray"
      :is-visible="isMerge"></device-merge-layer>
    <template v-slot:overlay>
      <over-list
        :max-feature-num="1000"
        :is-visible="isVisible"
        :data="captureArray">
        <template v-slot:list="{params}">
          <slot
            name="list"
            :params="params">
          </slot>
        </template>
      </over-list>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        auto-move-center
        :params="featureData"
        :visible="!!freeInfoOverlayPosition"
        :options="freeInfoOverlayOptions"
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
// eslint-disable-next-line import/no-unresolved
import OverList from './common/overlay-list';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import CameraLayer from './common/camera-layer';
// eslint-disable-next-line import/no-unresolved
import DeviceMergeLayer from './common/device-merge-layer';

export default {
  components: {
    OverList,
    MapWrap,
    CameraLayer,
    DeviceMergeLayer
  },
  props: {
    featureArray: {
      type: Array,
      default: () => []
    },
    captureArray: {
      type: Array,
      default: () => []
    },
    // 限制显示聚合zoom 为兼容大数据量性能
    limitMergeZoom: {
      type: Number,
      default: 8,
    }
  },
  data() {
    return {
      featureData: {},
      freeInfoOverlayPosition: undefined,
      freeInfoOverlayOptions: {
        offset: [0, 0],
        className: 'overlay-z-index'
      },
      zoom: 8,
    };
  },
  computed: {
    isVisible() {
      return this.captureArray.length > 0;
    },
    // 是否显示聚合图层
    isMerge() {
      return this.zoom < this.limitMergeZoom;
    },

  },

  methods: {
    ready() {
      this.$emit('ready');
    },
    showFreeOverlay(data = {}) {
      this.featureData = { ...data };
      this.freeInfoOverlayPosition = [data.lon, data.lat];
    },
    hideFreeOverlay() {
      this.freeInfoOverlayPosition = undefined;
    },
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
  },

};
</script>
<style>
.overlay-z-index {
  z-index: 1;
}
</style>
