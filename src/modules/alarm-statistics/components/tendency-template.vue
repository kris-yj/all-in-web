<template>
  <div
    v-loading="isLoading"
    class="template">
    <div class="tendency-wrap">
      <div class="tendency-captrue">
        <div
          ref="day"
          class="day-captrue">
          <div class="template-title">
            {{ $t('日报警统计') }}
          </div>
          <meg-line
            ref="line"
            :extend="dayOptions"
            height="100%">
            <data-empty v-show="!tendencyData.dayData.length"></data-empty>
          </meg-line>
        </div>
        <div
          ref="target"
          class="target-captrue">
          <div class="template-title">
            {{ $t('报警状态占比') }}
          </div>
          <meg-pie
            height="100%"
            :extend="pieOptions">
            <div class="all-number">
              {{ pieText }}
            </div>
            <data-empty
              v-show="isPieEmpty"
              :is-pie="true"></data-empty>
          </meg-pie>
        </div>
      </div>
      <div class="tendency-captrue">
        <div
          ref="hour"
          class="tendency-time">
          <div class="template-title">
            {{ $t("时段累积态势") }}
          </div>
          <meg-line
            ref="line"
            :extend="lineOptions"
            height="100%">
            <data-empty v-show="!tendencyData.hourData.length"></data-empty>
          </meg-line>
        </div>
        <div
          ref="deploy"
          class="deploy-capture">
          <div class="template-title">
            {{ $t("布控类型") }}<span class="topNumber">{{ $t("TOP10") }}</span>
          </div>
          <meg-histogram
            :extend="barOptions"
            height="100%">
            <data-empty v-show="!tendencyData.deployData.length"></data-empty>
          </meg-histogram>
        </div>
      </div>
    </div>
    <div
      ref="device"
      class="tendency-device">
      <meg-tabs
        v-model="resourceType"
        class="template-tabs">
        <meg-tab-pane
          name="0">
          <span
            slot="label"
            class="tab">设备报警</span>
        </meg-tab-pane>
        <meg-tab-pane
          name="1">
          <span
            slot="label"
            class="tab">底库报警</span>
        </meg-tab-pane>
      </meg-tabs>
      <div class="template-title">
        <span class="topNumber">{{ $t("TOP10") }}</span>
      </div>
      <meg-dropdown
        v-show="resourceType === '1'"
        class="database-select"
        placement="bottom"
        @command="changeDropdown"
        trigger="hover">
        <span class="meg-dropdown-link">
          {{ activeDrop.value }}
          <meg-icon
            name="arrow_down"
            class="meg-dropdown-link-icon"></meg-icon>
        </span>
        <meg-dropdown-menu
          slot="dropdown"
          class="camera-search-dropdown">
          <meg-dropdown-item
            v-for="item in databaseTypes"
            :key="item.code"
            :command="item">
            {{ item.value }}
          </meg-dropdown-item>
        </meg-dropdown-menu>
      </meg-dropdown>
      <bar
        v-show="resourceType === '0'"
        :title="deviceTitle"
        :data="deviceData">
        <data-empty v-show="!deviceData.length"></data-empty>
      </bar>
      <bar
        v-show="resourceType === '1'"
        :title="databaseTitle"
        :data="albumData">
        <data-empty v-show="!albumData.length"></data-empty>
      </bar>
    </div>
  </div>
</template>

<script>
import chartOption from '@/components/chart/chart.common';
import bar from '@/components/chart/bar';
import DataEmpty from '@/components/chart/data-empty';

const features = [
  {
    name: '待确认',
    key: 'newCount'
  },
  {
    name: '待接收',
    key: 'designateCount'
  }, {
    name: '待反馈',
    key: 'receiveCount'
  }, {
    name: '已办结',
    key: 'closeCount'
  }];
