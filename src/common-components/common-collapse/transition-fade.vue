<template>
  <transition name="fadeIn">
    <slot></slot>
  </transition>
</template>
<style lang="scss" scoped>
.fadeIn-enter-active, .fadeIn-leave-active {
  transition: opacity .3s;
}
.fadeIn-enter, .fadeIn-leave-to {
  opacity: 0;
}
</style>
