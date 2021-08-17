<template>
  <megvii-roi
    class="custom-structure"
    v-model="value"
    :allow-types="['rect']"
    :max-path="1"
    v-on="$listeners"
    v-bind="$attrs"
    :global-styles="{ strokeStyle: '#3a99f1' }"
    :focus-styles="{}">
    <div
      v-show="value.length"
      class="structure-ope-bar operate-bar"
      :style="operateBarPos">
      <meg-button
        type="text"
        icon="close_1"
        @click="resetValue"></meg-button>
      <meg-button
        type="text"
        icon="confirm"
        @click="confirmSend"></meg-button>
    </div>
  </megvii-roi>
</template>

<script>
import MegviiRoi from 'megvii-roi';

export default {
  components: {
    MegviiRoi
  },
  data() {
    return {
      value: []
    };
  },
  computed: {
    // 操作按钮的位置
    operateBarPos() {
      const [path] = this.value;
      const [left, top] = path ? [(path.start.x + path.width / 2), (path.start.y + path.height + 0.01)] : [0, 0];
      return { top: `${top * 100}%`, left: `${left * 100}%` };
    }
  },
  methods: {
    resetValue() {
      this.value = [];
      this.$emit('cancel');
    },
    confirmSend() {
      this.$emit('send', this.value[0]);
      this.resetValue();
    }
  }
};
</script>
<style lang="scss" scoped>
.custom-structure {
  background-color: rgba(0, 0, 0, 0.15);
  overflow: inherit;
  .structure-ope-bar {
    width: 110px;
    left: 50%;
    margin-left: -55px;
    z-index: 10;
  }
}
</style>
