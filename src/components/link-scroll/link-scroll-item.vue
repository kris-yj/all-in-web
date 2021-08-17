<template>
  <div
    :class="['link-scroll-item', {'active': isActive}]"
    @click="tabItem">
    <slot></slot>
  </div>
</template>
<script>
import { suffix, typeEnum, evtName } from './const';

const { menuItemClick } = evtName;
export default {
  name: `LinkScrollItem${suffix}`,
  inject: ['scrollBox', 'containerType'],
  data() {
    return {
      isActive: false
    };
  },
  computed: {
    isMenuItem() {
      return this.containerType === typeEnum.menu;
    }
  },
  methods: {
    tabItem() {
      if (!this.isMenuItem) return;
      this.scrollBox.$emit(menuItemClick, this);
    }
  }
};
</script>
<style lang="scss">

</style>
