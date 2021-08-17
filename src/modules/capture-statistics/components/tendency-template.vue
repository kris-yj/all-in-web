<template>
  <div
    class="template"
    v-loading="isLoading">
    <div class="tendency-wrap">
      <div
        class="tendency-captrue">
        <div
          ref="day"
          class="day-captrue">
          <div class="template-title">
            {{ $t('日抓拍量') }}
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
            {{ $t('抓拍目标') }}
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
          ref="dept"
          class="dept-capture">
          <div class="template-title">
            {{ $t("部门抓拍态势") }}<span class="topNumber">{{ $t("TOP10") }}</span>
          </div>
          <meg-histogram
            :extend="barOptions"
            height="100%">
            <data-empty v-show="!tendencyData.deptData.length"></data-empty>
          </meg-histogram>
        </div>
      </div>
    </div>
    <div
      ref="device"
      class="tendency-device">
      <div class="template-title">
        {{ $t("设备抓拍") }}<span class="topNumber">{{ $t("TOP10") }}</span>
      </div>
      <bar
        :title="deviceTitle"
        :legend="features"
        :data="deviceData">
        <data-empty v-show="!deviceData.length"></data-empty>
      </bar>
    </div>
  </div>
</template>

<script>
import chartOption from '@/components/chart/chart.common';
import DataEmpty from '@/components/chart/data-empty';
import bar from '@/components/chart/bar';

const features = [
  {
    name: '人脸',
    key: 'faceCount'
  },
  {
    name: '人体',
    key: 'bodyCount'
  }, {
    name: '机动车',
    key: 'carCount'
  }, {
    name: '非机动车',
    key: 'nonMotorCount'
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
    }
  },
  data() {
    return {
      histogram: chartOption.histogram,
      line: chartOption.line,
      pie: chartOption.pie,
      features
    };
  },
  computed: {
    isPieEmpty() {
      let flag = true;
      features.forEach((item) => {
        if (this.tendencyData.targetData[item.key] > 0) {
          flag = false;
        }
      });
      return flag;
    },
    deviceTitle() {
      return `单位:${this.tendencyData.deviceUnit}`;
    },
    /**
     * 组装日抓拍量统计数据
     */
    dayOptions() {
      const options = {
        x: [],
        y: [],
        title: `单位:${this.tendencyData.dayUnit}`,
        label: '日抓拍量',
        isSymbol: true,
        isArea: false
      };
      this.tendencyData.dayData.forEach((item) => {
        options.x.push(item.day);
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
     * 组装部门抓拍统计数据
     */
    barOptions() {
      const options = {
        x: [],
        y: [],
        limit: 6,
        title: `单位:${this.tendencyData.deptUnit}`
      };
      this.tendencyData.deptData.forEach((item) => {
        options.y.push(item.deptName);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    /**
     * 抓拍目标总数
     */
    pieText() {
      let number = 0;
      features.forEach((item) => {
        number += this.tendencyData.targetData[item.key] * 1000;
      });
      return number / 1000;
    },
    /**
     * 组装抓拍目标统计数据
     */
    pieOptions() {
      const val = [];
      features.forEach((item) => {
        val.push({
          name: item.name,
          value: this.tendencyData.targetData[item.key]
        });
      });
      return this.pie({
        data: val,
        title: `单位:${this.tendencyData.targetUnit}`
      });
    },
    deviceData() {
      const deviceData = this.tendencyData.deviceData.map((item) => ({
        name: item.camera.name,
        count: ((item.faceCount * 1000) + (item.bodyCount * 1000) + (item.carCount * 1000) + (item.nonMotorCount * 1000)) / 1000,
        series: [
          {
            name: '人脸',
            key: 'faceCount',
            count: item.faceCount
          },
          {
            name: '人体',
            key: 'bodyCount',
            count: item.bodyCount
          },
          {
            name: '机动车',
            key: 'carCount',
            count: item.carCount
          },
          {
            name: '非机动车',
            key: 'nonMotorCount',
            count: item.nonMotorCount
          }
        ]
      }));
      return deviceData;
    }
  },
  created() {
  },
  methods: {
    /**
     * 导出报表
     */
    async generatorImage() {
      const aggregationByCameraImg = await chartOption.generatorImage(this.$refs.device);
      const aggregationByDeptImg = await chartOption.generatorImage(this.$refs.dept);
      const aggregationByDayImg = await chartOption.generatorImage(this.$refs.day);
      const statisticByTypeImg = await chartOption.generatorImage(this.$refs.target);
      const aggregationByHourImg = await chartOption.generatorImage(this.$refs.hour);
      return {
        aggregationByCameraImg,
        aggregationByDeptImg,
        aggregationByDayImg,
        statisticByTypeImg,
        aggregationByHourImg
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
  .tendency-wrap {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .tendency-device {
    width: 320px;
    background: #ffffff;
    padding-top: 36px;
    position: relative;
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

    .dept-capture ,.tendency-time, .target-captrue,  .day-captrue {
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
    .dept-capture {
      flex: 1;
      margin-right: 10px;

    }
  }

}

</style>
