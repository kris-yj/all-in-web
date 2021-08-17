<template>
  <!-- 群体规律地图 -->
  <map-wrap
    ref="mapView"
    :cursor="isCursor"
    :auto-fit-layer="autoFitLayer">
    <!-- 抓拍聚合 -->
    <cluster-layer
      name="captureLayer"
      ref="captureLayer"
      :data="clusterData"
      :format-text="(number, count) => `${number}次\n相机: ${count}`"
      @select="selectChange"
      @hover="hoverChange"
      :is-mouse="true"
      :is-visible="isCaptureMap"></cluster-layer>
    <!--档案聚合 -->
    <cluster-layer
      ref="databaseLayer"
      name="databaseLayer"
      :data="databaseData"
      :format-text="formatText"
      @select="databaseSelectChange"
      :is-database="true"
      @hover="databaseHoverChange"
      :is-mouse="true"
      :is-visible="isDatabaseMap"></cluster-layer>
    <template v-slot:overlay>
      <!-- <over-list
        name="mapOverlayList"
        :max-feature-num="1000"
        :is-visible="isCaptureMap"
        :data="databaseData">
        <template v-slot:list="{params}">
          <slot
            name="list"
            :params="params">
          </slot>
        </template>
      </over-list> -->
      <!-- 详情弹窗 -->
      <meg-overlay
        name="detailOverlay"
        :params="detailInfo"
        :options="freeInfoOverlayOptions"
        :visible="!!detailInfoOverlayPosition"
        :position="detailInfoOverlayPosition">
        <template v-slot:default="{params }">
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
        <template v-slot:default="{params }">
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
// import { regionStyleLayerFn, regionSelectStyleLayerFn, regionHoverStyleLayerFn } from './styles/common';
// eslint-disable-next-line import/no-unresolved
import ClusterLayer from './common/cluster-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
// import OverList from './common/overlay-list';

export default {
  components: {
    MapWrap,
    // OverList,
    ClusterLayer
  },
  props: {
    type: {
      type: String,
      default: 'capture'
    },
    // 聚合节点数据
    clusterData: {
      type: Array,
      default: () => []
    },
    // 档案节点数据
    databaseData: {
      type: Array,
      default: () => []
    },
    formatText: {
      type: Function,
      default: (number, count) => `${number}人\n相机: ${count}`
    },
  },
  data() {
    return {
      autoFitLayer: 'captureLayer',

      freeInfoOverlayOptions: {
        offset: [0, -50],
      },
      freeInfo: { features: [] },
      freeInfoOverlayPosition: undefined,

      detailInfo: { features: [] },
      detailInfoOverlayPosition: undefined,
      isCursor: false

    };
  },
  computed: {

    isCaptureMap() {
      return this.type === 'capture';
    },
    isDatabaseMap() {
      return this.type === 'database';
    }
  },
  watch: {
    type(val) {
      if (val === 'database') {
        this.autoFitLayer = 'databaseLayer';
      } else {
        this.autoFitLayer = 'captureLayer';
      }
      this.hideFreeOverlay();
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    }
  },
  created() {

  },
  methods: {
    databaseSelectChange(lonLat, features = []) {
      this.detailInfo = { features };
      this.detailInfoOverlayPosition = lonLat;
    },
    databaseHoverChange(lonLat, features = []) {
      this.freeInfo = { features };
      this.freeInfoOverlayPosition = lonLat;
      if (lonLat) {
        this.isCursor = true;
      } else {
        this.isCursor = false;
      }
    },
    selectChange(lonLat, features = []) {
      this.detailInfo = { features };
      this.detailInfoOverlayPosition = lonLat;
    },
    hoverChange(lonLat, features = []) {
      this.freeInfo = { features };
      this.freeInfoOverlayPosition = lonLat;
      if (lonLat) {
        this.isCursor = true;
      } else {
        this.isCursor = false;
      }
    },
    /**
     * 异常详情
     */
    hideFreeOverlay() {
      this.detailInfoOverlayPosition = undefined;
      this.detailInfo = { features: [] };
      this.$refs[this.autoFitLayer].cancelSelect();
    },
  }
};
</script>
