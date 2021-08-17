<template>
  <div class="export-multi-threshold-select">
    <div
      class="threshold-item"
      v-for="(select,index) in thresholdOptions"
      v-show="!select.hidden"
      :key="index">
      <span class="select-title">
        {{ select.label }}
      </span>
      <span class="select-body">
        <meg-input-number
          :max="100"
          :controls="false"
          :min="1"
          v-model="innerThresholds[index]"
          @change="onChange($event,index)">
        </meg-input-number>
      </span>
      <span class="select-end"> ~100</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportSelectMultiThreshold',
  model: {
    prop: 'selected',
    event: 'change'
  },
  props: {
    selected: {
      type: Array,
      default: () => ([])
    },
    selectOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerThresholds: []
    };
  },
  computed: {
    thresholdOptions() {
      // 提供默认值
      return this.selectOptions.selects || [
        { label: '人脸相似度', value: 60 },
        { label: '人体相似度', value: 60 }
      ];
    }
  },
  watch: {
    selected: {
      handler() {
        this.innerThreshold = this.selected;
      }
    }
  },
  created() {
    this.innerThresholds = this.thresholdOptions.map((item) => item.value);
    this.$emit('change', this.innerThresholds.map((v) => v));
  },
  methods: {
    onChange(value, index) {
      this.innerThresholds[index] = value;
      this.$emit('change', this.innerThresholds.map((v) => v));
    }
  }
};
</script>
<style lang="scss" scoped>
.export-multi-threshold-select {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: 100%;

  .threshold-item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 5px;

    .select-title {
      flex: 1 0 45px;
      text-align: end;
    }

    .select-body {
      flex: 1 1 100px;
      margin: 0 10px;
    }

    .select-end {
      flex: 1 0 45px;
      text-align: start;
    }
  }
}
</style>
