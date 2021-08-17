<template>
  <div class="dashboard-r-aside">
    <div class="dashboard-aside-container">
      <div class="aside-block">
        <div class="aside-item">
          <h3>防控单元</h3>
          <div class="item-block">
            <count-up
              :end-val="asideRData.unitCount || 0"
              :tag="'p'"></count-up>
          </div>
        </div>
        <div class="aside-item">
          <h3>关注网格</h3>
          <div class="item-block">
            <count-up
              :end-val="asideRData.gridCount || 0"
              :tag="'p'"></count-up>
          </div>
        </div>
        <div class="aside-item">
          <h3>挖掘团伙 </h3>
          <div class="item-block">
            <count-up
              :end-val="asideRData.gangCount || 0"
              :tag="'p'"></count-up>
          </div>
        </div>
      </div>
      <div class="aside-r-main">
        <div class="aside-section">
          <div class="section-title">
            <h3>防控单元关注指数</h3>
            <p>TOP10</p>
          </div>
          <div
            class="section-list-wrapper"
            v-if="focusList.length">
            <div class="section-list-container">
              <div
                class="section-list"
                v-for="(focus, index) in focusList"
                :key="index">
                <div class="section-rank">
                  <div class="focus-icon"></div>
                  <div class="rank-number">
                    <p>{{ index + 1 }}</p>
                  </div>
                  <div class="category-icon">
                    <img :src="require(`../../../assets/images/dashboard/${focus.sceneId}.png`)" />
                  </div>
                  <i v-tooltip="{'class': 'dashboard-tooltip', text: focus.name}">{{ focus.name }}</i>
                </div>
                <div class="section-trend">
                  <em :class="{'zero': focus.score >= 7, 'second': (focus.score >= 4 && focus.score < 7), 'third': focus.score < 4}">{{ focus.score }}</em>
                  <div :class="{'trend-icon':true, 'up': focus.risen === 1, 'down': focus.risen === - 1}">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="line-noData">
            <p>暂无数据</p>
          </div>
        </div>
        <div class="aside-section">
          <div class="section-title">
            <h3>团伙人员活跃度</h3>
            <p>TOP20</p>
          </div>
          <div
            class="section-table-wrapper"
            v-if="gangList.length">
            <div class="table-header">
              <div class="th-name">
                姓名
              </div>
              <div class="th-gangName">
                团伙名称
              </div>
              <div class="th-active">
                活跃度
              </div>
              <div class="th-focus">
                关注度
              </div>
            </div>
            <div class="section-table-container">
              <div
                class="table-body"
                v-for="(gang, index) in gangList"
                :key="index">
                <div class="tbody-name">
                  <div class="focus-icon"></div>
                  <div class="rank-number">
                    <p>{{ index + 1 }}</p>
                  </div>
                  <div class="category-icon">
                    <meg-img-container :img-src="gang.picture">
                    </meg-img-container>
                  </div>
                  <i v-tooltip="{'class': 'dashboard-tooltip', text: gang.fullName}">{{ gang.fullName }}</i>
                </div>
                <div class="tbody-gangName">
                  <div
                    class="gang-icon"
                    v-if="gang.gangInfos.length"></div>
                  <p
                    v-if="gang.gangInfos.length"
                    v-tooltip="{'class': 'dashboard-tooltip', text: gang.gangInfos[0].gangName}">
                    {{ gang.gangInfos[0].gangName }}
                  </p>
                </div>
                <div class="tbody-active">
                  <div :class="{'active-icon': gang.activeIncreasedDays !== 0}"></div>
                  <p>{{ gang.activeCredit }}</p>
                </div>
                <div class="tbody-focus">
                  <div :class="{'focus-icon': gang.focusIncreasedDays !== 0}"></div>
                  <p>{{ gang.focusCredit }}</p>
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
      </div>
    </div>
  </div>
</template>
<script>
import CountUp from '@/common-components/common-countup';

