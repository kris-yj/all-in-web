<template>
  <div
    class="dashboard-logo"
    v-if="isFull">
    <div class="container">
      <h3 class="title">
        视图大数据综合应用平台
      </h3>
      <div class="megvii-logo">
        <div class="brand"></div>
      </div>
      <div class="date-block">
        <div class="clock">
          <h3 class="hour">
            {{ hours }}
          </h3>
          <h3 class="point">
            :
          </h3>
          <h3 class="minute">
            {{ minutes }}
          </h3>
        </div>
        <div class="date">
          <h3>{{ week }}</h3>
          <p>{{ nowDate }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboarLogo',
  data() {
    return {
      timer: null,
      // hours
      hours: '',
      // minutes
      minutes: '',
      // week
      week: '',
      nowDate: '',
    };
  },
  computed: {
    isFull() {
      return this.$store.state.fullscreen;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  created() {
    const nextDuration = 60000 - ((new Date().getTime()) % 60000);
    this.countdown(nextDuration);
  },
  methods: {
    /**
     * 获取当前时间的年月日，时分秒
    */
    countdown(duration) {
      const seperator = '.';
      const date = new Date();
      const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      // 获取当前月份
      const month = date.getMonth() + 1;
      // 获取当月的几号
      const day = date.getDate();
      this.hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
      this.minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;
      this.week = week[date.getDay()];
      this.nowDate = date.getFullYear() + seperator + month + seperator + day;
      this.timer = setTimeout(() => {
        this.countdown(60000);
      }, duration);
    },
  }
};
</script>
<style lang="scss" scoped>
@font-face {
  font-family: "TIME";
  src: url("~@/assets/fonts/TIME.ttf");
  font-weight: normal;
  font-style: normal;
}
@media (max-width: 1440px) {
  .dashboard-logo {
    height: 65px;
  }
  .title {
    font-size: 32px;
  }
}
@media (min-width: 1441px) and (max-width: 1920px){
  .dashboard-logo {
    height: 86px;
  }
  .title {
    font-size: 40px;
  }
}
.dashboard-logo {
  width: 100%;
  background-image: url('~@/assets/images/dashboard/top.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  background-color: rgba(0,42,156,1);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3333;
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .title {
      color: #FFFFFF;
      letter-spacing: 7px;
      text-align: center;
      text-shadow: 1px 1px 12px rgba(56,61,203,0.40);
      font-weight: 600;
    }
    .megvii-logo {
      width: 200px;
      height: 44px;
      padding: 2px 25px 2px 25px;
      box-sizing: border-box;
      position: absolute;
      left: 20px;
      top: 26px;
      background-image: url('~@/assets/images/dashboard/logobg.svg');
      background-repeat: no-repeat;
      background-size: cover;
      .brand {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        background-position: center;
        background-image: url('~@/assets/images/dashboard/megvii-logo.svg');
        background-repeat: no-repeat;
        background-size: contain;
      }
    }
    .date-block {
      width: 200px;
      height: 44px;
      padding: 2px 25px 2px 25px;
      box-sizing: border-box;
      position: absolute;
      right: 20px;
      top: 26px;
      background-image: url('~@/assets/images/dashboard/logobg.svg');
      background-repeat: no-repeat;
      background-size: cover;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .clock {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        margin-right: 4px;
        >h3 {
          font-weight: 600;
          font-family: "TIME";
          font-size: 36px;
          color: #FFFFFF;
          letter-spacing: 0;
          text-align: left;
        }
        .point {
          margin-left: 2px;
          margin-right: 2px;
          margin-top: -2px;
        }
      }
      .date {
        >h3 {
          font-size: 12px;
          color: #FFFFFF;
          letter-spacing: 0;
        }
        >p {
          font-size: 12px;
          color: #FFFFFF;
          letter-spacing: 0;
          line-height: 12px;
          margin-top: 2px;
        }
      }
    }
  }
}
</style>
