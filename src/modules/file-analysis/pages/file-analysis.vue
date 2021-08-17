<template>
  <page-layout class="file-analysis">
    <common-layout>
      <common-form-container
        @search="searchAnalysisList(true)"
        @reset="resetSearchForm"
        slot="left">
        <resource-header
          slot="header"
          :title="$t('文件解析')"></resource-header>
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
              :start-placeholder="$t('开始日期')"
              :end-placeholder="$t('结束日期')"
              :range-separator="$t('至')"
              :picker-options="pickerOptions">
            </meg-date-picker>
          </meg-form-item>
          <meg-form-item :label="$t('任务名称')">
            <meg-input
              v-model="searchForm.taskName"
              placeholder="请输入任务名称"></meg-input>
          </meg-form-item>
          <meg-form-item :label="$t('创建用户')">
            <meg-input
              v-model="searchForm.creatorName"
              placeholder="请输入用户名称"></meg-input>
          </meg-form-item>
        </meg-form>
      </common-form-container>
      <template slot="right">
        <analysis-result-table
          :columns="columns"
          :loading="isLoading"
          :table-data="tableData"
          :count-info="countInfo"
          :judge-action-config="judgeActionConfig"
          type="file"
          ref="analysisTable"
          @restart-task="restartTask"
          @judge-handle="judgeHandle"
          @get-judge-button-list="getJudgeButtonList"
          @task-detail="taskDetail"
          @create-task="addTask"
          @edit-task="handleEditTask"
          @delete-task="deleteTask"
          @copy-task="copyTask"
          @pause-task="pauseTask"
          @batch-resume="batchResume"
          @batch-restart="restartTask"
          @batch-delete="batchDelete"
          @batch-pause="batchPause"
          @radio-change="searchByStatus"
          @page-change="pageChange"
          @resume-task="resumeTask"
          @sort-change="sortChange"
          @target="toTarget"
          @alarm="toAlarm"></analysis-result-table>
        <add-task
          v-if="isAddShow"
          :visible="isAddShow"
          :monitor-info="monitorInfo"
          :albums="albums"
          :file-list-getter="fileListGetter"
          :path-tree-data="pathTreeData"
          :counts-map="countsMap"
          :form-type="formType"
          :init-data="detailData"
          :is-uploading-file="isUploadingFile"
          :adding="isLoading"
          @cancel="isAddShow = false"
          @creatTask="creatTask"
          @upload-file="uploadFile"></add-task>
        <edit-task
          ref="editTask"
          v-if="isEditShow"
          :is-edit-show="isEditShow"
          :detail-data="detailData"
          :monitor-info="monitorInfo"
          @close-click="isEditShow = false"
          @save-edit="editTask"></edit-task>
      </template>
    </common-layout>
  </page-layout>
</template>

<script>
import configInfo from '@/utils/data-map.utils.js';
import commonLayout from '@/common-components/common-layout';
import commonFormContainer from '@/common-components/common-form-container';
import resourceHeader from '@/components/analysis-resource-header';
import analysisResultTable from '@/components/analysis-result-table/analysis-result-table';
import commonSwitchParams from '@/common-components/common-switch-params';
import { switchToModule } from '@/utils/utils.js';
import { cloneDeep } from 'lodash';
import fileAnalysisSrv from '../file-analysis.service';
import addTask from '../components/add-task';
import editTask from '../components/edit-task';

