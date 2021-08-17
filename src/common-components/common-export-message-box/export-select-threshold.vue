<template>
  <div class="export-threshold-select">
    <span class="select-title">
      相似度
    </span>
    <span class="select-body">
      <meg-input-number
        :max="100"
        :controls="false"
        :min="1"
        v-model="innerThreshold"
        @change="onChange">
      </meg-input-number>
    </span>
    <span class="select-end"> ~100</span>
  </div>
</template>

<script>
export default {
  name: 'ExportSelectThreshold',
  model: {
    prop: 'selected',
    event: 'change'
  },
  props: {
    selected: {
      type: Number,
      default: 60
    },
    selectOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerThreshold: 60
    };
  },
  watch: {
    selected: {
      immediate: true,
      handler() {
        this.innerThreshold = this.selected;
      }
    }
  },
  created() {
    this.innerThreshold = this.selectOptions.selects || 60;
    this.$emit('change', this.innerThreshold);
  },
  methods: {
    onChange(value) {
      this.$emit('change', value);
    }
  }
};
</script>
<style lang="scss" scoped>
.export-threshold-select {
  display: flex;
  justify-content: space-around;
  align-items: center;

  .select-title {
    flex: 0 0 45px;
  }

  .select-body {
    flex: 1 1 100px;
    margin: 0 10px;
  }

  .select-end {
    flex: 0 0 45px;
  }
}
</style>
