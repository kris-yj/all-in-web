<template>
  <div class="property-item__wrap">
    <label class="property-item__label">
      {{ label }}
    </label>
    <div class="property-item__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: null,
      default: ''
    }
  }
};
</script>

<style lang="scss" scoped>
  .property-item__wrap{
    padding: 15px 17px 5px;
    font-size: 14px;
  }
  .property-item__label{
    text-align: left;
    padding: 0 0 8px;
    line-height: unset;
    display: inline-block;
  }
  .roperty-item__content{
    position: relative;
  }
</style>
