<template>
  <meg-radio-group
    v-model="aggType"
    @change="change">
    <meg-radio-button
      v-for="type in resultTabs"
      :label="type.value"
      :key="type.value">
      {{ aggType===type.value? `按${type.label}排序` : type.label }}
    </meg-radio-button>
  </meg-radio-group>
</template>

<script>
export default {
  props: {
    // 默认值
    value: {
      type: null,
      default: '',
    },
    resultTabs: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      aggType: 'SCORE',
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.aggType = newVal;
      }
    }
  },
  methods: {
    change() {
      this.$emit('input', this.aggType);
    }
  }

};
</script>
