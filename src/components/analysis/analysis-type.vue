<template>
  <div class="form-item-inner">
    <meg-radio-group
      ref="radios"
      class="analysis-types"
      v-model="analysisType"
      @change="handleRadioChange">
      <div
        class="analysis-type-item"
        v-for="(item, index) in analysisTypeArr"
        :key="index">
        <div class="title">
          <meg-radio
            :label="item.id">
            {{ item.label }}
          </meg-radio>
          <div class="type-wrapper">
            <analysis-type-icons :init-property-data="item.val"></analysis-type-icons>
          </div>
        </div>
        <div class="msg">
          {{ item.msg }}
        </div>
      </div>
    </meg-radio-group>
  </div>
</template>
<script>
import AnalysisTypeIcons from './analysis-type-icons';

export default {
  name: 'AnalysisType',
  components: {
    AnalysisTypeIcons
  },
  props: {
    analysisTypeArr: {
      type: Array,
      default: () => ([])
    },
    type: {
      type: Number,
      default: 1 // 1. 编辑，2. 新建
    },
    value: {
      type: Number,
      default: undefined
    },
    formType: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      analysisType: this.value
    };
  },
  watch: {
    value(v) {
      this.analysisType = v;
    },
    analysisTypeArr: {
      immediate: true,
      handler(arr) {
        if (arr && this.type === 2) {
          if (this.formType === 'add') {
            // 新建时默认选中第一项
            const { id } = this.analysisTypeArr[0];
            this.analysisType = id;
            this.$emit('input', id);
          }
        }
      }
    }
  },
  methods: {
    handleRadioChange(v) {
      this.$emit('input', v);
    }
  },
};
</script>
<style lang="scss">
.form-item-inner{
  .analysis-types{
    width: 100%;
  }
  .analysis-type-item{
    border-bottom: 1px solid #f3f3f3;
    padding: 14px 10px;
    line-height: 1;
    .title{
      position: relative;
      margin-bottom: 8px;
      .type-wrapper{
        position: absolute;
        right: 0;
        top: 0;
      }
    }
    .msg{
      margin-left: 28px;
      color: #999;
      font-size: 12px;
    }
  }
  .analysis-type-item:nth-child(2n-1) {
    background: #f9f9f9;
  }
}
</style>
