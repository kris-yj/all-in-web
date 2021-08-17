<template>
  <div class="alarm-realtime-statistics">
    <div class="alarm-statistics-header">
      <!-- slot 留给外部的报警订阅 奇葩设计 -->
      <span class="alarm-list-icon">
        <slot name="icon-corner"></slot>
      </span>
      <span class="alarm-total-num">{{ $t('今日报警') }}
        <label>{{ realtimeAlarmStatisticsData.allNum }}</label>
      </span>
      <span
        @click="checkAllAlarm"
        class="alarm-list-all">
        {{ $t('查看全部') }}
        <meg-icon
          width="10"
          height="10"
          name="arrow_right"></meg-icon>
      </span>
    </div>
    <div class="alarm-status-tab">
      <span
        @click="tabClick('1')"
        :class="{'active':processStatus==='1'}"
        v-tooltip="true">
        {{ $t('待确认') }}({{ formatNum(realtimeAlarmStatisticsData.toBeConfirmedNum) }})
      </span>
      <span
        @click="tabClick('2')"
        :class="{'active':processStatus==='2'}"
        v-tooltip="true">
        {{ $t('待接收') }}({{ formatNum(realtimeAlarmStatisticsData.toBeReceivedNum) }})
      </span>
      <span
        @click="tabClick('3')"
        :class="{'active':processStatus==='3'}"
        v-tooltip="true">
        {{ $t('待反馈') }}({{ formatNum(realtimeAlarmStatisticsData.toBeFeedBackNum) }})
      </span>
      <span
        @click="tabClick('')"
        :class="{'active':processStatus===''}">
        {{ $t('全部') }}
      </span>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import AlarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'AlarmRealtimeStatistics',
  model: {
    prop: 'active',
    event: 'change'
  },
  props: {
    active: {
      type: String,
      default: '1'
    }
  },
  data() {
    return {
      processStatus: '1',
      realtimeAlarmStatisticsData: {
        allNum: 0,
        toBeConfirmedNum: 0,
        toBeReceivedNum: 0,
        toBeFeedBackNum: 0
      },
      isPending: false,
      isLoading: false
    };
  },
  watch: {
    active(value) {
      this.processStatus = value;
    }
  },
  created() {
    this.getCurrDayAlarmSumData();
  },
  methods: {
    /**
     * 获取今日报警数量统计
     */
    async getCurrDayAlarmSumData() {
      if (this.isLoading) {
        this.isPending = true;
        return;
      }
      this.isPending = false;
      this.isLoading = true;
      const res = await AlarmRealTimeSrv.getCurrDayAlarmSumData();
      this.isLoading = false;
      if (this.isPending) this.getCurrDayAlarmSumData();
      if (res.code === 0) this.realtimeAlarmStatisticsData = res.data;
    },
    tabClick(value) {
      this.processStatus = value;
      this.$emit('change', value);
    },
    checkAllAlarm() {
      const moduleAuth = this.$store.getters.modulesByAlias('alarm-history');
      if (moduleAuth) {
        const startTime = new Date().setHours(0, 0, 0, 0);
        const endTime = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
        switchToModule({
          module: 'alarm-history',
          query: {
            timeArr: JSON.stringify([startTime, endTime]),
            type: 'camera'
          }
        });
      } else {
        this.$message.info('当前用户无历史报警查看权限');
      }
    },
    /**
     * 刷新报警数量
     */
    update() {
      this.getCurrDayAlarmSumData();
    },
    formatNum(num) {
      return num > 999 ? '999+' : `${num}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.alarm-realtime-statistics {
  .alarm-statistics-header {
    height: 36px;
    background: #232d68;
    color: #c7ced8;
    padding: 0 10px;
    display: flex;
    align-items: center;
    .alarm-total-num {
      display: inline-block;
      margin-right: auto;
      margin-left: 5px;
      vertical-align: middle;
      width: 232px;
      line-height: 26px;
      height: 30px;
      padding-top: 6px;
      label {
        color: #ffffff;
        margin-left: 12px;
        font-family: HEMIHEAD;
        font-size: 20px;
      }
    }
    .alarm-list-icon {
      display: inline-block;
      vertical-align: middle;
      width: 20px;
      height: 36px;
      line-height: 36px;
    }
    .alarm-list-all {
      cursor: pointer;
      font-size: 12px;
      line-height: 10px;
    }
  }
  .alarm-status-tab {
    height: 32px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: #232d68;
    color: #c7ced8;
    line-height: 32px;
    font-size: 12px;
    span {
      flex: 1;
      height: 32px;
      cursor: pointer;
      text-align: center;
      border-bottom: 4px solid #232d68;
      overflow: hidden;
      box-sizing: border-box;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        color: #ffffff;
      }
      &.active {
        color: #ffffff;
        font-weight: 700;
        border-bottom: 4px solid #ffffff;
      }
    }
  }
}
</style>
