<template>
  <div class="alarm-realtime-list">
    <div class="header">
      <alarm-realtime-statistics
        ref="alarmStatistics"
        v-model="processStatus">
        <template v-slot:icon-corner>
          <slot name="corner"></slot>
        </template>
      </alarm-realtime-statistics>
    </div>
    <div class="container">
      <alarm-realtime-container
        :loading="isLoading"
        @alarm-click="alarmClick"
        @scroll-reach-top="()=>{}"
        @scroll-reach-bottom="getCurrDayAlarmList"
        :alarm-list="alarmList">
      </alarm-realtime-container>
    </div>
  </div>
</template>
<script>
import AlarmRealtimeStatistics from './alarm-realtime-statistics';
import AlarmRealtimeContainer from '../alarm-card-container';
// import mockAlarmList from '../../../../mock/alarms';
import AlarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'AlarmRealtimeList',
  components: {
    AlarmRealtimeStatistics,
    AlarmRealtimeContainer
  },
  data() {
    return {
      isLoading: false,
      fetchNumPerTime: 20,
      fetchCount: 0,
      alarmList: [],
      processStatus: '1',
      lastId: '',
      getSize: 20,
    };
  },
  computed: {
    maxDisplayNum() {
      const totalFetchNum = this.fetchNumPerTime * this.fetchCount;
      return totalFetchNum >= 60 ? totalFetchNum : 60;
    }
  },
  watch: {
    processStatus() {
      this.resetAlarm();
    }
  },
  created() {
    this.getCurrDayAlarmList();
  },
  methods: {
    async getCurrDayAlarmList() {
      const params = {
        processStatus: this.processStatus,
        lastId: this.lastId,
        size: this.getSize
      };
      this.isLoading = true;
      const res = await AlarmRealTimeSrv.getCurrDayAlarmList(params);
      if (params.processStatus !== this.processStatus || res.code !== 0) { // 防止接口pedding造成错误渲染
        return;
      }
      this.isLoading = false;
      /**
       * 是否是初始化的第一页
       */
      if (params.lastId) {
        this.alarmList.push(...res.data);
      } else {
        this.alarmList = res.data;
      }
      // 判断是否有报警 取最后一条id
      if (res.data.length) {
        this.lastId = res.data[res.data.length - 1].id;
      }
    },
    /**
     * 外部更新报警
     */
    addAlarm(data) {
      this.$refs.alarmStatistics.update();
      const alarmList = data.reverse();
      alarmList.forEach((item) => {
        // 推送的报警不在当前tab下
        if (item.processStatus.toString() === this.processStatus || this.processStatus === '') {
          // 报警在列表中已存在
          if (!this.alarmList.find((val) => val.id === item.id)) this.alarmList.unshift(item);
        }
      });
    },
    /**
     * 外部更新报警状态
     * @param { String } id 报警id
     * @param { Object } data 报警信息
     */
    updateAlarm(id, data) {
      this.alarmList = this.alarmList.map((item) => (item.id === id ? data : item));
    },
    /**
     * 初始化报警列表清空所有状态
     */
    resetAlarm() {
      this.fetchCount = 0;
      this.lastId = '';
      this.alarmList = [];
      this.getCurrDayAlarmList();
      this.$refs.alarmStatistics.update();
    },
    /**
     * 点击报警
     * @param { Object } alarm 报警详情数据
     * @param {Number } index 报警列表索引
     */
    alarmClick(alarm, index) {
      this.$audio.stop();
      this.$emit('card-click', alarm, index, this.alarmList);
    }
  }
};
</script>
<style lang="scss" scoped>
.alarm-realtime-list {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #c8d0d9;
  * {
    user-select: none;
  }
  .header {
    flex: 0 0 68px;
  }
  .container {
    flex: 1 0 calc(100%-68px);
    padding-left: 5px;
  }
}
</style>
