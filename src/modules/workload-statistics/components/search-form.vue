<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '20px 0 0' }"
    @reset="resetClick"
    @search="searchClick">
    <template slot="header">
      工作量统计
    </template>
    <meg-form
      ref="searchForm"
      class="search-form"
      label-position="top">
      <meg-form-item label="起止时间">
        <meg-date-picker
          v-model="dateValue"
          :prefix-icon-visible="false"
          :clearable="false"
          :picker-options="pickerOptions"
          format="yyyy-MM-dd HH:mm"
          type="datetimerange"
          :range-separator="$t('至')"
          :start-placeholder="$t('开始日期')"
          :end-placeholder="$t('结束日期')">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item>
        <meg-radio-group v-model="type">
          <meg-radio label="user">
            人员
          </meg-radio>
          <meg-radio label="dept">
            部门
          </meg-radio>
        </meg-radio-group>
      </meg-form-item>
      <meg-form-item
        v-show="type==='dept'"
        :label="$t('选择部门')">
        <meg-treeselect
          ref="dept"
          :show-checkbox="true"
          :default-checked-all="true"
          show-dept-icon
          show-all-checked
          :props="{children: 'subOrgs', label: 'orgName'}"
          :search-placeholder="$t('输入部门名进行搜索')"
          :data="deptTree">
        </meg-treeselect>
      </meg-form-item>
      <meg-form-item
        v-show="type==='user'"
        :label="$t('选择人员')">
        <meg-treeselect
          ref="user"
          :show-checkbox="true"
          :default-checked-all="true"
          show-dept-icon
          :props="{children: 'subOrgs', label: 'name'}"
          :pretreatment-node-data-fn="treeFilters"
          :search-placeholder="$t('输入人员名进行搜索')"
          @tree-update-ready="onReadyTree"
          :data="personTree">
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
    CommonFormContainer,
  },
  props: {
    personTree: {
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
      cameraIds: [],
      isReady: false,
      type: 'user',
      pickerOptions: { shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth'] }
    };
  },
  created() {
  },
  methods: {

    treeFilters(item) {
      if (item.flag === 'dept') {
        item.noStatistics = true;
      } else {
        item.noStatistics = false;
      }
    },
    onReadyTree() {
      if (this.isReady) this.searchClick();
      this.isReady = true;
    },
    // 表单重置
    resetClick() {
      this.dateValue = [defaultStartTime, defaultEndTime];
      this.type = 'user';
      this.$refs.user.setCheckedKeys('ALL');
      this.$refs.dept.setCheckedKeys('ALL');
    },
    // 表单检索
    searchClick() {
      const [startTime, endTime] = this.dateValue;
      const params = {

      };
      if (this.type === 'user') params.usersIds = this.$refs.user.getCheckedKeys((item) => item.flag !== 'dept');
      if (this.type === 'dept') params.departIds = this.$refs.dept.getCheckedKeys();
      if (startTime) params.startTime = startTime.getTime();
      if (endTime) params.endTime = endTime.getTime();
      this.$emit('search', params, this.type);
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
