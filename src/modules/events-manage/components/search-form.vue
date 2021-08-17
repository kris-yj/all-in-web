<template>
  <common-form-container
    @search="handleSearch"
    @reset="handleReset">
    <template slot="header">
      <h3>事件档案</h3>
    </template>
    <meg-form
      ref="searchForm"
      :model="formData"
      label-position="top">
      <meg-form-item
        label="事件名称"
        prop="eventName">
        <meg-input
          v-model.trim="formData.eventName"
          placeholder="请输入事件名称"></meg-input>
      </meg-form-item>
      <meg-form-item
        label="创建时间"
        prop="createTime">
        <meg-date-picker
          v-model="formData.createTime"
          type="datetimerange"
          :prefix-icon-visible="false"
          format="yyyy-MM-dd HH:mm"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          default-date="pastMonth"
          :picker-options="pickerOptions"
          align="right">
        </meg-date-picker>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>
<script>
import CommonFormContainer from '@/common-components/common-form-container';

export default {
  name: 'SearchForm',
  components: {
    CommonFormContainer,
  },
  data() {
    return {
      formData: {
        eventName: '',
        createTime: []
      },
      pickerOptions: {
        shortcuts: [
          'today',
          'pastThreeDays',
          'pastWeek',
          'pastMonth'
        ]
      }
    };
  },
  methods: {
    /**
     * 检索
     */
    handleSearch() {
      const {
        createTime,
        eventName,
      } = this.formData;
      const searchData = {
        beginTime: createTime && createTime.length > 1 ? new Date(createTime[0]).getTime() : '',
        endTime: createTime && createTime.length > 1 ? new Date(createTime[1]).getTime() : '',
        eventName,
      };
      this.$emit('search', searchData);
    },
    /**
     * 重置
     */
    handleReset() {
      this.$emit('reset');
      this.$refs.searchForm.resetFields();
    },
  }
};
</script>
<style lang="scss" scoped>

</style>
