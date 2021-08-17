<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '20px 0 0' }"
    @reset="resetClick"
    @search="searchClick">
    <template slot="header">
      检索统计
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
          :prefix-icon-visible="false"
          :clearable="false"
          :picker-options="pickerOptions"
          :range-separator="$t('至')"
          :start-placeholder="$t('开始日期')"
          :end-placeholder="$t('结束日期')">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item :label="$t('部门')">
        <meg-treeselect
          ref="dept"
          :show-checkbox="true"
          :default-checked-all="true"
          show-dept-icon
          show-all-checked
          :props="{children: 'subOrgs', label: 'orgName'}"
          :search-placeholder="$t('输入部门名进行搜索')"
          @tree-update-ready="deptReadyTree"
          :data="deptTree">
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item :label="$t('底库')">
        <meg-treeselect
          :show-checkbox="true"
          :default-checked-all="true"
          ref="database"
          :props="{children: 'items', label: 'name'}"
          :search-placeholder="$t('输入底库名进行搜索')"
          @tree-update-ready="databaseReadyTree"
          :data="databaseTree">
        </meg-treeselect>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import moment from 'moment';

const defaultStartTime = moment().subtract(6, 'days').startOf('day').toDate();
const defaultEndTime = moment().endOf('day').toDate();
export default {
  components: {
    CommonFormContainer
  },
  props: {
    databaseTree: {
      type: Array,
      default: () => []
    },
    deptTree: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dateValue: [defaultStartTime, defaultEndTime],
      selectDept: [],
      selectDatabase: [],
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      },
      isResolved: 0 // tree初始化了几次
    };
  },
  created() {
  },
  methods: {
    // 表单重置
    resetClick() {
      this.dateValue = [defaultStartTime, defaultEndTime];
      this.$refs.dept.setCheckedKeys('ALL');
      this.$refs.database.setCheckedKeys('ALL');
    },
    /**
     * 部门加载完成之后
     */
    deptReadyTree() {
      this.isResolved += 1;
      this.initSearch();
    },
    /**
     * 底库加载完成之后
     */
    databaseReadyTree() {
      this.isResolved += 1;
      this.initSearch();
    },
    /**
     * 初始化检索
     */
    initSearch() {
      if (this.isResolved === 4) this.searchClick();
    },
    // 表单检索
    searchClick() {
      const [startTime, endTime] = this.dateValue;
      const albumIds = this.$refs.database.getCheckedKeys((item) => item.id !== 'all');
      const departIds = this.$refs.dept.getCheckedKeys();

      const params = {
        albumIds,
        departIds
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
</style>
