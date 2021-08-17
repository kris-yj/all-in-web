<template>
  <div class="depth-search-checkbox">
    <meg-checkbox
      v-model="checked">
      <span class="text">
        深度检索
      </span>
    </meg-checkbox>
    <meg-popover
      ref="destPopover"
      placement="top-start"
      width="90"
      trigger="hover"
      content="深度检索结果更准确，但会延长检索耗时">
    </meg-popover>
    <span
      class="deep-search-icon"
      v-popover:destPopover>
      <meg-icon
        name="help_prompt"
        color="#435068"></meg-icon>
    </span>
  </div>
</template>
<script>
export default {
  model: {
    prop: 'changedValue',
    event: 'input'
  },
  props: {
    changedValue: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    checked: {
      get() {
        return this.changedValue;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
};
</script>
<style lang="scss" scoped>
  ::v-deep .meg-checkbox{
    margin-right: 10px;
    font-weight: 500;
  }
  .deep-search-icon:hover{
    ::v-deep path {
      fill: #21539b;
    }
  }
</style>
