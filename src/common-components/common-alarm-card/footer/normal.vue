<template functional>
  <p
    v-tooltip="true"
    class="card-line">
    {{ props.info.value }}
  </p>
</template>

<script>
export default {
  name: 'Normal',
  props: {
    info: {
      type: Object,
      default: () => {}
    },
  }
};
</script>
<style lang="scss" scoped>
.card-line {
  font-size: 12px;
  color: #435068;
  line-height: 16px;
  .device-type-icon {
    margin-right: 5px;
  }
}
</style>
