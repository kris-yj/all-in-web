<template>
  <meg-form-item
    class="similarity-box"
    :label="$t('相似度')">
    <meg-input-number
      class="similarity"
      :controls="false"
      :max="100"
      :min="0"
      :precision="2"
      @change="onSimilarityChange"
      v-model.number="form.minSimilarity"></meg-input-number>
    <span class="middle">~</span>
    <meg-input-number
      class="similarity"
      :controls="false"
      :max="100"
      :min="0"
      :precision="2"
      @change="onSimilarityChange"
      v-model.number="form.maxSimilarity"></meg-input-number>
  </meg-form-item>
</template>

<script>
import utils from '../../alarm-history.utils';

export default {
  name: 'Similarity',
  components: {},
  props: {
    form: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {

    };
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {
    /**
     * @description 比较相似度大小并矫正
     */
    onSimilarityChange() {
      [this.form.minSimilarity, this.form.maxSimilarity] = utils.numSort(this.form.minSimilarity, this.form.maxSimilarity);
    },
  },
};
</script>
<style lang="scss" scoped>
.similarity-box {
  .similarity {
    width: 95px;
  }
  .middle {
    width: 59px;
    display: inline-block;
    text-align: center;
  }
}
</style>
