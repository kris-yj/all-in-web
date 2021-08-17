<template>
  <page-layout>
    <meg-container class="meg-container">
      <meg-aside class="task-aside">
        <search-form
          ref="searchForm"
          :deploy-type-list="deployTypeList"
          :history="false"
          :deploy-status-option="deployStatusOption"
          :album-tree-data="allAlbumList"
          @search="searchTask"></search-form>
      </meg-aside>
      <meg-main
        class="main-container">
        <!-- 头部导航 -->
        <div class="title-container">
          <div class="title-left-container font12">
            {{ $t('检索结果：共') }}<label class="font14"> {{ pagination.total }} </label>{{ $t('条') }}
          </div>
          <div class="title-right-container">
            <meg-button
              type="primary"
              v-if="enableCreate"
              @click="createTask(0)">
              {{ $t('新建识别布控') }}
            </meg-button>
            <meg-button
              type="primary"
              v-if="enableCreate"
              @click="createTask(1)">
              {{ $t('新建检测布控') }}
            </meg-button>
            <meg-button
              @click="toHistoryTask">
              {{ $t('历史任务') }}
            </meg-button>
          </div>
        </div>
        <!-- 数据展示表格 -->
        <div
          class="content-container"
          v-loading="loading">
          <common-table
            :columns="columns"
            :data="tableData"
            height="100%"
            :background="tableBackground"
            :pagination-props="pagination"
            :pagination-events="paginationEvents">
            <template v-slot:strategyName="{row}">
              <div
                v-tooltip="true"
                class="table-column-name">
                <span
                  @click="toTaskDetail(row)">
                  {{ row.strategyName }}
                </span>
              </div>
            </template>
            <template v-slot:status="{ row , $index}">
              <meg-switch
                v-if="row.status !== 2"
                v-model="row.status"
                :disabled="row.readOnly"
                :active-value="0"
                :inactive-value="1"
                @change="tabStatus(row,$index)">
              </meg-switch>
              {{ statusMap[row.status] }}
            </template>
            <template v-slot:termType="{ row }">
              {{ taskType[row.termType] }}
            </template>
            <template v-slot:alarmType="{ row }">
              {{ alarmTypeMap[row.alarmType] }}
            </template>
            <template v-slot:createTime="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
            <template v-slot:operation="{ row }">
              <meg-button
                v-if="enableCreate"
                @click="getDetailData(row,'copy')"
                type="text">
                {{ $t('复制') }}
              </meg-button>
              <template v-if="!row.readOnly && !row.applyReadOnly && enableCreate">
                <meg-button
                  v-if="!row.dualNetSync"
                  @click="getDetailData(row,'edit')"
                  type="text">
                  {{ $t('编辑') }}
                </meg-button>
                <meg-button
                  @click="cancelTask(row)"
                  type="text">
                  {{ $t('撤销') }}
                </meg-button>
              </template>
            </template>
          </common-table>
        </div>
      </meg-main>
    </meg-container>
    <manage-task
      :deploy-aging="deployAging"
      :mode="manageTaskType"
      :is-saving="isSaving"
      :deploy-type-list="deployTypeList"
      :default-data="defaultFormData"
      :get-album="getAlbumList"
      :dept-tree="deptTree"
      :person-tree="userTree"
      @save="onSaveTask"
      @open-create-type="isShowCreateDeployType = true"
      @close="isShowCreateTask = false"
      v-if="isShowCreateTask"></manage-task>
    <create-deploy-type
      @save="onCreateDeployType"
      @close="isShowCreateDeployType = false"
      v-if="isShowCreateDeployType"></create-deploy-type>
  </page-layout>
</template>

<script>
import doAddCameraSelectHistory from '@/utils/camera.utils.js';
import { switchToModule } from '@/utils/utils';
import moment from 'moment';
import SurveillanceTaskSvr from '@/modules/surveillance-task/surveillance-task.service.js';
import CommonTable from '@/common-components/common-table';
import SearchForm from '../components/search-form';
import ManageTask from '../components/manage-task';
import CreateDeployType from '../components/create-deploy-type';
import getCameraInfo from '../utils';

