<template>
  <!-- 左侧检索条件 -->
  <common-form-container
    :content-style="{ 'padding': '20px 0 0' }"
    @reset="resetClick"
    @search="searchClick">
    <template slot="header">
      抓拍统计
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
          :clearable="false"
          :range-separator="$t('至')"
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
          @update-ready="searchClick"
          @change="onCameraChange"></camera-select>
      </meg-form-item>
      <!-- <meg-form-item :label="$t('底库')">
        <meg-treeselect
          ref="libraryTreeSelector"
          :show-checkbox="true"
          :props="{children: 'items', label: 'name'}"
          :search-placeholder="$t('输入底库名进行搜索')"
          :data="albumList">
        </meg-treeselect>
      </meg-form-item> -->
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
  data() {
    return {
      dateValue: [defaultStartTime, defaultEndTime],
      cameraIds: [],
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      },
    };
  },
  created() {
  },
  methods: {
    onCameraChange(ids) {
      this.cameraIds = ids;
    },
    // 表单重置
    resetClick() {
      this.dateValue = [defaultStartTime, defaultEndTime];
      this.$refs.cameraSelector.setCheckedKeys('ALL');
    },
    // 表单检索
    searchClick() {
      console.log(this.dateValue);
      const [startTime, endTime] = this.dateValue;
      const params = {
        cameraIds: this.cameraIds
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
