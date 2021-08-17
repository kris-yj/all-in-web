<template>
  <div
    class="prev-next-wrapper"
    :style="{'height': height+'px'}">
    <div
      :class="['prev-next-container']">
      <div
        @click.stop="prevPage"
        class="prev-btn"
        :class="{'disabled': disableLeft}">
        <slot name="prev">
          <meg-icon
            name="arrow_hollow"
            width="22"
            dir="right"></meg-icon>
          <span v-show="showText">
            上一个
          </span>
        </slot>
      </div>
      <div
        class="middle-content">
        <slot></slot>
      </div>
      <div
        @click.stop="nextPage"
        class="next-btn"
        :class="{'disabled': disableRight}">
        <slot name="next">
          <span v-show="showText">
            下一个
          </span>
          <meg-icon
            name="arrow_hollow"
            width="22"
            dir="left"></meg-icon>
        </slot>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CommonNextPrev',
  model: {
    prop: 'index',
    event: 'change',
  },
  props: {
    // 当前项
    index: {
      type: Number,
      default: 0,
    },
    // 共多少个
    total: {
      type: Number,
      default: 0,
    },
    // 是否显示成文字的 上一页下一页，默认箭头
    showText: {
      type: Boolean,
      default: false,
    },
    // 整体高度，默认80px
    height: {
      type: Number,
      default: 80,
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    };
  },
  computed: {
    // 禁用左边
    disableLeft() {
      if (this.disabled || this.index <= 0) {
        return true;
      }
      return false;
    },
    // 禁用右边
    disableRight() {
      if (this.disabled || this.index >= this.total - 1) {
        return true;
      }
      return false;
    },
  },
  watch: {
  },
  mounted() {},
  destroyed() {},
  methods: {
    /**
     * 上一页
     */
    prevPage() {
      if (!this.disableLeft) {
        this.realIndex -= 1;
        this.$emit('change', this.index - 1, 'prev');
      }
    },
    /**
     * 下一页
     */
    nextPage() {
      if (!this.disableRight) {
        this.$emit('change', this.index + 1, 'next');
      }
    },
  },
};
</script>
<style scoped lang="scss">
.prev-next-wrapper {
  background: #000;
}
.prev-next-container {
  height: 100%;
  text-align: center;
  user-select: none;
  display: flex;
  .middle-content {
    flex: 1;
    min-width: 0;
  }
  .prev-btn,
  .next-btn {
    height: 100%;
    display: flex;
    align-items: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 10px;
    ::v-deep path {
      fill: rgba(255, 255, 255, 0.9);
    }
  }
  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
