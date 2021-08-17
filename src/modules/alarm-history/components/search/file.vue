<template>
  <meg-form
    label-position="top"
    class="file-form"
    :model="form">
    <meg-form-item :label="$t('起止时间')">
      <meg-date-picker
        v-model="defaultDate"
        :start-placeholder="$t('开始日期')"
        :end-placeholder="$t('结束日期')"
        :range-separator="$t('至')"
        type="datetimerange"
        ref="dataPicker"
        format="yyyy-MM-dd HH:mm"
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
      :label="$t('任务名称')">
      <common-file-selector
        ref="fileSelector"
        :file-list-getter="fileListGetter"
        @tree-update-ready="onFileReady"
        :default-checked-all="false"
        :task-list-getter="taskListGetter"></common-file-selector>
    </meg-form-item>
    <meg-form-item
      :label="$t('自动比对类型')">
      <meg-radio-group
        @change="onTypeChange"
        v-model="form.doPackage">
        <meg-radio :label="''">
          {{ $t('全部') }}
        </meg-radio>
        <meg-radio :label="false">
          {{ $t('底库') }}
        </meg-radio>
        <meg-radio :label="true">
          {{ $t('文件') }}
        </meg-radio>
      </meg-radio-group>
    </meg-form-item>

    <meg-form-item
      v-if="form.doPackage === false"
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
        @check-change="onCheckChange"
        :show-checkbox="true">
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
import CommonFileSelector from '@/common-components/common-file-selector';
import { CollapseProperty } from '@/common-components/common-property-form';
import AlarmHistoryMixin from '../../alarm-history.mixin.js';
import Similarity from './similarity';
import PapersNumbers from './papers-numbers';

export default {
  name: 'File',
  components: {
    CommonFileSelector, CollapseProperty, PapersNumbers, Similarity
  },
  mixins: [
    AlarmHistoryMixin
  ],
  props: {
    albumTreeData: {
      type: Array,
      default: () => []
    },
    taskListGetter: {
      type: Function,
      default: undefined
    },
    fileListGetter: {
      type: Function,
      default: undefined
    },
  },
  data() {
    return {
      form: {
        level: '',
        processStatus: '',
        maxSimilarity: 100,
        minSimilarity: 0,
        taskInfos: [],
        doPackage: '',
      },
      isShowSimilarity: false,
      dateArr: [],
      defaultDate: [],
      alarmLevel: this.$store.getters.dataMapByType('realtime_level'),
      processStatus: this.$store.getters.dataMapByType('realtime_deal'),

      itemsOne: [],
      itemsTwo: [],
      itemsThree: [],
      mutSelectAlbumProps: {
        children: 'items',
        label: 'name'
      },
      fileReadyStatus: false, // 文件组件是否准备完毕
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
    onFileReady() {
      if (this.form.taskInfos.length) {
        this.$refs.fileSelector.setCheckedKeys(this.form.taskInfos);
      }
      this.fileReadyStatus = true;
    },
    getDateValue(dateArr) {
      if (dateArr === null) {
        this.dateArr = [];
      } else {
        this.dateArr = dateArr;
      }
    },
    onTypeChange() {
      this.isShowSimilarity = false;
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
     * @description 相机选择发生变化时
     * @param {array} ids 选择的id
     */
    onCameraChange(ids) {
      this.formData.cameraIds = ids;
    },
    /**
     * @description 重置
     */
    reset() {
      if (this.$refs.albumTree) { this.$refs.albumTree.setCheckedKeys([]); }
      this.form = {
        level: '',
        processStatus: '',
        maxSimilarity: 100,
        minSimilarity: 0,
        cameraIds: [],
        doPackage: '',
      };
      this.isShowSimilarity = false;
      this.dateArr = [];
      this.setDefaultDate();
      this.$refs.fileSelector.setCheckedKeys([]);
      this.$refs.dataPicker.resetPickerOptionStatus();

      this.init();
    },
    /**
     * @description 获取检索条件
     */
    getCondition() {
      const params = {
        startTime: this.dateArr[0] ? this.dateArr[0].getTime() : '',
        endTime: this.dateArr[1] ? this.dateArr[1].getTime() : '',
        ...this.form,
        taskInfos: this.fileReadyStatus ? this.$refs.fileSelector.getSelectedKeys() : this.form.taskInfos,
        albumIds: this.$refs.albumTree ? this.$refs.albumTree.getCheckedKeys((val) => val.flag !== 'category') : [],
        strategyCategory: 3,
        maxSimilarity: this.isShowSimilarity ? this.form.maxSimilarity : '',
        minSimilarity: this.isShowSimilarity ? this.form.minSimilarity : '',
        noDatabaseTab: this.form.doPackage !== false,
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
.file-form {
  .meg-select {
    width: 100%;
  }
}
</style>
