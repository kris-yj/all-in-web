<template>
  <div class="config-block">
    <div class="item-title">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div class="item-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
    };
  },
  created() {
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
.config-block {
  box-sizing: border-box;
  margin-bottom: 12px;
  .item-title {
    background: #fff;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 500;
    padding-left: 20px;
  }
  .item-content {
    background: #F9F9F9;
    font-size: 12px;
    padding: 30px 0 10px;
    .meg-form {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
    }
  }
}
</style>
