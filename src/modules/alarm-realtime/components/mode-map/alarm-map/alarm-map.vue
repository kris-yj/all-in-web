<template>
  <!-- 报警地图 -->
  <alarm-display-map
    ref="map"
    @status-change="statusChange"
    @select="showCameraOverlay">
    <template v-slot:hover="{params}">
      <div
        v-tooltip="true"
        class="tooltipPopup">
        {{ params.name }}
      </div>
    </template>
    <template v-slot:select>
      <camera-msg
        @close-detail="hideCameraOverlay"
        @video-play="onVideoPlay"
        :open="isOpen"
        :is-loading="isDetailLoading"
        :camera-data="cameraDetailData"></camera-msg>
    </template>
    <template v-slot:alarm="{params}">
      <div @click="alarmClick(params)">
        <alarm-popup
          v-show="params.id"
          :params="params"></alarm-popup>
      </div>
    </template>
  </alarm-display-map>
</template>

<script>
import AlarmDisplayMap from '@/common-components/common-maps/alarm-display-map';
import AlarmPopup from './alarm-popup';
import CameraMsg from './camera-msg';
import { getDeviceList } from '../../device-data';
import alarmRealTimeSrv from '../../../alarm-realtime.service';

export default {
  components: {
    AlarmDisplayMap,
    AlarmPopup,
    CameraMsg
  },
  props: {

  },
  data() {
    return {
      cameraDetailData: {},
      isDetailLoading: false,
      isOpen: true
    };
  },
  mounted() {
    getDeviceList().then((list) => {
      this.$nextTick(() => {
        if (this.$refs.map) this.$refs.map.setFeature(list);
      });
    });
  },
  methods: {
    statusChange(type) {
      this.isOpen = type;
    },
    /**
     * 播放视频
     */
    onVideoPlay(data) {
      this.$emit('on-video-play', data);
    },
    /**
     * 关闭相机详情
     */
    hideCameraOverlay() {
      this.$refs.map.hideCameraOverlay();
    },
    /**
     * 点击地图查看相机详情
     */
    async showCameraOverlay(params) {
      this.eventTracking('AlarmMapMark');
      this.isDetailLoading = true;
      this.$refs.map.showCameraOverlay(params);
      const res = await alarmRealTimeSrv.getDeviceDetail({ id: params.id });
      if (res.code === 0) this.cameraDetailData = res.data;
      this.isDetailLoading = false;
    },
    /**
     * 新报警产生事件
     */
    onAddFeature(alarmList) {
      this.$refs.map.onAddFeature(alarmList);
    },
    /**
     * 点击相机树联动地图位置
     */
    moveTo(data = {}) {
      if (data.flag === 'camera' && data.lon && data.lat) {
        this.showCameraOverlay(data);
      } else if (data.flag === 'unit' && data.lon && data.lat) {
        this.$refs.map.moveTo(data);
      }
    },
    /**
     * 点击报警详情
     */
    alarmClick(alarm) {
      this.$audio.stop();
      this.$emit('alarm-click', alarm);
    }
  }
};
</script>

<style scoped>
.tooltipPopup {
  box-sizing: border-box;
  max-width: 130px;
  height: 24x;
  line-height: 24px;
  font-size: 12px;
  padding: 0 5px;
  background: #ffffff;
  color: #444444;
  text-align: center;
  box-shadow: 0 3px 1px rgba(0, 0, 0, 0.1);
}
</style>
