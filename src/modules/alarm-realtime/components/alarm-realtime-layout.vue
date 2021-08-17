<template functional>
  <meg-container class="realtime-alarm-container">
    <meg-header
      v-if="props.showHeader"
      :height="props.headerHeight"
      class="realtime-alarm-container-header">
      <slot name="header"></slot>
    </meg-header>
    <meg-main
      class="realtime-alarm-container-content">
      <slot name="content"></slot>
    </meg-main>
    <meg-aside
      v-if="props.showAside"
      :width="props.asideWidth"
      class="realtime-alarm-container-aside">
      <slot name="aside"></slot>
    </meg-aside>
  </meg-container>
</template>
<script>
export default {
  name: 'RealtimeAlarmLayout',
  props: {
    showHeader: {
      type: Boolean,
      default: false
    },
    headerHeight: {
      type: String,
      default: '60px'
    },
    // 是否显示侧边栏
    showAside: {
      type: Boolean,
      default: true
    },
    // 侧边栏宽度
    asideWidth: {
      type: String,
      default: '340px'
    }
  }
};
</script>
<style lang="scss" scoped>
.realtime-alarm-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .realtime-alarm-container-header {
    padding: 0;
    position: relative;
  }
  .realtime-alarm-container-content {
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .realtime-alarm-container-aside {
    height: 100%;
  }
}
</style>
