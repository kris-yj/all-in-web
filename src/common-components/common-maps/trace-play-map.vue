<template>
  <!--实时报警 活动轨迹地图-->
  <map-wrap
    is-zoom
    ref="mapView"
    :cursor="isCursor"
    auto-fit-layer="traceLineLayer"
    @ready="ready">
    <trace-layer
      ref="selectInteraction"
      @hover="onTraceNodeClickHoverChange"
      @select-change="onTraceNodeClickSelectChange"
      :data="featureArray"></trace-layer>
    <nearby-cameras-layer
      :is-show-nearby-cameras="isShowNearbyCameras"
      :show-nearby-cameras-layers="showNearbyCamerasLayers"
      :alarm-data="alarmData"></nearby-cameras-layer>
    <!-- 播放帧图层 -->
    <meg-frames-layer
      name="traceFramesLayer"
      ref="framesLayer"
      :frames="framesData"
      :speed="20"
      :style-function="traceNodeSelectFn"
      @progress="onPlayProgress"
      @end="onPlayEnd">
      <meg-static-feature
        :geometry="moveGeom"
        :params="moveParams">
      </meg-static-feature>
    </meg-frames-layer>
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
    <template slot="control">
      <div
        class="nearby-container"
        v-if="isShowNearbyControls">
        <meg-button
          v-if="!isShowNearbyCameras"
          @click="showNearbyCameras">
          查看附近视频
        </meg-button>
        <div v-else>
          <meg-button @click="hideNearbyCameras">
            取消
          </meg-button>
          <meg-button
            type="primary"
            @click="showVideoPlayer">
            查看范围内视频
          </meg-button>
        </div>
      </div>
      <!-- 播放控制条 -->
      <div class="playbar">
        <div class="playbar-container">
          <div class="playbar-content">
            <div
              class="playbar-actions"
              @click="handleMapPlayOrPause">
              <meg-icon
                class="video-pause"
                width="23px"
                height="23px"
                :name="isPlay ? 'video_pause' : 'video_play'"></meg-icon>
            </div>
            <div
              class="playbar-replay"
              @click="handleMapReplay">
              <meg-icon
                class="video-replay"
                width="23px"
                height="23px"
                name="video_replay"></meg-icon>
            </div>
            <div class="playbar-steps">
              <meg-slider
                v-model="progress"
                :disabled="true"
                :show-tooltip="false"></meg-slider>
            </div>
          </div>
        </div>
      </div>
    </template>
    <meg-dialog
      width="70%"
      :fullscreen="true"
      :visible.sync="innerVisible"
      append-to-body>
      <div class="video-dialog">
        <div class="video-dialog-title">
          <span>实时视频/历史视频</span>
        </div>
        <div class="video-dialog-container">
          <div class="video-menu-list">
            <div
              v-for="video in videoList"
              :class="`${activeId === video.id ? 'video-list-item-active ': ''}video-list-item`"
              :key="video.id"
              @click="onVideoClickHandler(video)">
              {{ video.name }}
            </div>
          </div>
          <div
            class="video-container">
            <meg-stream-player
              :socket-url="clipUrl"
              v-if="clipUrl!=='' && isFile === false"
              @close="closeVideo"></meg-stream-player>
            <meg-file-player
              :socket-url="clipUrl"
              v-else-if="clipUrl!=='' && isFile === true"
              @close="closeVideo"></meg-file-player>
            <div
              v-else
              class="default-video-container">
              <meg-icon
                name="camera_normal"
                height="67px"
                color="#2e385f"
                width="+86px"></meg-icon>
              <span class="text">{{ $t('暂无视频') }}</span>
            </div>
          </div>
        </div>
      </div>
    </meg-dialog>
  </map-wrap>
</template>
<script>
// eslint-disable-next-line import/no-unresolved
import TraceLayer from './common/trace-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
import { traceNodeSelectFn } from './styles/common';
import splineNodes from './util.js';
import NearbyCamerasLayer from './nearby-cameras-layer';
// import { circlePointsData, pointsData } from './mock.js';

