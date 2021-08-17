<template functional>
  <div class="border-box">
    <div></div>
  </div>
</template>

<script>
export default {
  name: 'SplitLine',
};
</script>
<style lang="scss" scoped>
.border-box {
  padding: 0 20px;
  & > div {
    height: 1px;
    background: #efefef;
  }
}
</style>
