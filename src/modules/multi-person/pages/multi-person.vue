<template>
  <page-layout>
    <div class="multiperson__lists">
      <div
        class="lists__title">
        <meg-return-button
          :title="$t('多人检索')"
          :button-visible="false"></meg-return-button>
        <span class="task-stats">{{ $t('正在执行') }}<span style="font-size:14px">（{{ personTaskStatis.process }}/{{ personTaskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已完成') }}<span style="font-size:14px">（{{ personTaskStatis.finish }}/{{ personTaskStatis.total }}）</span></span>
        <span class="task-stats">{{ $t('已终止') }}<span style="font-size:14px">（{{ personTaskStatis.terminate }}/{{ personTaskStatis.total }}）</span></span>
        <!-- <span>已取消（{{ personTaskStatis.cancel }}/{{ personTaskStatis.total }}）</span> -->
        <span class="task-stats">{{ $t('已失败') }}<span style="font-size:14px">（{{ personTaskStatis.error }}/{{ personTaskStatis.total }}）</span></span>
        <div class="new__task">
          <meg-button
            v-if="analysisManage && isSuperAdmin"
            @click="newTaskAll"
            type="primary">
            {{ $t('新建批量检索任务') }}
          </meg-button>
          <meg-button
            v-if="analysisManage"
            @click="newTask"
            type="primary">
            {{ $t('新建任务') }}
          </meg-button>
        </div>
      </div>
      <div
        v-loading="loading"
        class="lists__content">
        <meg-table
          stripe
          :key="tableId"
          :data="PersonList"
          ref="elTable"
          center="true"
          height="100%"
          :default-sort="{prop: 'date', order: 'descending'}"
          style="width: 100%">
          <div
            slot="empty"
            v-background="manBackground || loading ? false:{icon:'icon_1',text:$t('暂无数据')}">
          </div>
          <meg-table-column
            :label="$t('任务名称')"
            sortable
            sort-by="jobName"
            align="left">
            <template slot-scope="scope">
              <span
                class="jobName__item"
                v-if="scope.row.jobStatus==='JOB_FINISHED'&&scope.row.resultCount>0"
                type="text"
                @click="jobLists(scope.row)">{{ scope.row.jobName }}</span>
              <span v-else>{{ scope.row.jobName }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="jobStatus"
            :label="$t('状态')"
            sortable
            align="left">
            <template slot-scope="scope">
              <span :class="{'error-text':scope.row.jobStatus==='JOB_ERROR'}">{{ dicMap(taskStatusMap,scope.row.jobStatus) }}</span>
              <span v-if="scope.row.jobStatus=== 'JOB_RUNNING'">{{ scope.row.progressRate+"%" }}</span>
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
            :label="$t('上传文件')"
            align="left">
            <template slot-scope="scope">
              <span>{{ scope.row.fileName }}</span>
            </template>
          </meg-table-column>
          <meg-table-column
            prop="address"
            :label="$t('操作')"
            align="center">
            <template slot-scope="scope">
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
                @click="personDelete(scope.row)">
                {{ $t('删除') }}
              </meg-button>
              <meg-button
                @click="editPersonOpen(scope.row)"
                type="text">
                {{ $t('详情') }}
              </meg-button>
            </template>
          </meg-table-column>
        </meg-table>
      </div>
      <div class="person__page">
        <meg-pagination
          :total="totalLists"
          :page-sizes="[20, 50, 100]"
          @size-change="sizeChange"
          @current-change="currentChange">
        </meg-pagination>
      </div>
      <new-person-task
        @getList="getList"
        @close="taskDialogVisible=false"
        :visible.sync="taskDialogVisible">
      </new-person-task>
      <new-all-task
        @getList="getList"
        @close="taskAllVisible=false"
        :visible.sync="taskAllVisible">
      </new-all-task>
      <person-detail
        class="detail__main"
        :visible.sync="personDetailShow"
        :detail-data="detailData"
        @close="personDetailShow=false"
        :response-flag="responseFlag"
        @modifyJobName="modifyJobName"
        :if-auth="analysisManage">
      </person-detail>
    </div>
  </page-layout>
</template>

<script>
import moment from 'moment';
import { switchToModule } from '@/utils/utils.js';
import MultiPersonSrv from '../multi-person.service.js';
import newPersonTask from '../components/new-person-task';
import newAllTask from '../components/new-all-task';
import personDetail from '../components/person-detail';

export default {
  components: {
    personDetail,
    newPersonTask,
    newAllTask
  },
  data() {
    return {
      taskAllVisible: false,
      taskDialogVisible: false,
      manBackground: true,
      loading: false,
      totalLists: 0,
      taskStatusMap: [],
      personTaskStatis: {},
      newPersonShow: false,
      personDetailShow: false,
      PersonList: [],
      tableId: +new Date(),
      getPersonLists: {
        pageNo: 1,
        pageSize: 20
      },
      detailData: {},
      responseFlag: '',
    };
  },
  computed: {
    isSuperAdmin() {
      if (this.$store.getters.user.userName === 'superAdmin' && this.$store.getters.systemByType('enablePKSetting').value === 'true') {
        return true;
      }
      return false;
    },
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('multi-person', 'analysisManage');
    }
  },
  watch: {
    PersonList: {
      handler() {
      },
      deep: true
    },

  },
  created() {
    this.taskStatusMap = this.$store.getters.dataMapByType('job_status');

    this.getList();
    this.getStatistics();
    this.personOut = setInterval(() => {
      this.getListItem();
      this.getStatistics();
    }, 5000);
  },
  beforeDestroy() {
    clearInterval(this.personOut);
  },
  methods: {
    newTaskAll() {
      this.taskAllVisible = true;
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
    /**
       * 获取进度统计
       * @augments
       */
    getStatistics() {
      MultiPersonSrv.personStatistics().then((response) => {
        if (response.code === 0) {
          this.personTaskStatis = response.data;
        }
      });
    },
    /**
       * 获取任务比对详情
       * @augments row 任务信息
       */
    jobLists(row) {
      if (row.jobStatus !== 'JOB_FINISHED' || row.resultCount === 0) {
        return;
      }
      const query = { uid: row.jobId, jobName: row.jobName };
      switchToModule({
        module: 'multi-person',
        child: 'person-lists',
        query
      });
    },
    /**
       * 获取列表信息
       * @augments
       */
    getList() {
      const params = this.getPersonLists;
      this.loading = true;
      MultiPersonSrv.getMultiPersonList(params).then((response) => {
        if (response.code === 0) {
          this.loading = false;
          response.data.records.forEach((item) => {
            item.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss');
          });
          this.PersonList = response.data.records;
          this.totalLists = response.data.totalRecords;
          if (this.totalLists === 0) {
            this.manBackground = false;
          }
        }
      });
    },
    /**
       * 轮询列表信息
       * @augments
       */
    getListItem() {
      const params = this.getPersonLists;
      MultiPersonSrv.getMultiPersonList(params).then((response) => {
        if (response.code === 0) {
          response.data.records.forEach((item) => {
            item.createTime = moment(item.createTime).format('YYYY-MM-DD HH:mm:ss');
          });
          this.PersonList = response.data.records;
          this.totalLists = response.data.totalRecords;
        }
      });
    },
    editPersonOpen(data) {
      const params = {};
      params.jobId = data.jobId;
      MultiPersonSrv.personDetail(params).then((response) => {
        if (response.code === 0) {
          if (!response.data.uploadFileCount) {
            response.data.uploadFileCount = 0;
          }
          this.detailData = response.data;
          this.personDetailShow = true;
        }
      });
    },
    /**
     * 编辑任务名
     * @param {Object} 修改参数
     * @returns
     */
    modifyJobName(params, id) {
      MultiPersonSrv.modifyJobName(params, id).then((res) => {
        const timeStamp = new Date().getTime();
        if (res.code === 0) {
          this.responseFlag = `success_${timeStamp}`;
          this.getList();
        } else {
          this.responseFlag = `error_${timeStamp}`;
          this.$message.error(res.msg);
        }
      });
    },
    /**
       * 删除单个任务
       * @augments params 当前项数据
       */
    deletePerson(params) {
      MultiPersonSrv.deleteList(params).then((response) => {
        if (response.code === 0) {
          this.PersonList = this.PersonList.filter((item) => (item.jobId !== params.jobId));
          this.getList();
          this.$message({
            type: 'success',
            message: this.$t('删除成功!'),
          });
        } else {
          this.$message({
            type: 'error',
            message: response.msg
          });
        }
      });
    },
    /**
       * 删除单个任务
       * @augments data 当前项数据
       */
    personDelete(data) {
      const that = this;
      const params = {};
      params.jobId = data.jobId;
      this.$confirm(this.$t('您确定要删除此任务吗，删除后将不可恢复'), this.$t('删除任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        that.deletePerson(params);
      }).catch(() => {
      });
    },
    /**
       * 终止任务
       * @augments params 参数
       */
    cancelTask(data) {
      const that = this;
      const params = {};
      params.jobId = data.jobId;
      this.$confirm(this.$t('您确定要终止任务吗，终止后将停止运行'), this.$t('终止任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        that.cancelPerson(params);
      }).catch(() => {
      });
    },
    /**
       * 终止任务
       * @augments params 参数
       */
    cancelPerson(params) {
      MultiPersonSrv.personCancel(params.jobId).then((response) => {
        if (response.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('终止成功!'),
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
      MultiPersonSrv.restartTask(task.jobId).then((res) => {
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
       * 当分页容量大小改变时触发
       * @augments e 当前容量
       */
    sizeChange(e) {
      this.getPersonLists.pageSize = e;
      this.getList();
    },
    /**
       * 当分页数发生变化时触发
       * @augments e 当前页数
       */
    currentChange(e) {
      this.getPersonLists.pageNo = e;
      this.getList();
    },
    newTask() {
      this.taskDialogVisible = true;
    }
  },

};
</script>

<style lang='scss' scoped>
// @import "@/scss/table-list.scss";
::v-deep .meg-dialog__header{
    font-weight: 700;
    font-size: 16px;
    color: #435068;
    line-height: 54px;
  }
.multiperson__lists {
  width: 100%;
  height: 100%;
  background-color: rgb(220, 224, 228);
}
.jobName__item {
  cursor: pointer;
  color: #21539b;
}
.lists__title {
  display: flex;
  align-items: center;
  width: 100%;
  height: 56px;
  position: relative;
  padding: 0 20px 0 25px;
  box-sizing: border-box;
  font-size: 12px;
  color: #435068;
  .meg-return-button {
    margin-right: 30px;
  }
}
.task-stats {
  margin-right: 30px;
}
.error-text {
  color: #f05353;
}
.lists__title > span {
  display: inline-block;
  height: 55px;
  line-height: 55px;
  text-align: center;
}
.lists__title > span:nth-child(1) {
  font-size: 16px;
  color: #435068;
}
.new__task {
  position: absolute;
  top: 10px;
  right: 20px;
}
.lists__content {
  height: calc(100% - 105px);
  margin: 0 10px;
  overflow: auto;
  font-size: 14px;
}
.person__page {
  height: 50px;
  padding: 0 10px;
  background: white;
}
.cancelNone {
  display: none;
}
.jobName__item__error {
  color: #435068;
  cursor: inherit;
}
// .el-table .el-button{
//   font-size: 14px !important;
//   color: #21539a !important
// }
</style>
