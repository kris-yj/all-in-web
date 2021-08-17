<template>
  <!--团伙管控 活动规律地图-->
  <map-wrap
    ref="mapView"
    auto-fit-layer="heatmapLayer">
    <cluster-layer
      :format-text="formatText"
      @select="selectChange"
      @hover="hoverChange"
      :is-mouse="true"
      :data="featureData"></cluster-layer>
    <template v-slot:overlay>
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
  </map-wrap>
</template>
<script>
// eslint-disable-next-line import/no-unresolved
import ClusterLayer from './common/cluster-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  name: 'TracePlayMap',
  components: {
    ClusterLayer,
    MapWrap
  },
  props: {
    // 轨迹节点数据
    featureData: {
      type: Array,
      default: () => [],
    },
    /** 聚类显示文本格式化函数 */
    formatText: {
      type: Function,
      default: (number, count) => `${number}人\n相机: ${count}`
    },
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
  created() {
  },
  methods: {
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
.playbar {
  width: 672px;
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  z-index: 1;
  color: #fff;
  .playbar-container {
    width: 100%;
    opacity: 0.56;
    background: #4d5676;
    border-radius: 2px;
    .playbar-content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      align-content: center;
      padding: 8px 20px 8px 20px;
      box-sizing: border-box;
      .playbar-actions {
        width: 34px;
        height: 33px;
        cursor: pointer;
        opacity: 1;
        transition: all 0.3 ease-in-out;
        &:active {
          transform: scale(0.8);
          opacity: 0.8;
        }
        .video-pause {
          color: #fff;
        }
      }
      .playbar-steps {
        width: 545px;
        margin-left: 24px;
        ::v-deep.meg-slider__bar {
          background-color: #fff;
        }
      }
      .playbar-replay {
        width: 34px;
        height: 33px;
        margin-left: 24px;
        cursor: pointer;
        opacity: 1;
        transition: all 0.3 ease-in-out;
        &:active {
          transform: scale(0.8);
          opacity: 0.8;
        }
        .video-replay {
          color: #fff;
        }
      }
    }
  }
}
</style>
