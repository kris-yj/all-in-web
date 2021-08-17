<template>
  <alarm-layout
    header-height="60px"
    :show-header="true"
    :show-aside="false">
    <!-- 头部区域 -->
    <template v-slot:header>
      <div class="mode-police-header">
        <div class="header-left">
          <mode-selector
            ref="modeSelector"
            class="mode-selector"
            default-value="ModePolice"
            @mode-changed="onModeChanged">
          </mode-selector>
          <select-button
            icon="alarm_subscribe"
            label="报警订阅"
            v-model="reservationActive">
          </select-button>
        </div>
        <alarm-statistics
          ref="statistics"
          v-model="searchInfo.processStatus">
        </alarm-statistics>
        <div class="new-alarm-wrap">
          <div
            v-show="alarmTooltipInfoNum>0"
            class="new-alarm-tip">
            <span>{{ $t('有{count}条新的待确认报警', { count: alarmTooltipInfoNum }) }}</span>
            <span
              class="tip-button"
              @click="onClickCheckNewAlarm">{{ $t('查看') }}</span>
          </div>
        </div>
      </div>
    </template>
    <!-- 主体内容区 -->
    <template v-slot:content>
      <div
        v-loading="isLoading"
        class="mode-police-content">
        <!-- 报警订阅 -->
        <alarm-reservation
          class="alarm-reservation"
          :visible="reservationActive"
          @setting-ready="readySettings"
          @setting-change="updateSettings"
          v-show="reservationActive">
        </alarm-reservation>
        <!-- 报警详情 -->
        <alarm-detail
          v-if="isShowAlarmDetail"
          :total="currentAlarmList.length"
          :alarm-id="currentAlarmId"
          :index="currentIndex"
          @change="onChange"
          @temp-change="tempChange"
          @update="resetAlarm"
          @close="isShowAlarmDetail = false"></alarm-detail>
        <alarm-websocket
          :is-open-alarm-audio="isOpenAlarmAudio"
          @update-alarm="updateAlarm"
          @add-alarm="addAlarm">
        </alarm-websocket>
        <!-- 报警列表容器 -->
        <alarm-card-container
          ref="alarmList"
          @alarm-click="showDetail"
          :alarm-list="currentAlarmList"
          @top-visible-change="onTopVisibleChange"
          @scroll-reach-top="onReachTop"
          @scroll-reach-bottom="onReachBottom">
        </alarm-card-container>
      </div>
    </template>
  </alarm-layout>
