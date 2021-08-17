<template>
  <alarm-layout>
    <template v-slot:content>
      <!-- 模式选择 -->
      <mode-selector
        class="mode-selector"
        default-value="ModeCapture"
        @mode-changed="onModeChanged">
      </mode-selector>
      <!-- 设备选择 -->
      <device-selector
        class="device-selector"
        :class="{'device-selector_active':deviceSelectorActive}"
        @active-changed="onDeviceSelectorActiveChanged"
        can-drag-type="capture">
      </device-selector>
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
        @close="isShowAlarmDetail = false"></alarm-detail>
      <!-- 报警ws -->
      <alarm-websocket
        :is-open-alarm-audio="isOpenAlarmAudio"
        @update-alarm="updateAlarm"
        @add-alarm="addAlarm">
      </alarm-websocket>
      <!-- 报警订阅 -->
      <alarm-reservation
        @setting-change="updateSettings"
        @setting-ready="readySettings"
        :visible="reservationActive"
        class="alarm-reservation"
        v-show="reservationActive">
      </alarm-reservation>
      <!-- 主显示区 -->
      <div class="main-content">
        <check-point
          v-for="index in 3"
          :key="index"
          :check-point-index="index"
          @card-click="showCaptureDetail"
          @video-play="onVideoPlay">
        </check-point>
        <!-- 报警视频弹窗 -->
        <alarm-video-dialog
          v-if="videoDialogDisplay"
          :device-info="selectDeviceInfo"
          @close="videoDialogDisplay=false">
        </alarm-video-dialog>
        <!-- 抓拍详情 -->
        <capture-detail
          :visible.sync="detailVisible"
          :hide-swiper="true"
          :id="captureId"
          @change="onChangeDetail">
        </capture-detail>
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
import CaptureDetail from '@/common-components/common-capture-detail/capture-detail.vue';
import AlarmLayout from '../alarm-realtime-layout';
import ModeSelector from '../alarm-mode-selector';
// import MultiStageStatistics from '../alarm-multistage-statistics';
import DeviceSelector from '../alarm-device-selector/alarm-device-selector';
import AlarmRealtimeList from '../alarm-realtime-list/alarm-realtime-list';
import CheckPoint from './check-point';
import AlarmVideoDialog from '../alarm-video-dialog';
import SwitchButton from '../alarm-reservation/reservation-switch-button';
import AlarmReservation from '../alarm-reservation/alarm-reservation';
import AlarmWebsocket from '../alarm-websocket';

export default {
  name: 'ModeMap',
  components: {
    AlarmLayout,
    ModeSelector,
    // MultiStageStatistics,
    DeviceSelector,
    AlarmRealtimeList,
    CheckPoint,
    AlarmVideoDialog,
    SwitchButton,
    AlarmReservation,
    AlarmWebsocket,
    AlarmDetail,
    CaptureDetail
  },
  data() {
    return {
      deviceSelectorActive: false,
      selectDeviceInfo: {},
      videoDialogDisplay: false,
      reservationActive: false,

      isOpenAlarmAudio: true,
      isShowAlarmDetail: false,
      currentIndex: 0,
      alarmList: [],
      currentAlarmId: '',

      detailVisible: false,
      captureId: ''
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
     * 播放视频
     */
    onVideoPlay(info) {
      this.selectDeviceInfo = info;
      this.videoDialogDisplay = true;
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
     * @param {Boolean} audioType
     */
    updateSettings(audioType) {
      // 初始化报警列表
      this.isOpenAlarmAudio = audioType;
      this.reservationActive = false;
      this.$refs.alarmList.resetAlarm();
    },
    /**
     * 显示抓拍详情
     */
    showCaptureDetail(data) {
      this.captureId = data.id;
      this.detailVisible = true;
    },

    onChangeDetail() {

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

// .multi-stage-statistics {
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   z-index: 2001;
// }

.main-content {
  display: flex;
  height: calc(100% - 50px);
  margin-top: 50px;
  padding: 0 10px;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  overflow-y: auto;
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
