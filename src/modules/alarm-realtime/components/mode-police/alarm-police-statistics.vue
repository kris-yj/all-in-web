<template>
  <div class="tab-title-container">
    <meg-radio-group
      class="category-btn-group"
      v-model="processStatus"
      @change="onChange">
      <meg-radio-button
        label="">
        {{ $t('全部') }} {{ realtimeAlarmStatisticsData.allNum }}
      </meg-radio-button>
      <meg-radio-button
        label="1">
        {{ $t('待确认') }} {{ realtimeAlarmStatisticsData.toBeConfirmedNum }}
      </meg-radio-button>
      <meg-radio-button
        label="2">
        {{ $t('待接收') }} {{ realtimeAlarmStatisticsData.toBeReceivedNum }}
      </meg-radio-button>
      <meg-radio-button
        label="3">
        {{ $t('待反馈') }} {{ realtimeAlarmStatisticsData.toBeFeedBackNum }}
      </meg-radio-button>
      <meg-radio-button
        label="4">
        {{ $t('已办结') }} {{ realtimeAlarmStatisticsData.completedNum }}
      </meg-radio-button>
    </meg-radio-group>
  </div>
</template>

<script>
import AlarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'AlarmPoliceStatistics',
  model: {
    prop: 'active',
    event: 'change'
  },
  props: {
    active: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      processStatus: '',
      realtimeAlarmStatisticsData: {
        allNum: 0,
        toBeConfirmedNum: 0,
        toBeReceivedNum: 0,
        toBeFeedBackNum: 0,
        completedNum: 0
      }
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
    onChange(value) {
      this.$emit('change', value);
    },
    update() {
      this.getCurrDayAlarmSumData();
    },
    /**
     * 获取今日报警数量统计
     */
    async getCurrDayAlarmSumData() {
      const res = await AlarmRealTimeSrv.getCurrDayAlarmSumData();
      if (res.code === 0) this.realtimeAlarmStatisticsData = res.data;
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
