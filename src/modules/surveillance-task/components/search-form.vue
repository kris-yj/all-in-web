<template>
  <common-form-container
    @reset="reset"
    @search="search">
    <template v-slot:header>
      <section class="header-box">
        <span v-if="!history">{{ $t('布控任务') }}</span>
        <meg-return-button
          v-else
          :title="$t('历史任务')"
          :disable="true"
          @click="goPage"></meg-return-button>
      </section>
    </template>
    <meg-form
      class="surveillance-form"
      label-position="top">
      <meg-form-item
        :label="$t('任务名称')">
        <meg-input
          v-model.trim="formData.strategyName"
          :placeholder="$t('请输入{entity}', { entity: $t('任务名称') })"></meg-input>
      </meg-form-item>
      <meg-form-item :label="$t('起止时间')">
        <meg-date-picker
          value-format="timestamp"
          v-model="defaultDate"
          :start-placeholder="$t('开始日期')"
          :end-placeholder="$t('结束日期')"
          type="daterange"
          format="yyyy-MM-dd"
          :range-separator="$t('至')"
          :default-time="['00:00:00','23:59:59']"
          class="width-all"
          @change="getDateValue"
          :prefix-icon-visible="false"
          :picker-options="pickerOptions">
        </meg-date-picker>
      </meg-form-item>
      <meg-form-item
        :label="$t('布控类别')">
        <meg-select
          @change="onAlarmTypeChange"
          v-model="formData.alarmType">
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
        <meg-select v-model="formData.strategyTypeId">
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
        v-if="!history"
        :label="$t('布控状态')">
        <meg-select v-model="formData.status">
          <meg-option
            value="root"
            :label="$t('全部')"></meg-option>
          <meg-option
            v-for="item in deployStatusOption"
            :key="item.code"
            :value="item.code"
            :label="item.value"></meg-option>
        </meg-select>
      </meg-form-item>
      <meg-form-item
        :label="$t('相机')">
        <common-camera-selector
          ref="cameraSelector"
          is-deploy
          @change="onCameraChange"></common-camera-selector>
      </meg-form-item>
      <meg-form-item
        v-if="isShowAlbumTree"
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
          :show-checkbox="true">
        </meg-treeselect>
      </meg-form-item>
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import CommonCameraSelector from '@/common-components/common-camera-selector';
import { switchToModule } from '@/utils/utils';

export default {
  name: 'SearchForm',
  components: {
    CommonFormContainer,
    CommonCameraSelector
  },
  props: {
    deployTypeList: {
      type: Array,
      default: () => []
    },
    albumTreeData: {
      type: Array,
      default: () => []
    },
    history: {
      type: Boolean,
      default: false,
    },
    deployStatusOption: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultDate: [],
      optionsMock: this.$store.getters.dataMapByType('galaxy_strategy_alarm_type'),
      mutSelectAlbumProps: {
        children: 'items',
        label: 'name'
      },
      formData: {
        strategyName: '',
        beginTime: '',
        endTime: '',
        cameraIds: [],
        albumIds: [],
        strategyTypeId: 'root',
        alarmType: 'root',
        status: 'root'
      },
      dateArr: [],
      pickerOptions: {
        shortcuts: ['today', 'pastThreeDays', 'pastWeek', 'pastMonth']
      },
      optionMap: {
        'root': [],
      }
    };
  },
  computed: {
    deployList() {
      return this.optionMap[this.formData.alarmType];
    },
    isShowAlbumTree() {
      return this.formData.alarmType !== '1' && ([1, 2, 3, 4, 5, 6].includes(Number(this.formData.strategyTypeId)) || this.formData.strategyTypeId === 'root' || this.formData.strategyTypeId === '');
    }
  },
  watch: {
    deployTypeList: {
      handler(newValue) {
        if (newValue.length) {
          this.handleDeployTypeList(newValue);
        }
      },
    }
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * @description 布控类别变化时清空布控类型
     * @param {any}
     * @returns
     */
    onAlarmTypeChange() {
      this.formData.strategyTypeId = '';
    },
    getDateValue(dateArr) {
      if (dateArr === null) {
        this.dateArr = [];
      } else {
        this.dateArr = dateArr;
      }
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
    search() {
      const obj = {
        ...this.formData,
        albumIds: this.$refs.albumTree ? this.$refs.albumTree.getCheckedKeys() : [],
        beginTime: this.dateArr[0] ? new Date(this.dateArr[0]).getTime() : '',
        endTime: this.dateArr[1] ? new Date(this.dateArr[1]).getTime() : '',
        history: this.history,
        alarmType: this.formData.alarmType === 'root' ? '' : this.formData.alarmType,
        status: this.formData.status === 'root' ? '' : this.formData.status,
        strategyTypeId: this.formData.strategyTypeId === 'root' ? '' : this.formData.strategyTypeId,
      };
      if (this.history) {
        delete obj.status;
      }
      console.log(obj);
      this.$emit('search', obj);
    },
    /**
     * @description 相机选择发生变化时
     * @param {array} ids 选择的id
     */
    onCameraChange(ids) {
      this.formData.cameraIds = ids;
    },
    goPage() {
      switchToModule({
        isBlank: false,
        module: 'surveillance-task',
      });
    },
    reset() {
      this.formData = {
        strategyName: '',
        beginTime: '',
        endTime: '',
        cameraIds: [],
        albumIds: [],
        strategyTypeId: 'root',
        alarmType: 'root',
        status: 'root',
      };
      this.$refs.cameraSelector.reset();
      this.dateArr = [];
      this.defaultDate = [];
      this.category = [];
      this.$refs.albumTree.setCheckedKeys([]);
    }
  },
};
</script>
<style lang="scss" scoped>
.header-box {
  display: flex;
  align-items: center;
  height: 56px;
  background: #F1F1F1;
  box-sizing: border-box;
  font-weight:bold;
  .meg-return-button {
    min-height: 1px;
  }
}
.surveillance-form {
  .meg-select {
    width: 100%;
  }
}
</style>
