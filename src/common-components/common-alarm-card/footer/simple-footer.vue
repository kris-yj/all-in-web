<template>
  <footer class="simple-footer">
    <div class="left">
      <slot name="left"></slot>
    </div>
    <div class="right">
      <slot name="right"></slot>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'SimpleFooter',
};
</script>
<style lang="scss" scoped>
.simple-footer {
  padding: 8px 15px;
  height: 32px;
  display: flex;
  align-items: center;
  .right,.left {
    width: 50%;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
