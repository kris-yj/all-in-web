<template>
  <component :is="guideComponent"></component>
</template>

<script>
import GuideDefault from './guide-default';
import GuideTechnique from './guide-technique';

export default {
  components: {
    default: GuideDefault,
    technique: GuideTechnique
  },
  computed: {
    guideComponent() {
      const { query } = this.$route;
      if (query && query.type) {
        return `${query.type}`;
      }
      return 'default';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
