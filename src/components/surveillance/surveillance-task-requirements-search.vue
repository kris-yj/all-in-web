<template>
  <div class="search-container">
    <meg-form-container
      class="search-form-container"
      @search="searchFn"
      @reset="resetFn">
      <section
        slot="header"
        class="search-title-container"
        :class="{'history':type!==1}">
        <span
          class="task-title"
          v-if="type===1">{{ isCascadeMode ? $t('级联布控任务') : $t('布控任务') }}</span>
        <meg-return-button
          v-else
          :title="$t('历史任务')"
          :disable="true"
          @click="goPage"></meg-return-button>
      </section>
      <div
        class="search-content-container"
        slot="otherFormElement">
        <div class="surveillanceTask-left-content-container">
          <meg-form
            ref="form"
            label-position="top"
            label-width="80px">
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
            <meg-form-item :label="$t('任务名称')">
              <meg-input
                v-model="info.taskName"
                :placeholder="$t('请输入{entity}', { entity: $t('任务名称') })"></meg-input>
            </meg-form-item>
            <meg-form-item
              v-if="isCascadeMode"
              :label="$t('关联单位')">
              <meg-treeselect
                ref="cascadeTree"
                :data="cascadeTreeData"
                :standard-tree-data="true"
                :placeholder-text="$t('请输入{entity}', { entity: $t('级联单位') })"
                all-selected-text="全部"
                node-key="regId"
                :default-checked-all="true"
                :selected-count-text="$t('已选{count}个')"
                :empty-text="$t('暂无数据')"
                :search-placeholder="$t('输入级联单位名称进行搜索')"
                :props="cascadeTreeProps"
                :show-checkbox="true"
                @check-change="cascadeCheckChange"
                @tree-update-ready="cascadeReadyUpdate">
              </meg-treeselect>
            </meg-form-item>
          </meg-form>
        </div>
      </div>
    </meg-form-container>
  </div>
</template>

<script>
// import { switchToModule } from '@/utils/utils';

export default {
  name: 'RequirementsSearch',
  props: {
    type: {
      type: Number,
      default: 1,
    },
    // 是否是级联模式
    isCascadeMode: {
      type: Boolean,
      default: false
    },
    cascadeTreeData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      defaultDate: [],
      pickerOptions: {
        shortcuts: [{
          text: '近一天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: '近三天',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: '近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        },
        {
          text: '近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      info: {
        dateArr: [],
        taskName: '',
        cascadeNodeRegIds: [],
      },
      cascadeTreeProps: {
        children: 'child',
        label: 'nodeName'
      },
    };
  },
  methods: {
    goPage() {
      // switchToModule({
      //   isBlank: false,
      //   module: this.isCascadeMode ? 'cascadeSurveillance-task' : 'surveillance-task',
      // });
      this.$router.push({ name: this.isCascadeMode ? 'cascade-surveillance-task' : 'surveillance-task' });
    },
    getDateValue(dateArr) {
      if (dateArr === null) {
        // 如果选择清空，则设置为默认时间段
        // 因为数组是因为,必须得拷贝
        this.info.dateArr = [];
      } else {
        this.info.dateArr = dateArr;
      }
    },
    searchFn() {
      this.$emit('onSearch', this.info);
    },
    resetFn() {
      // 如果选择重置，则设置为默认时间段
      // 因为数组是因为,必须得拷贝
      this.defaultDate = [];
      this.info = {
        dateArr: [],
        taskName: '',
        cascadeNodeRegIds: []
      };
      if (this.isCascadeMode) {
        this.$refs.cascadeTree.setCheckedKeys('ALL');
        this.$refs.cascadeTree.filter('');
        this.cascadeCheckChange();
      }
    },
    /**
     * @description 当选择的级联单位发生变化时触发
     */
    cascadeCheckChange() {
      this.info.cascadeNodeRegIds = this.$refs.cascadeTree.getCheckedNodes((val) => val.nodeLevel === 2).map((val) => val.regId);
    },
    /**
     * @description 当级联单位树渲染完毕时触发
     */
    cascadeReadyUpdate() {
      this.cascadeCheckChange();
    },
  }
};
</script>

<style scoped>
.search-container{
  width: 100%;
  height: 100%;
}
.search-form-container{
  width: 100%;
  height: 100%;
  overflow: hidden!important;
}
.surveillanceTask-left-content-container{
 overflow: hidden;
  padding: 20px 25px;
}

.search-title-container{
  display: flex;
  align-items: center;
  height: 56px;
  background: #F1F1F1;
  padding: 0 25px;
  width: 320px;
  box-sizing: border-box;
  font-weight:bold;
}
.search-title-container.history{
    padding: 0 16px;
}
.task-title{
    font-size: 16px;
    height: 30px;
    line-height: 30px;
    font-weight: 900;
    color: #435068;
}
.width-all{
  width: 100%;
}
</style>
