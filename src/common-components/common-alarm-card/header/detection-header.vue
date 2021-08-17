<template>
  <div class="detection-header">
    <slot></slot>
  </div>
</template>

<script>

export default {
  name: 'DetectionHeader',
};
</script>
<style lang="scss" scoped>
.detection-header {
  width: 100%;
  height: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
</style>
