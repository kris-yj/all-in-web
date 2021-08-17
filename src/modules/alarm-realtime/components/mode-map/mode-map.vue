<template>
  <alarm-layout>
    <template v-slot:content>
      <!-- 模式选择 -->
      <mode-selector
        class="mode-selector"
        default-value="ModeMap"
        @mode-changed="onModeChanged">
      </mode-selector>
      <!-- 设备选择 -->
      <device-selector
        class="device-selector"
        can-drag-type="none"
        :class="{'device-selector_active':deviceSelectorActive}"
        @active-changed="onDeviceSelectorActiveChanged"
        @node-click="cameraClick">
      </device-selector>
      <!-- 实时报警地图 -->
      <alarm-map
        @alarm-click="showDetail"
        @on-video-play="onVideoPlay"
        ref="map">
      </alarm-map>
      <!-- 报警视频弹窗 -->
      <alarm-video-dialog
        v-if="videoDialogDisplay"
        @on-video-play="onVideoPlay"
        :device-info="selectDeviceInfo"
        @close="videoDialogDisplay=false">
      </alarm-video-dialog>
      <!-- 实时抓怕列表 -->
      <capture-realtime-list
        ref="captureList"
        class="capture-realtime-list"
        alarm-mode="map">
      </capture-realtime-list>
      <!-- TO DO 产品说不要 -->
      <!-- 多集群统计 -->
      <!-- <multi-stage-statistics
        class="multi-stage-statistics">
      </multi-stage-statistics> -->
      <!-- 报警订阅 -->
      <alarm-reservation
        class="alarm-reservation"
        :visible="reservationActive"
        @setting-change="updateSettings"
        @setting-ready="readySettings"
        v-show="reservationActive">
      </alarm-reservation>
      <!-- 报警详情 -->
      <alarm-detail
        v-if="isShowAlarmDetail"
        :total="alarmList.length"
        :alarm-id="currentAlarmId"
        :index="currentIndex"
        @change="onChange"
        @update="resetAlarm"
        @temp-change="tempChange"
        @close="isShowAlarmDetail = false"></alarm-detail>
      <!-- 报警ws -->
      <alarm-websocket
        :is-open-alarm-audio="isOpenAlarmAudio"
        @update-alarm="updateAlarm"
        @add-alarm="addAlarm">
      </alarm-websocket>
    </template>
    <template v-slot:aside>
      <!-- 实时报警列表 -->
      <alarm-realtime-list
        @card-click="showDetail"
        ref="alarmList">
        <template v-slot:corner>
          <switch-button v-model="reservationActive"></switch-button>
        </template>
      </alarm-realtime-list>
    </template>
  </alarm-layout>
</template>

<script>
import AlarmDetail from '@/common-components/common-alarm-detail';
import AlarmLayout from '../alarm-realtime-layout';
import ModeSelector from '../alarm-mode-selector';
// import MultiStageStatistics from '../alarm-multistage-statistics';
import DeviceSelector from '../alarm-device-selector/alarm-device-selector';
import CaptureRealtimeList from '../capture-realtime-list/capture-realtime-list';
import AlarmMap from './alarm-map/alarm-map';
import AlarmRealtimeList from '../alarm-realtime-list/alarm-realtime-list';
import AlarmWebsocket from '../alarm-websocket';
import AlarmVideoDialog from '../alarm-video-dialog';
import { setCustomSetting, getCustomSetting } from '../device-data';
import SwitchButton from '../alarm-reservation/reservation-switch-button';
import AlarmReservation from '../alarm-reservation/alarm-reservation';

export default {
  name: 'ModeMap',
  components: {
    AlarmLayout,
    AlarmWebsocket,
    ModeSelector,
    // MultiStageStatistics,
    DeviceSelector,
    AlarmRealtimeList,
    CaptureRealtimeList,
    AlarmMap,
    AlarmVideoDialog,
    SwitchButton,
    AlarmReservation,
    AlarmDetail
  },
  data() {
    return {
      deviceSelectorActive: false,
      videoDialogDisplay: false,
      reservationActive: false,
      selectDeviceInfo: {},
      isOpenAlarmAudio: true,
      isShowAlarmDetail: false,
      currentIndex: 0,
      alarmList: [],
      currentAlarmId: ''
    };
  },
  created() {
    getCustomSetting('map').then((settings) => {
      if (this.$refs.captureList) this.$refs.captureList.updateCamera(settings);
    });
  },
  methods: {
    /**
     * 模式选择响应事件
     */
    onModeChanged(mode) {
      this.$emit('mode-changed', mode);
    },

    onDeviceSelectorActiveChanged(active) {
      this.deviceSelectorActive = active;
    },
    /**
     * 视频播放
     */
    onVideoPlay(data) {
      this.selectDeviceInfo = data;
      this.videoDialogDisplay = true;
    },
    /**
     * 新报警产生事件
     */
    addAlarm(alarmList) {
      this.$refs.alarmList.addAlarm(alarmList);
      this.$refs.map.onAddFeature(alarmList);
    },
    /**
     * 处理报警后更新报警列表
     */
    resetAlarm() {
      this.$refs.alarmList.resetAlarm();
    },
    /**
     * 报警暂存架状态更新
     */
    tempChange(index, type, data) {
      this.updateAlarm([data]);
    },
    /**
     * websoket更新报警
     */
    updateAlarm(data) {
      data.forEach((item) => {
        this.$refs.alarmList.updateAlarm(item.id, item);
      });
    },
    /**
     * @description 报警详情点击上一个或者下一个时相关处理
     * @param {number} index 下标
     */
    onChange(index) {
      this.currentAlarmId = this.alarmList[index].id;
      this.currentIndex = index;
    },
    /**
     * 显示告警详情
     * @param { Object } alarm 报警详情数据
     * @param { Number } index 报警列表索引
     * @param { Array  } list 当前报警列表
     */
    showDetail(alarm, index = 0, list = []) {
      this.currentIndex = index;
      this.alarmList = list;
      this.currentAlarmId = alarm.id;
      this.isShowAlarmDetail = true;
    },
    /**
     * 布控订阅初始化完成
     * @param {Boolean} audioType 报警声音开关
     */
    readySettings(audioType) {
      this.isOpenAlarmAudio = audioType;
    },
    /**
     * 布控订阅设置更新
     * @param {Boolean} audioType 报警声音开关
     */
    updateSettings(audioType) {
      // 初始化报警列表
      this.isOpenAlarmAudio = audioType;
      this.reservationActive = false;
      this.$refs.alarmList.resetAlarm();
    },
    /**
     * 点击相机树联动地图位置
     */
    cameraClick(data) {
      if (data.flag === 'camera') {
        setCustomSetting('map', 0, data);
        if (this.$refs.captureList) this.$refs.captureList.updateCamera([data]);
      }
      this.$refs.map.moveTo(data);
    },

  }
};
</script>

<style scoped >
.mode-selector {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
}

.device-selector {
  position: absolute;
  top: 10px;
  left: 170px;
  width: 155px;
  height: 44px;
  z-index: 100;
}

.device-selector_active {
  height: calc(100% - 130px);
}

.capture-realtime-list {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 100%;
}

.alarm-reservation {
  position: absolute;
  height: 100%;
  right: 0;
  top: 0;
  z-index: 100;
  box-shadow: -3px 3px 5px 1px #dce1e5;
}
</style>
