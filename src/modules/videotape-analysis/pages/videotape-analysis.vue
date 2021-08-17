<template>
  <page-layout class="videotape-analysis">
    <common-layout>
      <common-form-container
        slot="left"
        @reset="reset"
        @search="searchFormWithEventTracking">
        <resource-header
          ref="header"
          slot="header"
          is-beta
          :title="$t('录像解析')"></resource-header>
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
              :default-params="{ monitoringTypes: [4, 5, 12], needLocal: true }"
              @change="cameraSelected"
              @cameras-updated="cameraReady">
            </camera-select>
          </meg-form-item>
          <meg-form-item :label="$t('任务名称')">
            <meg-input
              v-model="searchForm.taskName"
              placeholder="请输入任务名称"></meg-input>
          </meg-form-item>
          <meg-form-item
            :label="$t('创建用户')">
            <meg-input
              v-model="searchForm.creatorName"
              placeholder="请输入用户名称"></meg-input>
          </meg-form-item>
        </meg-form>
      </common-form-container>
      <template slot="right">
        <analysis-result-table
          type="video"
          ref="analysisTable"
          :columns="columns"
          :count-info="count"
          :loading="isLoading"
          :table-data="tableData"
          :judge-action-config="judgeActionConfig"
          @judge-handle="judgeHandle"
          @get-judge-button-list="getJudgeButtonList"
          @radio-change="handleRadioChange"
          @page-change="handlePageChange"
          @batch-delete="batchDelete"
          @batch-pause="batchPause"
          @batch-resume="batchResume"
          @batch-restart="resumeFailure"
          @pause-task="pauseRealtimeTask"
          @resume-task="resumeTask"
          @edit-task="handleEditTask"
          @delete-task="deleteTask"
          @task-detail="taskData"
          @create-task="createTask"
          @restart-task="resumeFailure"
          @copy-task="copyTask"
          @target="goTarget"
          @alarm="goAlarm"
          @sort-change="sortChange"></analysis-result-table>
        <task-detail
          v-if="isDetailShow"
          :type="2"
          :is-detail-show="isDetailShow"
          :detail-data="detailData"
          @close-click="closeTaskDetail"></task-detail>
        <edit-task
          v-if="isEditShow"
          :is-edit-show="isEditShow"
          :detail-data="detailData"
          :monitor-info="monitorInfo"
          @save-edit="saveEdit"
          @close-click="closeTaskEdit"></edit-task>
        <add-task
          v-if="isAddShow"
          :monitor-info="monitorInfo"
          :visible="isAddShow"
          :albums="albums"
          :adding="isLoading"
          :init-data="detailData"
          :form-type="formType"
          @confirm="batchTask"
          @cancel="isAddShow = false"></add-task>
      </template>
    </common-layout>
  </page-layout>
</template>

<script>
import { cloneDeep, pick } from 'lodash';
import configInfo from '@/utils/data-map.utils.js';
import CommonLayout from '@/common-components/common-layout';
import CommonFormContainer from '@/common-components/common-form-container';
import CameraSelect from '@/common-components/common-camera-selector';
import ResourceHeader from '@/components/analysis-resource-header';
import AnalysisResultTable from '@/components/analysis-result-table/analysis-result-table';
import TaskDetail from '@/components/analysis/analysis-detail';
import commonSwitchParams from '@/common-components/common-switch-params';
import EditTask from '../components/edit-task';
import AddTask from '../components/add-task';
import videotapeAnalysisSrv from '../videotape-analysis.service';

