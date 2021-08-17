<template>
  <div
    class="alarm-select-button"
    :class="{'active':componentActive}"
    @click.stop="selectBtnClick">
    <span class="select-button-icon">
      <meg-icon
        :name="icon"
        width="16"
        color="#435068 #ffffff"
        height="16"></meg-icon>
    </span>
    <span class="select-button-label">{{ label }}</span>
    <span
      class="select-button-arrow"
      :class="componentActive?'arrow-down':'arrow-up'">
      <meg-icon
        name="arrow_solid"
        width="12"
        height="12"
        dir="down"
        color="#21539b"></meg-icon>
    </span>
  </div>
</template>

<script>
export default {
  name: 'AlarmSelectButton',
  model: {
    prop: 'active',
    event: 'change'
  },
  props: {
    icon: {
      default: '',
      type: String
    },
    label: {
      default: '',
      type: String
    },
    // 显示状态
    active: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      componentActive: false
    };
  },
  watch: {
    active(val) {
      this.componentActive = val;
    }
  },
  mounted() {
    this.componentActive = this.active;
  },
  methods: {
    selectBtnClick() {
      this.componentActive = !this.componentActive;
      this.$emit('change', this.componentActive);
    }
  }
};
</script>

<style scoped lang="scss">
.alarm-select-button {
  display: flex;
  align-items: center;
  width: 184px;
  height: 34px;
  padding: 0 10px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  border: 1px solid #dddddd;
  border-radius: 2px;
  box-sizing: border-box;
  transition: all 0.3s;

  &:hover {
    border-color: #c0c4cc;
  }

  &.active {
    border-color: #21539b;
  }

  .select-button-icon {
    flex: 0 0 20px;
  }

  .select-button-label {
    flex: 1;
    color: #435068;
    user-select: none;
  }

  .select-button-arrow {
    flex: 0 0 10px;
    display: flex;
    width: 10px;
    align-items: center;
    justify-content: center;
    svg {
      border-radius: 5px;
    }
  }
}

.arrow-down {
  float: right;
  transform: rotate(90deg);
  transition: 0.2s;
  transform-origin: 50% 50%;
}
.arrow-up {
  float: right;
  transform: rotate(270deg);
  transform-origin: 50% 50%;
  transition: 0.2s;
}
</style>