export default {
  name: 'SurveillanceTask',
  components: {
    SearchForm,
    CommonTable,
    ManageTask,
    CreateDeployType
  },
  data() {
    return {
      enableCreate: false,
      // 新的
      loading: false,
      deployTypeList: [], // 布控类型列表
      allAlbumList: [], // 全部底库列表
      deptTree: [], // 部门树
      userTree: [], // 用户树
      tableBackground: {
        icon: 'icon_4',
        text: this.$t('检索无数据')
      },
      taskType: {}, // 布控任务时效类型映射
      columns: [
        {
          prop: 'strategyName',
          label: this.$t('任务名称')
        },
        {
          prop: 'alarmType',
          label: this.$t('布控类别'),
          sortable: true
        },
        {
          prop: 'strategyTypeName',
          label: this.$t('布控类型'),
          sortable: true
        },
        {
          prop: 'status',
          label: this.$t('布控状态'),
          sortable: true,
          width: '120px',
          align: 'center'
        },
        {
          prop: 'createTime',
          label: this.$t('创建时间'),
          sortable: true
        },
        {
          prop: 'warningCount',
          label: this.$t('报警数量'),
          sortable: true
        },
        {
          prop: 'termType',
          label: this.$t('布控时效'),
          sortable: true
        },
        {
          prop: 'creatorName',
          label: this.$t('创建用户')
        },
        {
          prop: 'operation',
          label: this.$t('操作'),
          align: 'center'
        },

      ],
      tableData: [],
      pagination: {
        layout: 'prev,pager,next,total,sizes',
        currentPage: 1,
        'page-sizes': [20, 50, 100],
        total: 0
      },
      paginationEvents: {
        change: this.paginationChange,
      },
      pageInfo: {
        pageNo: 1,
        pageSize: 20,
      },

      isSaving: false, // 弹窗是否loading
      isShowCreateTask: false,
      defaultFormData: {
        alarmType: 0, // 0 识别布控 1 检测布控
        strategyTypeId: 1,
      },
      manageTaskType: 'create', // 'create' 'copy' 'edit'
      deployAging: [], // 布控时效配置项
      searchInfo: {},
      statusMap: {},
      alarmTypeMap: {},
      isShowCreateDeployType: false, // 是否显示新建布控类型弹窗
      deployStatusOption: [], // 布控状态项
    };
  },
  computed: {

    // 是否可编辑布控任务
    enableEdit() {
      // 是否是双网
      const isDual = this.$store.getters.systemByType('isDual').value;
      // 双网下是否可编辑
      const dualSurveillanceEditable = this.$store.getters.systemByType('dualSurveillanceEditable').value;
      if (isDual === 'true' && dualSurveillanceEditable === 'false') {
        return false;
      }
      return true;
    }
  },
  created() {
    this.isDual = this.$store.getters.systemByType('isDual').value;
    this.enableCreate = this.$store.getters.modulePermissonsByAlias('surveillance-task', 'createDeployTask');
    this.init();
  },
  methods: {

    /**
     * @description 初始化
     * @param {any}
     * @returns
     */
    init() {
      // 加载布控类型
      this.getDeployTypeOptions();
      // 加载底库列表
      this.getAllAlbumList();
      // 获取字典表
      this.initDataMap();
      // 获取部门树和用户树
      this.getDeptTree();
      this.getUserTree();
      // createDeployTask
      this.$nextTick(() => {
        this.$refs.searchForm.search();
      });
    },

    // 更新任务列表
    updateTaskList(data = { ...this.searchInfo, ...this.pageInfo }) {
      const vm = this;
      this.loading = true;
      SurveillanceTaskSvr.getSurveillanceTaskList(data).then((response) => {
        vm.loading = false;
        if (response.code === 0) {
          vm.tableData = response.data.records;
          vm.pagination.total = response.data.totalRecords;
        } else {
          vm.$message.error(response.msg);
        }
      });
    },
    /**
     * @description 格式化时间
     * @param {number} time
     * @returns {string}
     */
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
    /**
     * @description 新建布控类型
     * @param {object} params
     */
    onCreateDeployType(params) {
      SurveillanceTaskSvr.createDeployType(params).then((res) => {
        if (res.code === 0) {
          this.getDeployTypeOptions();
          this.isShowCreateDeployType = false;
        } else {
          console.error(res.msg);
        }
      });
    },
    /**
     * @description 获取布控任务类型列表
     */
    getDeployTypeOptions() {
      SurveillanceTaskSvr.getDeployTypeList().then((res) => {
        if (res.code === 0) {
          this.deployTypeList = res.data;
        }
      });
    },
    /**
     * @description 获取部门树
     */
    getDeptTree() {
      SurveillanceTaskSvr.getDeptTree().then((res) => {
        if (res.code === 0) {
          this.deptTree = [res.data];
        }
      });
    },
    /**
     * @description 获取用户树
     */
    getUserTree() {
      SurveillanceTaskSvr.getUserTree().then((res) => {
        if (res.code === 0) {
          this.userTree = [res.data];
        }
      });
    },
    /**
     * @description 获取底库列表
     */
    getAllAlbumList() {
      this.getCameraAlbum({}, (data) => {
        this.allAlbumList = data.albums;
      });
    },
    /**
     * @description 获取相机和底库列表
     * @param {object} data
     */

    getCameraAlbum(data = {}, fn = () => {}) {
      SurveillanceTaskSvr.getCameraAlbum(data).then((res) => {
        if (res.code === 0) {
          fn(res.data);
        }
      });
    },
    /**
     * @description 分页器处理
     * @param {object} paginationInfo
     * @returns
     */
    paginationChange(paginationInfo) {
      this.pageInfo = paginationInfo;
      this.updateTaskList();
    },
    /**
     * @description 更改布控任务状态
     * @param {object} data
     * @param {number} index
     * @returns
     */
    tabStatus(data) {
      const map = {
        0: 1,
        1: 0,
      };
      const params = {
        id: data.id,
        status: data.status
      };
      console.log(data);
      console.log(params);
      SurveillanceTaskSvr.updateStatus(params).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('更改成功'));
        } else {
          console.error(res.msg);
          data.status = map[data.status];
        }
      });
    },
    // 点击撤销按钮，弹出撤销任务弹窗
    cancelTask(item) {
      const vm = this;
      this.$confirm(this.$t('布控任务撤销后将不可恢复, 您确定要继续吗?'), this.$t('撤销布控任务'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
      }).then(() => {
        SurveillanceTaskSvr.cancelSurveillanceTask({ id: item.id }).then((response) => {
          if (response.code === 0) {
            vm.updateTaskList();
          } else {
            vm.$message.error(response.msg);
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('已取消撤销')
        });
      });
    },

    /**
     * @description 点击新建任务按钮，弹出新建任务弹窗
     * @param {number} type
     */
    createTask(type) {
      const defaultDeployType = {
        0: '1',
        1: '7'
      };
      this.defaultFormData = {
        alarmType: type,
        strategyTypeId: defaultDeployType[type]
      };
      this.manageTaskType = 'create';
      this.isShowCreateTask = true;
    },
    /**
     * @description 获取字典表
     */
    initDataMap() {
      const vm = this;
      // TODO 抽离工具方法
      // 获取布控时效类型
      const deployAging = this.$store.getters.dataMapByType('deploy_aging');
      deployAging.forEach((item) => {
        vm.taskType[item.code] = item.value;
      });
      this.deployAging = deployAging;
      const deployStatus = this.$store.getters.dataMapByType('kunlun_deploy_task_status');
      this.deployStatusOption = deployStatus;
      deployStatus.forEach((item) => {
        vm.statusMap[item.code] = item.value;
      });

      const map = {};
      this.$store.getters.dataMapByType('galaxy_strategy_alarm_type').forEach((val) => {
        map[val.code] = val.value;
      });
      this.alarmTypeMap = map;
    },
    /**
     * @description 获取对应的底库
     * @param {object}params 请求参数
     */
    getAlbumList(params, fn = () => {}) {
      SurveillanceTaskSvr.getAlbumList(params).then((res) => {
        if (res.code === 0) {
          fn(res.data);
        } else {
          console.error(res.msg);
        }
      });
    },
    /**
     * @description 获取任务详情并打开弹窗
     * @param {object} task
     * @param {string} type
     */
    getDetailData(task, type) {
      SurveillanceTaskSvr.getTaskDetail({ id: task.id }).then((response) => {
        if (response.code === 0) {
          const taskDetailData = response.data;
          const { cameraIds } = getCameraInfo(taskDetailData.cameraList);
          taskDetailData.cameraIds = cameraIds;
          delete taskDetailData.cameraList;
          this.defaultFormData = taskDetailData;
          this.manageTaskType = type;
          this.isShowCreateTask = true;
        } else {
          this.$message.error(response.msg);
        }
      });
    },
    /**
     * @description
     * @param {any}
     * @returns
     */
    searchTask(info) {
      this.searchInfo = {
        ...info,
      };
      this.pageInfo = {
        pageNo: 1,
        pageSize: 20,
      };
      this.updateTaskList();
      const { cameraIds } = this.searchInfo;
      if (cameraIds && cameraIds.length > 0) {
        doAddCameraSelectHistory(cameraIds);
      }
    },
    /**
     * @description
     * @param {object} params
     * @param {string} mode 模式
     * @returns
     */
    onSaveTask(params, mode, fn = () => {}) {
      this.isSaving = true;
      const { cameraIds } = params;
      if (cameraIds && cameraIds.length) {
        doAddCameraSelectHistory(cameraIds);
      }
      if (mode === 'edit') {
        SurveillanceTaskSvr.editTask(params).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('编辑成功'));
            this.updateTaskList();
            this.getAllAlbumList();
          } else {
            console.error(res.msg);
          }
          fn();
          this.isShowCreateTask = false;
          this.isSaving = false;
        });
      } else {
        SurveillanceTaskSvr.createTask(params).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('创建成功'));
            this.updateTaskList();
            this.getAllAlbumList();
          } else {
            console.error(res.msg);
          }
          this.isShowCreateTask = false;
          this.isSaving = false;
        });
      }
    },
    toHistoryTask() {
      switchToModule({
        isBlank: false,
        module: 'surveillance-task-history',
      });
    },
    toTaskDetail(data) {
      this.$router.push({ name: 'surveillance-task-current-detail', params: { taskId: data.id } });
    },

    // 关闭新建任务弹窗
    createTaskDialogClose() {
      this.createTaskDialogVisible = false;
    },
    // 关闭新建任务弹窗
    createTaskDialogSave() {
      this.updateTaskList();
      this.createTaskDialogVisible = false;
    },

    // 关闭编辑和复制任务弹窗
    commonTaskDialogClose() {
      this.commonTaskDialogVisible = false;
    },
    // 保存编辑和复制任务弹窗
    commonTaskDialogSave() {
      this.updateTaskList();
      this.commonTaskDialogVisible = false;
    }
  }
};
</script>

<style scoped lang="scss">
.font12 {
  font-size: 12px;
}
.font14 {
  font-size: 14px;
}

.meg-container {
  width: 100%;
  height: 100%;
  background: #dce1e5;
}
.task-aside {
  width: 320px !important;
  background: #ffffff;
}
.left-content-container {
  width: 100%;
}

.main-container {
  height: 100%;
  padding: 0;
  border-left: 18px solid #dce1e5;
  box-sizing: border-box;
}
.title-container {
  height: 56px;
  line-height: 56px;
  color: #435068;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title-left-container {
  width: 250px;
}
.title-right-container {
  padding-right: 20px;
}
.content-container {
  background: #ffffff;
  height: calc(100% - 56px);
  overflow: hidden;
  .table-column-name {
    color: #21539b;
    cursor: pointer;
  }
}
.table-container {
  height: calc(100% - 50px);
}
.pagination-container {
  height: 50px;
  background: #ffffff;
}
</style>
