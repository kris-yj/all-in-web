<template>
  <page-layout class="file-analysis-detail">
    <common-layout>
      <template slot="left">
        <task-directions
          :task-info="taskInfo"
          :info-loading="infoLoading"
          @edit-task="showEdit"></task-directions>
        <edit-task
          ref="edit"
          :is-edit-show="isEditShow"
          :detail-data="taskInfo"
          :monitor-info="monitorInfo"
          @close-click="isEditShow = false"
          @save-edit="editTask"></edit-task>
      </template>
      <task-file-list
        slot="right"
        :task-item-info="taskItemInfo"
        @getTaskList="getDetailFileList"></task-file-list>
    </common-layout>
  </page-layout>
</template>
<script>
import commonLayout from '@/common-components/common-layout';
import TaskDirections from '../components/task-directions';
import taskFileList from '../components/task-file-list';
import analysisDetailSer from '../analysis-detail.service';
import fileAnalysisSrv from '../file-analysis.service';
import editTask from '../components/edit-task';

export default {
  components: {
    TaskDirections,
    commonLayout,
    taskFileList,
    editTask
  },
  data() {
    return {
      taskInfo: {},
      taskItemInfo: {},
      monitorInfo: {},
      infoLoading: false,
      isEditShow: false,
    };
  },
  created() {
    this.getAnalysisDetailInfo();
  },
  methods: {
    showEdit() {
      this.isEditShow = true;
      this.getLastResource();
    },
    getLastResource() {
      fileAnalysisSrv.getLastResouce().then((res) => {
        if (res.code === 0) {
          this.monitorInfo = res.data;
        }
      });
    },
    /**
     * @description  编辑任务
     * @param {Object} editForm 编辑任务需要提交的表单
     */
    editTask(editForm) {
      const { id } = editForm;
      delete editForm.id;
      analysisDetailSer.editTask(id, editForm).then((res) => {
        if (res.code === 0) {
          this.isEditShow = false;
          this.getAnalysisDetailInfo();
        }
        this.$refs.edit.btnLoading = false;
      });
    },
    /**
     * @description 查询主任务列表明细
     * @param {Object} searchForm 检索使用的表单对象
     */
    getDetailFileList(searchForm) {
      analysisDetailSer.getDetailFileList(searchForm).then((res) => {
        if (res.code === 0) {
          this.taskItemInfo = res.data;
        }
      });
    },
    /**
     * @description 获取文件解析任务详情
     */
    getAnalysisDetailInfo() {
      this.infoLoading = true;
      analysisDetailSer.getAnalysisDetail({
        id: this.$route.query.id
      }).then((res) => {
        if (res.code === 0) {
          this.taskInfo = res.data;
          this.infoLoading = false;
        }
      });
    }
  }
};
</script>
