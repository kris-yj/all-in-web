<template>
  <meg-container class="alarmHistoryContainer taskDetail task-detail-normal">
    <!-- 详情侧边栏 -->
    <meg-aside
      class="task-aside">
      <div class="left-content-container">
        <surveillance-task-detail-left
          @on-click-edit-task="editTask"
          :history="history"
          :enable-edit="enableEdit"
          :task-detail-data="taskDetailData">
        </surveillance-task-detail-left>
      </div>
    </meg-aside>
    <!-- 主体内容 -->
    <meg-main
      class="main-container">
      <div class="main">
        <!-- 详情顶部导航 -->
        <div class="main-nav">
          <div class="main-nav-left">
            <span
              v-if="isSelectMode"
              class="font12">{{ $t('已选择') }}
              <label class="font14"> {{ selectedCard.length }} </label>
              {{ $t('条结果') }}
            </span>
            <span
              v-else
              class="font12">{{ $t('检索结果：共') }}<label class="font14"> {{ totalNum }} </label>
              {{ $t('条') }}
            </span>
          </div>
          <!-- 中部查询维度选择 -->
          <div
            class="main-nav-middle"
            v-if="!isNoData">
            <meg-radio-group
              class="sort-box"
              v-model="currentSearchType">
              <meg-radio-button label="1">
                {{ currentSearchType === '1'? $t('按{entity}排序', { entity: $t('时间') }) : $t('时间') }}
              </meg-radio-button>
              <meg-radio-button label="2">
                {{ currentSearchType === '2'? $t('按{entity}排序', { entity: $t('地点') }) : $t('地点') }}
              </meg-radio-button>
              <meg-radio-button
                v-if="defaultFormData.alarmType === 0"
                label="3">
                {{ currentSearchType === '3'? $t('按{entity}排序', { entity: $t('相似度') }) : $t('相似度') }}
              </meg-radio-button>
              <meg-radio-button
                v-if="defaultFormData.alarmType === 0"
                label="4">
                {{ currentSearchType === '4'? $t('按{entity}排序', { entity: $t('底库') }) : $t('底库') }}
              </meg-radio-button>
              <meg-radio-button label="5">
                {{ currentSearchType === '5'? this.$t('按{entity}排序', { entity: $t('卡口类型') }) : $t('卡口类型') }}
              </meg-radio-button>
            </meg-radio-group>
          </div>
          <div
            v-if="enableExport"
            class="main-nav-right">
            <export-setting-button
              :disabled="isNoData"
              @click-export="onClickExport"
              @click-setting="onClickExportSetting"></export-setting-button>
            <meg-button
              :disabled="isNoData"
              v-if="isSelectMode"
              class="margin-left-10"
              @click="onClickSelectMode">
              {{ $t('退出选择') }}
            </meg-button>
          </div>
          <div
            v-else
            class="main-nav-right"></div>
        </div>
        <!-- 手风琴展示列表 -->
        <div
          class="main-content"
          v-loading="loading">
          <div
            v-background="!isNoData? false:{icon:'icon_2',text: $t('检索无结果')}"
            class="inner-container">
            <common-collapse
              ref="collapse"
              v-model="nowCollapseIndex"
              :default-active-name="defaultIndex"
              :categories="categoryList"
              :show-checkbox-animation="false"
              :card-min-width="300"
              :list="alarmCardInfoList"
              :total-records="totalNum"
              :loading="collapseLoading"
              @change="categoryChange"
              @load-list="fetchData"
              @check-list-change="onCheckChange">
              <template v-slot="{item,index}">
                <alarm-card
                  @click="cardClick(item,index)"
                  :show-store-icon="false"
                  :card-info="item"></alarm-card>
              </template>
            </common-collapse>
          </div>
        </div>
      </div>
    </meg-main>
    <alarm-detail
      @close="isShowAlarmDetail = false"
      :total="alarmCardInfoList.length"
      :alarm-id="currentAlarmId"
      :index="currentIndex"
      @update="onDetailUpdate"
      @temp-change="onTempChange"
      @change="onChange"
      v-if="isShowAlarmDetail"></alarm-detail>
    <manage-task
      :deploy-aging="deployAging"
      mode="edit"
      :is-saving="isSaving"
      :default-data="defaultFormData"
      :get-album="getAlbumList"
      @save="onSaveTask"
      @close="isShowCreateTask = false"
      v-if="isShowCreateTask"></manage-task>
  </meg-container>
