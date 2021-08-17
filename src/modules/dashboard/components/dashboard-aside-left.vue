<template>
  <div :class="{'dashboard-l-aside': cropScene === 0, 'crop-l-aside': cropScene !== 0}">
    <div
      :class="{'dashboard-aside-container': cropScene === 0, 'crop-aside-container': cropScene !== 0}">
      <div
        class="aside-block"
        v-if="cropScene === 0">
        <div class="aside-item">
          <h3>解析任务数</h3>
          <div class="item-block">
            <count-up
              :end-val="asideLData.analysisTaskCount || 0"
              :tag="'p'"></count-up>
          </div>
        </div>
        <div class="aside-item">
          <h3>实战技战法</h3>
          <div class="item-block">
            <count-up
              :end-val="asideLData.realTechRuleCount || 0"
              :tag="'p'"></count-up>
          </div>
        </div>
      </div>
      <div
        :class="{'aside-l-main': cropScene === 0, 'crop-l-main': cropScene !== 0}">
        <div class="aside-pie">
          <h3>全目标统计</h3>
          <div class="aside-charts-main">
            <meg-pie
              v-if="fullGoalList.length"
              width="100%"
              height="100%"
              :extend="pieOptions"></meg-pie>
            <div
              class="pie-noData"
              v-else>
              <p>暂无数据</p>
            </div>
          </div>
          <div class="aside-charts-lengend">
            <div
              class="lengend-list"
              v-for="lengend in fullGoalList"
              :key="lengend.label">
              <div class="lengend-label">
                <div :class="lengend.label"></div>
                <span>{{ lengend.name }}</span>
              </div>
              <div class="lengend-value">
                <count-up
                  :end-val="lengend.value || 0"
                  :tag="'p'"></count-up>
              </div>
            </div>
          </div>
        </div>
        <!-- 报警地点 -->
        <div class="aside-histogram">
          <div class="histogram-title">
            <div class="title-container">
              <h3>报警地点</h3>
              <p>TOP10</p>
            </div>
            <span>单位：{{ warningUnit }}</span>
          </div>
          <div
            class="aside-histogram-main"
            v-if="warningAddress.length">
            <div
              class="rank-list"
              v-for="(list, index) in warningAddress"
              :key="index">
              <div class="rank-icon">
                {{ index + 1 }}
              </div>
              <div class="rank-content">
                <div class="rank-title">
                  <div
                    class="address"
                    v-tooltip="{'class': 'dashboard-tooltip', text: list.address}">
                    {{ list.address }}
                  </div>
                  <div class="total">
                    <count-up
                      :options="countUpOpt"
                      :end-val="list.warningCount || 0"
                      :tag="'p'"></count-up>
                  </div>
                </div>
                <div class="pregress">
                  <div class="category">
                    <span :style="caculateWidth(warningAddress, list)"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="line-noData"
            v-else>
            <p>暂无数据</p>
          </div>
        </div>
        <!--报警统计-->
        <div
          class="charts-wrapper"
          v-if="cropScene !== 0">
          <div class="charts-title">
            <h3>报警统计</h3>
            <p>单位:{{ warningToggleUnit }}</p>
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
      </div>
    </div>
  </div>
</template>
<script>
import CountUp from '@/common-components/common-countup';
import { lineOpts, pieOpts } from '../charts.conf';

