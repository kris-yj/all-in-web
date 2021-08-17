<template>
  <div class="alarm-video-dialog">
    <div
      class="close-btn"
      v-show="!socketUrl"
      @click="onPlayerClose">
      <meg-icon
        name="close_player"
        width="15"
        height="15"
        color="#fff">
      </meg-icon>
    </div>
    <div
      class="player-container">
      <meg-stream-player
        :socket-url="socketUrl"
        :title="title"
        @close="onPlayerClose">
      </meg-stream-player>
    </div>
  </div>
</template>
<script>
import alarmRealTimeSrv from '../alarm-realtime.service';

export default {
  name: 'AlarmVideoDialog',
  props: {
    deviceInfo: {
      type: Object,
      default: () => ({ url: '', name: '' })
    }
  },
  data() {
    return {
      socketUrl: ''
    };
  },
  computed: {
    title() {
      return this.deviceInfo.name || '';
    }
  },
  async created() {
    const params = {
      deviceId: this.deviceInfo.id,
      protocol: 'iot'
    };
    const res = await alarmRealTimeSrv.getDeviceVideoAddress(params);
    if (res.code !== 0) {
      return;
    }
    const { url } = res.data;
    const videoSrcInfo = await alarmRealTimeSrv.getVideoStreamAddress({
      type: 'iot',
      url
    });
    this.socketUrl = videoSrcInfo.data.streamAddr;
  },
  methods: {
    onPlayerClose() {
      this.socketUrl = '';
      this.$emit('close');
    }
  }
};
</script>
<style lang="scss" scoped>
.alarm-video-dialog {
  position: absolute;
  width: 600px;
  height: 400px;
  left: 50%;
  top: 50%;
  margin-left: -300px;
  margin-top: -200px;
  .player-container {
    width: 100%;
    height: 100%;
  }
  .close-btn {
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
    z-index: 3;
  }
}
</style>
