<template>
  <common-form-container
    @reset="reset"
    @search="search">
    <template v-slot:header>
      <section class="header-box">
        <span v-if="!history">{{ $t('级联布控任务') }}</span>
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
      <meg-form-item :label="$t('起止时间')">
        <meg-date-picker
          value-format="yyyy-MM-dd"
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
        :label="$t('任务名称')">
        <meg-input
          v-model.trim="formData.strategyName"
          :placeholder="$t('请输入{entity}', { entity: $t('任务名称') })"></meg-input>
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
    </meg-form>
  </common-form-container>
</template>

<script>
import CommonFormContainer from '@/common-components/common-form-container';
import { switchToModule } from '@/utils/utils';

export default {
  name: 'SearchForm',
  components: {
    CommonFormContainer,
  },
  props: {
    history: {
      type: Boolean,
      default: false,
    },
    // 级联单位列表
    cascadeList: {
      type: Array,
      default: () => []
    },
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
        albumIds: [],
        cascadeIds: [],
      },
      cascadeTreeProps: {
        children: 'child',
        label: 'nodeName'
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
    getDateValue(dateArr) {
      console.log(220);
      console.log(dateArr);
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
        beginTime: this.dateArr[0] ? new Date(this.dateArr[0]).getTime() : '',
        endTime: this.dateArr[1] ? new Date(this.dateArr[1]).getTime() : '',
        history: this.history,
        cascadeIds: this.$refs.cascadeTree.getCheckedKeys(),
        cascadeFlag: true,
      };
      if (this.history) {
        delete obj.status;
      }
      this.$emit('search', obj);
    },
    goPage() {
      switchToModule({
        isBlank: false,
        module: 'cascade-surveillance-task',
      });
    },
    reset() {
      this.formData = {
        strategyName: '',
        beginTime: '',
        endTime: '',
        cascadeIds: [],
        albumIds: [],
      };
      this.dateArr = [];
      this.defaultDate = [];
      this.category = [];
      this.$refs.albumTree.setCheckedKeys([]);
      this.$refs.cascadeTree.setCheckedKeys('ALL');
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