</template>
<script>
import moment from 'moment';
import exportMessageBox from '@/common-components/common-export-message-box';
import SurveillanceTaskSvr from '@/modules/cascade-surveillance-task/cascade-surveillance-task.service.js';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import AlarmCard from '../../../common-components/common-alarm-card';
import CommonCollapse from '../../../common-components/common-collapse';
import SurveillanceTaskDetailLeft from './surveillance-task-detail-left.vue';
import ManageTask from './manage-task';
import AlarmDetail from '../../../common-components/common-alarm-detail';

export default {
  name: 'TaskDetail',
  components: {
    // 左边详情组件
    SurveillanceTaskDetailLeft,
    AlarmCard,
    CommonCollapse,
    ExportSettingButton,
    ManageTask,
    AlarmDetail,
  },
  props: {
    // 布控任务数据
    taskId: {
      type: String,
      default: ''
    },
    // 是否是历史任务
    history: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      currentSearchTypeMap: {
        '1': {
          code: 'date',
        },
        '2': {
          code: 'position',
          title: this.$t('按地点导出')
        },
        '3': {
          code: 'similarity',
        },
        '4': {
          code: 'album',
          title: this.$t('按底库导出')
        },
        '5': {
          code: 'scenesType',
          title: this.$t('按卡口类型导出')
        },
      },
      nowCollapseIndex: 99,
      defaultIndex: 99,
      collapseLoading: false,
      isShowAlarmDetail: false, // 是否显示报警详情
      currentAlarmId: '', // 当前报警详情的id
      currentIndex: 0, // 当前报警详情的index
      // 任务详情
      taskDetailData: {
        realDateStr: '',
        category: 0,
        timesStrArr: [],
        placesStr: '',
        camerasStr: '',
        albumsStr: '',
        name: '',
        status: -1,
        level: 0,
        alarmType: 0,
        dualNetSync: true,
      },
      editDetailData: {},
      detailData: {},
      commonTaskDialogVisible: false,

      lastCategoryId: '', // 记录上一次的类别条目

      // new
      // 是否可以导出
      enableExport: false,
      // 默认背景
      isNoData: false,
      // ----手风琴控制部分----
      pageInfo: {
        pageSize: 60,
        pageNo: 1
      },
      categories: [], // 当前维度下查询得到的分类对象数组
      loading: false, // 加载中
      isSelectMode: false, // 当前是否处于选择状态
      totalNum: 0,
      currentSearchType: '1', // 当前选择的维度类型
      deployTypeList: [],
      deployTypeMap: {},
      defaultFormData: {},
      categoryList: [], // 聚类的列表
      alarmCardInfoList: [], // 聚类内部，手风琴子项，每一个的列表
      categoriesPageInfo: {
        pageSize: 20,
        pageNo: 1
      }, // 分类的分页比如一个相机就是一个分类
      manager: null,
      selectedCard: [],
      others: [],
      deployAging: [],
      deptTree: [], // 部门树
      userTree: [], // 用户树
      isShowCreateTask: false,
      isSaving: false,
    };
  },
  computed: {
    enableEdit() {
      // 是否是双网
      const isDual = this.$store.getters.systemByType('isDual').value;
      // 是否可编辑
      const dualSurveillanceEditable = this.$store.getters.systemByType('dualSurveillanceEditable').value;
      if (isDual === 'true' && dualSurveillanceEditable === 'false') {
        return false;
      }
      return true;
    },
    isShowLoadMore() {
      const curCategory = this.categories[this.activeCategoryId];
      if (curCategory) return curCategory.totalRecords > this.alarmCardInfoList.length && !curCategory.canSelect;
      return false;
    },
    // 用于枚举的分类数组（经过排序）
    enumCategories() {
      return Object.values(this.categories).sort((a, b) => a.sortIndex - b.sortIndex);
    }
  },
  watch: {

    // 监听当前查询的条件类别
    currentSearchType() {
      this.resetResult();
      this.getClusterList();
    }
  },
  created() {
    this.initPage();
  },
  methods: {
    initPage() {
      if (!this.taskId) return;

      // new
      this.getTaskDetail();
      this.initExport();
      this.getClusterList();
      this.initMap();
      this.enableExport = this.$store.getters.modulePermissonsByAlias('surveillance-task', 'surveillanceTaskExport');
      this.manager = new ExportSettingManager(this.$store, 'surveillance-task', 'alarm_export_column');
    },
    initMap() {
      this.deployAging = this.$store.getters.dataMapByType('deploy_aging');
    },
    /**
     * @description 初始化导出
     */
    initExport() {
      const startTime = new Date(new Date(moment().subtract(6, 'days')).setHours(0, 0, 0, 0)).getTime();
      const endTime = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
      this.initDate = [startTime, endTime];
      this.exportDate = [startTime, endTime];
    },
    /**
     * @description 重置检索结果
     */
    resetResult() {
      console.log('resetResult');
      this.$nextTick(() => {
        this.$refs.collapse.cancelSelect();
      });
      this.pageInfo = {
        pageSize: 60,
        pageNo: 1
      };
      this.resetCategoriesPageInfo();
      this.categoryList = [];
      this.alarmCardInfoList = [];
      this.totalNum = 0;
      this.isSelectMode = false;
      this.nowCollapseIndex = this.defaultIndex;
      this.selectedCard = [];
    },
    /**
     * @description 重置假分页
     */
    resetCategoriesPageInfo() {
      this.categoriesPageInfo = {
        pageSize: 20,
        pageNo: 1
      };
    },
    // new
    /**
     * @description 获取任务详情并打开弹窗
     */
    getTaskDetail() {
      const vm = this;
      SurveillanceTaskSvr.getTaskDetail({ id: this.taskId }).then((response) => {
        if (response.code === 0) {
          const taskDetailData = { ...response.data };
          this.defaultFormData = { ...response.data };
          const leftInfo = {};
          leftInfo.name = taskDetailData.strategyName;
          if (taskDetailData.termType === 1) {
            leftInfo.realDateStr = `${moment(taskDetailData.startTime).format('YYYY-MM-DD')} ~ ${this.$t('至今')}`;
          } else {
            leftInfo.realDateStr = `${moment(taskDetailData.startTime).format('YYYY-MM-DD')} ~ ${moment(taskDetailData.endTime).format('YYYY-MM-DD')}`;
          }
          leftInfo.strategyTypeName = taskDetailData.strategyTypeName;
          leftInfo.timesStrArr = taskDetailData.strategyTimeList.map((val) => {
            const item = {};
            item.startTime = moment(new Date(val.startMinute + moment().startOf('day').toDate().getTime())).format('HH:mm');
            item.endTime = moment(new Date(val.endMinute + moment().startOf('day').toDate().getTime())).format('HH:mm');
            return item;
          });
          // todo 三个字段的name都没有定下来
          leftInfo.albumsStr = taskDetailData.albumList ? taskDetailData.albumList.map((val) => val.albumName).join(',') : ''; // 识别布控 才有底库
          leftInfo.cascadeName = taskDetailData.cascadeName; // 识别布控 才有底库
          leftInfo.enableEdit = !taskDetailData.readOnly && !taskDetailData.applyReadOnly && !taskDetailData.dualNetSync;
          leftInfo.alarmType = taskDetailData.alarmType;
          this.taskDetailData = leftInfo;
        } else {
          vm.$message.error(response.msg);
        }
      });
    },
    /**
     * @description 获取聚类列表（手风琴）
     * @param {any}
     * @returns
     */
    getClusterList() {
      this.loading = true;
      this.totalNum = 0;
      const params = {
        alarmStrategyId: this.taskId,
        clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
        source: 'CASCADE',
      };
      SurveillanceTaskSvr.getClusterList(params).then((res) => {
        if (res.code === 0) {
          const category = [...res.data.records];
          if (category.length === 0) this.isNoData = true;
          this.others = category.map((val) => ({
            label: val.displayName,
            value: val.condition,
          }));
          this.categoryList = category;
        }
        this.loading = false;
      });
    },
    /**
     * @description 获取列表详细的数据
     * @param {object} params 请求参数
     * @param {object} options 请求参数
     * @returns
     */
    getAlarmList(params = {}, options = {}) {
      this.loading = options.loading;
      this.collapseLoading = true;
      if (options.reset) {
        this.alarmCardInfoList = [];
      }
      SurveillanceTaskSvr.getAlarmList(params).then((res) => {
        if (res.code === 0) {
          if (options.reset) {
            this.alarmCardInfoList = [...res.data.records];
          } else {
            this.alarmCardInfoList = [...this.alarmCardInfoList, ...res.data.records];
          }
          this.totalNum = res.data.totalRecords;
        }
        this.collapseLoading = false;
        this.loading = false;
      });
    },
    /**
     * @description 更改暂存状态
     * @param {number} index 下标
     * @param {number} status 状态
     */
    onTempChange(index, status) {
      this.$set(this.alarmCardInfoList[index], 'temporaryFlag', status);
    },
    /**
     * @description 更改处理状态
     * @param {object:{ id:string , index: number }}
     */
    onDetailUpdate(obj, status) {
      this.$set(this.alarmCardInfoList[obj.index], 'processStatus', status);
    },
    /**
     * @description 聚合类发生变化时
     * @param {number} index
     */
    categoryChange(index) {
      if (index !== '') {
        this.pageInfo = {
          pageSize: 60,
          pageNo: 1
        };
        this.getAlarmList({
          ...this.categoryList[index].condition,
          ...this.pageInfo,
          alarmStrategyIds: [this.taskId],
          clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
          source: 'CASCADE',
        }, { reset: true, loading: true });
      }
    },
    /**
     * @description 手风琴加载更多
     * @param {any}
     * @returns
     */
    fetchData(pageNo, pageSize) {
      this.pageInfo = {
        pageNo, pageSize
      };
      this.getAlarmList({
        ...this.pageInfo,
        alarmStrategyIds: [this.taskId],
        ...this.categoryList[this.nowCollapseIndex].condition,
        clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
        source: 'CASCADE',
      });
    },
    /**
     * @description 手风琴选择发生变化时
     * @param {array} checkList 选中的ids
     * @returns
     */
    onCheckChange(checkList) {
      this.selectedCard = checkList;
      if (checkList.length) {
        this.isSelectMode = true;
      } else {
        this.isSelectMode = false;
      }
    },
    /**
     * @description 获取对应的底库
     * @param {object}params 请求参数
     */
    getAlbumList(params, fn = () => {}) {
      SurveillanceTaskSvr.getAlbumList(params).then((res) => {
        if (res.code === 0) {
          fn(res.data);
        } else {
          console.error(res.msg);
        }
      });
    },
    /**
     * @description 卡片点击时触发
     * @param {object} item  卡片数据
     * @param {number} index 卡片下标
     */
    cardClick(item, index) {
      console.log(item, index);
      this.currentAlarmId = item.id;
      this.currentIndex = index;
      this.isShowAlarmDetail = true;
    },
    /**
     * @description 加入/移除暂存架
     * @param {string} type 类型 del add
     * @param {object} data 数据
     * @param {number} index 下标
     * @returns
     */
    onStoreChange(type, data, index) {
      if (type === 'add') {
        this.addTemporaries(data, index);
      } else {
        this.deleteTemporaries(data, index);
      }
    },
    /**
     * @description 添加到暂存架
     * @param {object} data 数据
     * @param {number} index 下标
     * @returns
     */
    addTemporaries(data, index) {
      const params = {
        temId: data.id,
        temType: 2,
        temOrigin: 7,
      };
      SurveillanceTaskSvr.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('加入暂存架成功'));
          this.$set(this.alarmCardInfoList[index], 'temporaryFlag', 1);
        }
      });
    },
    /**
     * @description 移出暂存架
     * @param {object} data 数据
     * @param {number} index 下标
     * @returns
     */
    deleteTemporaries(data, index) {
      const params = {
        temIds: [data.id],
        temType: 2,
      };
      SurveillanceTaskSvr.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('移出暂存架成功'));
          this.$set(this.alarmCardInfoList[index], 'temporaryFlag', 0);
        }
      });
    },
    /**
     * @description 报警详情点击上一个或者下一个时相关处理
     * @param {number} index 下标
     */
    onChange(index) {
      this.currentAlarmId = this.alarmCardInfoList[index].id;
      this.currentIndex = index;
    },
    /**
     * @description 导出
     * @param {any}
     * @returns
     */
    onClickExport() {
      if (this.isSelectMode) {
        // 当处于选择模式下且选中项目条数大于0的时候导出,否则提示
        if (this.selectedCard.length > 0) {
          const param = {};
          param.ids = this.selectedCard;
          param.source = 'CASCADE';
          param.columns = this.manager.getExportSetting();
          this.alarmExportByAlarmId(param);
        } else {
          this.$message(this.$t('请选择报警'));
        }
      } else {
      // 维度字段： 1时间 2相似度
        const [startTime, endTime] = this.exportDate;
        switch (this.currentSearchType) {
          case '1':
            exportMessageBox.showExportMessageBox({
              type: 'time',
              title: this.$t('按时间导出'),
              tips: `（最多支持导出${this.$store.getters.systemByType('kunlun_export_warn_range_threshold').value}条）`,
              selects: [startTime, endTime]
            }).then(
              (select) => {
                // 根据选择条件进行导出操作
                const [start, end] = select;
                const params = {
                  startTime: start,
                  endTime: end,
                  clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
                  alarmStrategyIds: [this.taskId],
                  strategyCategory: 1
                };
                this.exportAlarmData(params);
              },
              () => {
                // 取消导出
              }
            );
            break;
          case '3':
            exportMessageBox.showExportMessageBox({
              type: 'threshold',
              title: this.$t('按相似度导出'),
              tips: `（最多支持导出${this.$store.getters.systemByType('kunlun_export_warn_range_threshold').value}条）`,
              selects: 60
            }).then(
              (select) => {
                // 根据选择条件进行导出操作
                const params = {
                  minSimilarity: select,
                  maxSimilarity: 100,
                  alarmStrategyIds: [this.taskId],
                  clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
                  strategyCategory: 1
                };
                this.exportAlarmData(params);
              },
              () => {
                // 取消导出
              }
            );
            break;
          default:
            exportMessageBox.showExportMessageBox({
              type: 'list',
              title: this.currentSearchTypeMap[this.currentSearchType].title,
              tips: `（最多支持导出${this.$store.getters.systemByType('kunlun_export_warn_range_threshold').value}条）`,
              selects: this.others
            }).then(
              (select) => {
                // 根据选择条件进行导出操作
                const map = {};
                select.forEach((val) => {
                  Object.keys(val).forEach((item) => {
                    if (Array.isArray(val[item])) {
                      if (map[item]) {
                        map[item] = [...map[item], ...val[item]];
                      } else {
                        map[item] = val[item];
                      }
                    }
                  });
                });
                const params = {
                  ...map,
                  alarmStrategyIds: [this.taskId],
                  clusterType: this.currentSearchTypeMap[this.currentSearchType].code,
                  strategyCategory: 1
                };
                this.exportAlarmData(params);
              },
              () => {
                // 取消导出
              }
            );
        }
      }
    },

    // 通过报警id来下载
    alarmExportByAlarmId(param) {
      const vm = this;
      SurveillanceTaskSvr.exportHistory(param).then((response) => {
        if (response.code === 0) {
          window.location.href = response.data;
        } else {
          vm.$message.error(response.msg);
        }
      });
    },
    /**
     * @description 导出数据
     * @param {object} params 参数
     * @returns
     */
    exportAlarmData(params) {
      SurveillanceTaskSvr.exportHistory({ ...params, columns: this.manager.getExportSetting() }).then((res) => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('导出成功，请前往任务列表下载'),
            type: 'success'
          });
        }
      });
    },

    /**
     * 打开导出设置
     */
    async onClickExportSetting() {
      await this.manager.setExportSetting();
    },
    onClickSelectMode() {
      this.isSelectMode = false;
      this.$refs.collapse.cancelSelect();
      this.selectedCard = [];
    },
    editTask() {
      this.isShowCreateTask = true;
    },
    /**
     * @description
     * @param {object} params
     * @param {string} mode 模式
     * @returns
     */
    onSaveTask(params) {
      this.isSaving = true;
      SurveillanceTaskSvr.editTask(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('编辑成功'));
          this.getTaskDetail();
        } else {
          console.error(res.msg);
        }
        this.isShowCreateTask = false;
        this.isSaving = false;
      });
    },
    // 关闭公共任务弹窗
    commonTaskDialogClose() {
      this.commonTaskDialogVisible = false;
    },
    // 公共任务保存成功
    commonTaskDialogSave() {
      this.commonTaskDialogVisible = false;
      // 获取任务详情
      this.getTaskDetail();
      // 获取报警分组统计
      this.getAlarmGroupList();
    }
  }
};
</script>

