<template>
  <div class="app">
    <common-header
      :show-immidately="showImmidately"
      v-if="isHeaderShow">
      <template v-slot:headerContent>
        <header-menu
          :alarm-count="alarmCount"></header-menu>
      </template>
      <template v-slot:headerActions>
        <!-- <meg-icon
          name="help_prompt"
          class="action"
          @click="guideClick"
          ref="guideIcon">
        </meg-icon> -->
        <task
          ref="task"
          class="action"></task>
        <user-info
          class="action"
          @login-out="loginOut"
          @about="onAbout"
          @show-update-password="onUpdatePasswordShow"></user-info>
      </template>
    </common-header>
    <div class="app-content-wrapper">
      <app-menu
        v-if="isMenuShow"
        class="app-menu">
      </app-menu>
      <app-content class="app-content"></app-content>
    </div>
    <update-password-dialog
      :is-show="isUpdatePasswordShow"
      :is-full-screen="isFullScreen"
      @update-password-confirm="updatePassword"
      @update-password-close="onUpdatePasswordClose">
    </update-password-dialog>
    <about-dialog
      :is-show="isAboutShow"
      :is-full-screen="isFullScreen"
      @about-close="onAboutClose">
    </about-dialog>
  </div>
</template>
<script>
import CommonHeader from '@/components/layout/header';
import Task from '@/components/task/task.vue';
import UserInfo from '@/components/user-info/user-info';
import UpdatePasswordDialog from '@/components/user-info/update-password';
import AboutDialog from '@/components/user-info/about';
import HeaderMenu from '../components/header-menu';
import AppMenu from '../components/app-menu';
import AppContent from '../components/app-content';
import LayoutSrv from '../layout.service';

export default {
  components: {
    CommonHeader,
    HeaderMenu,
    AppMenu,
    AppContent,
    Task,
    UserInfo,
    UpdatePasswordDialog,
    AboutDialog
  },
  props: {
    showImmidately: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isUpdatePasswordShow: false,
      isFullScreen: false,
      isAboutShow: false,
      alarmCountPollingTimer: null,
      alarmCount: 0
    };
  },
  computed: {
    isMenuShow() {
      if (this.$route.meta.hiddenMenu || this.$store.state.pageType === 'single') {
        return false;
      }
      return true;
    },
    isHeaderShow() {
      if (this.$store.state.pageType === 'single') {
        return false;
      }
      return true;
    }
  },
  watch: {
    '$route': {
      handler(newRoute) {
        const { query } = newRoute;
        this.$store.state.pageType = query.pageType || '';
        this.setByRouter(newRoute);
      },
      immediate: true
    }
  },
  created() {
    // 初始化
    this.init();
  },
  methods: {
    init() {
      // 根据当前路由的设置
      this.setByRouter(this.$router.currentRoute);
    },
    /**
     * 路由变化有的处理：设置当前一级导航，根据当前一级导航来获取侧边二级导航
     */
    setByRouter(route) {
      const { meta } = route;
      consola.info('set by router current first nav: ', meta.firstNav);
      // 依赖路由初始化话配置的一级导航，这部分需要优化
      this.$store.dispatch('setCurrentFirstNav', meta.firstNav || 'alarm');

      // 正常菜单模式,如果当前菜单有实时报警功能
      if (this.$store.getters.modulesByAlias('alarm-realtime') && this.$store.state.pageType !== 'single') {
        window.clearTimeout(this.alarmCountPollingTimer);
        this.alarmCountPollingTimer = null;
        if (route.name === 'alarm-realtime') {
          this.alarmCount = 0;
        } else {
          this.alarmTime = (new Date()).getTime();
          this.alarmCountPollingTimer = setTimeout(() => {
            this.getAlarmCount();
          }, 5000);
        }
      }
    },
    getAlarmCount() {
      const params = {
        capturedTime: this.alarmTime
      };
      if (this.$route.name === 'alarm-realtime') {
        window.clearTimeout(this.alarmCountPollingTimer);
        this.alarmCountPollingTimer = null;
        return;
      }
      LayoutSrv.getNewAlarm(params).then((res) => {
        if (res.code === 0) {
          this.alarmTime = res.data.capturedTime;
          this.alarmCount = res.data.allNum;
          if (res.data.allNum === 0) {
            this.alarmCountPollingTimer = setTimeout(() => {
              window.requestAnimationFrame(this.getAlarmCount);
            }, 5000);
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     *更新密码
     */
    updatePassword(params) {
      LayoutSrv.updatePassword(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('密码修改成功'));
        } else {
          this.$message.error(this.$t('密码修改失败'));
        }
        this.isUpdatePasswordShow = false;
      });
    },
    /**
     * 退出
     */
    loginOut() {
      LayoutSrv.loginOut().then((res) => {
        if (res.code === 0) {
          this.$refs.task.destroyed();
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('animation');
          // 退出登录成功后，导航到登录页
          this.$router.push('/login');
          window.clearTimeout(this.alarmCountPollingTimer);
          this.alarmCountPollingTimer = null;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 点击显示更新密码弹窗
     */
    onUpdatePasswordShow() {
      this.isUpdatePasswordShow = true;
    },
    /**
     * 点击关闭更新密码弹窗
     */
    onUpdatePasswordClose() {
      this.isUpdatePasswordShow = false;
    },
    /**
     * 点击显示关于弹窗
     */
    onAbout() {
      this.isAboutShow = true;
    },
    /**
     * 点击关闭关于弹窗
     */
    onAboutClose() {
      this.isAboutShow = false;
    },
  }
};
</script>
<style lang="scss" scoped>
.app {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
}
.app-content-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;
}
.app-menu {
  width: 100px;
  padding-top: 10px;
  overflow-y: auto;
}
.header-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 100%;
  flex: 1;
  color: #e6f2ff;
  .header-menu-item {
    width: 88px;
    margin: 0 5px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    position: relative;
  }
}
.app-content {
  flex: 1;
  background: #ffffff;
  overflow: hidden;
}
.page-single .app-content {
  background: inherit;
}
.action {
  margin-right: 25px;
  cursor: pointer;
}
.guide-mask {
  position: absolute;
  height: 100%;
  width: 100%;
  opacity: 0.7;
  background: #0c142c;
  z-index: 9999;

  .guide-tip-wrapper {
    position: absolute;
    top: 22px;
    width: 181px;
    height: 185px;
  }

  .guide-icon {
    position: absolute;
    right: 0px;
  }

  .guide-line {
    position: absolute;
    top: 6px;
    right: 10px;
  }

  .guide-btn {
    position: absolute;
    bottom: 0px;
    left: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 32px;
    border: 1px solid #ffffff;
    border-radius: 2px;
    cursor: pointer;

    span {
      font-size: 16px;
      color: #ffffff;
      font-weight: 600;
      margin-right: 5px;
    }
  }

  .tip-content {
    width: 147px;
    height: 81px;
    border: 1px dashed #ffffff;
    border-radius: 2px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 62px;

    p {
      color: #ffffff;
      font-weight: 600;
      font-size: 16px;
    }
  }
}
</style>
