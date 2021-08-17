<template>
  <div>
    <meg-popover
      v-if="$store.state.pageType !== 'single'"
      popper-class="userinfo-popover"
      placement="bottom"
      width="200"
      :confirm-text="$t('确定')"
      trigger="click"
      v-model="userInfoVisible"
      ref="userPopover">
      <div class="userinfo-content">
        <div class="info-content">
          <div class="username">
            {{ $store.state.user.userRealName }}
          </div>
          <div class="name">
            {{ $t('用户名：') }}{{ $store.state.user.userName }}
          </div>
          <div class="department"></div>
          <meg-button
            type="primary"
            class="fullscreen-btn"
            @click="screenSizeChange">
            <meg-icon
              class="fullscreen-icon"
              :name="isFullScreen? 'narrow' : 'fullscreen'"></meg-icon>
            <span>{{ isFullScreen? $t('退出全屏') : $t('进入全屏') }}</span>
          </meg-button>
        </div>
        <div class="about-info">
          <div class="btns">
            <meg-button
              type="text"
              @click="onUpdatePassword">
              <meg-icon
                class="edit-icon"
                name="user_password">
              </meg-icon>
              <span>{{ $t('修改密码') }}</span>
            </meg-button>
            <meg-button
              type="text"
              @click="onAbout">
              <meg-icon
                class="about-icon"
                name="user_about">
              </meg-icon>
              <span>{{ $t('关于') }}</span>
            </meg-button>
          </div>
          <meg-button @click="loginOut">
            {{ $t('退出') }}
          </meg-button>
        </div>
      </div>
    </meg-popover>
    <div
      class="user-info"
      v-popover:userPopover>
      <meg-icon
        class="user-icon"
        name="user"></meg-icon>
      <span class="username">{{ $store.state.user.userRealName }}</span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      userInfoVisible: false,
      isFullScreen: false
    };
  },
  computed: {
  // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      'fullscreen'
    ])
  },
  watch: {
    fullscreen(isFullScreen) {
      if (isFullScreen) {
        this.fullScreen();
      } else {
        this.exitFullScreen();
      }
    }
  },
  created() {
    // 设置全屏
    this.initFullScreen();
  },
  methods: {
    initFullScreen() {
      document.addEventListener('webkitfullscreenchange', () => {
        this.isFullScreen = document.webkitIsFullScreen;
        this.$store.dispatch('setFullscreen', this.isFullScreen);
      });
    },
    screenSizeChange() {
      if (this.isFullScreen) {
        this.exitFullScreen();
      } else {
        this.fullScreen();
      }
    },
    fullScreen() {
      const el = document.documentElement;
      const rfs = el.webkitRequestFullScreen;
      if (typeof rfs !== 'undefined' && rfs) {
        rfs.call(el);
      }
    },
    exitFullScreen() {
      const el = document;
      const cfs = el.webkitCancelFullScreen
      || el.mozCancelFullScreen || el.exitFullScreen;
      if (typeof cfs !== 'undefined' && cfs) {
        cfs.call(el);
      }
    },
    loginOut() {
      this.$emit('login-out');
    },
    onUpdatePassword() {
      this.$emit('show-update-password');
    },
    onAbout() {
      this.$emit('about');
    }
  }
};
</script>

<style lang="scss" scoped="scoped">
  .user-info {
    text-align: right;
    cursor: pointer;
    display: flex;
    align-items: center;
    .username {
      font-size: 14px;
      color: #daebfd;
      margin-left: 5px;
    }
  }
  .user-icon {
    width: 16px;
    height: 16px;
  }
  .userinfo-content .username {
    color: #435068;
    font-size: 16px;
  }
  .userinfo-content .name {
    font-size: 12px;
  }
  .info-content {
    padding: 20px;
  }
  .department {
    font-size: 14px;
    margin-top: 4px;
  }
  .fullscreen-btn {
    width: 100%;
    margin-top: 10px;
  }
  .fullscreen-icon {
    width: 12px;
    height: 12px;
    margin-right: 5px;
  }
  .about-info {
    display: flex;
    flex-direction: column;
    background-color: #eff1f5;
    border-top: 1px solid #e5e9ed;
    padding: 7px 20px 20px 20px;
    .edit-icon, .about-icon {
      width: 13px;
      height: 13px;
      margin-right: 4px;
    }
    .btns {
      flex: 1;
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
    }
  }
</style>
<style lang="scss">
  .userinfo-popover {
    padding: 0px;
    left: auto !important;
    right: 0 !important;
    border-radius: 0px;
    top: 44px !important;
  }
</style>
