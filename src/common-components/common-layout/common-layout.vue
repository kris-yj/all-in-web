<template>
  <meg-container>
    <meg-aside
      :width="asideWidth"
      v-if="!hideAside">
      <slot name="left"></slot>
    </meg-aside>
    <meg-main>
      <slot name="right"></slot>
    </meg-main>
  </meg-container>
</template>

<script>

export default {
  name: 'CommonLayout',
  props: {
    hideAside: {
      type: Boolean,
      default: false
    },
    asideWidth: {
      type: [String],
      default: '320px'
    }
  }
};
</script>

<style lang="scss" scoped>
.meg-container{
  height: 100%;
  background-color: #dce1e5;
  .meg-aside{
    background-color: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .meg-main{
    position: relative;
    padding: 0 0 0 18px;
    ::v-deep .common-main-header {
      color: #435068;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 20px;
    }
    ::v-deep .common-main-content {
      height: calc(100% - 56px);
      box-sizing: border-box;
      overflow: auto;
    }
  }
}
</style>