</template>
<script>
import AlarmDetail from '@/common-components/common-alarm-detail';
import AlarmLayout from '../alarm-realtime-layout';
import ModeSelector from '../alarm-mode-selector';
import SelectButton from '../alarm-select-button';
import AlarmStatistics from './alarm-police-statistics';
import AlarmCardContainer from '../alarm-card-container';
import AlarmReservation from '../alarm-reservation/alarm-reservation';
import AlarmWebsocket from '../alarm-websocket';
// import mockAlarmList from '../../../../mock/alarms';
import AlarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'ModePolice',
  components: {
    AlarmLayout,
    ModeSelector,
    SelectButton,
    AlarmStatistics,
    AlarmCardContainer,
    AlarmReservation,
    AlarmWebsocket,
    AlarmDetail
  },
  data() {
    return {
      currentAlarmList: [],
      reservationActive: false,
      searchInfo: {
        // 0全部 1待确认 2待接收 3待反馈 4已完结
        processStatus: '',
        lastId: '',
        size: 40
      },
      // socket推送过来的报警消息队列
      socketAlarmList: [],
      isSocketDisplay: true, // 是否把socket报警插入页面
      // 今日报警统计
      currentDayAlarmSumData: {},

      isLoading: false,

      // 报警详情信息
      isShowAlarmDetail: false,
      currentIndex: 0,
      currentAlarmId: '',

      // 当前点击的报警详情序号,
      alarmIndex: 0,

      // 获取数据次数
      fetchCount: 0,

      isOpenAlarmAudio: true,
    };
  },
  computed: {
    currentStatus() {
      return this.searchInfo.processStatus;
    },
    alarmTooltipInfoNum() {
      return this.socketAlarmList.filter((item) => item.processStatus.toString() === '1').length;
    },
    maxDisplayNum() {
      const totalFetchNum = this.searchInfo.size * this.fetchCount;
      return totalFetchNum >= 40 ? totalFetchNum : 40;
    }
  },
  watch: {
    isAlarmAuthorizationSetting(val) {
      if (val) {
        this.updateAlarmInfo();
      }
    },
    currentStatus() {
      this.resetAlarm();
    }
  },
  created() {
    this.getCurrDayAlarmList();
  },
  beforeDestroy() {
  },
  methods: {
    /**
     * 布控订阅初始化完成
     * @param {Boolean} audioType 报警声音开关
     */
    readySettings(audioType) {
      this.isOpenAlarmAudio = audioType;
    },
    resetAlarm() {
      this.isSocketDisplay = true;
      this.searchInfo.lastId = '';
      this.currentAlarmList = [];
      this.socketAlarmList = [];
      this.getCurrDayAlarmList();
      this.$refs.statistics.update();
    },
    /**
     * 请求报警列表
     */
    async getCurrDayAlarmList() {
      const params = {
        processStatus: this.searchInfo.processStatus,
        lastId: this.searchInfo.lastId,
        size: this.searchInfo.size
      };
      this.isLoading = true;
      const res = await AlarmRealTimeSrv.getCurrDayAlarmList(params);
      if (params.processStatus !== this.searchInfo.processStatus || res.code !== 0) { // 防止接口pedding造成错误渲染
        return;
      }
      this.isLoading = false;
      // 判断是否有报警 取最后一条id
      if (res.data.length) {
        this.searchInfo.lastId = res.data[res.data.length - 1].id;
      }
      this.currentAlarmList.push(...res.data);
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
    updateAlarm(data) {
      data.forEach((alarm) => {
        this.socketAlarmList = this.socketAlarmList.map((item) => (item.id === alarm.id ? alarm : item));
        this.currentAlarmList = this.currentAlarmList.map((item) => (item.id === alarm.id ? alarm : item));
      });
    },
    /**
     * @description 报警详情点击上一个或者下一个时相关处理
     * @param {number} index 下标
     */
    onChange(index) {
      this.currentAlarmId = this.currentAlarmList[index].id;
      this.currentIndex = index;
    },
    /**
     * 显示告警详情
     * @param { Object } alarm 报警详情数据
     * @param { Number } index 报警列表索引
     * @param { Array  } list 当前报警列表
     */
    showDetail(alarm, index = 0) {
      this.reservationActive = false;
      this.currentIndex = index;
      this.currentAlarmId = alarm.id;
      this.isShowAlarmDetail = true;
    },
    /**
     * 布控订阅设置更新
     * @param {Boolean} audioType
     */
    updateSettings(audioType) {
      // 初始化报警列表
      this.isOpenAlarmAudio = audioType;
      this.resetAlarm();
    },
    /**
     * 模式选择响应事件0
     */
    onModeChanged(mode) {
      this.$emit('mode-changed', mode);
    },
    /**
     * 是否贴顶事件
     */
    onTopVisibleChange(visible) {
      this.isSocketDisplay = visible;
    },
    /**
     * 列表滚动到顶部事件
     */
    onReachTop() {
      this.currentAlarmList.unshift(...this.socketAlarmList);
      this.socketAlarmList = [];
    },
    /**
     * 列表滚动到底部触发
     */
    onReachBottom() {
      // 防止重复请求
      if (this.isLoading) return;
      this.getCurrDayAlarmList();
    },
    /**
     * 查看最新报警返回顶部
     */
    onClickCheckNewAlarm() {
      this.$refs.alarmList.scrollToTop();
    },
    /**
     * 外部更新报警
     */
    addAlarm(data) {
      this.$refs.statistics.update();
      const alarmList = data.reverse();
      const currentAlarmList = [];
      // 先过滤需要不需要插入的报警
      alarmList.forEach((item) => {
        // 推送的报警不在当前tab下
        if (item.processStatus.toString() === this.searchInfo.processStatus || this.searchInfo.processStatus === '') {
          // 报警在列表中已存在
          if (!this.currentAlarmList.find((val) => val.id === item.id)) currentAlarmList.unshift(item);
        }
      });
      // 是否是顶部
      if (this.isSocketDisplay) {
        this.currentAlarmList.unshift(...currentAlarmList);
      } else {
        this.socketAlarmList.unshift(...currentAlarmList);
      }
    },
  }
};
</script>

<style scoped lang="scss">
.mode-police-header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;

  .header-left {
    flex: 0 0 320px;
    display: flex;
    justify-content: space-between;
  }
}
.mode-selector {
  z-index: 100;
}
.new-alarm-wrap {
  width: 235px;
}
.new-alarm-tip {
  width: 215px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fea0a0;
  border: 1px solid #ef7071;
  color: #c83131;
  padding: 0 10px;
  .tip-button {
    cursor: pointer;
  }
}
.mode-police-content {
  height: 100%;
  padding: 0 10px;
}
.alarm-reservation {
  position: absolute;
  height: 100%;
  top: 0;
  z-index: 2000;
}
</style>
