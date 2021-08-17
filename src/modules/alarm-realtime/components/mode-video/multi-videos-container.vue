<template>
  <div class="video-container">
    <div
      class="video-item"
      v-for="index in 4"
      :key="index"
      :class="{'active': activeIndex === index}">
      <video-container
        :video-index="index"
        :active="activeIndex === index"
        @device-change="onDeviceChange"
        @active-change="onVideoActiveChange">
      </video-container>
    </div>
  </div>
</template>
<script>
import VideoContainer from '../alarm-video-container/alarm-video-container';

export default {
  name: 'MultiVideosContainer',
  components: {
    VideoContainer
  },
  data() {
    return {
      activeIndex: 0,
      deviceIds: []
    };
  },
  methods: {
    onVideoActiveChange(index, active) {
      if (!active) {
        this.activeIndex = 0;
      } else {
        this.activeIndex = index;
      }
    },
    /**
     * 播放设备更新
     */
    onDeviceChange(index, device = {}) {
      this.deviceIds[index - 1] = device;
      this.$emit('device-change', this.deviceIds.filter((item) => item.id));
    }
  }
};
</script>
<style lang="scss" scoped>
.video-container {
  width: 100%;
  height: 100%;
  display: grid;
  position: relative;

  gap: 5px;
  grid-template: 1fr 1fr / 1fr 1fr;

  .video-item {
    background-image: linear-gradient(0deg, #252f5b 0%, #1b2141 100%);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;

    &.active {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99;
    }
  }
}
</style>
