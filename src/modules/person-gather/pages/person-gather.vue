<template>
  <page-layout>
    <div class="gather-wrap">
      <div class="gather-list-header">
        <div class="header-title">
          <meg-return-button
            :title="$t('人员聚类')"
            :button-visible="false"></meg-return-button>
          <span
            class="gather-list-count">
            <span class="task-stats">
              {{ $t('正在执行') }}(
              <span class="count-num">{{ progerssStats.process }}</span>/<span class="count-num">{{ progerssStats.total }}</span>)
            </span>
            <span class="task-stats">
              {{ $t('已完成') }}(
              <span class="count-num">{{ progerssStats.finish }}</span>/<span class="count-num">{{ progerssStats.total }}</span>)
            </span>
            <span class="task-stats">
              {{ $t('已终止') }} (<span class="count-num">{{ progerssStats.terminate }}</span>/ <span class="count-num">{{ progerssStats.total }}</span>)
            </span>
            <span class="task-stats">
              {{ $t('已失败') }} (<span class="count-num">{{ progerssStats.error }}</span>/ <span class="count-num">{{ progerssStats.total }}</span>)
            </span>
          </span>
        </div>
        <div class="action-btns">
          <meg-button
            type="primary"
            v-if="analysisManage"
            @click="showNewTaskDialog">
            {{ $t('新建任务') }}
          </meg-button>
        </div>
      </div>
      <div class="gather-list-content">
        <gather-list
          :list-data="gatherListData"
          :task-status-data="taskStatusData"
          :list-loading="listLoading"
          @show-detail-dialog="showDetailDialog"
          @restart-task="restartTask"
          @delete-task="confirmDelete"
          @stop-task="stopTask"></gather-list>
      </div>
      <div class="person-gather-pagition">
        <meg-pagination
          :total="total"
          :current-page.sync="listPagerInfo.pageNo"
          :page-size="listPagerInfo.pageSize"
          @size-change="sizeChange"
          @current-change="currentChange">
        </meg-pagination>
      </div>
      <gather-new-task
        ref="newTask"
        :rules="rules"
        :job-id="jobId"
        :is-visible="newTaskDialogVisible"
        :video-tree-data="videoTreeData"
        @close-dialog="closeNewTaskDialog"
        @query-gather-list="queryGatherList"
        @upload-file="uploadFile"
        @generate-job-id="generateJobId"></gather-new-task>
      <gather-detail-dialog
        v-if="detailDialogVisible"
        :rules="rules"
        :detail-dialog-visible="detailDialogVisible"
        :detail-dialog-data="detailDialogData"
        @edit-job-name="editJobName"
        @close-detail-dialog="closeDetailDialog"></gather-detail-dialog>
    </div>
  </page-layout>
</template>

<script>

import commonSwitchParams from '@/common-components/common-switch-params';
import Rules from '../person-gather.rule';
import PersonGatherSrv from '../person-gather.service';
import GatherList from '../components/gather-list';
import GatherNewTask from '../components/new-task';
import GatherDetailDialog from '../components/gather-detail';