export default {
  name: 'TracePlayMap',
  components: {
    TraceLayer,
    MapWrap,
    NearbyCamerasLayer
  },
  props: {
    // 轨迹节点数据
    trackData: {
      type: Array,
      default: () => [],
    },
    // 附近相机图层是否展示
    showNearbyCamerasLayers: {
      type: Boolean,
      default: false
    },
    // 展示查看附近视频控制按钮是否展示
    isShowNearbyControls: {
      type: Boolean,
      default: false
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
      isShowNearbyCameras: false, // 是否展示附近相机
      innerVisible: false,
      isPlay: false,
      disabled: false,
      progress: 0,
      isSelect: false,
      isCursor: false,
      moveParams: {},
      moveGeom: undefined,
      videoList: [],
      isFile: false,
      activeId: 1,
      clipUrl: '',
    };
  },
  computed: {
    // 报警地点位置数据
    alarmData() {
      return this.trackData.filter((item) => item.alarm && item.lon && item.lat);
    },

    // 轨迹显示可用数据
    featureArray() {
      // 先将经纬度为空的过滤掉;
      return this.trackData.filter((val) => val.lon && val.lat);
      // TODO: mock数据
      // return Math.random() > 0.3 ? pointsData : circlePointsData;
    },

    // 轨迹播放进度数据
    framesData() {
      const list = this.featureArray;
      // 轨迹回放按照时间顺序排序
      list.sort((a, b) => a.capturedTime - b.capturedTime);
      const framsData = list.reduce((last, cur) => ({
        node: cur,
        ret: last.ret.concat(...splineNodes(last.node, cur, 100))
      }), {
        node: null,
        ret: []
      }).ret;
      return framsData;
    }
  },
  watch: {
    framesData() {
      this.progress = 0;
    }
  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    this.traceNodeSelectFn = traceNodeSelectFn;
  },
  methods: {
    /**
     * 查看附近视频的click事件回调
    */
    showNearbyCameras() {
      this.isShowNearbyCameras = true;
    },
    /**
     * 取消查看附近视频的click事件回调
    */
    hideNearbyCameras() {
      this.isShowNearbyCameras = false;
    },
    /**
     * 查看范围内视频的click事件回调
    */
    showVideoPlayer() {
      this.innerVisible = true;
    },
    /**
     * 视频切换
    */
    onVideoClickHandler(video) {
      const { id, file: isFile, url } = video;
      this.isFile = isFile;
      this.clipUrl = url;
      this.activeId = id;
    },
    closeVideo() {
      this.clipUrl = '';
    },
    /**
     * 轨迹节点click鼠标移上事件回调
     */
    onTraceNodeClickHoverChange(select) {
      if (select) {
        this.isCursor = true;
      } else {
        this.isCursor = false;
      }
    },
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
     * 播放进程回调
     */
    onPlayProgress(state) {
      const showPosition = [state.frame.lon, state.frame.lat];
      this.freeInfo = state.frame.params;
      // this.freeInfoOverlayVisible = true;
      this.freeInfoOverlayVisible = false;
      this.freeInfoOverlayPosition = showPosition;
      // 设置移动物体位置
      this.moveGeom = {
        type: 'Point',
        coordinates: showPosition
      };
      this.moveParams = state.frame;
      this.progress = Math.floor(((state.current + 1) / state.total) * 100);
    },
    /**
     * 显示轨迹节点详情
     */
    showFreeOverlay(data) {
      if (data.lon && data.lat) {
        this.freeInfo = { ...data };
        this.freeInfoOverlayPosition = [data.lon, data.lat];
        this.freeInfoOverlayVisible = true;
        if (data.captureId) this.$refs.selectInteraction.select(data.captureId);
      }
    },
    /**
     * 关闭自由弹窗
     */
    hideFreeOverlay() {
      this.freeInfoOverlayVisible = false;
      this.$refs.selectInteraction.cancelSelect();
    },
    /**
     * 播放结束回调
     */
    onPlayEnd() {
      this.freeInfoOverlayVisible = false;
      this.isPlay = false;
      this.disabled = true;
      this.$refs.selectInteraction.isAnimating = true;
    },
    /**
     * 点击地图播放
     */
    handleMapPlayOrPause() {
      this.isPlay = !this.isPlay;
      if (this.isPlay) {
        this.disabled = false;
        // TODO: 隐藏附近视频的控制和相关图标展示
        this.showNearbyCamerasLayers = false;
        this.isShowNearbyControls = false;
        this.play();
      } else {
        this.pause();
        this.disabled = true;
      }
    },
    // 点解回放
    handleMapReplay() {
      this.progress = 0;
      this.stop();
      this.isPlay = true;
      this.play();
    },
    /**
     * 播放事件
     */
    play() {
      this.$refs.framesLayer.play();
      this.$refs.selectInteraction.isAnimating = false;
    },
    /**
     * 暂停播放
     */
    pause() {
      this.$refs.framesLayer.pause();
      this.$refs.selectInteraction.isAnimating = true;
    },
    /**
     * 停止播放
     */
    stop() {
      this.$refs.framesLayer.stop();
    },

  },

};
</script>
<style lang="scss" scoped>
.nearby-container{
  position: absolute;
  z-index: 999;
  top: 7px;
  right: 10px;
}
.video-dialog {
  background: #2A2A2A;
  margin: -20px -30px 0px;
  height: 100%;
  .video-dialog-title{
    background: #2A2A2A;
    height: 48px;
    line-height: 48px;
    font-size: 14px;
    color: #F9F9F9;
    letter-spacing: 0;
    padding-left: 20px;
    .fulls-creen-icon {
      position: absolute;
      right: 64px;
      top: 18px;
      opacity: 0.7;
    }
    .fulls-creen-icon:hover{
      cursor: pointer;
    }
  }
  .video-dialog-container{
    display: flex;
    .video-menu-list{
      background: #2A2A2A;
      width: 190px;
      .video-list-item {
        cursor: pointer;
        text-align: center;
        line-height: 36px;
        font-size: 12px;
        color: #D2D6DE;
        height: 36px;
        opacity: 0.8;
      }
      .video-list-item-active{
        background: #484d53;
      }
    }
  }
  .video-container {
    height: calc(100vh - 48px);
    width: 100%;
    position: relative;
  }
  .default-video-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background:linear-gradient(0deg, #252F5B 0%, #1B2141 100%);
    .text {
      color: #505B86;
      margin-top: 15px;
    }
  }
}

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
    background: rgba(77,86,118,.56);
    border-radius: 2px;
    .playbar-content {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      align-content: center;
      padding: 8px 20px 8px 20px;
      box-sizing: border-box;
      line-height: 33px;
      .playbar-actions {
        width: 34px;
        height: 33px;
        cursor: pointer;
        opacity: 1;
        // transition: all 0.3 ease-in-out;
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
