<template>
  <!--事件档案 详情轨迹地图-->
  <map-wrap
    ref="mapView"
    is-zoom
    auto-fit-layer="traceNodeLayer"
    @ready="ready">
    <!-- 轨迹线图层 -->
    <meg-vector-layer
      name="traceLineLayer"
      :style-function="traceLineStyleFn">
      <!-- 轨迹线图层 -->
      <meg-feature-array
        name="traceLineFeature"
        geom-type="LineString"
        :feature-data="traceLineGeomArray">
      </meg-feature-array>
    </meg-vector-layer>
    <!-- 轨迹节点图层 -->
    <meg-vector-layer
      name="traceNodeLayer"
      :style-function="traceNodeStyleFn">
      <!-- 轨迹节点标注 -->
      <meg-feature-array
        name="traceNodeFeatures"
        type="Point"
        :feature-data="traceNodeData">
      </meg-feature-array>
      <!-- 轨迹节点hover选择手势 -->
      <meg-select-interaction
        name="traceNodeHoverSelectInteraction"
        active
        select-type="mouse-move"
        :active-style-function="traceNodeSelectFn"
        @select-change="()=>{}">
      </meg-select-interaction>
      <!-- 轨迹节点click选择手势 -->
      <meg-select-interaction
        name="traceNodeClickSelectInteraction"
        active
        select-type="single-click"
        :active-style-function="traceNodeSelectFn"
        @select-change="onTraceNodeClickSelectChange">
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
    <!-- 控件插槽 -->
    <template slot="control">
      <slot name="control"></slot>
    </template>
  </map-wrap>
</template>
<script>
import {
  traceLineStyleFn, trackNodeStyleFn, trackNodeSelectFn
} from './styles/common';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  components: {
    MapWrap
  },
  props: {
    // 轨迹节点数据
    trackData: {
      type: Object,
      default: () => ({}),
    },
    isPoint: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {

      freeInfo: {},
      freeInfoOverlayOptions: {
        offset: [0, -20],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,

      isSelect: false
    };
  },
  computed: {
    // 轨迹线渲染数据
    traceLineGeomArray() {
      if (this.trackData.lines) {
        return this.trackData.lines.map((item) => ({
          coordinates: item.data,
          params: item.color
        }));
      }

      return undefined;
    },

    // 轨迹点数据
    traceNodeData() {
      if (this.trackData.nodes) {
        return this.trackData.nodes.map((item) => ({
          coordinates: [item.lon, item.lat],
          params: {
            ...item,
            start: item.start && this.isPoint,
            end: item.end && this.isPoint,
          }
        }));
      }
      return undefined;
    },

  },
  watch: {
    traceLineGeomArray() {
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    },
  },
  created() {
    this.traceNodeStyleFn = trackNodeStyleFn;
    this.traceNodeSelectFn = trackNodeSelectFn;
    this.traceLineStyleFn = traceLineStyleFn;
  },
  methods: {
    /**
     * 地图加载完成事件
     */
    ready() {
      this.$emit('ready');
    },
    // // 轨迹节点hover选择事件回调
    // onTraceNodeHoverSelectChange(select, unselect) {
    //   if (this.isSelect) {
    //     return;
    //   }
    //   if (select) {
    //     this.freeInfo = select.params;
    //     this.freeInfoOverlayPosition = select.lonLat;
    //     this.freeInfoOverlayVisible = true;
    //   }

    //   if (unselect) {
    //     if (!select) this.freeInfoOverlayVisible = false;
    //   }
    // },
    // 轨迹节点click选择事件回调
    onTraceNodeClickSelectChange(select, unselect) {
      if (select) {
        this.freeInfoOverlayVisible = false;
        this.freeInfo = select.params;
        this.freeInfoOverlayPosition = select.lonLat;
        this.freeInfoOverlayVisible = true;
        this.isSelect = true;
      }

      if (unselect) {
        if (!select) {
          this.isSelect = false;
          this.freeInfoOverlayVisible = false;
        }
      }
    },
    /**
     * 显示轨迹节点详情
     */
    showFreeOverlay(data) {
      this.isSelect = true;
      this.freeInfo = { ...data };
      this.freeInfoOverlayPosition = [data.lon, data.lat];
      this.freeInfoOverlayVisible = true;
    },
    /**
     * 关闭自由弹窗
     */
    hideFreeOverlay() {
      this.freeInfoOverlayVisible = false;
    },
  },

};
</script>
<style lang="scss" scoped>
</style>
