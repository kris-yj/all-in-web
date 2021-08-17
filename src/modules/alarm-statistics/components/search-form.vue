<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '20px 0 0' }"
    @reset="resetClick"
    @search="searchClick">
    <template slot="header">
      报警统计
    </template>
    <meg-form
      ref="searchForm"
      class="search-form"
      label-position="top">
      <meg-form-item label="起止时间">
        <meg-date-picker
          v-model="dateValue"
          format="yyyy-MM-dd HH:mm"
          type="datetimerange"
          :range-separator="$t('至')"
          :clearable="false"
          :prefix-icon-visible="false"
          :picker-options="pickerOptions"
          :start-placeholder="$t('开始日期')"
          :end-placeholder="$t('结束日期')">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item label="相机">
        <camera-select
          default-select-all
          map-icon-position="right"
          ref="cameraSelector"
          @update-ready="initSearch"></camera-select>
      </meg-form-item>
      <meg-form-item :label="$t('底库')">
        <meg-treeselect
          ref="database"
          :show-checkbox="true"
          :props="{children: 'items', label: 'name'}"
          :search-placeholder="$t('输入底库名进行搜索')"
          :default-checked-all="true"
          @tree-update-ready="initSearch"
          :data="databaseTree">
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item :label="$t('布控类型')">
        <meg-treeselect
          ref="deploy"
          :show-checkbox="true"
          :default-checked-all="true"
          :props="{children: 'items', label: 'ruleName'}"
          :search-placeholder="$t('输入布控类型进行搜索')"
          @tree-update-ready="initSearch"
          :data="deployList">
        </meg-treeselect>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import CameraSelect from '@/common-components/common-camera-selector';
import moment from 'moment';

const defaultStartTime = moment().subtract(6, 'days').startOf('day').toDate();
const defaultEndTime = moment().endOf('day').toDate();
export default {
  components: {
    CommonFormContainer,
    CameraSelect
  },
  props: {
    databaseTree: {
      type: Array,
      default: () => []
    },
    deployList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dateValue: [defaultStartTime, defaultEndTime],
      isResolved: 0,
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      },
    };
  },
  created() {
  },
  methods: {
    /**
     * 初始化检索
     */
    initSearch() {
      this.isResolved += 1;
      if (this.isResolved === 5) this.searchClick();
    },
    // 表单重置
    resetClick() {
      this.dateValue = [defaultStartTime, defaultEndTime];
      this.$refs.database.setCheckedKeys('ALL');
      this.$refs.cameraSelector.setCheckedKeys('ALL');
      this.$refs.deploy.setCheckedKeys('ALL');
    },
    // 表单检索
    searchClick() {
      const [startTime, endTime] = this.dateValue;
      const params = {
        cameraIds: this.$refs.cameraSelector.getCheckedKeys(),
        deployRules: this.$refs.deploy.getCheckedKeys((item) => item.id !== 'all'),
        albumIds: this.$refs.database.getCheckedKeys((item) => item.id !== 'all')
      };
      if (startTime) params.startTime = startTime.getTime();
      if (endTime) params.endTime = endTime.getTime();
      this.$emit('search', params);
    },

  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-form-item:last-child {
  margin-bottom: 0;
}
.search-form {
  padding: 0 25px 0;
}

.meg-select {
  width: 100%;
}
</style>
