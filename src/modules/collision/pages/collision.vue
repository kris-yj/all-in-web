<template>
  <page-layout>
    <div class="frequency__lists">
      <div class="lists__title">
        <div>
          <meg-return-button
            :title="$t('底库碰撞')"
            :button-visible="false"></meg-return-button>
          <span class="task-stats">{{ $t('正在执行') }}<span style="font-size:14px">（{{ taskStats.running }}/{{ totalCount ||0 }}）</span></span>
          <span class="task-stats">{{ $t('已完成') }}<span style="font-size:14px">（{{ taskStats.finished }}/{{ totalCount ||0 }}）</span></span>
          <span class="task-stats">{{ $t('已暂停') }}<span style="font-size:14px">（{{ taskStats.paused }}/{{ totalCount ||0 }}）</span></span>
          <span class="task-stats">{{ $t('已终止') }}<span style="font-size:14px">（{{ taskStats.terminate }}/{{ totalCount ||0 }}）</span></span>
          <span class="task-stats">{{ $t('已失败') }}<span style="font-size:14px">（{{ taskStats.error }}/{{ totalCount ||0 }}）</span></span>
        </div>
        <meg-button
          v-if="analysisManage"
          @click="newTask"
          type="primary">
          {{ $t('新建任务') }}
        </meg-button>
      </div>
      <div
        class="lists__content"
        v-loading="loading">
        <meg-table
          stripe
          :key="tableId"
          :data="taskListData"
          ref="elTable"
          center="true"
          height="100%"
          style="width: 100%">
          <div
            slot="empty"
            v-background="showBackground ? {image:'bg_1',icon:'icon_1',text: $t('暂无数据')} : false">
          </div>
          <meg-table-column
            :label="$t('任务名称')"
            sortable
            sort-by="name">
            <template slot-scope="scope">
              <span
                class="jobName__item"
                v-if="(scope.row.status==='JOB_FINISHED'||scope.row.status==='JOB_PAUSED')&&scope.row.resultCount>0"
                type="text"
                @click="taskDetail(scope.row)">{{ scope.row.name }}</span>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            :label="$t('状态')"
            sortable
            sort-by="status">
            <template slot-scope="scope">
              <span :class="{'error-text':scope.row.jobStatus==='JOB_ERROR'}">{{ dicMap(taskStatusMap,scope.row.status) }}</span>
              <span v-if="scope.row.status=== 'JOB_RUNNING'">{{ scope.row.jobProgress }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            :label="$t('结果数')"
            sortable
            align="center"
            sort-by="resultCount">
            <template slot-scope="scope">
              <span>{{ scope.row.resultCount }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="createTime"
            :label="$t('创建时间')"
            sortable>
            <template slot-scope="scope">
              <span>{{ scope.row.createTime | date }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="creatorName"
            :label="$t('创建用户')"
            sortable>
          </meg-table-column>
          <meg-table-column
            prop="creatorOrgName"
            :label="$t('创建部门')"
            sortable>
          </meg-table-column>
          <meg-table-column
            sortable
            sort-by="albumName1"
            :label="$t('底库')">
            <template slot-scope="scope">
              <span
                :class="scope.row.albumName1 ? null : 'noneData'"
                v-if="scope.row.singleAlbum">
                {{ scope.row.albumName1 ? scope.row.albumName1 : '底库已删除' }}
              </span>
              <span v-else>
                <span :class="scope.row.albumName1 ? null : 'noneData'">
                  {{ scope.row.albumName1 ? scope.row.albumName1 : '底库已删除' }}
                </span>
                VS
                <span :class="scope.row.albumName2 ? null : 'noneData'">
                  {{ scope.row.albumName2 ? scope.row.albumName2 : '底库已删除' }}
                </span>
              </span>
            </template>
          </meg-table-column>
          <meg-table-column
            :label="$t('操作')"
            align="center">
            <template slot-scope="scope">
              <meg-button
                v-if="analysisManage && (scope.row.status === 'JOB_RUNNING')"
                @click="pauseTask(scope.row)"
                type="text">
                {{ $t('暂停') }}
              </meg-button>
              <meg-button
                v-if="analysisManage && (scope.row.status === 'JOB_PAUSED' )"
                @click="LastTask(scope.row)"
                type="text">
                {{ $t('继续') }}
              </meg-button>
              <meg-button
                v-if="analysisManage"
                @click="copyTask(scope.row)"
                type="text">
                {{ $t('复制') }}
              </meg-button>
              <meg-button
                v-if="analysisManage && (scope.row.status === 'JOB_RUNNING' || scope.row.status === 'JOB_PREPARING' )"
                @click="cancelTask(scope.row)"
                type="text">
                {{ $t('终止') }}
              </meg-button>
              <meg-button
                v-if="analysisManage && (scope.row.status === 'JOB_TERMINATE' || scope.row.status === 'JOB_ERROR' )"
                @click="restartTask(scope.row)"
                type="text">
                {{ $t('重新启动') }}
              </meg-button>
              <meg-button
                v-if="analysisManage"
                type="text"
                @click="deleteTask(scope.row.id)">
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
          :current-page.sync="taskListParam.pageNo"
          :page-size="taskListParam.pageSize"
          @size-change="sizeChange"
          @current-change="currentChange">
        </meg-pagination>
      </div>
      <task-dialog
        :suggest-threshold="suggestThreshold"
        :form-data="taskFormData"
        :type="taskDialogType"
        :visible.sync="showTaskDialog"
        @taskConfirm="taskConfirm">
      </task-dialog>
      <detail-task-dialog
        :suggest-threshold="suggestThreshold"
        :form-data="taskFormData"
        :response-flag="responseFlag"
        :type="taskDialogType"
        :if-auth="analysisManage"
        :visible.sync="showDetailTaskDialog"
        @modifyJobName="modifyJobName">
      </detail-task-dialog>
    </div>
  </page-layout>
</template>

<script>
import moment from 'moment';
import * as _ from 'lodash';
import CollisionSrv from '@/modules/collision/collision.service.js';
import { switchToModule } from '@/utils/utils.js';
import TaskDialog from '../components/task-dialog';
import DetailTaskDialog from '../components/detail-task-dialog';

export default {
  components: {
    TaskDialog,
    DetailTaskDialog
  },
  filters: {
    date(value) {
      if (!value) return '';
      return moment(value).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  data() {
    return {
      suggestThreshold: {
        min: 80,
        recommend: 80
      },
      taskFormData: {}, // 任务对象
      taskDialogType: 'add', // 弹出框类型
      showTaskDialog: false, // 是否显示任务弹出框
      showDetailTaskDialog: false,
      taskStats: {
        running: 0,
        finished: 0,
        error: 0,
        cancel: 0,
        paused: 0,
      }, // 任务状态信息
      taskListData: [], // 任务详情列表
      totalRecords: 0, // 任务总数
      tableId: +new Date(), // element table id
      taskListParam: {
        pageNo: 1,
        pageSize: 20
      },
      taskStatusMap: [],
      loading: false,
      showBackground: this.totalRecords === 0,
      responseFlag: '',
    };
  },
  computed: {
    totalCount() {
      return this.taskStats ? this.taskStats.running + this.taskStats.finished + this.taskStats.error + this.taskStats.terminate + this.taskStats.paused : 0;
    },
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('collision', 'analysisManage');
    }
  },
  created() {
    this.taskStatusMap = this.$store.getters.dataMapByType('job_status');
    this.init();
    this.collisionOut = setInterval(() => {
      this.getTaskListMain();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.collisionOut);
  },
  methods: {
    /**
     * 初始化
     */
    async init() {
      await this.getSuggestThreshold();
      await this.getTaskList();
    },
    /**
       * 终止任务
       * @augments params 参数
       */
    cancelTask(data) {
      const that = this;
      const params = {};
      params.jobId = data.id;
      this.$confirm(this.$t('您确定要终止任务吗，终止后将停止运行'), this.$t('终止任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        that.cancelVideo(params);
      }).catch(() => {
      });
    },
    /**
       * 终止任务
       * @augments params 参数
       */
    cancelVideo(params) {
      CollisionSrv.regionCancel(params.jobId).then((response) => {
        if (response.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('终止成功!'),
          });
          this.getTaskList();
        }
      });
    },
    /**
     * 重新开始任务
     */
    restartTask(task) {
      CollisionSrv.restartTask(task.id).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('重新开始成功！'));
          this.getTaskList();
        }
      });
    },
    /**
       * 暂停任务
       * @augments params 参数
       */
    pauseTask(params) {
      CollisionSrv.collisionPause(params.id).then((response) => {
        if (response.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('暂停成功!'),
          });
          this.getTaskList();
        }
      });
    },
    /**
     * 继续开始任务
     */
    LastTask(task) {
      CollisionSrv.collisionResume(task.id).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('继续任务成功！'));
          this.getTaskList();
        }
      });
    },
    /**
     * 获取建议阈值
     */
    async getSuggestThreshold() {
      const result = await CollisionSrv.threshold();
      if (result.code === 0) {
        this.suggestThreshold = result.data;
      } else {
        this.$message({
          type: 'error',
          message: result.msg
        });
      }
    },
    /**
     * 获取task dialog form对象
     * @param {Object} task
     * @param {Boolean} isCopy 是否是复制任务
     * @return {Object} 用于传入task dialog的对象
     */
    getTaskDialogForm(task, isCopy = false) {
      if (_.isEmpty(task)) {
        return {
          id: null,
          name: '',
          singleAlbum: true,
          threshold: this.suggestThreshold.recommend,
          compareMode: 'SEARCH_EQUIVALENT',
          albumId1: '',
          albumId2: '',
          filters: []
        };
      }
      const taskForm = _.cloneDeep(task);
      taskForm.filters = [];
      if (taskForm.reduceSfz) { taskForm.filters.push('1'); }
      if (taskForm.reduceTwins) { taskForm.filters.push('2'); }
      if (isCopy) taskForm.name += `-${this.$t('副本')}`;
      return taskForm;
    },
    /**
     * 获取库库碰撞的列表
     */
    async getTaskList() {
      try {
        this.showBackground = false;
        this.loading = true;
        const result = await CollisionSrv.list(this.taskListParam);
        if (result.code === 0) {
          this.totalRecords = result.data.page.totalRecords;
          this.taskListData = result.data.page.records;
          this.taskStats = result.data.statusCount;
        } else {
          this.$message({ type: 'error', message: result.msg });
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
        if (this.totalRecords === 0) {
          this.showBackground = true;
        }
      }
    },
    /**
     * 获取库库碰撞的列表
     */
    async getTaskListMain() {
      try {
        const result = await CollisionSrv.list(this.taskListParam);
        if (result.code === 0) {
          this.totalRecords = result.data.page.totalRecords;
          this.taskListData = result.data.page.records;
          this.taskStats = result.data.statusCount;
        } else {
          this.$message({ type: 'error', message: result.msg });
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (this.totalRecords === 0) {
          this.showBackground = true;
        }
      }
    },
    /**
     * 任务弹窗的确认回调函数
     * @param {Object} task 需要新建的任务对象
     */
    taskConfirm(task) {
      const params = {
        name: task.name,
        compareMode: task.compareMode,
        albumId1: task.albumId1,
        albumId2: task.albumId2,
        singleAlbum: task.singleAlbum,
        threshold: task.threshold,
        reduceSfz: task.filters.includes('1'),
        reduceTwins: task.filters.includes('2')
      };
      this.addTask(params);
    },
    /**
     * 新建任务
     * @param {Object} task 需要新建的任务对象
     */
    async addTask(task) {
      const result = await CollisionSrv.new(task);
      if (result.code === 0) {
        this.$message({
          type: 'success',
          message: this.$t('新建任务成功！')
        });
        this.showTaskDialog = false;
        this.getTaskList();
      }
    },
    /**
     * 获取任务比对详情
     * @param {Object} task 任务对象
     */
    taskDetail(task) {
      const query = { id: task.id, task };
      switchToModule({
        module: 'collision',
        child: 'detail',
        query
      });
    },
    /**
     * 查看任务详情
     * @param {Object} task 任务对象
     */
    checkTaskInfo(task) {
      this.taskDialogType = 'check';
      this.taskFormData = this.getTaskDialogForm(task);
      this.showDetailTaskDialog = true;
    },
    /**
     * 编辑任务名
     * @param {Object} 修改参数
     * @returns
     */
    modifyJobName(params) {
      CollisionSrv.modifyJobName(params).then((res) => {
        const timeStamp = new Date().getTime();
        if (res.code === 0) {
          this.responseFlag = `success_${timeStamp}`;
          this.getTaskList();
        } else {
          this.responseFlag = `error_${timeStamp}`;
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 删除单个任务
     * @param {Number} id 任务id
     */
    async deleteTask(id) {
      try {
        // 弹出删除提示框
        await this.$confirm(
          this.$t('您确定要删除此任务吗，删除后将不可恢复'), // delete body
          this.$t('删除任务'), // delete title
          {
            confirmButtonText: this.$t('确定'),
            cancelButtonText: this.$t('取消')
          }
        );
      } catch (error) {
        // 操作者不想删除，点击取消
        // this.$message({
        //   type: 'info',
        //   message: '已取消删除'
        // });
        return;
      }
      // 操作者点击确定，发送删除请求
      const result = await CollisionSrv.delete({ id });
      if (result.code === 0) {
        this.$message.success(this.$t('删除成功！'));
        this.getTaskList();
      }
    },
    /**
     * 新建任务
     */
    newTask() {
      this.taskDialogType = 'add';
      this.taskFormData = this.getTaskDialogForm();
      this.showTaskDialog = true;
    },
    /**
     * 复制任务
     */
    copyTask(task) {
      this.taskDialogType = 'copy';
      this.taskFormData = this.getTaskDialogForm(task, true);
      this.showTaskDialog = true;
    },
    /**
     * 当分页容量大小改变时触发
     * @param {Number} pageSize 当前容量
     */
    sizeChange(pageSize) {
      this.taskListParam.pageSize = pageSize;
      this.getTaskList();
    },
    /**
     * 当分页数发生变化时触发
     * @param {pageNo} 当前页数
     */
    currentChange(pageNo) {
      this.taskListParam.pageNo = pageNo;
      this.getTaskList();
    },
    /**
     * 任务状态字典表映射
     * @param {Array} dic 库库碰撞字典
     * @param {Number} code 键值
     * @return {String} 任务状态字符串
     */
    dicMap(dic, code) {
      if (!code || !dic || !Array.isArray(dic)) return '';
      const item = dic.find((x) => x.code === code);
      return item && item.value;
    },
  },
};
</script>

<style lang='scss' scoped>
// @import "@/scss/table-list.scss";
.frequency__lists{
  width: 100%;
  height: 100%;
  background-color:rgb(220,224,228);
}
.noneData {
  color: #435068
}
  .jobName__item{
    cursor: pointer;
    color: #21539b;
  }
  .lists__title{
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 56px;
    position: relative;
    padding: 0 20px 0 25px;
    box-sizing: border-box;
    font-size: 12px;
    color: #435068;
    >div {
      height: 100%;
      display: flex;
      align-items: center;
    }
    .meg-return-button{
      margin-right: 30px;
    }
  }
  .task-stats{
    margin-right: 30px;
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
.jobName__item__error{
  color: #435068;
  cursor: inherit;
}
</style>
