<template>
  <div class="app-page">
    <router-view></router-view>
  </div>
</template>
<script>

export default {
  computed: {
    currentLocale() {
      return this.$store.state.currentLocale;
    },
    currentPageType() {
      return this.$store.state.pageType;
    }
  },
  watch: {
    currentLocale: {
      handler(currentVal) {
        document.querySelector('body').classList.add(`i18n-${currentVal}`);
      },
      immediate: true
    },
    currentPageType: {
      handler(currentVal) {
        if (currentVal !== '') {
          document.querySelector('body').classList.add(`page-${currentVal}`);
        }
      },
      immediate: true
    }
  }
};

</script>
<style lang="scss" scoped>
  .app-page {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
</style>
