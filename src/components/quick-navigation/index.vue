<template>
  <meg-drawer
    class="quick-navigation-drawer"
    direction="ltr"
    :visible="isQuickNavShow"
    :with-header="false"
    :before-close="beforeQuickNavClose"
    :modal-append-to-body="false"
    @opened="opened"
    @closed="closed"
    ref="quickNavDrawer">
    <quick-navigation
      :is-show="isQuickNavOpened"
      @quick-nav-clickoutside="quickNavClickoutside"
      @quick-navigation-close="quickNavigationClose"
      ref="quickNav">
    </quick-navigation>
  </meg-drawer>
</template>

<script>
import QuickNavigation from './quick-navigation.vue';

export default {
  components: {
    QuickNavigation
  },
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isOpened: false
    };
  },
  computed: {
    isQuickNavShow() {
      return this.isShow;
    },
    isQuickNavOpened() {
      return this.isOpened;
    }
  },
  methods: {
    opened() {
      this.isOpened = true;
    },
    closed() {
      this.$refs.quickNav.setStatus(0);
    },
    beforeQuickNavClose(done) {
      this.$emit('quick-navigation-close');
      done();
    },
    quickNavClickoutside() {
      this.$refs.quickNavDrawer.closeDrawer();
    },
    quickNavigationClose() {
      this.$refs.quickNavDrawer.closeDrawer();
    }
  }
};
</script>

<style lang="scss">
.quick-navigation-drawer {
  .meg-drawer {
    width: 490px !important;
    // background-image: linear-gradient(180deg, #141243 0%, #384574 100%);
    // box-shadow: 2px 0 4px 0 rgba(44,58,116,0.45);

    &:focus {
      outline: none;
    }
  }
}

.meg-drawer__container {
  top: 56px;
  height: calc(100% - 56px) !important;

  &:focus {
    outline: none;
  }
}

.app-header {
  .v-modal {
    background-color: #ffffff;
    opacity: 0;
  }
}
</style>
