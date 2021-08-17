<template>
  <!--脸人融合 轨迹分析地图-->
  <map-wrap
    ref="mapView"
    auto-fit-layer="traceLineLayer">
    <trace-layer
      @hover="ontrackNodeHoverSelectChange"
      @select-change="ontrackNodeClickSelectChange"
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
          <div>
            <slot
              name="freeInfoBody"
              :params="params">
            </slot>
          </div>
        </template>
      </meg-overlay>
    </template>
    <!-- 控件插槽 -->
    <template slot="control">
      <!-- 播放控制条 -->
      <div
        class="time-slider"
        v-if="isShowTimeSlider">
        <time-slider
          :start="startDay"
          :end="endDay"
          @change="dateChange"
          :block-data="blockData"></time-slider>
      </div>
    </template>
  </map-wrap>
</template>
<script>
import moment from 'moment';
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
    trackList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

      freeInfo: {},
      freeInfoOverlayOptions: {
        offset: [0, -35],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,

      targetDay: '',
      isClickSelect: false

    };
  },
  computed: {
    // 是否显示控制条
    isShowTimeSlider() {
      return this.trackList.length > 0;
    },
    // 轨迹按天数拍平map
    trackMap() {
      const map = new Map();
      this.trackList.forEach((item) => {
        map.set(item.captureDay, item.captures);
      });
      return map;
    },
    // 控制条开始时间
    startDay() {
      if (this.trackList.length) {
        return new Date(this.trackList[0].captureDay).getTime();
      }
      return 0;
    },
    // 控制条结束时间
    endDay() {
      if (this.trackList.length) {
        return new Date(this.trackList[this.trackList.length - 1].captureDay).getTime();
      }
      return 0;
    },
    // 当天轨迹数据
    trackData() {
      return this.trackMap.get(this.targetDay);
    },

    /**
     * 控制条块数组
     */
    blockData() {
      const list = [];
      const startDay = moment(this.startDay);
      const endDay = moment(this.endDay);
      const limit = endDay.diff(startDay, 'days');
      for (let i = 0; i <= limit; i += 1) {
        const day = moment(this.startDay).add(i, 'days').format('YYYY-MM-DD');
        list.push({
          time: day,
          haveTrace: !!this.trackMap.get(day)
        });
      }
      return {
        type: 'init',
        data: list
      };
    },

  },
  watch: {
    trackData() {
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    },
  },
  created() {

  },
  mounted() {
    if (this.trackList.length) {
      this.targetDay = this.trackList[0].captureDay;
      this.$emit('date-change', this.targetDay);
    }
  },
  methods: {
    // 轨迹节点hover选择事件回调
    ontrackNodeHoverSelectChange(select, unselect) {
      if (this.isClickSelect) {
        return;
      }
      if (select) {
        this.freeInfo = select.params;
        this.freeInfoOverlayPosition = select.lonLat;
        this.freeInfoOverlayVisible = true;
      }

      if (unselect) {
        if (!select) this.freeInfoOverlayVisible = false;
      }
    },
    // 轨迹节点click选择事件回调
    ontrackNodeClickSelectChange(select, unselect) {
      if (select) {
        this.freeInfoOverlayVisible = false;
        this.freeInfo = select.params;
        this.freeInfoOverlayPosition = select.lonLat;
        this.isClickSelect = true;
        this.freeInfoOverlayVisible = true;
      }

      if (unselect) {
        if (!select) {
          this.isClickSelect = false;
          this.freeInfoOverlayVisible = false;
        }
      }
    },
    /**
     * 时间滑块改变
     */
    dateChange(start) {
      this.targetDay = start.format('YYYY-MM-DD');
      this.isClickSelect = false;
      this.freeInfoOverlayVisible = false;
      this.$emit('date-change', this.targetDay);
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
.time-slider {
  position: absolute;
  bottom: 50px;
  width: calc(100% - 400px);
  left: 200px;
  z-index: 1;
}
</style>
