<template>
  <div class="content">
    <!-- <keep-alive include="FileCenter"> -->
    <router-view></router-view>
    <!-- </keep-alive> -->
  </div>
</template>

<script>
export default {
};
</script>

<style lang="scss" scoped="scoped">
  .content {
    width: 100%;
    height: 100%;
    // overflow: auto;
    // 待优化
  }
</style>
