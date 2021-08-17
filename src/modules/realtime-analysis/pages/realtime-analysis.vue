<template>
  <page-layout class="realtime-analysis">
    <common-layout>
      <common-form-container
        slot="left"
        @reset="reset"
        @search="searchFormWithEventTracking">
        <resource-header
          :show-resource-monitor="false"
          slot="header"></resource-header>
        <meg-form
          class="search-form"
          label-position="top">
          <meg-form-item :label="$t('创建时间')">
            <meg-date-picker
              :prefix-icon-visible="false"
              type="datetimerange"
              @change="getDateValue"
              format="yyyy-MM-dd HH:mm"
              v-model="tempValue"
              :start-placeholder="$t('开始时间')"
              :end-placeholder="$t('结束时间')"
              :range-separator="$t('至')"
              :picker-options="pickerOptions">
            </meg-date-picker>
          </meg-form-item>
          <meg-form-item :label="$t('选择相机')">
            <camera-select
              ref="cameraTree"
              map-icon-position="right"
              :default-params="{ needLocal: true }"
              @change="cameraSelected"
              @cameras-updated="cameraReady">
            </camera-select>
          </meg-form-item>
          <meg-form-item :label="$t('创建用户')">
            <meg-input
              v-model="searchForm.creatorName"
              placeholder="请输入用户名称"></meg-input>
          </meg-form-item>
          <meg-form-item :label="$t('卡口类型')">
            <meg-select
              background
              class="camera-type"
              v-model="searchForm.monitoringType">
              <meg-option
                v-for="option in monitoringTypeList"
                :key="option.value"
                :label="option.value"
                :value="option.code"></meg-option>
            </meg-select>
          </meg-form-item>
        </meg-form>
      </common-form-container>
      <analysis-result-table
        slot="right"
        ref="analysisTable"
        :columns="columns"
        :count-info="count"
        :loading="isLoading"
        :table-data="tableData"
        :monitoring-type="realMonitoringType"
        :judge-action-config="judgeActionConfig"
        @judge-handle="judgeHandle"
        @get-judge-button-list="getJudgeButtonList"
        @radio-change="handleRadioChange"
        @page-change="handlePageChange"
        @batch-delete="batchDelete"
        @batch-pause="batchPause"
        @batch-resume="batchResume"
        @pause-task="pauseRealtimeTask"
        @resume-task="resumeTask"
        @edit-task="handleEditTask"
        @delete-task="deleteTask"
        @create-task="createTask"
        @task-detail="taskData"
        @copy-task="copyTask"
        @target="goTarget"
        @alarm="goAlarm"
        @sort-change="sortChange"></analysis-result-table>
    </common-layout>
    <edit-task
      v-if="isEditShow"
      :is-add-show="isEditShow"
      :init-data="initData"
      @confirm="editSuccess"
      @cancel="editCancel"></edit-task>
    <add-task
      ref="addTask"
      v-if="showAddTask"
      :form-type="formType"
      :adding="adding"
      :visible="showAddTask"
      :task-data="initData"
      :from-module="fromModule"
      @confirm="addTask"
      @cancel="showAddTask = false"
      @monitoring-type-change="monitoringTypeChange"></add-task>
    <task-detail
      ref="realtimeTaskDetail"
      :type="1"
      :is-detail-show="isDetailShow"
      :detail-data="detailData"
      @close-click="closeTaskDetail"></task-detail>
  </page-layout>
</template>

<script>
import { cloneDeep } from 'lodash';
import configInfo, { monitoringTypeMap } from '@/utils/data-map.utils.js';
import CommonLayout from '@/common-components/common-layout';
import CommonFormContainer from '@/common-components/common-form-container';
import CameraSelect from '@/common-components/common-camera-selector';
import AnalysisResultTable from '@/components/analysis-result-table/analysis-result-table';
import ResourceHeader from '@/components/analysis-resource-header';
import TaskDetail from '@/components/analysis/analysis-detail';
import commonSwitchParams from '@/common-components/common-switch-params';
import EditTask from '../components/edit-task';
import AddTask from '../components/add-task';
import realtimeAnalysisSrv from '../realtime-analysis.service';

