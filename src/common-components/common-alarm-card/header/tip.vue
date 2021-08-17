<template functional>
  <div
    class="tip">
    <meg-icon
      class="icon"
      :name="props.info.icon"
      width="14"
      height="14"
      :color="props.info.color"></meg-icon>
    <!-- 底库名称 -->
    <span
      v-tooltip="true"
      :style="{'color':props.info.color}"
      class="name">{{ props.info.value }}</span>
  </div>
</template>

<script>
export default {
  name: 'Tip',
  props: {
    info: {
      type: Object,
      default: () => {}
    },

  },
};
</script>
<style lang="scss" scoped>
.tip {
  margin-left: 4%;
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 1px;
  .icon {
    flex-shrink: 0;
  }
  .name {
    padding-left: 1.5%;
    flex:1;
    box-sizing: border-box;
  }
}
</style>
