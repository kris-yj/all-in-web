<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '0' }"
    @reset="resetClick"
    @search="searchClick">
    <meg-form
      ref="searchForm"
      :model="formData"
      class="search-form"
      label-position="top">
      <search-common-condition
        ref="searchCommonCondition"
        :form-data="formData"></search-common-condition>
      <meg-form-item
        label="目标特征"
        prop="description"
        class="form-item-description">
        <meg-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入目标特征"></meg-input>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import SearchCommonCondition from '@/components/search/search-common-condition';

export default {
  components: {
    CommonFormContainer,
    SearchCommonCondition,
  },
  data() {
    return {
      formData: {
        sourceType: 'CAMERA',
        taskInfos: [],
        cameraIds: [],
        fileTime: [],
        cameraTime: [],
        startTime: '',
        endTime: '',
        // 检索文本
        description: '',
        currentTab: 'ALL',
      },
    };
  },
  created() {
  },
  methods: {
    getFileSelectedNodes() {
      return this.$refs.searchCommonCondition.getFileSelectedNodes();
    },
    // 表单重置
    resetClick() {
      this.$refs.searchForm.resetFields();
      this.$refs.searchCommonCondition.resetCheckedAll();
    },
    // 表单检索
    searchClick() {
      const commonData = this.$refs.searchCommonCondition.getData(true);
      if (!commonData) return;
      this.formData = Object.assign(this.formData, commonData);
      this.$nextTick(() => {
        this.$emit('search', this.formData);
      });
    },
  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-form-item:last-child {
  margin-bottom: 0;
}
.form-item-description{
  padding: 10px 25px 0;
}
</style>