export default {
  name: 'DashboardAdiseLeft',
  components: {
    CountUp,
  },
  props: {
    fullGoal: {
      type: Object,
      default: () => ({})
    },
    warningAddress: {
      type: Array,
      default: () => []
    },
    asideLData: {
      type: Object,
      default: () => ({})
    },
    warningDateList: {
      type: Array,
      default: () => []
    },
    footerData: {
      type: Object,
      default: () => ({})
    },
    cropScene: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      countUpOpt: {
        decimalPlaces: 2,
      },
    };
  },
  computed: {
    pieOptions() {
      const result = this.dealWithCaptureGroupCountVO(this.fullGoal);
      return this.setFullGoalPieOptions(result);
    },
    fullGoalList() {
      return this.dealWithCaptureGroupCountVO(this.fullGoal);
    },
    warningUnit() {
      const unit = '个';
      if (this.asideLData.warningAggregationByAddressUnit) {
        return this.asideLData.warningAggregationByAddressUnit.unit;
      }
      return unit;
    },
    warningToggleUnit() {
      const unit = '个';
      if (this.footerData.warningAggregationByDayUnit) {
        return this.footerData.warningAggregationByDayUnit.unit;
      }
      return unit;
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
  },
  methods: {
    /**
     * 全目标统计
     */
    dealWithCaptureGroupCountVO(groupObj) {
      const keys = Object.keys(groupObj);
      if (keys.length === 0) return [];
      const groupArr = [
        {
          label: 'face',
          name: '人脸',
          value: groupObj.faceCount,
          color1: '#18D5FF',
          color2: '#19B6FF',
        },
        {
          label: 'motor',
          name: '机动车',
          value: groupObj.carCount,
          color1: '#F6CF9D',
          color2: '#EBBF8B',
        },
        {
          label: 'body',
          name: '人体',
          value: groupObj.bodyCount,
          color1: '#B197FF',
          color2: '#926FFF',
        },
        {
          label: 'no-motor',
          name: '非机动车',
          value: groupObj.nonMotorCount,
          color1: '#83E6DB',
          color2: '#6DE6C0',
        }
      ];
      return groupArr;
    },
    /**
     * 设置全目标搜图饼图
     */
    setFullGoalPieOptions(groupArr) {
      const fullGoalPieOptions = pieOpts(groupArr);
      return fullGoalPieOptions;
    },
    // 计算百分比
    caculateWidth(data, current) {
      const max = data.map((item) => item.warningCount).sort((a, b) => a - b);
      const base = (max[max.length - 1]) * 10000;
      const count = current.warningCount * 10000;
      const width = `${Math.ceil((count / base) * 100)}%`;
      return {
        width,
      };
    }
  }
};
</script>
<style lang="scss">
  .pie-wrapper{
    border: 1px solid #18D5FF;
    box-sizing: border-box;
    background-color: rgba(0,35,131,0.90);
    box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
    padding: 12px;
  }
  .pie-body{
    width: 100%;
  }
  .pie-title{
    display: flex;
    justify-content: flex-start;
  }
  .pie-title >p {
    font-size: 12px;
    color: #B5F3FF;
  }
  .pie-content {
    display: flex;
    justify-content: flex-start;
    align-content: center;
    align-items: center;
    margin-top: 4px;
  }
  .pie-content__icon{
    width: 10px;
    height: 10px;
    background-color: #4b84ff;
  }
  .pie-content__number{
    margin-left: 8px;
  }
  .pie-content__number >span {
    font-size: 12px;
    color: #fff;
  }
  .pie-content__other{
    margin-left: 8px;
  }
  .pie-content__other >span{
    font-size: 12px;
    color: #fff;
    letter-spacing: 0;
    text-align: right;
    line-height: 14px;
  }
  .dashboard-tooltip{
    background: rgba(0,35,131,0.90);
    border: 1px solid #18D5FF;
    box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
    font-size: 12px;
    color: #FFFFFF;
    line-height: 18px;
  }
