<template>
  <div class="gather-list">
    <meg-table
      empty-text=""
      stripe
      :data="listData"
      v-loading="listLoading"
      tooltip-effect="meg"
      height="100%">
      <div
        slot="empty"
        v-background="listData.length === 0 &&!listLoading? { icon:'icon_1', text:$t('暂无数据')} : false">
      </div>
      <meg-table-column
        prop="jobName"
        sortable
        :label="$t('任务名称')"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span
            class="job-name"
            v-if="scope.row.jobStatus==='JOB_FINISHED'&& scope.row.resultCount>0 "
            @click="goDetailPage(scope.row)">{{ scope.row.jobName }}</span>
          <span v-else>{{ scope.row.jobName }}</span>
        </template>
      </meg-table-column>
      <meg-table-column
        prop="jobStatus"
        sortable
        :label="$t('状态')"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span :class="{'error-text':scope.row.jobStatus==='JOB_ERROR'}">{{ getStatusText(scope.row.jobStatus) }}</span>
          <span v-if="scope.row.jobStatus==='JOB_RUNNING'">{{ `（${scope.row.jobProgress}%）` }}</span>
        </template>
      </meg-table-column>
      <meg-table-column
        prop="resultCount"
        sortable
        :label="$t('结果数')"
        show-overflow-tooltip></meg-table-column>
      <meg-table-column
        prop="createTime"
        sortable
        :label="$t('创建时间')"
        show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ formatTime(scope.row.createTime) }}</span>
        </template>
      </meg-table-column>
      <meg-table-column
        prop="creatorName"
        sortable
        :label="$t('创建用户')"
        show-overflow-tooltip></meg-table-column>
      <meg-table-column
        prop="creatorOrgName"
        sortable
        :label="$t('创建部门')"
        show-overflow-tooltip></meg-table-column>
      <meg-table-column
        :label="$t('文件类型')"
        sortable
        prop="clusterType"
        show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.clusterType==="PACKAGE"? $t('图片压缩包') : $t('已解析离线视频') }}
        </template>
      </meg-table-column>
      <meg-table-column
        :label="$t('操作')">
        <template slot-scope="scope">
          <meg-button
            v-if="scope.row.jobStatus==='JOB_RUNNING' && analysisManage"
            type="text"
            @click="stopTaskConfirm(scope.row)">
            {{ $t('终止') }}
          </meg-button>
          <meg-button
            v-if="(scope.row.jobStatus==='JOB_TERMINATE' ||scope.row.jobStatus==='JOB_ERROR') && analysisManage"
            type="text"
            @click="restartTask(scope.row)">
            {{ $t('重新启动') }}
          </meg-button>
          <meg-button
            type="text"
            v-if="analysisManage"
            @click="deleteTask(scope.row)">
            {{ $t('删除') }}
          </meg-button>
          <meg-button
            type="text"
            @click="openDetailDialog(scope.row)">
            {{ $t('详情') }}
          </meg-button>
        </template>
      </meg-table-column>
    </meg-table>
  </div>
</template>
<script>
import moment from 'moment';
import { switchToModule } from '@/utils/utils.js';

export default {
  props: {
    listLoading: {
      type: Boolean,
      default: false
    },
    taskStatusta: {
      type: Array,
      default: () => []
    },
    listData: {
      type: Array,
      default: () => []
    },
    tableSelect: {
      type: Boolean,
      default: false
    },
    allChecked: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
    };
  },
  computed: {
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('person-gather', 'analysisManage');
    }
  },
  created() {
    this.taskStatusData = this.$store.getters.dataMapByType('job_status');
  },
  methods: {
    /*
    * 终止任务确认弹框
    * @param {data} 当前任务数据
    * @return
    * */
    stopTaskConfirm(data) {
      const params = {};
      params.jobId = data.id;
      this.$confirm(this.$t('您确定要终止任务吗，终止后将停止运行'), this.$t('终止任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        this.stopTask(params);
      }).catch(() => {
      });
    },
    /*
    * 打开详情弹框
    * @param {any}
    * @return
    * */
    openDetailDialog(data) {
      this.$emit('show-detail-dialog', data.id);
    },
    /*
    * 格式化时间
    * @param {any}
    * @return
    * */
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
    /*
    * 处理任务状态的显示文案
    * @param {any}
    * @return
    * */
    getStatusText(key) {
      const statusMap = new Map();
      this.taskStatusData.forEach((item) => {
        statusMap.set(item.code, item.value);
      });
      return statusMap.get(key);
    },
    /*
    * 终止任务
    * @param {any}
    * @return
    * */
    stopTask(data) {
      this.$emit('stop-task', data);
    },
    /*
    * 重新启动任务
    * @param {any}
    * @return
    * */
    restartTask(data) {
      this.$emit('restart-task', data);
    },
    /*
    * 删除任务
    * @param {any}
    * @return
    * */
    deleteTask(data) {
      this.$emit('delete-task', data);
    },
    /*
    * 跳转详情
    * @param {any}
    * @return
    * */
    goDetailPage(data) {
      const query = { id: data.id, jobName: data.jobName };
      switchToModule({
        module: 'person-gather',
        child: 'gather-detail',
        query
      });
    },

  }
};
</script>

<style lang="scss" scoped>
// @import "@/scss/table-list.scss";
.gather-list {
  height: 100%;
  background-color: #ffffff;
  .job-name {
    cursor: pointer;
    color: #21539b;
  }
  .error-text {
    color: #f05353;
  }
}
</style>