export default {
  components: {
    CommonLayout,
    CommonFormContainer,
    CameraSelect,
    AnalysisResultTable,
    ResourceHeader,
    EditTask,
    AddTask,
    TaskDetail
  },
  data() {
    // 时间选择组件配置
    this.pickerOptions = {
      shortcuts: ['today', 'pastThreeDays', 'pastWeek']
    };
    // 检索表格配置
    this.columns = configInfo.realtimeAnalysisTableConfig;
    const defaultMonitorType = this.$store.getters.systemByType('analysisBayonetDefaultType').value;
    const supportMotorOrNonmotor = window.config.globalConfig.clientAppId === 'bigdata-web';
    // radio-button配置信息
    return {
      realMonitoringType: defaultMonitorType,
      fromModule: false,
      adding: false,
      isDetailShow: false,
      tempValue: [], // 表单时间
      searchForm: { // 检索表单字段
        cameraIds: [],
        startTime: '', // 时间戳
        endTime: '', // 时间戳
        pageSize: 20,
        pageNo: 1,
        status: null, // 任务状态
        creatorName: '', // 创建人
        monitoringType: defaultMonitorType, // 卡口类型
        orderBy: 'CREATE_TIME', // 排序字段
        order: 'DESC', // 排序规则 ASC,DESC
      },
      isLoading: false, // 是否正在加载数据
      tableData: {}, // 检索结果数据,
      isEditShow: false, // 编辑
      showAddTask: false, // 添加任务
      initData: {},
      count: {},
      detailData: {},
      cameraInfoArr: [],
      judgeActionConfig: [],
      formType: 'add',
      supportMotorOrNonmotor
    };
  },
  computed: {
    // 卡口类型
    monitoringTypeList() {
      let types = this.$store.getters.dataMapByType('kunlun_analysis_bayonet_type') || [];
      if (this.supportMotorOrNonmotor) {
        types = types.filter((item) => item.code !== '4');
      }
      return types;
    }
  },
  watch: {
    initData: {
      immediate: true,
      handler(v) {
        console.log('v', v);
      }
    }
  },
  created() {
    this.searchAnalysisList();
  },
  mounted() {
    const { query } = this.$route;
    if (query.addTask) {
      let monitoringType = '';
      Object.keys(monitoringTypeMap).forEach((item) => {
        if (monitoringTypeMap[item].includes(query.monitoringType)) {
          monitoringType = item;
        }
      });
      this.showAddTask = true;
      this.initData = {
        monitoringType,
        cameraIds: JSON.parse(query.cameraIds || [])
      };
      this.fromModule = true;
      this.formType = 'copy';
    }
  },
  methods: {
    /**
     * 解析结果
     */
    goTarget(data) {
      const cameraIds = [data.cameraId];
      const query = {
        cameraIds,
        sourceType: 'CAMERA'
      };
      if (data.scheduleType !== 0) {
        query.startTime = data.startTime;
        query.endTime = data.endTime;
      }
      new commonSwitchParams.FormatSwitchParams({
        module: 'attribute-search',
        pageType: 'single',
        isBlank: true,
        query
      }).switchToModule();
    },
    /**
     * 报警结果
     */
    async goAlarm(data) {
      const cameraIds = [data.cameraId];
      const timeArr = [];
      const searchType = 'camera';
      const { data: res } = await realtimeAnalysisSrv.cameraDeploy(data.cameraId);
      if (!res) {
        return this.$message.error({
          message: '当前相机未被布控，无报警结果',
          showClose: true
        });
      }
      new commonSwitchParams.FormatSwitchParams({
        module: 'alarm-history',
        pageType: 'single',
        isBlank: true,
        query: {
          timeArr: JSON.stringify(timeArr),
          cameraIds: JSON.stringify(cameraIds),
          type: searchType
        }
      }).switchToModule();
      return false;
    },
    /**
     * @description 表格排序
     * @param {Object} sortInfo 排序信息
     */
    sortChange(sortInfo) {
      const map = {
        cameraName: 'CAMERA_NAME',
        monitoringType: 'MONITORING_TYPE',
        creatorName: 'CREATOR_NAME',
        createTime: 'CREATE_TIME'
      };
      this.searchForm.pageNo = 1;
      this.searchForm.orderBy = map[sortInfo.prop];
      this.searchForm.order = sortInfo.order === 'ascending' ? 'ASC' : 'DESC';
      this.searchAnalysisList();
    },
    reset() {
      const defType = this.$store.getters.systemByType('analysisBayonetDefaultType').value;
      this.tempValue = [];
      this.searchForm.startTime = '';
      this.searchForm.endTime = '';
      this.searchForm.cameraIds = [];
      this.searchForm.taskName = '';
      this.searchForm.pageSize = 20;
      this.searchForm.pageNo = 1;
      this.searchForm.monitoringType = defType;
      this.searchForm.creatorName = '';
      this.$refs.cameraTree.reset();
      this.eventTracking('FealtimeAnalysisResetBtn');
    },
    /**
     * @description 查询配置研判跳转列表
     * @param {Object} row 任务数据
     */
    async getJudgeButtonList(row) {
      console.log('row', row);
      // this.judgeActionConfig = [];
      // const { startTime, endTime, cameraId } = row;
      // const cameraIds = [cameraId];
      // const actions = [{
      //   label: '属性检索',
      //   value: 'attribute-search',
      //   query: {
      //     startTime,
      //     endTime,
      //     cameraIds,
      //     sourceType: 'CAMERA'
      //   }
      // }];
      // const { code, msg, data } = await realtimeAnalysisSrv.cameraStat(row.cameraId);
      // if (code === 0) {
      //   if (data.captureCount > 0) {
      //     actions.push({
      //       label: '抓拍检索',
      //       value: 'capture-search',
      //       query: {
      //         startTime,
      //         endTime,
      //         cameraIds
      //       }
      //     });
      //   }
      //   if (data.alarmCount > 0) {
      //     actions.push({
      //       label: '历史报警',
      //       value: 'alarm-history',
      //       query: {
      //         type: 'camera',
      //         timeArr: JSON.stringify([startTime, endTime]),
      //         cameraIds: JSON.stringify(cameraIds)
      //       }
      //     });
      //   }
      // } else {
      //   this.$message.error(msg);
      // }
      this.judgeActionConfig = [];
    },
    /**
     * @description 配置研判跳转列表
     * @param {Object} row 任务与跳转信息
     */
    judgeHandle(row, item) {
      new commonSwitchParams.FormatSwitchParams({
        module: row.alias,
        isBlank: true,
        pageType: 'single',
        query: item.query
      }).switchToModule();
    },
    /**
     * 复制任务
     */
    copyTask(data) {
      this.formType = 'copy';
      this.initData = data;
      this.showAddTask = true;
      this.eventTracking('FealtimeAnalysisTaskCopy');
    },
    async monitoringTypeChange(v, type) {
      if (type !== 'add') {
        this.searchForm.monitoringType = v;
      }
      this.$refs.addTask.setTreeData([]);
      const defType = this.$store.getters.systemByType('analysisBayonetDefaultType').value;
      if (this.req) {
        this.req.cancel('abort prev request.');
      }
      this.req = realtimeAnalysisSrv.noAnalysisTree({
        monitoringType: Number(v) || defType,
        range: 'valid'
      });
      this.req.then((res) => {
        const { code, msg, data } = res;
        if (code === 0) {
          data.forEach((item) => {
            item.label = item.name;
          });
          if (this.$refs.addTask) {
            this.$refs.addTask.setTreeData(data);
          }
        } else {
          this.$message.error({
            message: msg,
            showClose: true
          });
        }
      }).catch((err) => {
        if (!err.isCancel) {
          this.$message.error({
            message: err,
            showClose: true
          });
        } else {
          console.info('abort request', err);
        }
      });
    },
    /**
     * 新建任务
     */
    async addTask(data) {
      if (this.adding) return;
      this.adding = true;
      const { code, msg } = await realtimeAnalysisSrv.addTask(data);
      if (code === 0) {
        this.showAddTask = false;
        this.searchAnalysisList();
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
      this.adding = false;
    },
    closeTaskDetail() {
      this.isDetailShow = false;
    },
    taskData(data) {
      this.eventTracking('FealtimeAnalysisTaskDetail');
      this.isDetailShow = true;
      this.detailData = data;
    },
    createTask() {
      this.formType = 'add';
      this.initData = {};
      this.showAddTask = true;
      this.eventTracking('FealtimeAnalysisAddTask');
    },
    /**
     * 删除任务
     */
    async deleteTask(data) {
      this.eventTracking('FealtimeAnalysisTaskDelete');
      try {
        await this.$confirm('此操作会删除该任务及该任务产生的解析数据，是否继续？', '提示');
        const { code, msg } = await realtimeAnalysisSrv.delete(data.id);
        this.eventTracking('FealtimeAnalysisTaskSureDelete');
        if (code === 0) {
          this.$message.success({
            message: '任务删除成功！',
            showClose: true
          });
          this.searchAnalysisList();
        } else {
          this.$message.error({
            message: msg,
            showClose: true
          });
        }
      } catch (e) {
        console.log(e);
      }
    },

    /**
     * 编辑成功
     */
    async editSuccess({
      id,
      form
    }) {
      if (form.scheduleType === 0) {
        delete form.startHour;
        delete form.endHour;
      }
      const { code, msg } = await realtimeAnalysisSrv.edit(id, form);
      if (code === 0) {
        this.$message.success({
          message: '任务修改成功！',
          showClose: true
        });
        this.searchAnalysisList();
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
      this.isEditShow = false;
    },
    /**
     * 取消编辑
     */
    editCancel() {
      this.isEditShow = false;
    },
    /**
     * 编辑
     */
    async handleEditTask(task) {
      this.initData = {};
      this.isEditShow = true;
      this.eventTracking('FealtimeAnalysisTaskEdit');
      const { code, msg, data } = await realtimeAnalysisSrv.getDetail(task.id);
      if (code === 0) {
        this.initData = data;
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    /**
     * 继续
     */
    async resumeTask(data) {
      this.eventTracking('FealtimeAnalysisTaskGo');
      const { code, msg } = await realtimeAnalysisSrv.resume(data.id);
      if (code === 0) {
        this.searchAnalysisList();
        this.$message.success({
          message: '任务继续成功！',
          showClose: true
        });
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    /**
     * 暂停
     */
    async pauseRealtimeTask(data) {
      this.eventTracking('FealtimeAnalysisTaskStop');
      const { code, msg } = await realtimeAnalysisSrv.pause(data.id);
      if (code === 0) {
        this.searchAnalysisList();
        this.$message.success({
          message: '任务暂停成功！',
          showClose: true
        });
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    createParams(selects = {}) {
      const { acrossPage, selections } = selects;
      let params = {};
      if (acrossPage) {
        params = cloneDeep(this.searchForm);
        delete params.pageSize;
        delete params.pageNo;
      } else {
        params.taskIds = selections.map((item) => item.id);
      }
      return params;
    },
    /**
     * 批量继续
     */
    async batchResume(selects) {
      this.eventTracking('FealtimeAnalysisTaskPLGo');
      const params = this.createParams(selects);
      const { code, msg } = await realtimeAnalysisSrv.batchResume(params);
      this.$refs.analysisTable.batchResumeLoading = false;
      if (code === 0) {
        this.searchAnalysisList();
        this.$message.success({
          message: '已选任务批量继续成功！',
          showClose: true
        });
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    /**
     * 批量暂停
     */
    async batchPause(selects) {
      this.eventTracking('FealtimeAnalysisTaskPLStop');
      const params = this.createParams(selects);
      const { code, msg } = await realtimeAnalysisSrv.batchPause(params);
      this.$refs.analysisTable.batchPauseLoading = false;
      if (code === 0) {
        this.searchAnalysisList();
        this.$message.success({
          message: '已选任务批量暂停成功！',
          showClose: true
        });
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    /**
     * 批量删除
     */
    async batchDelete(selects) {
      this.eventTracking('FealtimeAnalysisTaskPLDelete');
      try {
        await this.$confirm('此操作会删除该任务及该任务产生的解析数据，是否继续？', '提示');
        const params = this.createParams(selects);
        const { code, msg } = await realtimeAnalysisSrv.batchDelete(params);
        if (code === 0) {
          this.$message.success({
            message: '已选任务批量删除成功！',
            showClose: true
          });
          this.searchAnalysisList();
        } else {
          this.$message.error({
            message: msg,
            showClose: true
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
    handlePageChange({ pageSize, pageNo }) {
      this.searchForm.pageNo = pageNo;
      this.searchForm.pageSize = pageSize;
      this.searchAnalysisList();
    },
    handleRadioChange(value) {
      if (this.isLoading) return;
      this.searchForm.pageNo = 1;
      this.searchForm.status = value;
      this.searchAnalysisList();
    },
    /**
     * 任务统计
     */
    async getStatistics() {
      const params = cloneDeep(this.searchForm);
      delete params.pageSize;
      delete params.pageNo;
      delete params.status;
      const { code, data, msg } = await realtimeAnalysisSrv.getStatistics(params);
      if (code === 0) {
        this.count = data;
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    /**
     * @description 相机选择组件更新完成
     * @param {Array} cameraInfoArr 相机数组
     */
    cameraReady() {
      // this.cameraInfoArr = cameraInfoArr;
      // this.searchForm.cameraIds = cameraInfoArr.map((item) => item.id);
    },
    /**
     * @description 相机选中事件
     * @param {Array} selectedCameraArr 被选中的相机id组成的数组
     */
    cameraSelected(selectedCameraArr) {
      this.searchForm.cameraIds = selectedCameraArr;
    },
    searchFormWithEventTracking() {
      this.searchForm.pageNo = 1;
      this.searchAnalysisList();
      this.eventTracking('FealtimeAnalysisSearchBtn');
    },
    /**
     * @description 检索实时分析列表
     */
    async searchAnalysisList(countable = true) {
      if (this.isLoading) return;
      this.isLoading = true;
      this.realMonitoringType = this.searchForm.monitoringType;
      const { code, data, msg } = await realtimeAnalysisSrv.getRealtimeAnalysisList(this.searchForm);
      this.isLoading = false;
      if (code === 0) {
        this.tableData = data;
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
      if (countable) {
        this.getStatistics(this.searchForm);
      }
    },
    /**
     * 时间日期改变时触发
     * @param {Array} date 改变后的时间组成的数组
     */
    getDateValue(date) {
      if (date && date.length) {
        this.searchForm.startTime = +date[0];
        this.searchForm.endTime = +date[1];
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.realtime-analysis{
  .search-form{
    .camera-type{
      width: 100%;
    }
  }
}
</style>