</style>
<style lang="scss" scoped>
@media (max-width: 1440px) {
  .dashboard-l-aside {
    .aside-charts-lengend {
      display: none !important;
    }
  }
  .crop-l-aside {
    .aside-charts-lengend {
      display: none !important;
    }
  }
  .pie-noData {
    width: 100px !important;
    height: 100px !important;
    >p {
      font-size: 12px !important;
    }
  }
}
.crop-l-aside {
    width: 350px;
    max-width: 350px;
    height: 100%;
    background-image: linear-gradient(-90deg, #002A9C 0%, rgba(0,42,156,0.90) 55%, rgba(0,42,156,0.60) 79%, rgba(0,42,156,0.00) 100%);
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    .crop-aside-container {
      display: flex;
      box-sizing: border-box;
      height: 100%;
    }
    .crop-l-main{
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding-right: 20px;
      box-sizing: border-box;
    }
    .aside-pie {
      box-sizing: border-box;
      flex: 1;
      display: flex;
      flex-direction: column;
      >h3 {
        font-size: 18px;
        line-height: 36px;
        color: #FFFFFF;
        font-weight: 600;
        height: 36px;
        padding-left: 20px;
        margin-top: 24px;
        box-sizing: border-box;
      }
      .aside-charts-main {
        width: 100%;
        display: flex;
        justify-content: center;
        flex: 4;
      }
    }
    .aside-histogram {
      padding: 24px 0 0 20px;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .histogram-title {
        display: flex;
        flex-direction: column;
        .title-container {
          display: flex;
          align-content: center;
          justify-content: flex-start;
          align-items: center;
          >h3 {
            font-size: 18px;
            color: #FFFFFF;
            font-weight: 600;
            height: 36px;
            line-height: 36px;
          }
          >p {
            font-size: 24px;
            color: #18D5FF;
            font-family: HemiHead;
          }
        }
        >span {
          font-size: 12px;
          color: #B5F3FF;
        }
      }
      .aside-histogram-main {
        flex: 1;
        padding: 12px 6px 0 0;
        margin-bottom: 16px;
        box-sizing: border-box;
        overflow-y: auto;
        .rank-list {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          align-content: center;
          margin-top: 20px;
          width: 100%;
          cursor: pointer;
          &:first-child{
            margin-top: 0
          }
          .rank-icon {
            width: 22px;
            height: 34px;
            background-image: url('~@/assets/images/dashboard/warn-addr.svg');
            background-repeat: no-repeat;
            background-position: left center;
            background-size: contain;
            display: flex;
            padding-left: 5px;
            justify-content: center;
            align-content: center;
            align-items: center;
            font-size: 20px;
            color: #fff;
            font-family: HemiHead;
          }
          .rank-content {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            &:hover {
              .rank-tooltips {
                opacity: 1;
              }
            }
            .rank-title {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-content: center;
              align-items: center;
              .address {
                width: 150px;
                font-size: 14px;
                color: #B5F3FF;
                padding-bottom: 8px;
              }
              .total {
                >p {
                  font-family: HemiHead;
                  font-size: 18px;
                  color: #B5F3FF;
                  line-height: 14px;
                }
              }
            }
            .pregress {
              height: 10px;
              width: 100%;
              transform: scaleY(-1);
              .category {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                align-content: center;
                width: 100%;
                background-color: rgba(50,170,255,.24);
                >span {
                  display: flex;
                  height: 10px;
                  background-image: linear-gradient(90deg, #19B6FF 0%, #18D5FF 100%);
                  margin-right: 1px;
                  &:last-child{
                    margin-right: 0;
                  }
                }
              }
            }
            .rank-tooltips {
              width: 215px;
              height: 48px;
              box-sizing: border-box;
              background: rgba(0,35,131,0.90);
              border: 1px solid #18D5FF;
              box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
              position: absolute;
              top: -30px;
              right: 0;
              z-index: 2;
              opacity: 0;
              >p {
                font-size: 12px;
                color: #FFFFFF;
                line-height: 18px;
                padding: 7px;
              }
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
    .aside-charts-lengend {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      margin-left: 20px;
      flex: 1;
      .lengend-list {
        width: 50%;
        display: flex;
        justify-content: space-between;
        align-content: center;
        align-items: center;
        .lengend-label {
          width: 50%;
          display: flex;
          justify-content: flex-start;
          align-content: center;
          align-items: center;
          >div {
            width: 24px;
            height: 24px;
            background-repeat: no-repeat;
            background-size: cover;
            &.face {
              background-image: url('~@/assets/images/dashboard/face.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
            &.body{
              background-image: url('~@/assets/images/dashboard/body.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
            &.motor{
              background-image: url('~@/assets/images/dashboard/motor.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
            &.no-motor {
              background-image: url('~@/assets/images/dashboard/no-motor.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
          }
          >span {
            font-size: 14px;
            color: #B5F3FF;
            display: block;
            padding-left: 6px;
          }
        }
        .lengend-value {
          width: 50%;
          >p {
          font-family: HemiHead;
          font-size: 16px;
          color: #B5F3FF;
          }
        }
      }
    }
  }

.dashboard-l-aside {
    width: 350px;
    max-width: 350px;
    height: 100%;
    background-image: linear-gradient(90deg, #002A9C 0%, rgba(0,42,156,0.90) 55%, rgba(0,42,156,0.60) 79%, rgba(0,42,156,0.00) 100%);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    .dashboard-aside-container {
      margin-top: 78px;
      height: calc(100% - 78px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
    }
    .aside-block {
      width: 100%;
      height: 77px;
      margin-top: 24px;
      display: flex;
      justify-content: space-around;
      align-content: center;
      align-items: center;
      .aside-item {
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        flex-direction: column;
        >h3 {
          font-weight: 600;
          font-size: 16px;
          color: #B5F3FF;
        }
      }
      .item-block {
        width: 138px;
        display: flex;
        justify-content: center;
        margin-top: 10px;
        background-image: url('~@/assets/images/dashboard/purple-bg.png');;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        >p {
          font-size: 28px;
          color: #FFFFFF;
          font-family: HemiHead;
          margin-top: -5px;
        }
      }
    }
    .aside-l-main{
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .aside-pie {
      box-sizing: border-box;
      flex: 1;
      display: flex;
      flex-direction: column;
      >h3 {
        font-size: 18px;
        line-height: 36px;
        color: #FFFFFF;
        font-weight: 600;
        height: 36px;
        padding-left: 20px;
        margin-top: 24px;
        box-sizing: border-box;
      }
      .aside-charts-main {
        width: 100%;
        display: flex;
        justify-content: center;
        flex: 4;
      }
    }
    .aside-histogram {
      padding: 24px 20px 0 20px;
      width: 100%;
      box-sizing: border-box;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .histogram-title {
        display: flex;
        flex-direction: column;
        .title-container {
          display: flex;
          align-content: center;
          justify-content: flex-start;
          align-items: center;
          >h3 {
            font-size: 18px;
            color: #FFFFFF;
            font-weight: 600;
            height: 36px;
            line-height: 36px;
          }
          >p {
            font-size: 24px;
            color: #18D5FF;
            font-family: HemiHead;
          }
        }
        >span {
          font-size: 12px;
          color: #B5F3FF;
        }
      }
      .aside-histogram-main {
        flex: 1;
        padding: 12px 6px 0 0;
        margin-bottom: 16px;
        box-sizing: border-box;
        overflow-y: auto;
        .rank-list {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          align-content: center;
          margin-top: 20px;
          width: 100%;
          cursor: pointer;
          &:first-child{
            margin-top: 0
          }
          .rank-icon {
            width: 22px;
            height: 34px;
            background-image: url('~@/assets/images/dashboard/warn-addr.svg');
            background-repeat: no-repeat;
            background-position: left center;
            background-size: contain;
            display: flex;
            padding-left: 5px;
            justify-content: center;
            align-content: center;
            align-items: center;
            font-size: 20px;
            color: #fff;
            font-family: HemiHead;
          }
          .rank-content {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: relative;
            &:hover {
              .rank-tooltips {
                opacity: 1;
              }
            }
            .rank-title {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-content: center;
              align-items: center;
              .address {
                width: 150px;
                font-size: 14px;
                color: #B5F3FF;
                padding-bottom: 8px;
              }
              .total {
                >p {
                  font-family: HemiHead;
                  font-size: 18px;
                  color: #B5F3FF;
                  line-height: 14px;
                }
              }
            }
            .pregress {
              height: 10px;
              width: 100%;
              transform: scaleY(-1);
              .category {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                align-content: center;
                width: 100%;
                background-color: rgba(50,170,255,.24);
                >span {
                  display: flex;
                  height: 10px;
                  background-image: linear-gradient(90deg, #19B6FF 0%, #18D5FF 100%);
                  margin-right: 1px;
                  &:last-child{
                    margin-right: 0;
                  }
                }
              }
            }
            .rank-tooltips {
              width: 215px;
              height: 48px;
              box-sizing: border-box;
              background: rgba(0,35,131,0.90);
              border: 1px solid #18D5FF;
              box-shadow: 0 2px 4px 0 rgba(13,49,81,0.20);
              position: absolute;
              top: -30px;
              right: 0;
              z-index: 2;
              opacity: 0;
              >p {
                font-size: 12px;
                color: #FFFFFF;
                line-height: 18px;
                padding: 7px;
              }
            }
          }
        }
      }
    }
    .aside-charts-lengend {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      margin-left: 20px;
      flex: 1;
      .lengend-list {
        width: 50%;
        display: flex;
        justify-content: space-between;
        align-content: center;
        align-items: center;
        .lengend-label {
          width: 50%;
          display: flex;
          justify-content: flex-start;
          align-content: center;
          align-items: center;
          >div {
            width: 24px;
            height: 24px;
            background-repeat: no-repeat;
            background-size: cover;
            &.face {
              background-image: url('~@/assets/images/dashboard/face.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
            &.body{
              background-image: url('~@/assets/images/dashboard/body.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
            &.motor{
              background-image: url('~@/assets/images/dashboard/motor.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
            &.no-motor {
              background-image: url('~@/assets/images/dashboard/no-motor.png');
              background-repeat: no-repeat;
              background-position: center;
              background-size: cover;
            }
          }
          >span {
            font-size: 14px;
            color: #B5F3FF;
            display: block;
            padding-left: 6px;
          }
        }
        .lengend-value {
          width: 50%;
          >p {
          font-family: HemiHead;
          font-size: 16px;
          color: #B5F3FF;
          }
        }
      }
    }
  }
  .pie-noData{
    width : 168px;
    height : 168px;
    border-radius: 50%;
    background: #32AAFF;
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 24px;
    >p {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      font-size: 16px;
      color: #B5F3FF;
    }
    &:after {
      content: '';
      display: block;
      height: 70%;
      width: 70%;
      position: absolute;
      z-index: 1;
      top: 15%;
      left: 15%;
      background-color: rgba(0, 42, 156, .94);
      border-radius: 50%;
    }
  }
  .line-noData {
    width: 100%;
    margin: 12px 0 20px 0;
    background-color: rgba(50, 170, 255, .12);
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    >p {
      font-size: 12px;
      color: #B5F3FF;
    }
  }
/*控制整个滚动条*/
::-webkit-scrollbar {
    width: 8px;
    height: 100%;
    background-color: rgba(24,213,255,0.16);
}
::-webkit-scrollbar-track-piece{
  background-color: rgba(24,213,255,0.16);
}
/*滚动条中间滑动部分*/
::-webkit-scrollbar-thumb {
    background-color: rgba(24,213,255,0.30);
    border: 0;
}
</style>
