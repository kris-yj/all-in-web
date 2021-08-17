<template>
  <meg-form
    label-position="top"
    class="video-form"
    :model="form">
    <meg-form-item :label="$t('起止时间')">
      <meg-date-picker
        v-model="defaultDate"
        :start-placeholder="$t('开始日期')"
        :end-placeholder="$t('结束日期')"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        ref="dataPicker"
        :range-separator="$t('至')"
        class="width-all"
        @change="getDateValue"
        :prefix-icon-visible="false"
        :picker-options="pickerOptions">
      </meg-date-picker>
    </meg-form-item>
    <meg-form-item
      :label="$t('报警级别')">
      <meg-select
        v-model="form.level">
        <meg-option
          value=""
          :label="$t('全部')"></meg-option>
        <meg-option
          v-for="item in alarmLevel"
          :key="item.code"
          :value="item.code"
          :label="item.value"></meg-option>
      </meg-select>
    </meg-form-item>
    <meg-form-item
      :label="$t('处理状态')">
      <meg-select
        v-model="form.processStatus">
        <meg-option
          value=""
          :label="$t('全部')"></meg-option>
        <meg-option
          v-for="item in processStatus"
          :key="item.code"
          :value="item.code"
          :label="item.value"></meg-option>
      </meg-select>
    </meg-form-item>
    <meg-form-item
      :label="$t('相机')">
      <common-camera-selector
        ref="cameraSelector"
        :default-ids="form.cameraIds"
        @change="onCameraChange"></common-camera-selector>
    </meg-form-item>

    <meg-form-item
      :label="$t('底库')">
      <meg-treeselect
        ref="albumTree"
        :data="albumTreeData"
        :standard-tree-data="true"
        :brief-selected-info="true"
        :show-count="false"
        :all-selected-text="$t('全部底库')"
        :placeholder-text="$t('请选择底库')"
        :search-placeholder="$t('输入底库名进行搜索')"
        :props="mutSelectAlbumProps"
        :show-checkbox="true"
        @check-change="onCheckChange">
      </meg-treeselect>
    </meg-form-item>
    <similarity
      v-if="isShowSimilarity"
      :form="form"></similarity>
    <papers-numbers
      :items="itemsOne">
    </papers-numbers>
    <collapse-property
      :items="itemsTwo"></collapse-property>
    <collapse-property
      :items="itemsThree"></collapse-property>
  </meg-form>
</template>

<script>
import CommonCameraSelector from '@/common-components/common-camera-selector';
import { CollapseProperty } from '@/common-components/common-property-form';
import AlarmHistoryMixin from '../../alarm-history.mixin.js';
import Similarity from './similarity';

import PapersNumbers from './papers-numbers';

export default {
  name: 'Video',
  components: {
    CommonCameraSelector, CollapseProperty, PapersNumbers, Similarity
  },
  mixins: [
    AlarmHistoryMixin
  ],
  props: {
    albumTreeData: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      form: {
        level: '',
        processStatus: '',
        maxSimilarity: 100,
        minSimilarity: '',
        cameraIds: [],
      },
      dateArr: [],
      defaultDate: [],
      alarmLevel: this.$store.getters.dataMapByType('realtime_level'),
      processStatus: this.$store.getters.dataMapByType('realtime_deal'),
      isShowSimilarity: false,
      mutSelectAlbumProps: {
        children: 'items',
        label: 'name'
      },
      itemsOne: [],
      itemsTwo: [],
      itemsThree: [],
    };
  },
  computed: {},
  watch: {},
  created() {
    this.setDefaultDate();
    this.init();
  },
  mounted() {},
  methods: {
    getDateValue(dateArr) {
      if (dateArr === null) {
        this.dateArr = [];
      } else {
        this.dateArr = dateArr;
      }
    },
    /**
     * @description 相机选择发生变化时
     * @param {array} ids 选择的id
     */
    onCameraChange(ids) {
      this.form.cameraIds = ids;
    },
    /**
     * @description 重置
     */
    reset() {
      this.$refs.cameraSelector.reset();
      this.$refs.albumTree.setCheckedKeys([]);
      this.form = {
        level: '',
        processStatus: '',
        maxSimilarity: 100,
        minSimilarity: 0,
        cameraIds: [],
      };
      this.isShowSimilarity = false;
      this.dateArr = [];
      this.setDefaultDate();
      this.$refs.dataPicker.resetPickerOptionStatus();

      this.init();
    },
    /**
     * @description 选中底库变化时判断是否有车牌库，如果有，隐藏掉相似度
     */
    onCheckChange() {
      const checkNodes = this.$refs.albumTree.getCheckedNodes();
      if (checkNodes.length) {
        this.isShowSimilarity = !checkNodes.filter((val) => val.deployObject === '4').length;
      } else {
        this.isShowSimilarity = false;
      }
    },
    /**
     * @description 获取检索条件
     */
    getCondition() {
      const params = {
        startTime: this.dateArr[0] ? this.dateArr[0].getTime() : '',
        endTime: this.dateArr[1] ? this.dateArr[1].getTime() : '',
        ...this.form,
        albumIds: this.$refs.albumTree.getCheckedKeys((val) => val.flag !== 'category'),
        strategyCategory: 2,
        maxSimilarity: this.isShowSimilarity ? this.form.maxSimilarity : '',
        minSimilarity: this.isShowSimilarity ? this.form.minSimilarity : '',
      };
      this.itemsOne.forEach((val) => {
        params[val.attrKey] = val.value;
      });
      this.itemsTwo.forEach((val) => {
        params[val.attrKey] = val.value;
      });
      this.itemsThree.forEach((val) => {
        params[val.attrKey] = val.value;
      });
      return params;
    },
  },
};
</script>
<style lang="scss" scoped>
.video-form {
  .meg-select {
    width: 100%;
  }
}
</style>
