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
      <div class="porperties-wrap">
        <meg-form-item
          class="porperties-item-wrap"
          v-for="(item, index) in techniqueSubProperties"
          :label="item.name"
          :key="index+item.attrKey">
          <property-item :item="item"></property-item>
        </meg-form-item>
      </div>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import SearchCommonCondition from '@/components/search/search-common-condition';
import PropertyItem from '@/common-components/common-property-form/property-form-item';

export default {
  components: {
    PropertyItem,
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
        detectTypes: [0, 1, 5, 6],
        currentTab: 'ALL',
      },
      // 技战法属性
      techniqueSubProperties: [],
      subPropertiesText: '',
    };
  },
  created() {
    this.subPropertiesText = this.$route.query.technicalProperties;
    this.resetProperties();
  },
  methods: {
    resetProperties() {
      // 必须要是数组
      if (this.subPropertiesText && this.subPropertiesText[0] === '[') {
        this.techniqueSubProperties = JSON.parse(this.subPropertiesText) || [];
      }
    },
    // 表单重置
    resetClick() {
      this.$refs.searchForm.resetFields();
      this.$refs.searchCommonCondition.resetCheckedAll();
      this.resetProperties();
    },
    // 表单检索
    searchClick() {
      const commonData = this.$refs.searchCommonCondition.getData(true);
      if (!commonData) return;
      this.formData = Object.assign(this.formData, commonData);
      this.dealWithProperties();
      this.$nextTick(() => {
        this.$emit('search', this.formData);
      });
    },
    getFileSelectedNodes() {
      return this.$refs.searchCommonCondition.getFileSelectedNodes();
    },
    dealWithProperties() {
      const properties = this.techniqueSubProperties;
      const arr = [];
      const codeMap = {};
      properties.forEach((item) => {
        codeMap[item.parentInfo.code] = 1;
        if (item.value && item.value.length) {
          arr.push({
            key: item.attrKey,
            detectType: item.parentInfo.code,
            queryType: item.queryType || '',
            values: Array.isArray(item.value) ? item.value : [item.value]
          });
        }
      });
      this.formData.properties = arr;
      this.formData.detectTypes = Object.keys(codeMap);
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-form-item:last-child {
  margin-bottom: 0;
}
.porperties-wrap{
  padding: 0 25px 20px;
  margin-top: 10px;
}
</style>
