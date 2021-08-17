<template>
  <div class="dashboard-footer">
    <div class="dashboard-footer-container">
      <div class="dashboard-footer__wrapper">
        <div class="charts-wrapper">
          <div class="charts-title">
            <h3>抓拍统计</h3>
            <p>单位:{{ captureUnit }}</p>
          </div>
          <div
            class="charts-box"
            v-if="captureDateList.length">
            <meg-line
              width="100%"
              height="100%"
              :extend="captureDateOptions"></meg-line>
          </div>
          <div
            class="line-noData"
            v-else>
            <p>暂无数据</p>
          </div>
        </div>
        <div class="charts-wrapper">
          <div class="charts-title">
            <h3>报警统计</h3>
            <p>单位:{{ warningUnit }}</p>
          </div>
          <div
            class="charts-box"
            v-if="warningDateList.length">
            <meg-line
              width="100%"
              height="100%"
              :extend="warningDateOptions"></meg-line>
          </div>
          <div
            class="line-noData"
            v-else>
            <p>暂无数据</p>
          </div>
        </div>
        <div class="charts-wrapper">
          <div class="charts-title">
            <div class="title-container">
              <h3>关注人员统计</h3>
              <p>TOP5</p>
            </div>
            <p>单位:个</p>
          </div>
          <div
            class="charts-box"
            v-if="focusDateList.length">
            <meg-histogram
              width="100%"
              height="100%"
              :extend="focusDataOptions">
            </meg-histogram>
          </div>
          <div
            class="line-noData"
            v-else>
            <p>暂无数据</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { lineOpts, histogramOpts } from '../charts.conf';

export default {
  name: 'DashboardFooter',
  props: {
    captureDateList: {
      type: Array,
      default: () => [],
    },
    warningDateList: {
      type: Array,
      default: () => []
    },
    focusDateList: {
      type: Array,
      default: () => []
    },
    footerData: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    captureDateOptions() {
      const startColor = '#19B6FF';
      const endColor = '#18D5FF';
      const data = {
        x: [],
        y: []
      };
      this.captureDateList.forEach((item) => {
        data.x.push(item.day);
        data.y.push(item.count);
      });
      return lineOpts(data, startColor, endColor);
    },
    warningDateOptions() {
      const startColor = '#F06767';
      const endColor = '#F68080';
      const data = {
        x: [],
        y: []
      };
      this.warningDateList.forEach((item) => {
        data.x.push(item.warningDay);
        data.y.push(item.count);
      });
      return lineOpts(data, startColor, endColor);
    },
    focusDataOptions() {
      const data = {
        x: [],
        y: []
      };
      this.focusDateList.forEach((item) => {
        data.x.push(item.personType);
        data.y.push(item.profileCount);
      });
      return histogramOpts(data);
    },
    captureUnit() {
      const unit = '个';
      if (this.footerData.captureAggregationByDayUnit) {
        return this.footerData.captureAggregationByDayUnit.unit;
      }
      return unit;
    },
    warningUnit() {
      const unit = '个';
      if (this.footerData.warningAggregationByDayUnit) {
        return this.footerData.warningAggregationByDayUnit.unit;
      }
      return unit;
    }
  }
};
</script>
<style lang="scss">
.histogram-tooltip {
  border: 1px solid #18D5FF;
  box-sizing: border-box;
  background-color: rgba(0,35,131,0.90);
  box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
  padding: 12px;
  width: 100px;
  .histogram-tooltip__container {
    width: 100%;
    .histogram-tooltip__title {
      font-size: 12px;
      color: #B5F3FF;
      line-height: 12px;
    }
    .histogram-tooltip__list {
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
      height: 12px;
      line-height: 12px;
      margin-top: 10px;
      .histogram-tooltip__label {
        width: 12px;
        height: 4px;
        background-color: #1AB8FF;
      }
      .histogram-tooltip__value {
        margin-left: 4px;
        >p {
          font-size: 12px;
          color: #FFFFFF;
        }
      }
    }
  }
}
.tooltip-wrapper{
    border: 1px solid #18D5FF;
    box-sizing: border-box;
    background-color: rgba(0,35,131,0.90);
    box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
    padding: 12px;
    width: 100px;
  }
  .tooltip-body{
    width: 100%;
  }
  .tooltip-title{
    display: flex;
    justify-content: flex-start;
  }
  .tooltip-title >p {
    font-size: 12px;
    color: #B5F3FF;
    line-height: 12px;
  }
  .tooltip-content {
    display: flex;
    justify-content: flex-start;
    align-content: center;
    align-items: center;
    margin-top: 8px;
    line-height: 12px;
  }
  .tooltip-content__icon{
    width: 12px;
    height: 4px;
    background-color: #1AB8FF;
  }
  .tooltip-content__number{
    margin-left: 4px;
  }
  .tooltip-content__number >span {
    font-size: 12px;
    color: #fff;
  }
  .tooltip-content__other{
    margin-left: 4px;
  }
  .tooltip-content__other >span{
    font-size: 12px;
    color: #fff;
    letter-spacing: 0;
    text-align: right;
    line-height: 14px;
  }
</style>
<style lang="scss" scoped>
.dashboard-footer {
    width: 100%;
    height: 240px;
    background-image: linear-gradient(0deg, #002A9C 0%, rgba(0,42,156,0.90) 55%, rgba(0,42,156,0.60) 79%, rgba(0,42,156,0.00) 100%);
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 0;
    .dashboard-footer-container {
      width: calc(100% - 700px);
      height: 100%;
      position: relative;
      left: 50%;
      transform: translateX(-50%);
      .dashboard-footer__wrapper{
        width: 100%;
        height: 226px;
        position: absolute;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: space-around;
      }
      .charts-wrapper {
        width: 32%;
        height: 226px;
      }
      .charts-box {
        width: 100%;
        height: 170px;
      }
      .charts-title {
        .title-container {
          display: flex;
          align-content: center;
          justify-content: flex-start;
          align-items: center;
          height: 18px;
          >h3 {
            font-size: 18px;
            color: #FFFFFF;
            font-weight: 600;
          }
          >p {
            font-size: 24px;
            color: #18D5FF;
            font-family: HemiHead;
          }
        }
         >h3 {
          font-size: 16px;
          color: #FFFFFF;
          font-weight: 600;
        }
        >p {
          padding-top: 9px;
          font-size: 12px;
          color: #B5F3FF;
        }
      }
    }
  }
  .line-noData {
    width: 100%;
    height: 150px;
    margin-top: 12px;
    background-color: rgba(50, 170, 255, .12);
    display: flex;
    justify-content: center;
    align-items: center;
    >p {
      font-size: 12px;
      color: #B5F3FF;
    }
  }
</style>
