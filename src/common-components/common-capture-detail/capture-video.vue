<template>
  <div class="capture-video">
    <div class="video-title">
      {{ $t('视频回放') }}
    </div>
    <div
      class="more-video"
      v-if="videoInfo.cameraName"
      @click="showVideoPlayback">
      {{ $t('查看更多录像') }}
    </div>
    <div class="player-wrapper">
      <meg-file-player
        ref="player"
        :socket-url="srcCache"
        @close="closePlayer">
      </meg-file-player>
    </div>
    <common-video-playback
      :visible.sync="visible"
      :camera-id="videoInfo.cameraId"
      :camera-name="videoInfo.cameraName"
      :base-url="videoInfo.baseUrl"
      :start-time="startTime"
      :end-time="endTime"
      @close="resumeSrc"></common-video-playback>
  </div>
</template>

<script>
import CommonVideoPlayback from '@/common-components/common-video-playback';

export default {
  components: {
    CommonVideoPlayback
  },
  props: {
    videoInfo: {
      type: Object,
      default: () => {},
      required: true
    }
  },
  data() {
    return {
      visible: false,
      srcCache: this.videoInfo.src
    };
  },
  computed: {
    startTime() {
      return this.videoInfo.capturedTime ? new Date(this.videoInfo.capturedTime - 450000) : '';
    },
    endTime() {
      return this.videoInfo.capturedTime ? new Date(this.videoInfo.capturedTime + 450000) : '';
    }
  },
  watch: {
    'videoInfo.src': function (val) {
      if (val) {
        this.srcCache = val;
      }
    }
  },
  methods: {
    showVideoPlayback() {
      this.srcCache = '';
      this.visible = true;
    },
    closePlayer() {
      this.srcCache = '';
    },
    resumeSrc() {
      if (this.videoInfo.src) {
        this.srcCache = this.videoInfo.src;
      }
    }
  },
};
</script>

<style lang='scss' scoped>
.capture-video {
  margin-top: 20px;
  width: 840px;
  position: relative;
  .more-video {
    position: absolute;
    top: 0;
    right: 0;
    color: #21539b;
    cursor: pointer;
  }
  .video-title {
    display: inline-block;
    margin-bottom: 10px;
    width: 49%;
    font-size: 14px;
    color: #869abb;
  }
  .player-wrapper {
    height: 487px;
  }
}
</style>
