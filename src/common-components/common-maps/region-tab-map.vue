<template>
  <!--事件档案 详情轨迹地图-->
  <map-wrap
    ref="map"
    :auto-fit-layer="autoFitLayer"
    @ready="ready">
    <line-layer
      name="region"
      :region-data="regionData"></line-layer>
    <!-- 抓拍聚合 -->
    <cluster-layer
      name="clusterLayer"
      :data="clusterData"
      @select="selectChange"
      @hover="hoverChange"
      :is-mouse="true"
      :format-text="formatText"
      :is-visible="isCaptureMap"></cluster-layer>
    <template v-slot:overlay>
      <over-list
        :auto-fit="false"
        name="mapOverlayList"
        :max-feature-num="1000"
        :is-visible="isDatabaseMap"
        :data="databaseData">
        <template v-slot:list="{params}">
          <slot
            name="list"
            :params="params">
          </slot>
        </template>
      </over-list>
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
// eslint-disable-next-line import/no-unresolved
import LineLayer from './common/line-layer';
// eslint-disable-next-line import/no-unresolved
import ClusterLayer from './common/cluster-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import OverList from './common/overlay-list';

export default {
  components: {
    LineLayer,
    ClusterLayer,
    MapWrap,
    OverList
  },
  props: {
    // 区域节点数据
    regionData: {
      type: Object,
      default: () => {},
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
    type: {
      type: String,
      default: 'database'
    },
    /** 聚类显示文本格式化函数 */
    formatText: {
      type: Function,
      default: (number, count) => `${number}人\n相机: ${count}`
    },
    // 标注图层是否自动适应
    overlayAutoFit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      freeInfoOverlayOptions: {
        offset: [0, -50],
      },
      freeInfo: { features: [] },
      freeInfoOverlayPosition: undefined,

      detailInfo: { features: [] },
      detailInfoOverlayPosition: undefined
    };
  },
  computed: {
    autoFitLayer() {
      if (!this.overlayAutoFit) return 'region';
      return this.type === 'database' ? 'mapOverlayList' : 'clusterLayer';
    },
    isCaptureMap() {
      return this.type === 'capture';
    },
    isDatabaseMap() {
      return this.type === 'database';
    }
  },
  watch: {
    type() {
      this.$nextTick(this.$refs.map.fitForLayer);
    }
  },
  created() {
  },
  methods: {
    ready() {
      this.$emit('ready');
    },
    /**
     * 抓拍聚合
     * @param {Array} features 聚合抓拍数据
     */
    selectChange(lonLat, features = []) {
      this.detailInfo = { features };
      this.detailInfoOverlayPosition = lonLat;
    },
    hoverChange(lonLat, features = []) {
      this.freeInfo = { features };
      this.freeInfoOverlayPosition = lonLat;
    },
    /**
     * 异常详情
     */
    hideFreeOverlay() {
      this.detailInfoOverlayPosition = undefined;
      this.detailInfo = { features: [] };
    },
  },

};
</script>
<style lang="scss" scoped>

</style>