export default {
  components: {
    GatherList,
    GatherNewTask,
    GatherDetailDialog
  },
  data() {
    return {
      listPagerInfo: {
        pageNo: 1,
        pageSize: 20,
      },
      gatherListData: [],
      taskStatusData: [],
      listLoading: false,
      total: 0,
      progerssStats: {},
      rules: Rules.addTask(null),
      jobId: '',
      newTaskDialogVisible: false,
      detailDialogVisible: false,
      detailDialogData: {}, // 任务详情弹框数据
      videoTreeData: [], // 文件中心视频列表
      delay: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })()
    };
  },
  computed: {
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('person-gather', 'analysisManage');
    }
  },
  async created() {
    this.queryGatherList();
    this.queryProgerssStats();
    await this.getFileCenterList();
  },
  mounted() {
    // 携图跳转接受
    this.reveiverQuery();
  },
  beforeDestroy() {
    clearInterval(this.taskTimeOut);
  },
  methods: {
    /*
    * 如果不需要上传文件，还需要走一下这个接口
    * @param {any}
    * @return
    * */
    async uploadFile(params) {
      const res = await PersonGatherSrv.uploadFile(params);
      if (res.code === 0) {
        this.$message.success(this.$t('任务创建成功！'));
      } else {
        this.$message.error(this.$t('任务创建失败'));
      }
      this.closeDetailDialog();
    },
    reveiverQuery() {
      const { query } = this.$route;
      commonSwitchParams.getOriginalQuery(query).then(async (params) => {
        if (Object.keys(params).length === 1 && params.pageType) return;
        if (params.id) {
          this.newTaskDialogVisible = true;
          this.delay.p.then(() => {
            this.$nextTick(() => {
              if (this.$refs.newTask) this.$refs.newTask.setChecked(params);
            });
          });
        }
      });
    },
    /*
    * 编辑任务名字
    * @param {any}
    * @return
    * */
    async editJobName(params) {
      const res = await PersonGatherSrv.modifyJobName(params);
      if (res.code === 0) {
        this.$message.success(this.$t('编辑成功'));
      } else {
        this.$message.error(this.$t('编辑失败'));
      }
    },
    /*
    * 详情弹框
    * @param {any}
    * @return
    * */
    async showDetailDialog(id) {
      const params = { id };
      const res = await PersonGatherSrv.queryTaskDetail(params);
      if (res.code === 0) {
        this.detailDialogData = res.data;
        this.rules = Rules.addTask(res.data.id);
        this.detailDialogVisible = true;
      } else {
        this.$message.error(this.$t('任务详情请求失败'));
      }
    },
    closeDetailDialog() {
      this.detailDialogVisible = false;
    },
    /*
    * 获取文件中心视频列表
    * @param {any}
    * @return
    * */
    getFileCenterList() {
      return PersonGatherSrv.queryDoneJobVideos().then((res) => {
        if (res.code === 0) {
          this.videoTreeData = res.data.map((item) => ({
            ...item,
            record: item.record.map((val) => ({ ...val, key: val.resourceId })),
            key: item.taskId
          }));
          this.delay.r();
        }
      });
    },
    /*
    * 生成任务id
    * @param {any}
    * @return
    * */
    async generateJobId(params) {
      const res = await PersonGatherSrv.createTask(params);
      if (res.code === 0) {
        if (params.clusterType === 'PACKAGE') {
          this.$message.success(this.$t('压缩包正在上传，请勿离开或刷新页面，可到任务列表中查看上传进度'));
        }
        this.jobId = res.data.jobId;
        this.newTaskDialogVisible = false;
        this.queryGatherList();
      } else {
        this.$message.error(this.$t('创建失败'));
      }
    },
    /*
    * 打开新建任务弹框
    * @param {any}
    * @return
    * */
    showNewTaskDialog() {
      this.rules = Rules.addTask(null);
      this.newTaskDialogVisible = true;
    },
    /*
    * 关闭新建任务弹框
    * @param {any}
    * @return
    * */
    closeNewTaskDialog() {
      this.newTaskDialogVisible = false;
    },
    /*
    * 确认删除弹框
    * @param {any}
    * @return
    * */
    confirmDelete(data) {
      this.$confirm(this.$t('您确定要删除此任务吗，删除后将不可恢复'), this.$t('删除任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.deleteTask(data);
      }).catch(() => {
      });
    },
    /*
    * 删除列表任务
    * @param {any}
    * @return
    * */
    async deleteTask(data) {
      const res = await PersonGatherSrv.deleteTask({ id: data.id });
      if (res.code === 0) {
        this.$message.success(this.$t('任务删除成功'));
        this.queryGatherList();
      } else {
        this.$message.error(this.$t('任务删除失败'));
      }
    },
    /*
    * 终止列表任务
    * @param {any}
    * @return
    * */
    async stopTask(data) {
      const res = await PersonGatherSrv.stopTask({ id: data.jobId });
      if (res.code === 0) {
        this.$message.success(this.$t('任务终止成功'));
        this.queryGatherList();
      } else {
        this.$message.error(this.$t('任务终止失败'));
      }
    },
    /*
    * 重新启动任务
    * @param {any}
    * @return
    * */
    async restartTask(data) {
      const res = await PersonGatherSrv.restartTask({ id: data.id });
      if (res.code === 0) {
        this.$message.success(this.$t('任务重新启动成功'));
        this.queryGatherList();
      } else {
        this.$message.error(this.$t('任务重新启动失败'));
      }
    },
    /*
    * 人员聚类任务列表
    * @param {any}
    * @return
    * */
    async queryGatherList() {
      const { pageNo, pageSize } = this.listPagerInfo;
      const params = {
        pageNo,
        pageSize,
      };
      const res = await PersonGatherSrv.queryGatherList(params);
      if (res.code !== 0) {
        this.$message(res.msg || this.$t('请求失败'));
        return;
      }
      const { data } = res;
      this.gatherListData = data.records;
      this.total = data.totalRecords;
      // 以重复延迟的方式达到轮询的结果，避免轮询时间由于后端接口响应或者网络波动而不一致
      clearTimeout(this.taskTimeOut);
      this.taskTimeOut = setTimeout(() => {
        this.queryGatherList();
        this.queryProgerssStats();
      }, 5000);
    },
    /*
    * 列表分页条数改变
    * @param {size} 分页条数
    * @return
    * */
    sizeChange(size) {
      this.listPagerInfo = {
        pageSize: size,
        pageNo: 1
      };
      this.queryGatherList();
    },
    /*
    * 当前页数改变
    * @param {page} 当前页数
    * @return
    * */
    currentChange(page) {
      this.listPagerInfo = {
        pageSize: this.listPagerInfo.pageSize,
        pageNo: page
      };
      this.queryGatherList();
    },
    /*
    * 当前任务状态统计
    * @param {page} 当前页数
    * @return
    * */
    async queryProgerssStats() {
      const res = await PersonGatherSrv.queryProgerssStats();
      if (res.code !== 0) {
        this.$message(res.msg || this.$t('请求失败'));
      }
      this.progerssStats = res.data;
    }
  }
};
</script>

<style scoped lang="scss">
.task-stats{
  margin-right: 30px;
}
.gather-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background-color: rgb(220, 224, 228);
}
.gather-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 56px;
  color: #435068;
  padding: 0 20px 0 25px;
  box-sizing: border-box;
  .header-title{
    display: flex;
    align-items: center;
  }
  .meg-return-button {
    margin-right: 30px;
  }
  .gather-list-count {
    color: #435068;
    font-size: 12px;
    .count-num {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
.gather-list-content{
  margin: 0 10px;
  height: calc(100% - 105px);
}
.person-gather-pagition{
  background: white;
  height: 50px;
}
</style>
