<template>
  <map-wrap
    @ready="ready"
    ref="mapView"
    is-zoom
    auto-fit-layer="traceLineLayer">
    <trace-layer
      @select-change="onTraceNodeClickSelectChange"
      :data="trackData"></trace-layer>
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
            name="freeInfoOverlay"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
  </map-wrap>
</template>
<script>
import {
  traceNodeStyleFn, traceNodeSelectFn, traceLineStyleFn,
} from './styles/common';
// eslint-disable-next-line import/no-unresolved
import TraceLayer from './common/trace-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  components: {
    TraceLayer,
    MapWrap
  },
  props: {
    // 轨迹节点数据
    trackData: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      freeInfo: {},
      freeInfoOverlayOptions: {
        offset: [0, -50],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,

      isSelect: false
    };
  },
  computed: {

  },
  watch: {
    trackData() {
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    },
  },
  created() {
    this.traceNodeyleFn = traceNodeStyleFn;
    this.traceNodeSelectFn = traceNodeSelectFn;
    this.traceLineStyleFn = traceLineStyleFn;
  },
  methods: {
    /**
     * 地图加载完成事件
     */
    ready() {
      this.$emit('ready');
    },
    // 轨迹节点click选择事件回调
    onTraceNodeClickSelectChange(type, select) {
      if (select) {
        this.freeInfo = select.params;
        this.freeInfoOverlayPosition = select.lonLat;
        this.freeInfoOverlayVisible = true;
      } else {
        this.freeInfoOverlayVisible = false;
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
