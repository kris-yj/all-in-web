<template>
  <meg-form
    label-position="top"
    class="camera-form"
    :model="form">
    <meg-form-item :label="$t('起止时间')">
      <meg-date-picker
        v-model="defaultDate"
        :start-placeholder="$t('开始日期')"
        :end-placeholder="$t('结束日期')"
        type="datetimerange"
        ref="dataPicker"
        format="yyyy-MM-dd HH:mm"
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
        is-deploy
        :camera-data-func="treeUrl"
        @change="onCameraChange"></common-camera-selector>
    </meg-form-item>
    <meg-form-item
      :label="$t('布控类别')">
      <meg-select
        v-model="form.alarmType">
        <meg-option
          value="root"
          :label="$t('全部')"></meg-option>
        <meg-option
          v-for="item in optionsMock"
          :key="item.code"
          :value="item.code"
          :label="item.value"></meg-option>
      </meg-select>
    </meg-form-item>
    <meg-form-item
      :label="$t('布控类型')">
      <meg-select
        @change="onTypeChange"
        v-model="form.strategyTypeId">
        <meg-option
          value="root"
          :label="$t('全部')"></meg-option>
        <meg-option
          v-for="item in deployList"
          :key="item.id"
          :value="item.id"
          :label="item.ruleName"></meg-option>
      </meg-select>
    </meg-form-item>
    <meg-form-item
      :label="$t('布控任务')">
      <meg-treeselect
        ref="taskTree"
        :data="showTaskList"
        :standard-tree-data="true"
        :brief-selected-info="true"
        :default-checked-all="true"
        :show-count="false"
        :all-selected-text="$t('全部任务')"
        :placeholder-text="$t('请选择任务')"
        :search-placeholder="$t('输入任务名进行搜索')"
        :props="taskProps"
        :show-checkbox="true"
        @tree-update-ready="onTaskCheckChange"
        @check-change="onTaskCheckChange">
      </meg-treeselect>
    </meg-form-item>
    <meg-form-item
      v-if="isShowAlbumTree"
      :label="$t('底库')">
      <meg-treeselect
        ref="albumTree"
        :data="albumRealData"
        :standard-tree-data="true"
        :brief-selected-info="true"
        :show-count="false"
        :all-selected-text="$t('全部底库')"
        :placeholder-text="$t('请选择底库')"
        :search-placeholder="$t('输入底库名进行搜索')"
        :props="mutSelectAlbumProps"
        :show-checkbox="true">
      </meg-treeselect>
    </meg-form-item>
    <similarity
      :form="form"
      v-if="showSimilarity"></similarity>
    <template v-if="[1,2].includes(Number(form.strategyTypeId))">
      <papers-numbers
        :items="itemsOne">
      </papers-numbers>
      <collapse-property
        :items="itemsTwo"></collapse-property>
    </template>
    <collapse-property
      v-if="[3,4,5,6].includes(Number(form.strategyTypeId))"
      :items="itemsThree"></collapse-property>
  </meg-form>
</template>

<script>
import CommonCameraSelector from '@/common-components/common-camera-selector';
import { CollapseProperty } from '@/common-components/common-property-form';
import PapersNumbers from './papers-numbers';
import Similarity from './similarity';
import AlarmHistorySvr from '../../alarm-history.service';
import AlarmHistoryMixin from '../../alarm-history.mixin.js';

