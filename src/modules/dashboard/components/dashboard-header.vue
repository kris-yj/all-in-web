<template>
  <header class="dashboard-header">
    <div class="header-l-border"></div>
    <div class="header-r-border"></div>
    <nav class="dashboard-nav">
      <li>
        <h3>相机总数</h3>
        <count-up
          :end-val="cameraCount"
          :tag="'p'"></count-up>
      </li>
      <li>
        <h3>抓拍总数</h3>
        <count-up
          :end-val="captureCount"
          :tag="'p'"></count-up>
      </li>
      <li>
        <h3>报警总数</h3>
        <count-up
          :end-val="warningCount"
          :tag="'p'"></count-up>
      </li>
      <li>
        <h3>全息档案</h3>
        <count-up
          :end-val="holographicDocCount"
          :tag="'p'"></count-up>
      </li>
      <li>
        <h3>关注人员</h3>
        <count-up
          :end-val="focusPeopleCount"
          :tag="'p'"></count-up>
      </li>
    </nav>
  </header>
</template>
<script>
import CountUp from '@/common-components/common-countup';

export default {
  name: 'DashboardHeader',
  components: {
    CountUp
  },
  props: {
    data: {
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
    }
  }
};
</script>
<style lang="scss" scoped>
.dashboard-header {
    width: 100%;
    box-sizing: border-box;
    padding: 20px 35px 0 35px;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    background-image: linear-gradient(to bottom, rgba(0,42,156,0.94) 0%, rgba(0,42,156,0.84) 53%, rgba(0,42,156,0.00) 100%);
     @media (min-width: 1440px) and (max-width: 1814px) {
      .dashboard-nav >li >h3 {
        font-size: 18px;
      }
      .dashboard-nav >li >p {
        font-size: 32px;
        padding-top: 9px;
      }
    }
    @media (min-width: 1815px) and (max-width: 1920px){
      .dashboard-nav >li >h3 {
        font-size: 20px;
      }
      .dashboard-nav >li >p {
        padding-top: 16px;
        font-size: 48px;
      }
    }
    .header-l-border {
        width: 120px;
        height: 78px;
        background-image: url('~@/assets/images/dashboard/header-border.png');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center center;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      .header-r-border {
        width: 120px;
        height: 78px;
        background-image: url('~@/assets/images/dashboard/header-border.png');
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center center;
        position: absolute;
        right: 0;
        top: 50%;
        transform: rotate(-180px);
        transform: translateY(-50%) rotateY(180deg);
      }
    .dashboard-nav {
      display: flex;
      justify-content: center;
      align-items: center;
      align-content: center;
      >li {
        width: 18%;
        box-sizing: border-box;
        margin-right: 40px;
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        flex-direction: column;
        >h3 {
          font-size: 18px;
          color: #B5F3FF;
          font-weight: 600;

        }
        >p {
          font-size: 32px;
          padding-top: 9px;
          line-height: 32px;
          color: #FFFFFF;
          text-align: center;
          font-family: HemiHead;
        }
      }
    }
  }
</style>
