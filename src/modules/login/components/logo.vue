<template>
  <div class="logo-con">
    <img
      v-if="showPoliceBadge"
      src="@/assets/images/login/police.png"
      class="police" />
    <img
      v-if="showLogo"
      :src="logoUrl"
      class="logo" />
  </div>
</template>

<script>
// import { computed } from '@vue/composition-api';
// import store from '@/store';

export default {
  props: {
    logoUrl: {
      type: String,
      default: ''
    }
  },
  // setup() {
  //   const showPoliceBadge = computed(() => store.getters.systemByType('showPoliceBadge').value);

  //   console.log('showPoliceBadge', showPoliceBadge);

  //   return {
  //     showPoliceBadge
  //   };
  // },
  computed: {
    showPoliceBadge() {
      const { value } = this.$store.getters.system.showPoliceBadge;
      return value === true || value === 'true';
    },
    showLogo() {
      const { value } = this.$store.getters.system.productLogo;
      return value !== '';
    },
  }
};
</script>

<style lang="scss" scoped>
  .logo-con {
    position: absolute;
    top: 60px;
    left: 160px;

    .police {
      position: absolute;
      height: 70px;
      vertical-align: middle;
      margin-right: 22px;
    }
    .logo {
      position: absolute;
      top: 15px;
      left: 86px;
      vertical-align: middle;
    }
  }
</style>
