<template>
  <alarm-layout>
    <template v-slot:content>
      <!-- 模式选择 -->
      <mode-selector
        class="mode-selector"
        default-value="ModeStruct"
        @mode-changed="onModeChanged">
      </mode-selector>
      <!-- 设备选择 -->
      <device-selector
        class="device-selector"
        mode="struct"
        :class="{'device-selector_active':deviceSelectorActive}"
        @active-changed="onDeviceSelectorActiveChanged"
        @node-click="cameraClick"
        can-drag-type="none">
      </device-selector>
      <!-- 实时抓怕列表 -->
      <capture-realtime-list
        ref="captureList"
        class="capture-realtime-list"
        alarm-mode="struct">
      </capture-realtime-list>
      <!-- 多集群统计 -->
      <!-- <multi-stage-statistics
        class="multi-stage-statistics">
      </multi-stage-statistics> -->

      <!-- 报警详情 -->
      <alarm-detail
        v-if="isShowAlarmDetail"
        :total="alarmList.length"
        :alarm-id="currentAlarmId"
        :index="currentIndex"
        @change="onChange"
        @update="resetAlarm"
        @temp-change="tempChange"
        @close="isShowAlarmDetail = false">
      </alarm-detail>
      <!-- 报警ws -->
      <alarm-websocket
        :is-open-alarm-audio="isOpenAlarmAudio"
        @update-alarm="updateAlarm"
        @add-alarm="addAlarm">
      </alarm-websocket>
      <!-- 报警订阅 -->
      <alarm-reservation
        @setting-change="updateSettings"
        :visible="reservationActive"
        @setting-ready="readySettings"
        class="alarm-reservation"
        v-show="reservationActive">
      </alarm-reservation>
      <!-- 视频容器 -->
      <div class="struct-video-container">
        <struct-video-container
          :device-info="selectDevice"
          @close="onVideoClose">
        </struct-video-container>
      </div>
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
import AlarmRealtimeList from '../alarm-realtime-list/alarm-realtime-list';
import StructVideoContainer from './struct-video-container';
import SwitchButton from '../alarm-reservation/reservation-switch-button';
import AlarmReservation from '../alarm-reservation/alarm-reservation';
import AlarmWebsocket from '../alarm-websocket';

export default {
  name: 'ModeStruct',
  components: {
    AlarmLayout,
    ModeSelector,
    // MultiStageStatistics,
    DeviceSelector,
    AlarmRealtimeList,
    CaptureRealtimeList,
    StructVideoContainer,
    SwitchButton,
    AlarmReservation,
    AlarmWebsocket,
    AlarmDetail
  },
  data() {
    return {
      deviceSelectorActive: false,
      reservationActive: false,
      isAlarmOpenAudio: true,

      isOpenAlarmAudio: true,
      isShowAlarmDetail: false,
      currentIndex: 0,
      alarmList: [],
      currentAlarmId: '',
      selectDevice: {}
    };
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
     * @description 报警详情点击上一个或者下一个时相关处理
     * @param {number} index 下标
     */
    onChange(index) {
      this.currentAlarmId = this.alarmList[index].id;
      this.currentIndex = index;
    },
    /**
     * 新报警产生事件
     */
    addAlarm(alarmList) {
      this.$refs.alarmList.addAlarm(alarmList);
    },
    /**
     * 报警暂存架状态更新
     */
    tempChange(index, type, data) {
      this.updateAlarm([data]);
    },
    /**
     * 处理报警后更新报警列表
     */
    resetAlarm() {
      this.$refs.alarmList.resetAlarm();
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
     * @param {Boolean} audioType
     */
    updateSettings(audioType) {
      // 初始化报警列表
      this.isOpenAlarmAudio = audioType;
      this.reservationActive = false;
      this.$refs.alarmList.resetAlarm();
    },
    /**
     * 点击相机树显示抓拍图
     */
    cameraClick(data) {
      if (data.flag === 'camera') {
        this.selectDevice = data;
        if (this.$refs.captureList) this.$refs.captureList.updateCamera([data]);
      }
    },
    onVideoClose() {
      this.selectDevice = {};
      if (this.$refs.captureList) this.$refs.captureList.updateCamera([]);
    }
  }
};
</script>

<style scoped lang="scss">
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
  // transition: height 0.3s;
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

// .multi-stage-statistics {
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   z-index: 2001;
// }

.struct-video-container {
  width: 100%;
  height: calc(100% - 160px);
  margin-top: 50px;
  margin-bottom: 160px;
  padding: 0 10px;
  box-sizing: border-box;
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
