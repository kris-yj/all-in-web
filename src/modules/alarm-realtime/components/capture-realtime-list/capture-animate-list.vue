<template>
  <animate-card-frame
    ref="cardFrame"
    :max-display-num="14">
    <template v-slot:default="{data}">
      <div
        class="img-item"
        :style="toBackgroundStyle(data.cropUrl)"
        @click.stop="onImgClick(data)">
      </div>
    </template>
  </animate-card-frame>
</template>
<script>
import AnimateCardFrame from '../animate-card-frame.vue';
import RequestLooper from '../request-looper';
import alarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'CaptureAnimateList',
  components: {
    AnimateCardFrame
  },
  props: {
    deviceInfo: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      device: []
    };
  },
  created() {
    this.looper = new RequestLooper(
      () => {
        const params = {
          modeType: 'capture-list',
          cameraId: this.device.join()
        };
        return alarmRealTimeSrv.getCaptureRealTimeList(params);
      },

      (response) => {
        if (response.code === 0) {
          this.$refs.cardFrame.addCard(response.data.records);
        }
      },
      500
    );
  },
  mounted() {
  },
  beforeDestroy() {
    this.looper.destroy();
  },
  methods: {
    /**
     * 更新设备列表
     */
    updateDeviceInfo(deviceInfo) {
      this.device = deviceInfo;
      if (this.device.length) {
        this.looper.start();
      } else {
        this.looper.stop();
      }
    },
    toBackgroundStyle(url) {
      return {
        backgroundImage: `url(${url})`
      };
    },
    /**
     * 查看抓拍详情
     */
    onImgClick(data) {
      this.$emit('on-img-click', data);
    }
  }
};
</script>
<style lang="scss" scoped>
.img-item {
  width: 90px;
  height: 90px;
  margin-left: 10px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #ffffff;
  box-shadow: 0 3px 1px rgba(0, 0, 0, 0.1);
}
</style>