<style scoped lang="scss">
.alarmHistoryContainer {
  width: 100%;
  height: 100%;
  position: relative;
  background: #dce1e5;
  .task-aside {
    width: 320px !important;
    background: #ffffff;
    height: 100%;
  }
  .main-container {
    display: flex;
    flex-direction: column;
    padding: 0;
    .main {
      background: #dce1e5;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      flex-wrap: nowrap;
      .main-nav {
        height: 56px;
        line-height: 56px;
        margin: 0 20px;
        text-align: center;
        color: #435068;
        position: relative;
        display: flex;
        justify-content: space-between;
        .main-nav-left {
          height: 56px;
          line-height: 56px;
          text-align: left;
          span {
            display: inline-block;
          }
        }
        .main-nav-middle {
          height: 56px;
          line-height: 56px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .main-nav-right {
          height: 56px;
          .right-button-margin {
            margin-left: 10px;
          }
        }
      }
      .main-content {
        height: calc(100% - 56px);
        margin: 0px 3px 0 17px;
        .inner-container {
          width: 100%;
          height: 100%;
          overflow: auto;
        }
      }
    }
  }
}
.font12 {
  font-size: 12px;
}
.font14 {
  font-size: 14px;
}

.i18n-en-US {
  .task-detail-normal {
    .main-nav-right {
      width: 243px;
    }
    .timeDialog-container label {
      width: 150px;
    }
  }
}
</style>
<style lang="scss">
.i18n-en-US {
  .task-detail-normal {
    .time-dialog-box {
      height: 100px;
      .meg-dialog {
        width: 500px !important;
      }
    }
  }
}
</style>
