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
        type="daterange"
        format="yyyy-MM-dd"
        class="width-all"
        @change="getDateValue"
        :prefix-icon-visible="false"
        :picker-options="pickerOptions">
      </meg-date-picker>
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
      :label="$t('底库')">
      <meg-treeselect
        ref="albumTree"
        :data="albumRealList"
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
    <meg-form-item :label="$t('级联单位')">
      <meg-treeselect
        ref="cascadeTree"
        :data="cascadeList"
        :standard-tree-data="true"
        :placeholder-text="$t('请选择{entity}', { entity: $t('级联单位') })"
        :all-selected-text="$t('全部')"
        node-key="regId"
        :show-count="false"
        :empty-text="$t('暂无数据')"
        :default-checked-all="true"
        :search-placeholder="$t('输入级联单位名称进行搜索')"
        :props="cascadeTreeProps"
        :show-checkbox="true">
      </meg-treeselect>
    </meg-form-item>
    <collapse-property
      :items="itemsOne"></collapse-property>
    <collapse-property
      :items="itemsTwo"></collapse-property>
  </meg-form>
</template>

<script>
import { CollapseProperty } from '@/common-components/common-property-form';
import moment from 'moment';
import collapseDefaultData from './default-data';
import utils from '../../alarm-history.utils';

export default {
  name: 'Camera',
  components: { CollapseProperty },
  props: {
    // 级联单位列表
    cascadeList: {
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
        cascadeIds: [],
      },
      showSimilarity: true,
      itemsOne: [],
      itemsTwo: [],
      itemsThree: [],
      dateArr: [],
      defaultDate: [],
      alarmLevel: this.$store.getters.dataMapByType('realtime_level'),
      processStatus: this.$store.getters.dataMapByType('realtime_deal'),
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      },
      cascadeTreeProps: {
        children: 'child',
        label: 'nodeName'
      },
      mutSelectAlbumProps: {
        children: 'items',
        label: 'name'
      },
      albumMap: {
        'root': [],
      }
    };
  },
  computed: {
    deployList() {
      return this.optionMap[this.form.alarmType];
    },
    albumRealList() {
      return this.albumMap[this.form.strategyTypeId] || [];
    },
  },
  watch: {
    albumTreeData: {
      handler(newValue) {
        if (newValue.length) {
          this.handleAlbumList(newValue);
        }
      },
      immediate: true,
    },
    'form.alarmType': {
      handler() {
        this.form.strategyTypeId = '';
        this.$refs.taskTree.setCheckedKeys([]);
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
     * @description 比较相似度大小并矫正
     */
    onSimilarityChange() {
      [this.form.minSimilarity, this.form.maxSimilarity] = utils.numSort(this.form.minSimilarity, this.form.maxSimilarity);
    },
    setDefaultDate() {
      const startTime = new Date(new Date(moment().subtract(6, 'days')).setHours(0, 0, 0, 0));
      const endTime = new Date(new Date().setHours(23, 59, 59, 999));
      this.defaultDate = [startTime, endTime];
      this.dateArr = [startTime, endTime];
    },
    /**
     * @description 设置默认条件
     * @param {object}
     */
    setCondition(obj) {
      Object.keys(obj).forEach((val) => {
        let timeArr = [];
        if (obj.timeArr) {
          timeArr = JSON.parse(obj.timeArr);
        }
        const [start, end] = timeArr;
        switch (val) {
          case 'cameraIds':
            this.form.cameraIds = JSON.parse(obj.cameraIds);
            break;
          case 'timeArr':
            if (start) {
              this.defaultDate = [new Date(start), new Date(end)];
              this.dateArr = [new Date(start), new Date(end)];
            }
            break;
          case 'strategyTypeId':
            this.form.strategyTypeId = obj.strategyTypeId;
            if (this.form.strategyTypeId === '1' || this.form.strategyTypeId === '2') {
              this.itemsOne[1].value = 'sfz';
              this.itemsOne[2].value = obj.photoCardNo;
            } else {
              this.itemsThree[0].value = obj.carNo;
            }
            break;
          default:
            break;
        }
      });
    },
    /**
     * @description 当选中的布控任务发生变化时，处理相似度显隐
     */
    onTaskCheckChange() {
      this.showSimilarity = !this.$refs.taskTree.getCheckedNodes((val) => val.alarmType === 1).length && this.form.alarmType !== '1' && [1, 2, 3, 4].includes(Number(this.form.strategyTypeId));
    },
    getDateValue(dateArr) {
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
    init() {
      Object.keys(collapseDefaultData).forEach((val) => {
        this[val] = JSON.parse(JSON.stringify(collapseDefaultData[val]));
      });
      this.handlePreset(this.itemsOne[1], 'album_card');
      this.handlePreset(this.itemsTwo[0], 'common_gender');
      this.handlePreset(this.itemsTwo[1], 'realtime_age');
    },
    /**
     * @description 预置处理
     * @param {object} target
     * @param {string} systemName
     */
    handlePreset(target, systemName) {
      const ele = {
        name: this.$t('全部'),
        code: '',
      };
      const arr = [ele, ...this.$store.getters.dataMapByType(systemName).map((item) => ({
        name: item.value,
        code: item.code,
      }))];
      target.data = arr;
      const map = {};
      arr.forEach((val) => {
        map[val.code] = val;
      });
      target.dataMap = map;
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
      this.$refs.albumTree.setCheckedKeys([]);
      this.$refs.cascadeTree.setCheckedKeys('ALL');
      this.form = {
        level: '',
        processStatus: '',
        cascadeIds: [],
      };
      this.dateArr = [];
      this.setDefaultDate();
      Object.keys(collapseDefaultData).forEach((val) => {
        this[val] = JSON.parse(JSON.stringify(collapseDefaultData[val]));
      });
    },
    /**
     * @description 获取检索条件
     */
    getCondition() {
      const params = {
        startTime: this.dateArr[0] ? this.dateArr[0].getTime() : '',
        endTime: this.dateArr[1] ? this.dateArr[1].getTime() : '',
        ...this.form,
        albumIds: this.$refs.albumTree ? this.$refs.albumTree.getCheckedKeys() : [],
        strategyCategory: 1,
        cascadeIds: this.$refs.cascadeTree.getCheckedNodes((val) => val.nodeLevel === 2).map((val) => val.regId)
      };
      if ([1, 2].includes(Number(this.form.strategyTypeId))) {
        this.itemsOne.forEach((val) => {
          params[val.attrKey] = val.value;
        });
        this.itemsTwo.forEach((val) => {
          params[val.attrKey] = val.value;
        });
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
    .similarity{
      width: 100px;
    }
    .middle {
      width: 60px;
      display: inline-block;
      text-align: center;
    }
  }
}
</style>
