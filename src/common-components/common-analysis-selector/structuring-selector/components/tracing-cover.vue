<template>
  <div class="tracing-cover">
    <megvii-roi
      :value="value"
      single-type
      current-type="point"
      :max-path="4"
      v-on="$listeners"
      :global-styles="{ lineWidth: 3, strokeStyle: '#f8181a' }"
      :focus-styles="{}">
    </megvii-roi>
    <div class="racing-ope-bar operate-bar">
      <meg-button
        type="text"
        icon="cancel"
        @click="$emit('undo')"
        :disabled="value.length === 0"></meg-button>
      <meg-button
        type="text"
        icon="close_1"
        @click="$emit('cancel')"></meg-button>
      <meg-button
        type="text"
        icon="confirm"
        @click="$emit('save')"
        :disabled="value.length !== 4"></meg-button>
    </div>
  </div>
</template>

<script>
import MegviiRoi from 'megvii-roi';

export default {
  components: {
    MegviiRoi
  },
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  }
};
</script>
<style lang="scss" scoped>
.tracing-cover {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  .racing-ope-bar {
    left: 50%;
    margin-left: -82px;
    bottom: -56px;
    width: 164px;
  }
}
</style>
