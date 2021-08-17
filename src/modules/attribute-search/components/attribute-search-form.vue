<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '20px 0 0' }"
    :show-header="showTitle"
    @reset="resetClick"
    @search="searchClick">
    <template
      slot="header">
      属性检索
    </template>
    <meg-form
      ref="searchForm"
      :model="formData"
      class="search-form"
      label-position="top">
      <common-property-form
        ref="commonPropertyForm"
        :default-get-config="false"
        :tab-horizontal="true"
        :collapse-btn-visible="true"
        :default-expand="false"
        v-model="currentTab">
        <search-common-condition
          ref="searchCommonCondition"
          :form-data="formData"
          :default-checked-keys="defaultCheckedKeys"
          @get-selected-keys="getSelectedKeys"></search-common-condition>
      </common-property-form>
    </meg-form>
  </common-form-container>
</template>

<script>
import moment from 'moment';
import CommonFormContainer from '@/common-components/common-form-container';
import SearchCommonCondition from '@/components/search/search-common-condition';
import CommonPropertyForm from '@/common-components/common-property-form';
import commonSwitchParams from '@/common-components/common-switch-params';

const lastSevenDay = [+moment().subtract(6, 'day').startOf('day').toDate(), +moment().endOf('day').toDate()];

export default {
  components: {
    CommonFormContainer,
    SearchCommonCondition,
    CommonPropertyForm
  },
  data() {
    return {
      formData: {
        sourceType: 'CAMERA',
        taskInfos: [],
        cameraIds: [],
        fileTime: [],
        detectTypes: [0, 1, 5, 6],
        cameraTime: [...lastSevenDay],
        startTime: +lastSevenDay[0],
        endTime: +lastSevenDay[1],
      },
      currentTab: 'ALL',
      defaultCheckedKeys: []
    };
  },
  computed: {
    showTitle() {
      return this.$route.query.pageType !== 'single';
    },
  },
  watch: {
    currentTab(newVal) {
      const map = {
        'ALL': 'NatureSearchTermAll',
        '0': 'NatureSearchTermFace',
        '1': 'NatureSearchTermBody',
        '5': 'NatureSearchTermCar',
        '6': 'NatureSearchTermUNCar',
      };
      if (map[newVal]) this.eventTracking(map[newVal]);
    }
  },
  mounted() {
    const { query } = this.$route;
    if (Object.keys(query).length > 1 || (Object.keys(query).length === 1 && !query.pageType)) {
      commonSwitchParams.getOriginalQuery(query).then((params) => {
        this.searchFromQuery = true;
        console.log(params);
        this.dealWithQuery(params);
      });
    } else {
      this.$refs.commonPropertyForm.getPropertyConfig();
      this.searchFromQuery = false;
    }
  },
  methods: {
    dealWithQuery(params) {
      console.log(params, this.currentTab);
      const {
        from = '',
        taskInfos = this.formData.taskInfos,
        sourceType = this.formData.sourceType,
        currentTab = this.currentTab,
        detectTypes = null,
        properties = {}
      } = params;
      let { cameraIds } = params;
      if (typeof cameraIds === 'string') {
        cameraIds = [cameraIds];
      }
      this.formData.sourceType = sourceType;
      const { startTime = '', endTime = '' } = params;
      console.log(sourceType);
      if (currentTab === 0 || currentTab) this.currentTab = currentTab;
      if (detectTypes && detectTypes.length === 1) {
        this.currentTab = detectTypes[0]; //eslint-disable-line
      } else if (detectTypes) {
        this.currentTab = 'ALL';
      }
      if (Object.keys(properties).length) {
        const { commonPropertyForm } = this.$refs;
        if (from === 'multiple-search') {
          commonPropertyForm.getPropertyConfig().then(() => {
            commonPropertyForm.setProperties(properties, this.currentTab);
          });
        } else {
          commonPropertyForm.getPropertyConfig().then(() => {
            commonPropertyForm.setProperties((this.dealWithLogProperties(properties), this.currentTab));
          });
        }
      }
      if (sourceType === 'CAMERA') {
        this.formData.cameraIds = params.cameraIds;
        this.defaultCheckedKeys = params.cameraIds;
        if (startTime && endTime) {
          this.formData.cameraTime = [startTime, endTime];
        }
      } else if (sourceType === 'OFFLINE') {
        this.formData.taskInfos = taskInfos;
        this.defaultCheckedKeys = taskInfos;
        this.formData.fileTime = [startTime || '', endTime || ''];
      }
      if (currentTab === 0 || currentTab) this.currentTab = currentTab;
      if (detectTypes && detectTypes.length === 1) {
        this.currentTab = detectTypes[0]; //eslint-disable-line
      } else if (detectTypes) {
        this.currentTab = 'ALL';
      }
      if (Object.keys(properties).length) {
        const { commonPropertyForm } = this.$refs;
        if (from === 'multiple-search') {
          commonPropertyForm.getPropertyConfig().then(() => {
            commonPropertyForm.setProperties(properties, this.currentTab);
          });
        } else {
          commonPropertyForm.getPropertyConfig().then(() => {
            commonPropertyForm.setProperties((this.dealWithLogProperties(properties), this.currentTab));
          });
        }
      }
      if (sourceType === 'CAMERA') {
        this.formData.cameraIds = params.cameraIds;
        this.defaultCheckedKeys = params.cameraIds;
        if (startTime && endTime) {
          this.formData.cameraTime = [startTime, endTime];
        }
      } else if (sourceType === 'OFFLINE') {
        this.formData.taskInfos = taskInfos;
        this.defaultCheckedKeys = taskInfos;
        this.formData.fileTime = [startTime || '', endTime || ''];
      }
    },
    // 获取选中的key
    getSelectedKeys(type) {
      if (this.searchFromQuery && this.formData.sourceType === type) {
        // searchClick方法中bool参数去掉后，下面这个判断似乎就没有意义了，注释掉
        // if (this.formData.sourceType === 'OFFLINE') {
        //   this.formData.startTime = this.formData.fileTime[0] || '';
        //   this.formData.endTime = this.formData.fileTime[1] || '';
        // }
        if (this.formData.sourceType !== 'CAMERA' || this.formData.cameraIds.length) {
          this.searchClick(true);
          this.searchFromQuery = false;
        }
      } else if (!this.searchFromQuery && this.formData.sourceType === type) {
        this.searchClick(true);
      }
    },
    // 表单重置
    resetClick() {
      this.$refs.searchForm.resetFields();
      this.$refs.commonPropertyForm.reset('ALL');
      this.$refs.searchCommonCondition.resetCheckedAll();
    },
    // 表单检索
    searchClick() {
      // 埋点请求
      this.eventTracking('NatureSearchSearch');
      // if (!bool) {
      const commonData = this.$refs.searchCommonCondition.getData(true);
      console.log(commonData);
      if (!commonData) return;
      this.formData = Object.assign(this.formData, commonData, { detectTypes: this.currentTab === 'ALL' ? [0, 1, 5, 6] : [this.currentTab] });
      // }
      // this.formData = Object.assign(this.formData, { detectTypes: this.currentTab === 'ALL' ? [0, 1, 5, 6] : [this.currentTab] });
      this.formData.currentTab = this.currentTab;
      setTimeout(() => {
        // 加setTimeout的原因是不确定哪个异步先到。。。
        this.dealWithProperties();
        this.$emit('search', this.formData);
      }, 800);
      this.searchFromQuery = false;
    },
    /**
     * @description 处理日志传入的属性
     */
    dealWithLogProperties(properties) {
      const propertyObj = {};
      properties.forEach((item) => {
        propertyObj[`${item.key}_${item.detectType}`] = item.values;
      });
      return propertyObj;
    },
    dealWithProperties() {
      const properties = this.$refs.commonPropertyForm.getProperties();
      const arr = [];
      properties.forEach((item) => {
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
      console.log(properties);
    },
    getFileSelectedNodes() {
      return this.$refs.searchCommonCondition.getFileSelectedNodes();
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-form-item:last-child {
  margin-bottom: 0;
}
</style>
