<template>
  <megvii-roi
    :value="list"
    readonly
    ref="roi"
    v-on="$listeners"
    :global-styles="{ strokeStyle: '#fff' }"
    :focus-styles="{}"
    ignore-invalid-select
    :invert-fill-styles="['rgba(58, 153, 241, 0)', 'rgba(67, 80, 104, 0.3)']"
    :digits="0">
  </megvii-roi>
</template>

<script>
import MegviiRoi from 'megvii-roi';

export default {
  name: 'StructureCover',
  components: {
    MegviiRoi
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    /* choseIndex: {
      type: Number,
      default: 0
    } */
  },
  data() {
    return {
      list: []
    };
  },
  watch: {
    /* choseIndex: 'choseIndexChange' */
    value: {
      handler(val) {
        this.list = val.faceList.concat(val.bodyList, val.motorList, val.nonMotorList);
      },
      immediate: true
    }
  },
  mounted() {
    /* this.$nextTick(() => {
      this.choseIndexChange(this.choseIndex);
    }); */
  },
  methods: {
    update() {
      this.list = this.value.faceList.concat(this.value.bodyList, this.value.motorList, this.value.nonMotorList);
    }
    /* choseIndexChange(newValue) {
      if (this.$refs.roi) {
        this.$refs.roi.choosePath(newValue);
        this.$refs.roi.redrawCanvas();
      }
    } */
  }
};
</script>
