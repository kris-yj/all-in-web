<template>
  <div>
    <div v-show="isVisible">
      <slot></slot>
    </div>
    <div
      class="show-more-btns"
      v-show="collapseBtnVisible && $scopedSlots.default">
      <meg-button
        type="text"
        @click="expandClick">
        {{ isVisible?'收起筛选':'全部筛选' }}
        <meg-icon
          name="double_arrow_up"
          :dir="isVisible?'':'down'"
          width="14"></meg-icon>
      </meg-button>
    </div>
  </div>
</template>

<script>

export default {
  model: {
    prop: 'isVisible',
    event: 'change'
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    collapseBtnVisible: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {};
  },
  methods: {
    expandClick() {
      this.$emit('change', !this.isVisible);
    }
  }
};
</script>

<style lang="scss" scoped>
.show-more-btns{
  text-align: right;
  padding-right: 25px;
}
</style>
