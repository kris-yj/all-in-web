<template>
  <div
    class="wrapper"
    v-background="bgVisible">
    <div
      class="loading"
      v-loading="loading">
      <div
        class="regular-chart__container"
        v-if="!loading">
        <div class="regular-chart__timeslot">
          <h3>时段积累趋势</h3>
          <meg-line
            ref="line"
            width="100%"
            :extend="lineOptions()"
            height="100%"></meg-line>
        </div>
        <div class="regular-chart__period">
          <div class="regular-chart__left">
            <h3>日抓拍量统计</h3>
            <meg-histogram
              :extend="dateHistogramOptions()"
              height="100%"></meg-histogram>
          </div>
          <div class="regular-chart__right">
            <h3>设备抓拍统计</h3>
            <meg-histogram
              :extend="camerahistogramOptions()"
              height="100%"></meg-histogram>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import EventManageApi from '../events-manage.service';
import chartOption from '../charts';

export default {
  name: 'ActivityRegular',
  data() {
    return {
      line: chartOption.line,
      histogram: chartOption.histogram,
      hourHuntData: [],
      dateHuntData: [],
      cameraHuntData: [],
      loading: false,
    };
  },
  computed: {
    bgVisible() {
      const background = {
        icon: 'icon_2',
        text: '暂无数据'
      };
      if (this.hourHuntData.length > 0 || this.dateHuntData.length > 0 || this.cameraHuntData.length > 0 || this.loading) return false;
      return background;
    }
  },
  created() {
    this.getActivityRegular();
  },
  methods: {
    getActivityRegular() {
      const type = ['hour', 'date', 'camera'];
      const params = {
        eventId: this.$route.query.eventId,
        limitLonLat: true,
        order: 'asc'
      };
      const allPromise = type.map((item) => EventManageApi.clueCategory({ ...params, aggType: item }));
      this.loading = true;
      Promise.all(allPromise).then(([hour, date, camera]) => {
        this.loading = false;
        if (hour.code === 0 && date.code === 0 && camera.code === 0) {
          this.hourHuntData = hour.data.records;
          this.dateHuntData = date.data.records;
          this.cameraHuntData = camera.data.records;
        }
      });
    },
    // 折线图
    lineOptions() {
      const val = {
        x: [],
        y: []
      };
      this.hourHuntData.forEach((item) => {
        val.x.push(item.aggName);
        val.y.push(item.count);
      });
      return this.line(val, '{b}:00 抓拍总量<br/>{c} 个');
    },
    // 日期
    dateHistogramOptions() {
      const options = {
        x: [],
        y: [],
        max: 5,
      };
      this.dateHuntData.forEach((item) => {
        options.y.push(item.aggName);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
    // 相机
    camerahistogramOptions() {
      const options = {
        x: [],
        y: [],
        max: 5,
      };
      this.cameraHuntData.forEach((item) => {
        options.y.push(item.aggName);
        options.x.push(item.count);
      });
      return this.histogram(options);
    },
  }
};
</script>
<style lang="scss" scoped>
  .wrapper {
    width: 100%;
    height: 100%;
    .loading {
      width: 100%;
      height: 100%;
    }
  }
 .regular-chart__container {
    display: flex;
    height: calc(100% -56px);
    background-color: #DBE1E5;
    flex-direction: column;
    min-height: 300px;
    padding: 20px;
    h3 {
        font-size: 14px;
        color: #435068;
    }
    .regular-chart__timeslot {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      background-color: #fff;
      >h3 {
        margin-top: 20px;
        margin-left: 10px;
      }
    }
    .regular-chart__period {
      box-sizing: border-box;
      display: flex;
      flex: 1;
      margin-top: 10px;
      justify-content: space-between;
      align-content: center;
      align-items: center;
      h3 {
        box-sizing: border-box;
        margin-left: 10px;
        margin-top: 20px;
      }
      .regular-chart__left {
        width: 50%;
        height: 100%;
        background-color: #fff;
        position: relative;
      }
      .regular-chart__right {
        width: 50%;
        height: 100%;
        box-sizing: border-box;
        margin-left: 10px;
        background-color: #fff;
        position: relative;
        padding-right: 20px;
      }
  }
}
</style>
