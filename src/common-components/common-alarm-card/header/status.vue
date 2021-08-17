<template functional>
  <div class="status">
    {{ props.info.status }}
  </div>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      default: () => {}
    },
  },
};
</script>
<style lang="scss" scoped>
.status {
  flex-basis: 60px;
  margin-right: 9px;
  text-align: right;
  flex-shrink: 0;
}
</style>
