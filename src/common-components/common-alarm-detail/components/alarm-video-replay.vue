<template>
  <div class="alarmVideoReplay-container">
    <div class="alarmVideoReplay-left-container">
      <p>{{ $t('抓拍图') }}</p>
      <div
        class="all-img-container">
        <meg-img-container
          :aspect-ratio="1.34"
          text-align="center"
          vertical-align="middle"
          :img-src="videoInfo.faceOnlyUrl"></meg-img-container>
      </div>
      <div class="video-downLoad-btn">
        <a
          v-if="videoInfo.clipUrl!=='' && videoInfo.clipUrl"
          :href="videoInfo.clipFile"
          :download="$t('抓拍视频')">
          <meg-button>
            <i class="meg-icon-download"></i>
            {{ $t('下载视频') }}</meg-button>
        </a>
      </div>
    </div>
    <div class="alarmVideoReplay-right-container">
      <div
        class="video-container">
        <!-- 播放完成重置 -->
        <meg-file-player
          :socket-url="videoInfo.clipUrl"
          v-if="videoInfo.clipUrl!==''"></meg-file-player>
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
</template>
<script>

export default {
  name: 'AlarmVideoReplay',
  props: {
    videoInfo: {
      type: Object,
      default: () => {},
      required: true
    }
  },
  data() {
    return {
      videoKey: new Date().getTime()
    };
  },
  watch: {
    videoInfo() {
      this.videoKey = new Date().getTime();
    }

  },
  methods: {
    /**
     * 视频播放结束事件
     */
    videoPlayEnd() {
      this.videoKey = new Date().getTime();
    }
  }
};
</script>
<style scoped lang="scss">
.alarmVideoReplay-container {
  width: 100%;
  height: 100%;
}
.alarmVideoReplay-left-container {
  width: 308px;
  height: 100%;
  margin-right: 20px;
  float: left;
}
.alarmVideoReplay-right-container {
  height: 100%;
  width: calc(100% - 328px);
  float: right;
}
.alarmVideoReplay-left-container p {
  line-height: 36px;
  font-size: 14px;
  color: #777777;
}
.alarmVideoReplay-right-container p {
  line-height: 36px;
  font-size: 14px;
  color: #777777;
}
.all-img-container {
  height: 230px;
  width: 308px;
}
.video-downLoad-btn {
  height: 35px;
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
.video-container {
  margin-top: 20px;
  margin-right: 20px;
  height: 400px;
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
</style>
<style>
.alarmVideoReplay-container .video-js.vjs-ended {
  position: absolute;
}
.alarmVideoReplay-container .video-js.vjs-ended .vjs-big-play-button {
  top: 50%;
  left: 50%;
  margin-left: -50px;
  margin-top: -50px;
}
.alarmVideoReplay-container .video-js .vjs-time-control {
  padding: 0;
  display: inline-block;
}
.alarmVideoReplay-container .video-js .vjs-remaining-time {
  padding: 0;
  display: inline-block;
}
.alarmVideoReplay-container .vjs-current-time.vjs-time-control.vjs-control {
  padding: 0;
  display: inline-block;
}
.alarmVideoReplay-container .vjs-duration.vjs-time-control.vjs-control {
  padding: 0;
  display: inline-block;
}
.alarmVideoReplay-container .vjs-time-control.vjs-time-divider {
  min-width: auto;
  width: 3px;
  padding: 0;
}
</style>
