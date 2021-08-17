<template>
  <page-layout>
    <div class="region__lists">
      <div class="lists__title">
        <meg-return-button
          :title="$t('区域碰撞')"
          :button-visible="false"></meg-return-button>
        <span class="task-stats">{{ $t('正在执行') }}<span class="number-font">（{{ taskStatis.process }}/{{ taskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已完成') }}<span class="number-font">（{{ taskStatis.finish }}/{{ taskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已终止') }}<span class="number-font">（{{ taskStatis.terminate }}/{{ taskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已失败') }}<span class="number-font">（{{ taskStatis.error }}/{{ taskStatis.total }}）</span></span>
        <div
          v-if="analysisManage"
          class="new__task">
          <meg-button
            :disabled="disabled"
            @click="newTask"
            type="primary">
            {{ $t('新建区域碰撞任务') }}
          </meg-button>
          <meg-button
            @click="newDateTask"
            :disabled="disabled"
            type="primary">
            {{ $t('新建时间碰撞任务') }}
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
            v-background="totalRecords || tableLoading ? false:{icon:'icon_1',text:$t('暂无数据')}">
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
              <span v-if="scope.row.jobStatus=== 'JOB_RUNNING'">{{ scope.row.progress+"%" }}</span>
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
            :label="$t('任务类型')"
            sortable
            align="left">
            <template slot-scope="scope">
              <span>{{ typeChoose(scope.row.jobType) }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="address"
            :label="$t('操作')"
            align="center">
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
                v-if="analysisManage && (scope.row.jobStatus === 'JOB_TERMINATE' || scope.row.jobStatus === 'JOB_ERROR' )"
                @click="restartTask(scope.row)"
                type="text">
                {{ $t('重新启动') }}
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
        :region-threshold="regionThreshold"
        :form-data="taskFormData"
        :operate-type="taskType"
        :visible.sync="taskDialogVisible"
        :camera-list="cameraList"
        @taskConfirm="taskConfirm">
      </task-dialog>
      <date-task-dialog
        ref="dateTaskDialog"
        :region-threshold="regionThreshold"
        :form-data="dateFormData"
        :operate-type="taskType"
        :visible.sync="dateTaskDialogVisible"
        :camera-list="cameraList"
        @taskConfirm="taskConfirm">
      </date-task-dialog>
      <div class="detail__main">
        <task-detail-dialog
          :form-data="taskdetailData"
          :visible.sync="taskDetailDialogVisible"
          ref="taskDetail"
          @modifyJobName="modifyJobName"
          :response-flag="responseFlag"
          :if-auth="analysisManage">
        </task-detail-dialog>
        <date-detail-dialog
          ref="dateDetail"
          :form-data="dateDetailData"
          :visible.sync="dateDetailDialogVisible"
          :camera-list="cameraList"
          @modifyJobName="modifyJobName"
          :response-flag="responseFlag"
          :if-auth="analysisManage">
        </date-detail-dialog>
      </div>
    </div>
  </page-layout>
</template>

<script>
import moment from 'moment';
import { switchToModule } from '@/utils/utils.js';
import RegionSrv from '../region.service.js';
import TaskDialog from '../components/task-dialog';
import DateTaskDialog from '../components/date-task-dialog';
import TaskDetailDialog from '../components/task-detail-dialog';
import DateDetailDialog from '../components/date-detail-dialog';

const TaskForm = function () {
  this.jobName = '';
  this.jobType = '2';
  this.threshold = 80;
  this.region1 = {};
  this.region1.beginTime = '';
  this.region1.endTime = '';
  this.region1.cameraIds = [];
  this.region1.regionLocation = '';
  this.region2 = {};
  this.region2.beginTime = '';
  this.region2.endTime = '';
  this.region2.cameraIds = [];
  this.region2.regionLocation = '';
};
const DateTaskForm = function () {
  this.jobName = '';
  this.jobType = '1';
  this.threshold = 80;
  this.timeRegions = {};
  this.timeRegions.times = [];
  this.timeRegions.cameraIds = [];
  this.timeRegions.regionLocation = '';
};
const flatData = function (array) {
  const stack = [...array];
  const target = [];
  while (stack.length) {
    const curr = stack.pop();
    if (curr.flag === 'camera') {
      target.push(curr);
    }
    if (curr.items && curr.items.length) {
      stack.push(...curr.items);
    }
  }
  return target;
};
export default {
  components: {
    TaskDialog,
    DateTaskDialog,
    TaskDetailDialog,
    DateDetailDialog
  },
  data() {
    return {
      regionThreshold: {
        min: 20,
        thresholdNum: 85,
      },
      detailData: {},
      taskdetailData: new TaskForm(),
      dateDetailData: new DateTaskForm(),
      taskFormData: new TaskForm(),
      dateFormData: new DateTaskForm(),
      taskType: 'add',
      cameraList: [], // 相机选择树列表
      taskDialogVisible: false,
      dateTaskDialogVisible: false,
      taskDetailDialogVisible: false,
      dateDetailDialogVisible: false,
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
      taskStatusMap: [],
      taskInterval: '', // 任务定时函数
      tableLoading: true,
      responseFlag: '',
      disabled: true
    };
  },
  computed: {
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('region', 'analysisManage');
    }
  },
  created() {
    this.taskStatusMap = this.$store.getters.dataMapByType('job_status');
    const allCamera = {
      hideUnit: false
    };
    RegionSrv.cameraList(allCamera).then((res) => {
      this.disabled = false;
      if (res.code === 0) {
        this.cameraList = res.data;
        this.$nextTick(() => {
          console.log(this.cameraList);
          const list = flatData(this.cameraList);
          this.$refs.taskDetail.setTreeData(list);
          this.$refs.dateDetail.setTreeData(list);
        });
      }
    });
    this.init();
    this.threshold();
    this.taskInterval = setInterval(() => {
      this.init();
    }, 5000);
  },
  destroyed() {
    clearInterval(this.taskInterval);
  },
  methods: {
    typeChoose(val) {
      if (val === '1') {
        return this.$t('时间碰撞');
      }
      return this.$t('区域碰撞');
    },
    /**
     * 初始化 列表和统计信息
     */
    init() {
      this.getList();
      this.getStatistics();
    },
    threshold() {
      RegionSrv.threshold().then((res) => {
        if (res.code === 0) {
          this.regionThreshold.min = res.data.min;
          this.regionThreshold.thresholdNum = res.data.recommend;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 编辑任务名
     * @param {Object} 修改参数
     * @returns
     */
    modifyJobName(params, type) {
      RegionSrv.modifyJobName(params).then((res) => {
        const timeStamp = new Date().getTime();
        if (res.code === 0) {
          this.responseFlag = `success_${timeStamp}`;
          if (type === 'task') {
            this.taskdetailData.jobName = params.jobName;
          } else {
            this.dateDetailData.jobName = params.jobName;
          }
          this.init();
        } else {
          this.responseFlag = `error_${timeStamp}`;
          this.$message.error(res.msg);
        }
      });
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
      RegionSrv.regionCancel(params.jobId).then((response) => {
        if (response.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('终止成功'),
          });
          this.getList();
          this.getStatistics();
        }
      });
    },
    /**
     * 重新开始任务
     */
    restartTask(task) {
      RegionSrv.restartTask(task.id).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('重新开始成功！'));
          this.getList();
          this.getStatistics();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 任务弹窗的确认回调函数
     * @param {task} 回调参数
     */
    taskConfirm(task) {
      RegionSrv.addTask(task).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('新建任务成功！'));
          this.taskDialogVisible = false;
          this.dateTaskDialogVisible = false;
          this.init();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
       * 获取进度统计
       * @augments
       */
    getStatistics() {
      RegionSrv.regionStatistics().then((response) => {
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
      const query = { uid: row.id, jobName: row.jobName, jobType: row.jobType };
      switchToModule({
        module: 'region',
        child: 'task-detail-region',
        query
      });
    },
    /**
       * 获取列表信息
       * @augments
       */
    getList() {
      RegionSrv.getRegionList(this.taskListsParam).then((response) => {
        if (response.code === 0) {
          response.data.records.forEach((item) => {
            item.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss');
          });
          this.taskListData = response.data.records;
          this.totalRecords = response.data.totalRecords;
          this.tableLoading = false;
        }
      });
    },

    /**
     * 删除单个任务
     * @augments params 当前项数据
     */
    deleteTask(id) {
      const params = {};
      params.id = id;
      RegionSrv.deleteTask(params.id).then((res) => {
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
        this.deleteTask(task.id);
      }).catch(() => {
      });
    },
    /**
     * 新建区域碰撞任务
     */
    newTask() {
      this.taskType = 'add';
      this.taskDialogVisible = true;
      this.taskFormData = new TaskForm();
      this.cameraList = [...this.cameraList];
    },
    /**
     * 新建时间碰撞任务
     */
    newDateTask() {
      this.taskType = 'add';
      this.dateTaskDialogVisible = true;
      this.dateFormData = new DateTaskForm();
      this.dateFormData.jobType = '1';
      this.cameraList = [...this.cameraList];
    },
    /**
     * 复制任务
     */
    copyTask(task) {
      this.taskType = 'copy';
      RegionSrv.jobDetail(task.id).then((res) => {
        if (res.code === 0) {
          if (task.jobType === '1') {
            this.dateFormData = {
              jobType: '1',
              jobName: `${res.data.jobName}-${this.$t('副本')}`,
              threshold: res.data.threshold,
              timeRegions: res.data.timeRegions
            };
            this.dateTaskDialogVisible = true;
          } else {
            this.taskFormData = {
              jobType: '2',
              jobName: `${res.data.jobName}-${this.$t('副本')}`,
              threshold: res.data.threshold,
              regions: res.data.regionVos,
            };
            this.taskDialogVisible = true;
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 查看任务详情
     */
    checkTaskInfo(task) {
      RegionSrv.jobDetail(task.id).then((res) => {
        if (res.code === 0) {
          if (task.jobType === '1') {
            this.dateDetailData = res.data;

            this.dateDetailDialogVisible = true;
          } else {
            this.taskdetailData = res.data;
            this.taskDetailDialogVisible = true;
          }
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

<style lang='scss' scoped>
// @import "@/scss/table-list.scss";
.region__lists{
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
  .lists__title span{
    display: inline-block;
    height: 56px;
    line-height: 56px;
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
}

</style>
