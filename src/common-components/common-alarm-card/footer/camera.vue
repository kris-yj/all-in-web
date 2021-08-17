<template functional>
  <p
    class="card-line"
    v-tooltip="true">
    <span class="device-type-icon">
      <meg-icon
        width="12"
        height="12"
        color="#D1D5DD"
        :name="props.info.icon">
      </meg-icon>
    </span>
    {{ props.info.value }}
  </p>
</template>

<script>
export default {
  name: 'Camera',
  props: {
    info: {
      type: Object,
      default: () => {}
    },
  },
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