export default {
  components: {
    commonLayout,
    commonFormContainer,
    resourceHeader,
    analysisResultTable,
    addTask,
    editTask
  },
  data() {
    // 时间选择组件配置信息
    this.pickerOptions = {
      shortcuts: ['today', 'pastThreeDays', 'pastWeek']
    };
    // 检索表格配置
    this.columns = configInfo.fileAnalysisTableConfig;
    return {
      tempValue: [], // 表单时间
      isLoading: false, // 是否正在加载数据
      isUploadingFile: false, // 是否正在上传文件
      tableData: {}, // 检索结果数据
      searchForm: { // 检索表单字段
        taskName: '', // 任务名称
        startTime: '', // 时间戳
        endTime: '', // 时间戳
        pageSize: 20,
        pageNo: 1,
        status: [], // 任务状态
        creatorName: '', // 创建人
        orderBy: '', // 排序字段
        order: '', // 排序规则 ASC,DESC
      },
      isAddShow: false,
      monitorInfo: {}, // 剩余算力
      albums: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      },
      fileListGetter: fileAnalysisSrv.getFileList,
      pathTreeData: [],
      countsMap: {}, // 文件统计
      isEditShow: false, // 是否展示编辑对话框
      detailData: {}, //  任务详情
      countInfo: {}, // 表格的快速筛选按钮配置
      uploadFilePath: '', // 上传的文件生成的地址
      firstName: '', // 上传文件的文件名
      judgeActionConfig: [], // 研判按钮配置
      formType: 'add', // 表单模式：新建、复制
    };
  },
  created() {
    // 检索任务列表
    this.searchAnalysisList();
    // 获取底库列表
    this.albumList();
    // 获取文件信息
    this.fetchCounts();
    // 获取目录信息
    this.fetchPathList();
  },
  methods: {
    /**
     * @description 跳转到历史报警
     * @param {Object} row 当前行数据
     */
    toAlarm(row) {
      switchToModule({
        module: 'alarm-history',
        query: {
          type: 'file',
          timeArr: JSON.stringify(['', '']),
          taskInfos: JSON.stringify([{
            id: row.id,
          }])
        },
        pageType: 'single',
        isBlank: true
      });
    },
    /**
     * @description 跳转到属性检索
     * @param {Object} row 当前行数据
     */
    toTarget(row) {
      new commonSwitchParams.FormatSwitchParams({
        module: 'attribute-search',
        isBlank: true,
        pageType: 'single',
        query: {
          from: 'file-analysis',
          data: {
            sourceType: 'OFFLINE',
            taskInfos: [{
              id: row.id
            }],
          }
        },
      }).switchToModule();
    },
    /**
     * @description 表格排序
     * @param {Object} sortInfo 排序信息
     */
    sortChange(sortInfo) {
      this.searchForm.pageNo = 1;
      this.searchForm.orderBy = sortInfo.prop;
      this.searchForm.order = sortInfo.order === 'ascending' ? 'ASC' : 'DESC';
      this.searchAnalysisList();
    },
    /**
     * @description 复制任务
     * @param {any}
     * @returns
     */
    copyTask(data) {
      this.eventTracking('FileAnalysisTaskCopy');
      this.formType = 'copy';
      this.getDetailData(data.id);
      this.isAddShow = true;
      this.getLastResource();
    },
    /**
     * @description 重置检索表单
     */
    resetSearchForm() {
      this.eventTracking('FileAnalysisResetBtn');
      this.searchForm.taskName = '';
      this.searchForm.creatorName = '';
      this.tempValue = [];
      this.searchForm.startTime = '';
      this.searchForm.endTime = '';
    },
    /**
     * @description 查询配置研判跳转列表
     * @param {Object} row 任务数据
     */
    getJudgeButtonList() {
      this.judgeActionConfig = [{
        label: this.$t('人员聚类'),
        value: 'person-gather'
      }];
    },
    /**
     * @description 配置研判跳转列表
     * @param {Object} row 任务与跳转信息
     */
    judgeHandle(row) {
      switchToModule({
        module: row.alias,
        query: {
          jobName: row.taskName,
          id: JSON.stringify(row.resourceIds),
        },
        pageType: 'single',
        isBlank: true
      });
    },
    /**
     * @description 上传文件信息
     * @param {Object} file 上传的文件信息
     */
    uploadFile(file) {
      if (file) {
        this.isUploadingFile = true;
        const formData = new FormData();
        formData.append('file', file.raw);
        fileAnalysisSrv.uploadAnalyzePhoto(formData).then((res) => {
          if (res.code === 0) {
            this.uploadFilePath = res.data.path;
            this.firstName = res.data.firstName;
            this.isUploadingFile = false;
          }
        });
      } else {
        this.uploadFilePath = '';
      }
    },
    /**
     * @description 分页信息改变
     * @param {Object} pageInfo 分页配置信息
     */
    pageChange(pageInfo) {
      this.searchForm.pageSize = pageInfo.pageSize;
      this.searchForm.pageNo = pageInfo.pageNo;
      this.searchAnalysisList();
    },
    /**
     * @description 获取任务统计数据
     */
    getTaskStatusStatistics() {
      const params = cloneDeep(this.searchForm);
      delete params.pageSize;
      delete params.pageNo;
      delete params.status;
      fileAnalysisSrv.getTaskStatusStatistics(params).then((res) => {
        if (res.code === 0) {
          this.countInfo = res.data;
        }
      });
    },
    /**
     * @description 按照任务状态进行分类检索
     * @param {Number} value 任务状态值
     */
    searchByStatus(value) {
      if (value === '') { // 点击全部筛选button
        this.searchForm.status = [];
        this.eventTracking('FileAnalysisTaskAllTab');
      } else if (value === 1) { // 点击正在进行筛选button
        this.eventTracking('FileAnalysisTaskDoingTab');
        this.searchForm.status = [value];
      } else {
        this.searchForm.status = [value];
      }
      this.searchAnalysisList();
    },
    /**
     * @description 批量暂停
     * @param {Object} itemListInfo 要操作的被选中的列表对象
     */
    batchPause(itemListInfo, isBatch = true) {
      fileAnalysisSrv.pauseTask({
        batchTaskIds: itemListInfo.selections.map((item) => item.id)
      }).then((res) => {
        this.$refs.analysisTable.batchPauseLoading = false;
        if (res.code === 0) {
          this.$message.success({
            message: `已选任务${isBatch ? '批量' : ''}暂停成功！`,
            showClose: true
          });
          this.searchAnalysisList();
        } else {
          this.$message.error({
            message: res.msg,
            showClose: true
          });
        }
      });
    },
    /**
     * @description 批量删除
     * @param {Object} itemListInfo 要操作的被选中的列表对象
     */
    batchDelete(itemListInfo, isBatch = true) {
      this.$confirm(this.$t('此操作会删除该任务及该任务产生的解析数据，是否继续？'), this.$t('删除任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        fileAnalysisSrv.deleteTask({
          batchTaskIds: itemListInfo.selections.map((item) => item.id)
        }).then((res) => {
          if (res.code === 0) {
            this.$message.success({
              message: `任务${isBatch ? '批量' : ''}删除成功！`,
              showClose: true
            });
            this.searchAnalysisList();
          } else {
            this.$message.error({
              message: res.msg,
              showClose: true
            });
          }
        });
      }).then(() => {
        console.log('取消删除');
      });
    },
    /**
     * @description 批量继续
     * @param {Object} itemListInfo 要操作的被选中的列表对象
     */
    batchResume(itemListInfo, isBatch = true) {
      fileAnalysisSrv.restartTask({
        batchTaskIds: itemListInfo.selections.map((item) => item.id)
      }).then((res) => {
        this.$refs.analysisTable.batchResumeLoading = false;
        if (res.code === 0) {
          this.$message.success({
            message: `已选任务${isBatch ? '批量' : ''}继续成功！`,
            showClose: true
          });
          this.searchAnalysisList();
        } else {
          this.$message.error({
            message: res.msg,
            showClose: true
          });
        }
      });
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
        params.batchTaskIds = selections.map((item) => item.id);
      }
      return params;
    },
    /**
     * @description 继续文件解析任务
     * @param {Object} itemInfo 任务信息
     */
    restartTask(itemInfo) {
      this.eventTracking('FileAnalysisTaskGo');
      let params = {
        batchTaskIds: [itemInfo.id]
      };
      if (itemInfo.selections) {
        params = this.createParams(itemInfo);
      }
      fileAnalysisSrv.resumeTask(params).then((res) => {
        if (res.code === 0) {
          this.$message.success({
            message: '任务重启成功！',
            showClose: true
          });
          this.searchAnalysisList();
        } else {
          this.$message.error({
            message: res.msg,
            showClose: true
          });
        }
      });
    },
    /**
     * @description 失败启动文件解析任务
     * @param {Object} itemInfo 任务信息
     */
    resumeTask(itemInfo) {
      this.batchResume({ selections: [itemInfo] }, false);
    },
    /**
     * @description 暂停文件解析任务
     * @param {Object} itemInfo 任务信息
     */
    pauseTask(itemInfo) {
      this.eventTracking('FileAnalysisTaskStop');
      this.batchPause({ selections: [itemInfo] }, false);
    },
    /**
     * @description 删除文件解析任务
     * @param {Object} itemInfo 任务信息
     */
    deleteTask(itemInfo) {
      this.eventTracking('FileAnalysisTaskDelete');
      this.batchDelete({ selections: [itemInfo] }, false);
    },
    /**
     * @description  编辑任务
     * @param {Object} editForm 编辑任务需要提交的表单
     */
    editTask(editForm) {
      this.eventTracking('FileAnalysisTaskEdit');
      const { id } = editForm;
      delete editForm.id;
      fileAnalysisSrv.editTask(id, editForm).then((res) => {
        if (res.code === 0) {
          this.$message.success({
            message: '任务编辑成功！',
            showClose: true
          });
          this.isEditShow = false;
          this.searchAnalysisList();
        } else {
          let { msg } = res;
          if (msg === 'GALAXY_ANALYSIS_TASK_NAME_REPEAT') {
            msg = '任务名称重复！';
          }
          this.$message.error({
            message: msg,
            showClose: true
          });
        }
        this.$refs.editTask.btnLoading = false;
      });
    },
    /**
     * @description 编辑任务
     * @param {Object} item 任务信息
     */
    handleEditTask(item) {
      this.getLastResource();
      this.getDetailData(item.id);
      this.isEditShow = true;
      this.detailData = {};
    },
    /**
     * @description 获取任务详情信息
     * @param {String} id 当前任务id
     */
    async getDetailData(id) {
      this.detailData = {};
      const { code, data } = await fileAnalysisSrv.getAnalysisDetail({ id });
      if (code === 0) {
        this.detailData = data;
      }
    },
    /**
     * @description 创建文件解析任务
     * @param {Object} 创建任务表单
     */
    creatTask(formData) {
      if (this.isLoading) return false;
      if (formData.autoCompare) {
        if (formData.doPackage) {
          if (!this.uploadFilePath) {
            return this.$message.error({
              message: '请上传图片压缩包！',
              showClose: true
            });
          }
          formData.filePath = this.uploadFilePath;
          formData.fileName = this.firstName;
        } else {
          if (!formData.albums || !formData.albums.length) { // eslint-disable-line
            return this.$message.error({
              message: '请选择底库！',
              showClose: true
            });
          }
        }
      }
      this.isLoading = true;
      fileAnalysisSrv.creatAnalysisTask(formData).then((res) => {
        if (res.code === 0) {
          this.$message.success({
            message: '任务创建成功！',
            showClose: true
          });
          this.isAddShow = false;
          this.searchAnalysisList();
        } else {
          let { msg } = res;
          if (msg === 'GALAXY_ANALYSIS_TASK_NAME_REPEAT') {
            msg = '任务名称重复！';
          }
          this.$message.error({
            message: msg,
            showClose: true
          });
        }
        this.isLoading = false;
      });
      return false;
    },
    /**
     * @description 获取文件个数统计数据
     */
    fetchCounts() {
      fileAnalysisSrv.queryCounts().then((res) => {
        if (res.code === 0) {
          const countsMap = {};
          res.data.counts.forEach((item) => {
            countsMap[item.id] = item.images + item.videos;
          });
          this.countsMap = countsMap;
        }
      });
    },
    /**
     * @description 获取文件夹目录列表
     */
    fetchPathList() {
      this.floderLoading = true;
      fileAnalysisSrv.getPathList({
        filterFtp: 1
      }).then((res) => {
        if (res.code === 0) {
          const pathList = res.data.paths;
          this.pathTreeData = this.createTree(pathList);
          this.floderLoading = false;
        }
      });
    },
    /**
     * @description 生成文件树（迁移结构化方法）
     */
    createTree(data, id) {
      const arr = [];
      data.forEach((item) => {
        if (item.parentId === id) {
          const childItems = this.createTree(data, item.id);
          const newItem = { ...item };
          if (childItems.length > 0) {
            newItem.children = childItems;
          }
          newItem.label = newItem.name;
          arr.push(newItem);
        }
      });
      return arr;
    },
    /**
     * @description 获取底库数据
     */
    async albumList() {
      const { code, msg, data } = await fileAnalysisSrv.albumList({
        deployObject: [1, 2, 3, 4, 5],
        type: [2, 3]
      });
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
    /**
     * @description 查看解析任务详情
     * @param {Object} itemDetail 当前解析任务条目数据
     */
    taskDetail(itemDetail) {
      switchToModule({
        module: 'file-analysis',
        child: 'analysis-detail',
        query: { id: itemDetail.id },
        isBlank: false
      });
    },
    /**
     * @description 新建文件解析任务
     */
    addTask() {
      this.eventTracking('FileAnalysisAddTask');
      this.formType = 'add';
      this.isAddShow = true;
      this.detailData = {};
      this.getLastResource();
    },
    /**
     * @description 检索文件分析列表
     * @param {Boolean} btnClick 是否由检索按钮触发
     */
    searchAnalysisList(btnClick) {
      if (btnClick) {
        this.searchForm.pageNo = 1;
        this.eventTracking('FileAnalysisResetBtn');
      }
      this.isLoading = true;
      fileAnalysisSrv.getFileAnalysisList(this.searchForm).then((res) => {
        this.isLoading = false;
        if (res.code === 0) {
          this.tableData = res.data;
          // 获取任务状态统计信息
          this.getTaskStatusStatistics();
        }
      });
    },
    /**
     * 时间日期改变时触发
     * @param {date} 改变后的时间
     * @returns
     */
    getDateValue(date) {
      if (date && date.length) {
        this.searchForm.startTime = +date[0];
        this.searchForm.endTime = +date[1];
      } else {
        this.searchForm.startTime = '';
        this.searchForm.endTime = '';
      }
    },
    /**
     * @description 获取解析服务器资源使用情况
     */
    getLastResource() {
      fileAnalysisSrv.getLastResouce().then((res) => {
        if (res.code === 0) {
          this.monitorInfo = res.data;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
