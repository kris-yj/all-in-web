<template>
  <div class="wrapper">
    <div class="container">
      <div class="block-group">
        <div :class="{'block-item': true, noDoc: cropScene === 1}">
          <h3>相机总数</h3>
          <h4>相机总数</h4>
          <count-up
            :end-val="cameraCount"
            :tag="'p'"></count-up>
        </div>
        <div :class="{'block-item': true, noDoc: cropScene === 1}">
          <h3>报警总数</h3>
          <h4>报警总数</h4>
          <count-up
            :end-val="warningCount"
            :tag="'p'"></count-up>
        </div>
        <div :class="{'block-item': true, noDoc: cropScene === 1}">
          <h3>抓拍总数</h3>
          <h4>抓拍总数</h4>
          <count-up
            :end-val="captureCount"
            :tag="'p'"></count-up>
        </div>

        <div :class="{'block-item': true, noDoc: cropScene === 1}">
          <h3>解析任务数</h3>
          <h4>解析任务数</h4>
          <count-up
            :end-val="asideLData.analysisTaskCount || 0"
            :tag="'p'"></count-up>
        </div>

        <div :class="{'block-item': true, noDoc: cropScene === 1}">
          <h3>实战技战法数</h3>
          <h4>实战技战法数</h4>
          <count-up
            :end-val="asideLData.realTechRuleCount || 0"
            :tag="'p'"></count-up>
        </div>

        <div
          :class="{'block-item': true, hasDoc: cropScene === 2}"
          v-if="cropScene === 2">
          <h3>全息档案</h3>
          <h4>全息档案</h4>
          <count-up
            :end-val="holographicDocCount"
            :tag="'p'"></count-up>
        </div>
      </div>

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
    </div>
  </div>
</template>
<script>
import CountUp from '@/common-components/common-countup';
import { lineOpts } from '../charts.conf';

export default {
  name: 'DashboardCropLeft',
  components: {
    CountUp,
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    captureDateList: {
      type: Array,
      default: () => [],
    },
    footerData: {
      type: Object,
      default: () => ({})
    },
    cropScene: {
      type: Number,
      default: 0,
    },
    asideLData: {
      type: Object,
      default: () => ({})
    },
  },
  computed: {
    cameraCount() {
      return Number(this.data.cameraCount);
    },
    captureCount() {
      return Number(this.data.captureCount);
    },
    warningCount() {
      return Number(this.data.warningCount);
    },
    holographicDocCount() {
      return Number(this.data.holographicDocCount);
    },
    focusPeopleCount() {
      return Number(this.data.focusPeopleCount);
    },
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
    captureUnit() {
      const unit = '个';
      if (this.footerData.captureAggregationByDayUnit) {
        return this.footerData.captureAggregationByDayUnit.unit;
      }
      return unit;
    },
  }
};
</script>
<style lang="scss" scoped>
@media (max-width: 1440px) {
  .wrapper {
    .container {
      .block-group {
        .block-item {
          display: flex;
          justify-content: space-between !important;
          flex-direction: row !important;
          align-items: center;
          align-content: center;
          padding: 12px;
          box-sizing: border-box;
          margin-top: 20px;
          opacity: 0.5;
          border: 1px solid #86A0F0;
          box-shadow: inset 0 -2px 3px 0 rgba(114,155,250,0.40), inset -2px 0 3px 0 rgba(114,155,250,0.40), inset 2px 0 3px 0 rgba(114,155,250,0.40), inset 0 2px 3px 0 rgba(114,155,250,0.40);
          &.noDoc {
            >h3 {
              height: 40px;
              line-height: 40px;
            }
            >p {
              padding-top: 6px !important;
            }
          }
          &:first-child {
            margin-top: 0;
          }
          >h3 {
           display: none !important;
          }
          >h4 {
            display: block !important;
            font-size: 20px;
            color: #B5F3FF;
            font-weight: 700;
          }
          >p {
            font-size: 48px;
            line-height: 32px;
            color: #FFFFFF;
            font-weight: 400;
            margin-left: 1.9%;
          }
        }
      }
    }
  }
}

.wrapper {
    width: 350px;
    max-width: 350px;
    height: 100%;
    background-image: linear-gradient(90deg, #002A9C 0%, rgba(0,42,156,0.90) 55%, rgba(0,42,156,0.60) 79%, rgba(0,42,156,0.00) 100%);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1;
    .container {
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      .block-group {
        display: flex;
        flex-direction: column;
        padding-top: 20px;
        padding-left: 20px;
        box-sizing: border-box;
        flex: 1;
        .block-item {
          display: flex;
          justify-content: flex-start;
          flex-direction: column;
          padding: 12px;
          box-sizing: border-box;
          margin-top: 20px;
          opacity: 0.5;
          border: 1px solid #86A0F0;
          box-shadow: inset 0 -2px 3px 0 rgba(114,155,250,0.40), inset -2px 0 3px 0 rgba(114,155,250,0.40), inset 2px 0 3px 0 rgba(114,155,250,0.40), inset 0 2px 3px 0 rgba(114,155,250,0.40);
          &.noDoc {
            >h3 {
              height: 40px;
              line-height: 40px;
            }
            >p {
              padding-top: 20px;
            }
          }
          &:first-child {
            margin-top: 0;
          }
          >h3 {
            display: inline-block;
            width: 100%;
            height: 34px;
            line-height: 34px;
            padding-left: 12px;
            box-sizing: border-box;
            background-image: url('~@/assets/images/dashboard/block-title-bg.png');
            background-size: 100%;
            font-size: 20px;
            color: #B5F3FF;
            font-weight: 700;
          }
          >h4 {
            display: none;
          }
          >p {
            font-size: 32px;
            padding-top: 6px;
            line-height: 32px;
            color: #FFFFFF;
            font-family: HemiHead;
            text-align: left;
          }
        }
      }
    }
}

.charts-wrapper {
  width: 100%;
  height: 226px;
  margin: 24px 0 20px 20px;
  box-sizing: border-box;
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
</style>
