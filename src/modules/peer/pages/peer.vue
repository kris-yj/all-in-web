<template>
  <page-layout>
    <div class="peer__lists">
      <div class="lists__title">
        <meg-return-button
          :title="$t('同行分析')"
          :button-visible="false"></meg-return-button>
        <span class="task-stats">{{ $t('正在执行') }}<span class="number-font">（{{ taskStatis.process }}/{{ taskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已完成') }}<span class="number-font">（{{ taskStatis.finish }}/{{ taskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已终止') }}<span class="number-font">（{{ taskStatis.terminate }}/{{ taskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已失败') }}<span class="number-font">（{{ taskStatis.error }}/{{ taskStatis.total }}）</span></span>
        <div
          v-if="analysisManage"
          class="new__task">
          <meg-button
            @click="newTask"
            type="primary">
            {{ $t('新建任务') }}
          </meg-button>
        </div>
      </div>
      <div
        class="lists__content"
        v-loading="tableLoading">
        <meg-table
          stripe
          :key="tableId"
          :data="taskListData"
          ref="elTable"
          center="true"
          height="100%"
          :default-sort="{prop: 'date', order: 'descending'}"
          style="width: 100%">
          <div
            slot="empty"
            v-background="totalRecords || tableLoading ? false:{icon:'icon_1',text: $t('暂无数据')}">
          </div>
          <meg-table-column
            :label="$t('任务名称')"
            sortable
            sort-by="jobName"
            align="left">
            <template slot-scope="scope">
              <span
                class="jobName__item"
                v-if="scope.row.jobStatus === 'JOB_FINISHED' && scope.row.resultCount !== 0"
                @click="taskDetail(scope.row)"
                type="text">{{ scope.row.jobName }}</span>
              <span v-else>{{ scope.row.jobName }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            :label="$t('状态')"
            sortable
            sort-by="jobStatus"
            align="left">
            <template slot-scope="scope">
              <span :class="{'error-text':scope.row.jobStatus==='JOB_ERROR'}">{{ dicMap(taskStatusMap,scope.row.jobStatus) }}</span>
              <span v-if="scope.row.jobStatus=== 'JOB_RUNNING'">{{ scope.row.jobProgress+"%" }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="resultCount"
            :label="$t('结果数')"
            sortable
            align="center">
          </meg-table-column>
          <meg-table-column
            prop="createTime"
            :label="$t('创建时间')"
            sortable
            align="left">
          </meg-table-column>
          <meg-table-column
            prop="creatorName"
            :label="$t('创建用户')"
            sortable
            align="left">
          </meg-table-column>
          <meg-table-column
            prop="creatorOrgName"
            :label="$t('创建部门')"
            sortable
            align="left">
          </meg-table-column>
          <meg-table-column
            prop="appearCount"
            :label="$t('上传图片')"
            align="left">
            <template slot-scope="scope">
              <div class="table-img-box">
                <meg-img-container
                  :img-src="photoUrl(scope)">
                </meg-img-container>
              </div>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="address"
            :label="$t('操作')"
            align="center"
            width="236px">
            <template slot-scope="scope">
              <meg-button
                v-if="analysisManage"
                @click="copyTask(scope.row)"
                type="text">
                {{ $t('复制') }}
              </meg-button>
              <meg-button
                v-if="analysisManage && (scope.row.jobStatus === 'JOB_RUNNING' || scope.row.jobStatus === 'JOB_PREPARING' )"
                @click="cancelTask(scope.row)"
                type="text">
                {{ $t('终止') }}
              </meg-button>
              <meg-button
                v-if="analysisManage && scope.row.jobStatus ==='JOB_TERMINATE' || scope.row.jobStatus === 'JOB_ERROR'"
                @click="restartTask(scope.row)"
                type="text">
                {{ $t('重新开始') }}
              </meg-button>
              <meg-button
                v-if="analysisManage"
                type="text"
                @click="taskDelete(scope.row)">
                {{ $t('删除') }}
              </meg-button>
              <meg-button
                @click="checkTaskInfo(scope.row)"
                type="text">
                {{ $t('详情') }}
              </meg-button>
            </template>
          </meg-table-column>
        </meg-table>
      </div>
      <div class="task__page">
        <meg-pagination
          :total="totalRecords"
          @size-change="sizeChange"
          @current-change="currentChange">
        </meg-pagination>
      </div>
      <task-dialog
        ref="taskDialog"
        :form-data="taskFormData"
        :type="taskType"
        :visible.sync="taskDialogVisible"
        @taskConfirm="taskConfirm">
      </task-dialog>
      <peer-dialog
        class="detail__main"
        ref="peerDialog"
        :response-flag="responseFlag"
        :type="taskType"
        :visible.sync="peerDialogVisible"
        @taskConfirm="taskConfirm"
        @modifyJobName="modifyJobName">
      </peer-dialog>
    </div>
  </page-layout>
</template>

<script>
import moment from 'moment';
import commonSwitchParams from '@/common-components/common-switch-params';
import { switchToModule } from '@/utils/utils.js';
import PeerSrv from '@/modules/peer/peer.service.js';
import TaskDialog from '../components/task-dialog.vue';
import PeerDialog from '../components/peer-dialog.vue';

/**
 * 表单默认数据
 */
const TaskForm = function (interval) {
  const DATE = new Date();
  const end = DATE.setHours(23, 59, 59, 999);
  const start = DATE.setHours(0, 0, 0, 0) - 6 * 24 * 60 * 60 * 1000;
  this.jobName = '';
  this.appearCount = 2;
  this.startTime = start;
  this.endTime = end;
  this.cameraIds = [];
  this.interval = interval;
  this.face = {};
};

export default {
  components: {
    TaskDialog,
    PeerDialog
  },
  data() {
    return {
      taskFormData: {},
      taskType: '',
      taskDialogVisible: false,
      peerDialogVisible: false,
      taskStatis: {},
      newPersonShow: false,
      personDetailShow: false,
      taskListData: [], // 任务详情列表
      totalRecords: 0, // 任务总数
      tableId: +new Date(),
      taskListsParam: {
        pageNo: 1,
        // 列表分页
        pageSize: 20
      },
      detailData: {},
      taskStatusMap: [],
      interval: 1,
      tableLoading: true,
      responseFlag: 'success',
      taskTimeOut: '',
    };
  },
  computed: {
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('peer', 'analysisManage');
    },
  },
  created() {
    this.taskStatusMap = this.$store.getters.dataMapByType('job_status');
    this.interval = this.$store.getters.system.peerIntervals.value;
    this.init();
  },
  mounted() {
    this.reveiverQuery();
  },
  destroyed() {
    clearTimeout(this.taskTimeOut);
  },
  methods: {
    reveiverQuery() {
      const { query } = this.$route;
      commonSwitchParams.getOriginalQuery(query).then((params) => {
        if (Object.keys(params).length === 1 && params.pageType) return;
        const {
          jumpWithImgInfo,
        } = params;
        if (params.cameraIds) {
          this.taskFormData = {
            ...new TaskForm(this.interval),
            jobName: params.jobName || null,
            startTime: params.startTime,
            endTime: params.endTime,
            cameraIds: params.cameraIds,
          };
        } else {
          this.taskFormData = new TaskForm(this.interval);
        }
        let fileList = [];
        if (jumpWithImgInfo) {
          const { photo } = jumpWithImgInfo;
          fileList = [{
            ...photo,
            photo: jumpWithImgInfo.photoUrl,
          }];
          fileList[0].couldEdit = true;
          fileList[0].goAnalyze = false;
          this.$nextTick(() => {
            if (this.$refs.taskDialog) this.$refs.taskDialog.setInitFile(fileList);
          });
        }
        this.taskVisible();
      });
    },
    photoUrl(scope) {
      return scope.row.photoInfo && scope.row.photoInfo.photoUrl;
    },
    taskVisible() {
      this.taskType = 'add';
      this.taskDialogVisible = true;
    },
    /**
     * 初始化 列表和统计信息
     */
    init() {
      this.getList();
      this.getStatistics();
    },
    /**
     * 任务弹窗的确认回调函数
     * @param {task} 回调参数
     */
    taskConfirm(task) {
      PeerSrv.addTask(task).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('新建任务成功！'));
          this.taskDialogVisible = false;
          this.init();
        }
      });
    },
    /**
     * 编辑任务名
     * @param {Object} 修改参数
     * @returns
     */
    modifyJobName(params) {
      PeerSrv.modifyJobName(params).then((res) => {
        const timeStamp = new Date().getTime();
        if (res.code === 0) {
          this.responseFlag = `success_${timeStamp}`;
          this.init();
        } else {
          this.responseFlag = `error_${timeStamp}`;
        }
      });
    },
    /**
       * 获取进度统计
       * @augments
       */
    getStatistics() {
      PeerSrv.peerStatistics().then((response) => {
        if (response.code === 0) {
          this.taskStatis = response.data;
        }
      });
    },
    /**
       * 获取任务比对详情
       * @augments row 任务信息
       */
    taskDetail(row) {
      const query = { uid: row.jobId, jobName: row.jobName };
      switchToModule({
        module: 'peer',
        child: 'peer-task-detail',
        query
      });
    },
    /**
       * 获取列表信息
       * @augments
       */
    getList() {
      PeerSrv.getPeerList(this.taskListsParam).then((res) => {
        if (res.code === 0) {
          if (res.data.pageNo !== this.taskListsParam.pageNo) { return; }
          res.data.records.forEach((item) => {
            item.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss');
          });
          this.taskListData = res.data.records;
          this.totalRecords = res.data.totalRecords;
        } else {
          this.$message.error(res.msg);
        }
        // 以重复延迟的方式达到轮询的结果，避免轮询时间由于后端接口响应或者网络波动而不一致
        clearTimeout(this.taskTimeOut);
        this.taskTimeOut = setTimeout(() => { this.init(); }, 5000);
        this.tableLoading = false;
      });
    },

    /**
     * 删除单个任务
     * @augments params 当前项数据
     */
    deleteTask(params) {
      PeerSrv.deleteTask(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('删除成功！'));
          this.init();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 删除单个任务
     * @augments task 当前项数据
     */
    taskDelete(task) {
      this.$confirm(this.$t('您确定要删除此任务吗，删除后将不可恢复'), this.$t('删除任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.deleteTask(task.jobId);
      }).catch(() => {
      });
    },
    /**
     * 新建任务
     */
    newTask() {
      this.taskType = 'add';
      this.taskDialogVisible = true;
      this.taskFormData = new TaskForm(this.interval);
    },
    /**
     * 复制任务
     */
    copyTask(task) {
      this.taskType = 'copy';
      PeerSrv.jobDetail(task.jobId).then((res) => {
        if (res.code === 0) {
          this.taskDialogVisible = true;
          this.taskFormData = {
            jobName: `${res.data.jobName}-${this.$t('副本')}`,
            appearCount: res.data.appearCount,
            startTime: res.data.startTime,
            endTime: res.data.endTime,
            cameraIds: res.data.cameras.map((val) => val.cameraId),
            interval: `${res.data.interval}`,
            face: res.data.photoInfo
          };
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 查看任务详情
     */
    checkTaskInfo(task) {
      this.taskType = 'check';
      PeerSrv.jobDetail(task.jobId).then((res) => {
        if (res.code === 0) {
          this.peerDialogVisible = true;
          this.$nextTick(() => {
            this.$refs.peerDialog.setFormData(res.data);
          });
        }
      });
    },
    /**
     * 取消任务
     */
    cancelTask(task) {
      PeerSrv.cancelTask(task.jobId).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('终止成功！'));
          this.init();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 重新开始任务
     */
    restartTask(task) {
      PeerSrv.restartTask(task.jobId).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('重新开始成功！'));
          this.init();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 当分页容量大小改变时触发
     * @augments e 当前容量
     */
    sizeChange(e) {
      this.taskListsParam.pageSize = e;
      this.getList();
    },
    /**
     * 当分页数发生变化时触发
     * @augments e 当前页数
     */
    currentChange(e) {
      this.taskListsParam.pageNo = e;
      this.getList();
    },

    /**
     * 字典表映射
     */
    dicMap(arr, code) {
      if (code) {
        let target = '';
        arr.forEach((obj) => {
          if (obj.code === code.toString()) {
            target = obj.value;
          }
        });
        return target;
      }
      return '';
    },

  },

};
</script>

<style lang='scss' scope>
// @import "@/scss/table-list.scss";
.peer__lists{
  width: 100%;
  height: 100%;
  background-color:rgb(220,224,228);
  .lists__title{
    display: flex;
    align-items: center;
    width: 100%;
    height: 56px;
    position: relative;
    padding: 0 20px 0 25px;
    box-sizing: border-box;
    font-size: 12px;
    color: #435068;
    .meg-return-button{
      margin-right: 30px;
    }
  }

  .task-stats{
    margin-right: 30px;
    .number-font{
      font-size: 14px;
    }
  }
  .new__task{
    position: absolute;
    top:10px;
    right: 20px;
  }
  .lists__content{
    height: calc(100% - 105px);
    margin: 0 10px;
    overflow: auto;
  }
  .task__page{
    height: 50px;
    padding: 0 10px;
    background: white;
  }
  .jobName__item{
    cursor: pointer;
    color: #21539b;
  }
  .table-img-box{
    display: inline-block;
    width: 70px;
    height: 70px;
    overflow: hidden;
  }
}
</style>
