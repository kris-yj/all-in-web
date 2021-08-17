<template>
  <meg-radio-group
    class="sort-box"
    v-model="sortType">
    <meg-radio-button label="0">
      {{ sortType === '0' ? $t('按{entity}排序', { entity: $t('时间') }) : $t('时间') }}
    </meg-radio-button>
    <meg-radio-button label="1">
      {{ sortType === '1' ? $t('按{entity}排序', { entity: $t('相似度') }) : $t('相似度') }}
    </meg-radio-button>
    <meg-radio-button label="2">
      {{ sortType === '2' ? $t('按{entity}排序', { entity: $t('地点') }) : $t('地点') }}
    </meg-radio-button>
    <meg-radio-button label="3">
      {{ sortType === '3' ? $t('按{entity}排序', { entity: $t('目标') }) : $t('目标') }}
    </meg-radio-button>
  </meg-radio-group>
</template>
<script>
export default {
  props: {
  },
  data() {
    return {
      sortType: '0'
    };
  },
  watch: {
    sortType(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$emit('change', newValue);
      }
    }
  }

};
</script>
<style lang="scss">
.sort-box{
  .el-radio-button__orig-radio{
    color: #5a6676;
    border-color: #d2d6de;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: #21539b;
    background-color: #f9f9f9;
    border-color: #d2d6de;
    box-shadow:none;
  }
  .el-radio-button__inner{
    height: 34px;
    font-weight: 500;
    font-size: 14px;
    line-height: 34px;
    padding-top: 0;
    padding-bottom: 0;
    background-color: #e3e7ea;
  }
  .el-radio-button:last-child .el-radio-button__inner {
    border-radius: 0;
  }
  .el-radio-button:first-child .el-radio-button__inner {
    border-radius: 0;
  }
  .meg-icon{
    width: 6px;
    height: 10px;
    color: #5a6676;
  }
}
</style>