export default {
  components: {
    bar,
    DataEmpty
  },
  props: {
    tendencyData: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: true
    },
    databaseData: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      activeDrop: this.$store.getters.dataMapByType('galaxy_strategy_album_type')[0],
      histogram: chartOption.histogram,
      line: chartOption.line,
      pie: chartOption.pie,
      resourceType: '0',
      databaseTypes: this.$store.getters.dataMapByType('galaxy_strategy_album_type')
    };
  },
  computed: {

    /**
     * 报警状态占比
     */
    isPieEmpty() {
      let flag = true;
      features.forEach((item) => {
        if (this.tendencyData.statusData[item.key] > 0) {
          flag = false;
        }
      });
      return flag;
    },
    deviceTitle() {
      return `单位:${this.tendencyData.deviceUnit}`;
    },
    databaseTitle() {
      return `单位:${this.databaseData.aggregationByAlbumUnit.unit}`;
    },
    /**
     * 组装日抓拍量统计数据
     */
    dayOptions() {
      const options = {
        x: [],
        y: [],
        title: `单位:${this.tendencyData.dayUnit}`,
        isSymbol: true,
        isArea: false
      };
      this.tendencyData.dayData.forEach((item) => {
        options.x.push(item.warningDay);
        options.y.push(item.count);
      });
      return this.line(options);
    },
    /*
     * 组装时段累积趋势数据
     */
    lineOptions() {
      const options = {
        x: [],
        y: [],
        title: `单位:${this.tendencyData.hourUnit}`
      };
      this.tendencyData.hourData.forEach((item) => {
        options.x.push(item.hour);
        options.y.push(item.count);
      });
      return this.line(options);
    },
    /**
     * 组装布控类型统计数据
     */
    barOptions() {
      const options = {
        x: [],
        y: [],
        limit: 5,
        title: `单位:${this.tendencyData.deployUnit}`
      };
      this.tendencyData.deployData.forEach((item) => {
        options.y.push(item.deployRule.name);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 报警状态统计总数
     */
    pieText() {
      let number = 0;
      features.forEach((item) => {
        number += this.tendencyData.statusData[item.key] * 1000;
      });
      return number / 1000;
    },
    /**
     * 组装报警状态统计数据
     */
    pieOptions() {
      const val = [];
      features.forEach((item) => {
        val.push({
          name: item.name,
          value: this.tendencyData.statusData[item.key]
        });
      });
      return this.pie({
        data: val,
        title: `单位:${this.tendencyData.statusUnit}`
      });
    },
    /**
     * 底库报警数据
     */
    albumData() {
      const alarmData = this.databaseData.warningAggregationByAlbums.map((item) => ({
        name: item.album.name,
        count: item.count,
        series: [
          {
            name: item.album.name,
            key: 'count',
            count: item.count
          }
        ]
      }));
      return alarmData;
    },
    /**
     * 设备报警数据
     */
    deviceData() {
      const deviceData = this.tendencyData.deviceData.map((item) => ({
        name: item.camera.name,
        count: item.count,
        series: [
          {
            name: item.camera.name,
            key: 'count',
            count: item.count
          }
        ]
      }));
      return deviceData.sort((a, b) => b.count - a.count);
    }
  },
  created() {
  },
  methods: {
    changeDropdown(item) {
      this.activeDrop = item;
      this.$emit('get-database', item.code);
    },
    /**
     * 导出报表
     */
    async generatorImage() {
      const aggregationByDeployRuleImg = await chartOption.generatorImage(this.$refs.deploy);
      const aggregationByDayImg = await chartOption.generatorImage(this.$refs.day);
      const statisticByStatusImg = await chartOption.generatorImage(this.$refs.target);
      const aggregationByHourImg = await chartOption.generatorImage(this.$refs.hour);
      const aggregationByCameraImg = await chartOption.generatorImage(this.$refs.device);
      return {
        aggregationByDeployRuleImg,
        aggregationByDayImg,
        statisticByStatusImg,
        aggregationByHourImg,
        aggregationByCameraImg
      };
    },
  }
};
</script>

<style lang='scss' scoped>
.template {
  display: flex;
  height: calc(100% - 56px);
  padding-bottom: 18px;
  box-sizing: border-box;
  ::v-deep .meg-tabs__nav-wrap {
    padding-left: 20px;
    &::after {
      height: 1px;
    }
  }
  ::v-deep .meg-tabs__item {
    padding: 0 15px;
  }
  ::v-deep .meg-tabs__active-bar {
    height: 4px;
  }
  .tendency-wrap {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .tendency-device {
    width: 320px;
    background: #ffffff;
    padding-top: 50px;
    position: relative;
    .template-title {
      left: auto;
      right: 20px;
    }
  }
  .template-tabs {
    position: absolute;
    top: 0;
    width: 100%;
    padding-top: 7px;
    .tab {
      line-height: 42px;
      font-size: 14px;
      font-weight: normal;
    }
  }
  .template-title {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 14px;
    color: #435068;
  }
  .topNumber {
    color: #41A8F7;
    font-size: 16px;
    padding-left: 6px;
    font-family: 'HEMIHEAD';
  }
  .all-number {
    width: 100px;
    height: 20px;
    line-height: 32px;
    font-size: 32px;
    color: #435068;
    text-align: center;
    margin-left: -56px;
    position: absolute;
    font-family: 'HEMIHEAD';
    top: 50%;
    margin-top: -16px;
    left: 50%;
  }
  .tendency-captrue {
    display: flex;
    flex: 1;

    .deploy-capture ,.tendency-time, .target-captrue,  .day-captrue {
      background: #ffffff;
      padding-top: 36px;
      position: relative;
    }
    .tendency-time {
      flex: 1;
      margin-right: 10px;
    }
    .target-captrue {
      flex: 1;
      margin-bottom: 10px;
      margin-right: 10px;
    }
    .day-captrue {
      flex: 1;
      margin-bottom: 10px;
      margin-right: 10px;
    }
    .deploy-capture {
      flex: 1;
      margin-right: 10px;
    }
  }
  .meg-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    .meg-dropdown-link-icon {
      margin-left: 2px;
      font-size: 12px;
    }
  }
  .meg-dropdown-link.meg-dropdown-selfdefine {
    color: #21539B;
  }
  .database-select {
    position: absolute;
    top: 56px;
    right: 20px;
    z-index: 1;
  }
}

</style>
