<template>
  <div class="similarity-input-wrapper">
    <meg-input-number
      class="similarity-input"
      :controls="false"
      :precision="2"
      :min="1"
      :max="100"
      @change="change"
      v-model="threshold">
    </meg-input-number> ~100
  </div>
</template>
<script>
export default {
  name: 'CommonSimilarityInput',
  model: {
    prop: 'changedThreshold',
    event: 'change'
  },
  props: {
    changedThreshold: {
      type: Number,
      default: 1,
    },
  },
  computed: {
    threshold: {
      get() {
        return this.changedThreshold;
      },
      set(val) {
        this.$emit('change', val);
      }
    }
  },
  methods: {
    change(value) {
      this.$emit('change', value);
    }
  }
};
</script>

<style lang="scss" scoped>
  .similarity-input {
    width: 100px;
  }
</style>
