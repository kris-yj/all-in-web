<template>
  <div>
    <div class="show-more-btns">
      <meg-button
        type="text"
        @click="expandClick">
        {{ isVisible?'收起':'更多' }}
        <meg-icon
          name="arrow_up"
          :dir="isVisible?'':'down'"
          width="11"></meg-icon>
      </meg-button>
    </div>
    <transition name="fadeIn">
      <div v-show="isVisible">
        <slot></slot>
      </div>
    </transition>
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
.fadeIn-enter-active, .fadeIn-leave-active {
  transition: opacity .3s;
}
.fadeIn-enter, .fadeIn-leave-to {
  opacity: 0;
}
.meg-icon{
  position: relative;
  left: -1px;
}
.show-more-btns{
  margin-bottom: 10px;
}
</style>
