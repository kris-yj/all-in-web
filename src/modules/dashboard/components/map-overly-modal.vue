<template>
  <div class="area-wrapper">
    <div class="area-hover">
      <div class="area-aside">
        <h3>
          {{ data.name }}
        </h3>
        <div class="tags">
          {{ data.sceneName }}
        </div>
        <p v-show="mode === 'click'">
          {{ data.deviceCount }}个点位
        </p>
      </div>
      <div class="area-right">
        <div class="top">
          <h3 :class="{'zero': data.score >= 7, 'second': (data.score >= 4 && data.score < 7), 'third': data.score < 4}">
            {{ data.score }}
          </h3>
          <span :class="{'trend-icon':true, 'up': data.risen === 1, 'down': data.risen === - 1}"></span>
        </div>
        <div
          class="detail"
          @click="handleJumpTo"
          v-show="mode === 'click'">
          <p>
            查看详情
          </p>
          <meg-icon
            class="detail-icon"
            name="arrow_right"
            width="10"
            height="10"></meg-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { switchToModule } from '@/utils/utils.js';

export default {
  name: 'MapOverlyModal',
  props: {
    mode: {
      type: String,
      default: 'hover'
    },
    data: {
      type: Object,
      default: () => null
    }
  },
  methods: {
    handleJumpTo() {
      const { id } = this.data;
      switchToModule({
        module: 'control-unit-document',
        child: 'doc-detail',
        query: {
          id,
        },
        pageType: 'single',
        isBlank: true
      });
    }
  }
};
</script>
<style lang="scss" scoped>
  .area-wrapper {
    width: 242px;
    padding: 20px 14px 20px 14px;
    background-color:rgba(0, 42, 156, .94);
    box-shadow: 2px 4px 8px 1px rgba(0,0,0,0.12);
    border: 1px solid #18D5FF;
    position: relative;
    &:after {
      content: ' ';
      width: 8px;
      height: 8px;
      background-color:rgba(0, 42, 156, .94);
      border-bottom: 1px solid #18D5FF;
      border-right: 1px solid #18D5FF;
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%) rotate(45deg);
    }
    .area-hover {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .area-aside {
        >h3 {
          font-size: 14px;
          color: #FFFFFF;
          font-weight: 600;
        }
        .tags {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 16px;
          width: 56px;
          border-radius: 2px;
          font-size: 12px;
          color: #D6F4FF;
          margin-top: 8px;
          background-color: rgba(25, 182, 255, .24);
        }
        >p {
          padding-top: 14px;
          font-size: 12px;
          color: #D6F4FF;
        }
      }
      .area-right {
        display: flex;
        flex-direction: column;
        .top {
          display: flex;
          justify-content: flex-end;
          align-items: center ;
          >h3 {
            font-family: HemiHead;
            font-size: 40px;
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
              margin-left: 11.4px;
              width: 9px;
              height: 11px;
              background-repeat: no-repeat;
              background-size: cover;
              &.up {
                background-image: url('~@/assets/images/dashboard/up.png');
              }
              &.down {
                background-image: url('~@/assets/images/dashboard/down.png');
              }
          }
        }
      }
      .detail {
        display: flex;
        justify-content: flex-end;
        cursor: pointer;
        align-items: center;
        >p {
          font-size: 12px;
          color: #FFFFFF;
        }
        .detail-icon {
          color: #fff;
          margin-top: -2px;
          margin-left: 2px;
        }
      }
    }
  }
</style>