export default {
  components: {
    CommonLayout,
    CommonFormContainer,
    CameraSelect,
    EditTask,
    AddTask,
    ResourceHeader,
    AnalysisResultTable,
    TaskDetail
  },
  data() {
    // 时间选择组件配置
    this.pickerOptions = {
      shortcuts: ['today', 'pastThreeDays', 'pastWeek']
    };
    // 检索表格配置
    this.columns = configInfo.videotapeAnalysisTableConfig;
    // radio-button配置信息
    return {
      isAddShow: false,
      isEditShow: false,
      isDetailShow: false,
      detailData: {},
      tempValue: [], // 表单时间
      isLoading: false, // 是否正在加载数据
      tableData: {}, // 检索结果数据
      searchForm: { // 检索表单字段
        batchTaskIds: [], // 任务id集合，前端目前用不到
        cameraIds: [],
        departIds: [], // 部门标识
        taskName: '', // 任务名称
        startTime: '', // 时间戳
        endTime: '', // 时间戳
        pageSize: 20,
        pageNo: 1,
        status: [], // 任务状态
        creatorName: '', // 创建人
        orderBy: '',
        order: ''
      },
      count: {},
      initData: {},
      albums: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      },
      batchTaskForm: {},
      monitorInfo: {
        remainVideoPower: 0,
        totalVideoPower: 0
      },
      formType: 'add',
      judgeActionConfig: []
    };
  },
  created() {
    const { id } = this.$route.query;
    if (!id) {
      this.searchAnalysisList();
    }
    this.albumList();
  },
  mounted() {
    const { query } = this.$route;
    console.log('query', query);
    if (query.addTask) {
      query.$cameraIds = JSON.parse(query.cameraIds || []);
      this.requestMonitorInfo();
      this.isAddShow = true;
      this.detailData = query;
      this.formType = 'copy';
    }
  },
  methods: {
    /**
     * 解析结果
     */
    goTarget(data) {
      const cameraIds = data.camerIds;
      new commonSwitchParams.FormatSwitchParams({
        module: 'attribute-search',
        pageType: 'single',
        isBlank: true,
        query: {
          cameraIds,
          sourceType: 'CAMERA',
          startTime: data.startTime,
          endTime: data.endTime
        }
      }).switchToModule();
    },
    /**
     * 报警结果
     */
    goAlarm(data) {
      const cameraIds = data.camerIds;
      const timeArr = [data.startTime, data.endTime];
      const searchType = 'video';
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
    },
    /**
     * @description 表格排序
     * @param {Object} sortInfo 排序信息
     */
    sortChange(sortInfo) {
      if (sortInfo.prop === 'finishNum') {
        sortInfo.prop = 'successNum';
      }
      this.searchForm.pageNo = 1;
      this.searchForm.orderBy = sortInfo.prop;
      this.searchForm.order = sortInfo.order === 'ascending' ? 'ASC' : 'DESC';
      this.searchAnalysisList();
    },
    reset() {
      this.tempValue = [];
      this.searchForm.startTime = '';
      this.searchForm.endTime = '';
      this.searchForm.cameraIds = [];
      this.searchForm.taskName = '';
      this.searchForm.pageSize = 20;
      this.searchForm.pageNo = 1;
      this.searchForm.creatorName = '';
      this.$refs.cameraTree.reset();
      this.eventTracking('VideotapeAnalysisResetBtn');
    },
    /**
     * @description 查询配置研判跳转列表
     * @param {Object} row 任务数据
     */
    async getJudgeButtonList(row) {
      const hasFrequencyPermission = !!this.$store.getters.modulesByAlias(['frequency']).length;
      const hasPeerPermission = !!this.$store.getters.modulesByAlias(['peer']).length;
      this.judgeActionConfig = [];
      // await this.taskDetail(row.batchTaskId);
      const {
        camerIds = [],
        startTime,
        endTime,
        taskName
      } = row;
      // const cameraIds = cameras.map((item) => item.cameraId);
      if (hasFrequencyPermission) {
        this.judgeActionConfig.push({
          label: '频繁出没',
          value: 'frequency',
          query: {
            cameraIds: camerIds,
            startTime,
            endTime,
            jobName: taskName
          }
        });
      }
      if (hasPeerPermission) {
        this.judgeActionConfig.push({
          label: '同行分析',
          value: 'peer',
          query: {
            cameraIds: camerIds,
            startTime,
            endTime,
            jobName: taskName
          }
        });
      }
      // , {
      //   label: '属性检索',
      //   value: 'attribute-search',
      //   query: {
      //     startTime,
      //     endTime,
      //     cameraIds,
      //     sourceType: 'CAMERA'
      //   }
      // }
      // const { code, msg, data } = await videotapeAnalysisSrv.cameraStat(row.batchTaskId);
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
      //         type: 'video',
      //         timeArr: JSON.stringify([startTime, endTime]),
      //         cameraIds: JSON.stringify(cameraIds)
      //       }
      //     });
      //   }
      // } else {
      //   this.$message.error(msg);
      // }
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
    copyTask(data) {
      this.eventTracking('VideotapeAnalysisTaskCopy');
      this.requestMonitorInfo();
      this.formType = 'copy';
      this.isAddShow = true;
      this.detailData = {};
      this.taskDetail(data.batchTaskId);
    },
    async requestMonitorInfo() {
      const { header } = this.$refs;
      if (header) {
        const data = await header.getLastResource();
        this.monitorInfo = data;
      }
    },
    /**
     * (批量)失败重启
     */
    async resumeFailure(data = {}) {
      let params = {
        batchTaskIds: [data.batchTaskId]
      };
      if (data.selections) {
        params = this.createParams(data);
      }
      const { code, msg } = await videotapeAnalysisSrv.resumeFailure(params);
      if (code === 0) {
        this.$message.success({
          message: data.selections && data.selections.length ? '已选任务批量重启成功！' : '任务重启成功',
          showClose: true
        });
        this.searchAnalysisList();
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    async saveEdit(data) {
      const params = pick(data, ['speed', 'taskName', 'priority']);
      const { code, msg } = await videotapeAnalysisSrv.editTask(data.batchTaskId, params);
      if (code === 0) {
        this.$message.success({
          message: '任务修改成功',
          showClose: true
        });
        this.isEditShow = false;
        this.searchAnalysisList();
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    /**
     * 任务详情
     */
    async taskDetail(taskId) {
      const { code, msg, data } = await videotapeAnalysisSrv.taskDetail(taskId);
      if (code === 0) {
        this.detailData = data;
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    async batchTask(data) {
      if (this.isLoading) return;
      this.isLoading = true;
      const { code, msg } = await videotapeAnalysisSrv.batchTask(data);
      if (code === 0) {
        this.$message.success({
          message: '新建任务成功',
          showClose: true
        });
        this.isAddShow = false;
        this.searchAnalysisList();
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
      this.isLoading = false;
    },
    async albumList() {
      const { code, msg, data } = await videotapeAnalysisSrv.albumList();
      if (code === 0) {
        if (data.length) {
          const { albums } = this;
          data.forEach((item) => {
            albums[item.deployObject].push(item);
          });
          this.albums = albums;
        }
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    async createTask() {
      this.eventTracking('VideotapeAnalysisAddTask');
      this.requestMonitorInfo();
      this.detailData = {};
      this.formType = 'add';
      this.isAddShow = true;
    },
    taskData(data) {
      this.eventTracking('VideotapeAnalysisTaskDetail');
      this.detailData = {};
      this.isDetailShow = true;
      this.taskDetail(data.batchTaskId);
    },
    closeTaskDetail() {
      this.isDetailShow = false;
    },
    closeTaskEdit() {
      this.isEditShow = false;
    },
    /**
     * 删除任务
     */
    async deleteTask(data) {
      this.eventTracking('VideotapeAnalysisTaskDelete');
      try {
        await this.$confirm('此操作会删除该任务及该任务产生的解析数据，是否继续？', '提示');
        this.eventTracking('VideotapeAnalysisTaskSureDelete');
        const { code, msg } = await videotapeAnalysisSrv.batchDelete({
          batchTaskIds: [data.batchTaskId]
        });
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
    editSuccess() {
      this.$message.success({
        message: '任务修改成功！',
        showClose: true
      });
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
    async handleEditTask(data) {
      this.eventTracking('VideotapeAnalysisTaskEdit');
      this.detailData = {};
      const { header } = this.$refs;
      if (header) {
        const res = await header.getLastResource();
        this.monitorInfo = res;
      }
      this.taskDetail(data.batchTaskId);
      this.isEditShow = true;
    },
    /**
     * 继续
     */
    async resumeTask(data) {
      this.eventTracking('VideotapeAnalysisTaskGo');
      const { code, msg } = await videotapeAnalysisSrv.batchResume({
        batchTaskIds: [data.batchTaskId]
      });
      if (code === 0) {
        this.$message.success({
          message: '任务继续成功！',
          showClose: true
        });
        this.searchAnalysisList();
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
      this.eventTracking('VideotapeAnalysisTaskStop');
      const { code, msg } = await videotapeAnalysisSrv.batchPause({
        batchTaskIds: [data.batchTaskId]
      });
      if (code === 0) {
        this.$message.success({
          message: '任务暂停成功！',
          showClose: true
        });
        this.searchAnalysisList();
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
    },
    createParams(selects = {}) {
      const { acrossPage, selections } = selects;
      console.log('selections', selections);
      let params = {};
      if (acrossPage) {
        params = cloneDeep(this.searchForm);
        delete params.pageSize;
        delete params.pageNo;
      } else {
        params.batchTaskIds = selections.map((item) => item.batchTaskId);
      }
      return params;
    },
    /**
     * 批量继续
     */
    async batchResume(selects) {
      this.eventTracking('VideotapeAnalysisTaskPLGo');
      const params = this.createParams(selects);
      const { code, msg } = await videotapeAnalysisSrv.batchResume(params);
      this.$refs.analysisTable.batchResumeLoading = false;
      if (code === 0) {
        this.$message.success({
          message: '已选任务批量继续成功！',
          showClose: true
        });
        this.searchAnalysisList();
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
      this.eventTracking('VideotapeAnalysisTaskPLStop');
      const params = this.createParams(selects);
      const { code, msg } = await videotapeAnalysisSrv.batchPause(params);
      this.$refs.analysisTable.batchPauseLoading = false;
      if (code === 0) {
        this.$message.success({
          message: '已选任务批量暂停成功！',
          showClose: true
        });
        this.searchAnalysisList();
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
      this.eventTracking('VideotapeAnalysisTaskPLDelete');
      try {
        await this.$confirm('此操作会删除该任务及该任务产生的解析数据，是否继续？', '提示');
        const params = this.createParams(selects);
        const { code, msg } = await videotapeAnalysisSrv.batchDelete(params);
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
      this.searchForm.status = (value || value === 0) ? [value] : null;
      this.searchAnalysisList();
    },
    /**
     * 统计
     */
    async getStat() {
      const params = cloneDeep(this.searchForm);
      delete params.status;
      const { code, data, msg } = await videotapeAnalysisSrv.getStat(params);
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
      const { id } = this.$route.query;
      if (id) {
        this.searchForm.cameraIds = [id];
        this.$nextTick(() => {
          this.$refs.cameraTree.setCheckedKeys([id]);
        });
        this.searchAnalysisList();
      }
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
      this.eventTracking('VideotapeAnalysisSearchBtn');
    },
    /**
     * @description 检索实时分析列表
     */
    async searchAnalysisList(countable = true) {
      this.isLoading = true;
      const { code, data, msg } = await videotapeAnalysisSrv.getVideotapeTaskList(this.searchForm);
      if (code === 0) {
        this.tableData = data;
      } else {
        this.$message.error({
          message: msg,
          showClose: true
        });
      }
      if (countable) {
        this.getStat(this.searchForm);
      }
      this.isLoading = false;
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
.videotape-analysis{
  .resouce-monitor{
    font-size: 14px;
    color: #A1A7B3;
    margin-left: 16px;
  }
  .analysis-result{
    .radio-group{
      height: 55px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
