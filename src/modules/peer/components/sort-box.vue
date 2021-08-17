<template>
  <meg-radio-group
    class="sort-box"
    v-model="sortType">
    <meg-radio-button label="DAY">
      {{ sortType === 'DAY' ? $t('按{entity}排序',{entity: $t('时间')}):$t('时间') }}
    </meg-radio-button>
    <meg-radio-button label="CAMERA">
      {{ sortType === 'CAMERA' ? $t('按{entity}排序',{entity: $t('地点')}):$t('地点') }}
    </meg-radio-button>
  </meg-radio-group>
</template>
<script>
export default {
  props: {
    isPhotoSearch: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      sortType: 'DAY'
    };
  },
  computed: {

  },
  watch: {
    isPhotoSearch() {
      this.sortType = this.isPhotoSearch ? 0 : 1;
    },
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
