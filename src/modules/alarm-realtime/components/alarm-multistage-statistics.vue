<template>
  <div
    class="multistage-statistics"
    v-click-outside="onClickOutOfPnl">
    <div
      @click.stop="onShowBtnClick($event)"
      class="multistage-statistics-btn">
      <meg-icon
        name="statistics"
        width="20px"
        height="18px"
        color="#435068">
      </meg-icon>
    </div>
    <!-- 多级统计信息面板 -->
    <div
      v-show="multistageShow"
      class="multistage-statistics-panel">
      <div class="info">
        <span class="info-key">
          {{ $t('本地报警') }}
        </span>
        <span
          class="info-value newFont"
          :class="toNumClass(multiStagesAlarmData.localNum)"
          @click="onNumClick(multiStagesAlarmData.localNum !==0,0)">
          {{ multiStagesAlarmData.localNum }}
        </span>
      </div>
      <div class="info">
        <span class="info-key">
          {{ $t('推送报警') }}
        </span>
        <span
          class="info-value newFont"
          :class="toNumClass(multiStagesAlarmData.pushedNum)"
          @click="onNumClick(multiStagesAlarmData.pushedNum !==0,1)">
          {{ multiStagesAlarmData.pushedNum }}
        </span>
      </div>
      <div class="info">
        <span class="info-key">
          {{ $t('订阅报警') }}
        </span>
        <span
          class="info-value newFont"
          :class="toNumClass(multiStagesAlarmData.subscribedNum)"
          @click="onNumClick(multiStagesAlarmData.subscribedNum !==0,2)">
          {{ multiStagesAlarmData.subscribedNum }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>

import AlarmRealtimeSvr from '../alarm-realtime.service.js';

export default {
  name: 'MultistageStatistics',
  data() {
    return {
      multistageShow: false,
      multiStagesAlarmData: {
        localNum: 0,
        pushedNum: 0,
        subscribedNum: 0
      }
    };
  },
  methods: {
    toNumClass(num) {
      return {
        'can-jump': num !== 0,
        'can-not-jump': num === 0
      };
    },
    onNumClick(canJump, type) {
      if (canJump) {
        const timeSpan = [new Date().setHours(0, 0, 0, 0), new Date().getTime()];
        if (type === 0) {
          this.$router.push({ name: 'alarm-history', params: { todayAlarmSearchTime: timeSpan } });
        } else {
          this.$router.push({ name: 'cluster', params: { searchType: type, searchTime: timeSpan } });
        }
      }
    },
    onShowBtnClick() {
      this.multistageShow = !this.multistageShow;
      if (this.multistageShow) {
        AlarmRealtimeSvr.getMultiStagesAlarmStatistics().then((response) => {
          if (response.code === 0) {
            this.multiStagesAlarmData = response.data;
          }
        });
      }
    },
    onClickOutOfPnl() {
      this.multistageShow = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.can-jump {
  color: #21539b;
  cursor: pointer;
}

.can-not-jump {
  color: #444444;
}

.multistage-statistics {
  width: 34px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  z-index: 100;
}

.multistage-statistics-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 34px;
  height: 34px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  border-radius: 1px;
  cursor: pointer;
  z-index: 9;
}

.multistage-statistics-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 85px;
  height: 150px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
  z-index: 9;
  padding: 10px 10px;
  margin-top: 6px;

  .info {
    display: flex;
    align-items: center;
    width: 100%;
    .info-key {
      flex: 0 0 60px;
      color: #989898;
    }
    .info-value {
      flex: 1;
      font-family: HEMIHEAD;
      font-size: 18px;
    }
  }
}
</style>
