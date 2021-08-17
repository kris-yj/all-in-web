<template>
  <div
    class="app-header"
    ref="appHeader">
    <div class="header-title">
      <div
        @click="quickNavigationOpen"
        :class="['quick-nav-btn-wrapper', isQuickNavShow? 'open' : '']">
        <meg-icon
          name="quick-nav-dial"
          color="#ffffff"
          class="quick-nav-btn"></meg-icon>
      </div>
      <div class="header-logo-area">
        <div
          v-if="isShowInnerLogo"
          class="logo"
          @click="backToMain">
          <img
            :src="navLogo" />
        </div>
        <slot name="headerTitle">
          <div class="default-system-name">
            {{ defaultTitleName }}
          </div>
        </slot>
      </div>
    </div>
    <div class="header-content">
      <slot name="headerContent"></slot>
    </div>
    <div class="header-actions">
      <guide :show-immidately="showImmidately"></guide>
      <slot name="headerActions"></slot>
      <temporary-shelf class="action"></temporary-shelf>
    </div>
    <quick-navigation
      :is-show="isQuickNavShow"
      @quick-navigation-close="quickNavigationClose">
    </quick-navigation>
  </div>
</template>

<script>
import TemporaryShelf from '../temporary-shelf/temporary-shelf';
import QuickNavigation from '../quick-navigation';
import Guide from '../guide';

export default {
  components: {
    TemporaryShelf,
    QuickNavigation,
    Guide
  },
  props: {
    showImmidately: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isQuickNavShow: false,
    };
  },
  computed: {
    isShowInnerLogo() {
      const { value } = this.$store.getters.systemByType('showInnerLogo');
      return value === 'true' || value === true;
    },
    navLogo() {
      return this.$store.getters.systemByType('kunlun_navigation_logo').value;
    },
    productType() {
      return Number(this.$store.getters.systemByType('productType').value);
    },
    defaultTitleName() {
      const productNameCode = this.productType === 0 ? 'productName' : 'productName_DL';
      return this.$store.getters.systemByType(productNameCode).value;
    }
  },
  methods: {
    backToMain() {
      this.$router.push('/');
    },
    quickNavigationOpen() {
      this.isQuickNavShow = true;
    },
    quickNavigationClose() {
      this.isQuickNavShow = false;
    },
  }
};
</script>

<style lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: $--app-layout-header-height;
  color: #e6f2ff;

  .quick-nav-btn-wrapper {
    width: 100px;
    cursor: pointer;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.open {
      background-color: #141243;
    }
  }

  .quick-nav-btn {
    height: 20px;
    width: 20px;
  }

  .header-logo-area {
    display: flex;
    align-items: center;
    margin-left: 21px;
  }

  .header-title {
    display: flex;
    align-items: center;
    color: #fff;
    text-align: center;
    font-size: 20px;
    font-weight: 700;
  }
  .logo {
    height: 40px;
    width: 103px;
    display: flex;
    align-items: center;
    cursor: pointer;
    img {
      height: 40px;
    }
  }
  .default-system-name {
    margin-left: 21px;
  }
  .header-actions {
    display: flex;
    align-items: center;
  }
  .action {
    margin-right: 25px;
    cursor: pointer;
  }
}
</style>