export default {
  name: 'Camera',
  components: {
    CommonCameraSelector, CollapseProperty, PapersNumbers, Similarity
  },
  mixins: [
    AlarmHistoryMixin
  ],
  props: {
    deployTypeList: {
      type: Array,
      default: () => []
    },
    taskList: {
      type: Array,
      default: () => []
    },
    albumTreeData: {
      type: Array,
      default: () => []
    },
    defaultData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        level: '',
        processStatus: '',
        alarmType: 'root',
        strategyTypeId: 'root',
        maxSimilarity: 100,
        minSimilarity: 60,
        cameraIds: [],
      },
      treeUrl: () => AlarmHistorySvr.cameraTree,
      showSimilarity: false,
      itemsOne: [],
      itemsTwo: [],
      itemsThree: [],
      dateArr: [],
      defaultDate: [],
      albumRealData: [],
      alarmLevel: this.$store.getters.dataMapByType('realtime_level'),
      processStatus: this.$store.getters.dataMapByType('realtime_deal'),
      taskProps: {
        children: 'items',
        label: 'strategyName'
      },
      mutSelectAlbumProps: {
        children: 'items',
        label: 'name'
      },
      optionsMock: [{
        code: '1',
        value: '检测布控'
      }, {
        code: '0',
        value: '识别布控'
      }],
      optionMap: {
        'root': [],
      },
      albumMap: {
        'root': [],
      },
    };
  },
  computed: {
    deployList() {
      return this.optionMap[this.form.alarmType];
    },
    albumRealList() {
      return this.albumMap[this.form.strategyTypeId] || [];
    },
    // 要展示得布控任务列表
    showTaskList() {
      return [{
        id: 'root',
        strategyName: this.$t('全部'),
        items: this.taskList.filter((val) => (this.form.alarmType === 'root' ? true : (val.alarmType === Number(this.form.alarmType))) && (this.form.strategyTypeId === 'root' ? true : (val.strategyTypeId === this.form.strategyTypeId))),
      }];
    },
    isShowAlbumTree() {
      return this.form.alarmType !== '1' && ([1, 2, 3, 4, 5, 6].includes(Number(this.form.strategyTypeId)) || this.form.strategyTypeId === 'root' || this.form.strategyTypeId === '');
    }
  },
  watch: {
    deployTypeList: {
      handler(newValue) {
        if (newValue.length) {
          this.handleDeployTypeList(newValue);
        }
      },
      immediate: true,
    },
    albumTreeData: {
      handler(newValue) {
        if (newValue.length) {
          this.handleAlbumList(newValue);
          this.onTypeChange();
        }
      },
      immediate: true,
    },
    'form.alarmType': {
      handler() {
        this.form.strategyTypeId = '';
        this.$refs.taskTree.setCheckedKeys([]);
        this.form.strategyTypeId = 'root';
      },
    },
    'form.strategyTypeId': {
      handler() {
        this.$refs.taskTree.setCheckedKeys([]);
      },
    },
  },
  created() {
    this.setDefaultDate();
    this.init();
  },
  mounted() {

  },
  methods: {
    /**
     * @description 当选中的布控任务发生变化时，处理相似度显隐
     */
    onTaskCheckChange() {
      this.showSimilarity = !this.$refs.taskTree.getCheckedNodes((val) => val.alarmType === 1).length && this.form.alarmType !== '1' && [1, 2, 3, 4].includes(Number(this.form.strategyTypeId));
    },
    getDateValue(dateArr) {
      console.log(dateArr);
      if (dateArr === null) {
        this.dateArr = [];
      } else {
        this.dateArr = dateArr;
      }
    },
    /**
     * @description 处理底库列表，分类
     * @param {array} list
     */
    handleAlbumList(list) {
      const map = { ...this.albumMap };
      list.forEach((val) => {
        if (map[val.albumType]) {
          map[val.albumType].push(val);
        } else {
          map[val.albumType] = [val];
        }
      });
      map.root = list;
      this.albumMap = map;
    },
    /**
     * @description 相机选择发生变化时
     * @param {array} ids 选择的id
     */
    onCameraChange(ids) {
      this.form.cameraIds = ids;
    },
    /**
     * @description 处理布控类型
     * @param {array} list
     * @returns
     */
    handleDeployTypeList(list) {
      this.optionMap.root = list;
      this.optionsMock.forEach((val) => {
        this.optionMap[val.code] = list.filter((value) => value.ruleType === Number(val.code));
      });
    },
    /**
     * @description 重置
     */
    reset() {
      this.form = {
        level: '',
        processStatus: '',
        alarmType: 'root',
        strategyTypeId: 'root',
        maxSimilarity: 100,
        minSimilarity: 60,
        cameraIds: [],
      };
      this.dateArr = [];
      this.$nextTick(() => {
        this.$refs.cameraSelector.reset();
        this.$refs.taskTree.setCheckedKeys('ALL');
        this.$refs.albumTree.setCheckedKeys([]);
      });
      this.setDefaultDate();
      this.init();
      this.$refs.dataPicker.resetPickerOptionStatus();
    },
    /**
     * @description 布控类型变化时触发
     */
    onTypeChange() {
      this.albumRealData = this.handleAlbumListFromAlarm(this.albumRealList);
    },
    /**
     * @description 处理来自报警的底库列表
     * @param {array} items
     * @returns {array}
     */
    handleAlbumListFromAlarm(items) {
      const obj = {
        id: 'root',
        name: this.$t('全部'),
        flag: 'category',
        items: [
          {
            id: 'person',
            flag: 'category',
            items: [],
            name: this.$t('人像库')
          },
          {
            id: 'body',
            flag: 'category',
            items: [],
            name: this.$t('人体库')
          },
          {
            id: 'car',
            flag: 'category',
            items: [],
            name: this.$t('车辆库')
          },
          {
            id: 'plate',
            flag: 'category',
            items: [],
            name: this.$t('车牌库')
          },
        ]
      };
      items.forEach((val) => {
        switch (val.albumType) {
          case 1:
            obj.items[0].items.push(val);
            break;
          case 2:
            obj.items[1].items.push(val);
            break;
          case 3:
          case 4:
            obj.items[2].items.push(val);
            break;
          case 5:
          case 6:
            obj.items[3].items.push(val);
            break;
          default:
            break;
        }
      });
      obj.items = obj.items.filter((val) => val.items.length);
      return [obj];
    },
    /**
     * @description 获取检索条件
     */
    getCondition() {
      const params = {
        startTime: this.dateArr[0] ? this.dateArr[0].getTime() : '',
        endTime: this.dateArr[1] ? this.dateArr[1].getTime() : '',
        ...this.form,
        alarmType: this.form.alarmType === 'root' ? '' : this.form.alarmType,
        alarmStrategyIds: this.$refs.taskTree.getCheckedKeys((val) => val.id !== 'root'),
        strategyTypeIds: this.form.strategyTypeId === 'root' || !this.form.strategyTypeId ? [] : [this.form.strategyTypeId],
        albumIds: this.$refs.albumTree ? this.$refs.albumTree.getCheckedKeys((val) => val.flag !== 'category') : [],
        strategyCategory: 1,
        maxSimilarity: this.showSimilarity ? this.form.maxSimilarity : '',
        minSimilarity: this.showSimilarity ? this.form.minSimilarity : '',
      };
      if ([1, 2].includes(Number(this.form.strategyTypeId))) {
        this.itemsOne.forEach((val) => {
          params[val.attrKey] = val.value;
        });
        this.itemsTwo.forEach((val) => {
          params[val.attrKey] = val.value;
        });
      }
      if ([3, 4, 5, 6].includes(Number(this.form.strategyTypeId))) {
        this.itemsThree.forEach((val) => {
          params[val.attrKey] = val.value;
        });
      }
      if (this.showTaskList[0].items.some((val) => val.alarmType === 1)) {
        params.noDatabaseTab = true;
      }
      return params;
    },
  },
};
</script>
<style lang="scss" scoped>
.camera-form {
  .meg-select {
    width: 100%;
  }
  .similarity-box {
    .similarity {
      width: 95px;
    }
    .middle {
      width: 60px;
      display: inline-block;
      text-align: center;
    }
  }
}
</style>