export default {
  name: 'DashboardAsideRight',
  components: {
    CountUp,
  },
  props: {
    focusList: {
      type: Array,
      default: () => []
    },
    gangList: {
      type: Array,
      default: () => []
    },
    asideRData: {
      type: Object,
      default: () => ({})
    }
  },
};
</script>
<style>
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
 .dashboard-r-aside {
    width: 350px;
    max-width: 350px;
    height: 100%;
    background-image: linear-gradient(-90deg, #002A9C 0%, rgba(0,42,156,0.90) 55%, rgba(0,42,156,0.60) 79%, rgba(0,42,156,0.00) 100%);
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    .dashboard-aside-container {
      margin-top: 78px;
      height: calc(100% - 78px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding-right: 20px;
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
        width: 92px;
        height: 42px;
        display: flex;
        justify-content: center;
        margin-top: 20px;
        background-image: url('~@/assets/images/dashboard/blue-bg.png');;
        background-repeat: no-repeat;
        background-size: contain;
        >p {
          font-size: 28px;
          color: #FFFFFF;
          font-family: HemiHead;
          margin-top: -8px;
        }
      }
    }
    .aside-r-main {
      width: 100%;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    .aside-section {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-top: 24px;
      .section-title {
        display: flex;
        align-content: center;
        justify-content: flex-start;
        align-items: center;
        height: 36px;
        >h3 {
          font-size: 18px;
          color: #FFFFFF;
          font-weight: 600;
        }
        >p {
          font-size: 24px;
          color: #18D5FF;
          font-family: HemiHead;
          height: 36px;
          line-height: 36px;
        }
      }
    }
    .section-list-wrapper {
      flex: 1;
      margin-top: 12px;
      box-sizing: border-box;
      overflow-y: auto;
      .section-list-container {
        .section-list {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          border-bottom: 1px solid #2C429B;
          &:first-child {
            margin-top: 0;
          }
          .section-rank {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            align-content: center;
            position: relative;
            .focus-icon {
              width: 16px;
              height: 24px;
              background-image: url('~@/assets/images/dashboard/follow-index.svg');
              background-repeat: no-repeat;
              background-size: cover;
              position: absolute;
              top: 50%;
              left: 0;
              transform: translateY(-50%);
            }
            .rank-number {
              width: 30px;
              height: 28px;
              padding-left: 15px;
              >p {
                font-family: HemiHead;
                font-size: 20px;
                color: #FFFFFF;
              }
            }
            .category-icon {
              margin-left: 6px;
              width: 16px;
              height: 16px;
              margin-top: -2px;
            }
            >i {
              width: 120px;
              margin-top: -2px;
              margin-left: 11.5px;
              font-size: 14px;
              color: #D6F4FF;
              font-style: normal;
            }
          }
          .section-trend {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-top: 4px;
            >em {
              font-style: normal;
              font-family: HemiHead;
              font-size: 24px;
              color: #19B6FF;
              &.zero{
                color: #F0801D;
              }
              &.second {
                color: #F1AA00;
              }
              &.third {
                color: #19B6Ff;
              }
            }
            .trend-icon {
              margin-left: 11px;
              width: 9px;
              height: 11px;
              background-repeat: no-repeat;
              background-size: cover;
              margin-top: -4px;
              &.up {
                background-image: url('~@/assets/images/dashboard/up.png');
              }
              &.down {
                background-image: url('~@/assets/images/dashboard/down.png');
              }
            }
          }
        }
      }
    }
    .section-table-wrapper {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .table-header {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: 30px;
        background-color: rgba(50,222,255,0.08);
        .th-name {
          width: 35%;
          height: 30px;
          font-size: 14px;
          color: #B5F3FF;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .th-gangName{
          width: 25%;
          height: 30px;
          font-size: 14px;
          color: #B5F3FF;
          display: flex;
          justify-content: center;
          align-items: center;
        }
          .th-active {
            width: 20%;
            height: 30px;
            font-size: 14px;
            color: #B5F3FF;
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }
          .th-focus {
            width: 20%;
            height: 30px;
            font-size: 14px;
            color: #B5F3FF;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-right: 10px;
          }
        }
      .section-table-container {
        flex: 1;
        overflow-y: auto;
        padding-right: 6px;
        margin-top: 7px;
        .table-body {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          border-bottom: 1px solid #2C429B;
          .tbody-name {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            width: 35%;
            height: 40px;
            position: relative;
            .focus-icon {
              width: 16px;
              height: 24px;
              background-image: url('~@/assets/images/dashboard/follow-index.svg');
              background-repeat: no-repeat;
              background-size: cover;
              position: absolute;
              top: 50%;
              left: 0;
              transform: translateY(-50%);
            }
            .rank-number {
              width: 30px;
              height: 28px;
              padding-left: 15px;
              >p {
                font-family: HemiHead;
                font-size: 20px;
                color: #FFFFFF;
              }
            }
            .category-icon {
              width: 34px;
              height: 34px;
              margin-top: -2px;
            }
            >i {
              width: 40px;
              margin-top: -2px;
              font-size: 14px;
              color: #D6F4FF;
              font-style: normal;
            }
          }
          .tbody-gangName{
            width: 25%;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            .gang-icon {
              width: 14px;
              height: 14px;
              background-image: url('~@/assets/images/dashboard/focus.png');
              background-repeat: no-repeat;
              background-size: contain;
              margin-top: -2px;
            }
            >p {
              font-size: 14px;
              color: #D6F4FF;
              padding-left: 2px;
              flex: 1;
            }
          }
          .tbody-active {
            width: 20%;
            height: 40px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            .active-icon {
              width: 18px;
              height: 13px;
              background-image: url('~@/assets/images/dashboard/red.png');
              background-repeat: no-repeat;
              background-size: cover;
              margin-top: -2px;
            }
            >p {
              font-family: HemiHead;
              font-size: 18px;
              color: #D6F4FF;
            }
          }
          .tbody-focus {
            width: 20%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            .focus-icon {
              width: 18px;
              height: 13px;
              background-image: url('~@/assets/images/dashboard/red.png');
              background-repeat: no-repeat;
              background-size: cover;
              margin-top: -2px;
            }
            >p {
              font-family: HemiHead;
              font-size: 18px;
              color: #D6F4FF;
            }
          }
        }
      }
    }
  }
  .line-noData {
    width: 100%;
    margin-top: 12px;
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
