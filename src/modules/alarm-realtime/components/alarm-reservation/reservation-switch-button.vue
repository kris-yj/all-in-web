<template>
  <span
    title="报警订阅"
    class="reservation-switch-button"
    :class="innerActive?'rotate':''"
    @click="OnClick">
    <meg-icon
      name="list"
      width="14"
      height="14"
      color="#C7CED8">
    </meg-icon>
  </span>
</template>
<script>
export default {
  name: 'ReservationSwitchButton',
  model: {
    prop: 'active',
    event: 'change'
  },
  props: {
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerActive: false
    };
  },
  watch: {
    active(val) {
      this.innerActive = val;
    }
  },
  methods: {
    OnClick() {
      this.innerActive = !this.innerActive;
      this.$emit('change', this.innerActive);
    }
  }
};
</script>
<style lang="scss" scoped>
.reservation-switch-button {
  display: inline-block;
  cursor: pointer;
  transition: all 0.5s;
  &.rotate {
    transform: rotateZ(90deg);
  }
}
</style>
