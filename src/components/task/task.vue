<template>
  <!-- eslint-disable vue/valid-v-for -->
  <meg-popover
    popper-class="task-popover"
    placement="bottom"
    width="340"
    trigger="click"
    :offset="10"
    @show="taskPopoverShow"
    v-model="taskPopoverVisable">
    <div class="task-body">
      <div class="task-head">
        <span class="title">任务通知</span>
        <span
          class="task-close-btn"
          @click="onTaskPopoverClose">
          <meg-icon name="close"></meg-icon>
        </span>
      </div>
      <div class="task-content-wrap">
        <span
          class="no-datas"
          v-show="taskList.length === 0">无任务</span>
        <ul
          class="task-content"
          v-loading="isTaskLoading">
          <li
            class="task-item"
            v-for="task in taskList"
            :key="task.id">
            <span
              class="task-process-bar"
              v-if="(task.progressForBar > 0 && task.progress < 100) && task.taskStatus !== 24 && [2, 12, 14, 19, 22, 19, 36, 37, 47, 48, 51].findIndex(status => status === task.taskStatus) === -1"
              :style="{width: `${task.progressForBar}%`}">
            </span>
            <span class="task-type">{{ getTaskTypeName(task) }}</span>
            <span class="task-source-name">{{ getTaskSourceName(task.taskSourceId) }}</span>
            <span class="task-create-time">{{ getTime(task.ctime) }}</span>
            <span
              :class="[
                'task-progress',
                [2, 12, 14, 19, 22, 19, 36, 37, 47, 48, 51].findIndex(status => status === task.taskStatus) !== -1? 'error' : '']">
              <section
                class="task-progress-num"
                v-if="(/{/).test(task.failMsg)">
                <!-- <span class="success">成功 {{ getProcessNum(task.failMsg,'successNum') }}</span> /
                    <span class="error">失败 {{ getProcessNum(task.failMsg,'failNum') }}   </span> -->
              </section>
              {{ getTaskStatus(task) }}
            </span>
            <span
              class="task-name"
              v-tooltip="true">{{ transformTaskName(task.taskName) }}</span>
            <div class="task-actions">
              <meg-tooltip content="取消">
                <span
                  class="task-action-icon-wrap"
                  v-if="isCancelShow(task)"
                  @click="onCancelTask(task)">
                  <meg-icon
                    class="task-actions-icon"
                    color="#435068"
                    name="cancel_task">
                  </meg-icon>
                </span>
              </meg-tooltip>
              <meg-tooltip content="删除">
                <span
                  class="task-action-icon-wrap"
                  v-if="isDeleteShow(task)"
                  @click="onDeleteTask(task)">
                  <meg-icon
                    class="task-actions-icon"
                    color="#435068"
                    name="mission_del">
                  </meg-icon>
                </span>
              </meg-tooltip>
              <meg-tooltip content="查看">
                <span
                  class="task-action-icon-wrap"
                  v-if="isDetailShow(task)"
                  @click="onDetailTask(task)">
                  <meg-icon
                    class="task-actions-icon"
                    color="#435068"
                    name="view">
                  </meg-icon>
                </span>
              </meg-tooltip>
              <meg-tooltip
                :content="[19, 36, 37, 24].findIndex(status => status === task.taskStatus) !== -1?'下载失败文件':'下载'">
                <span
                  class="task-action-icon-wrap"
                  v-if="isDownloadShow(task)"
                  @click="onDownloadTask(task.downloadUrl)">
                  <meg-icon
                    class="task-actions-icon"
                    color="#435068"
                    name="download_task">
                  </meg-icon>
                </span>
              </meg-tooltip>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div
      class="task-info"
      slot="reference">
      <meg-tooltip
        content="任务列表"
        effect="meg">
        <meg-icon
          v-show="taskListStatus !== 'hasTasking'"
          class="user-icon"
          :name="taskIconName">
        </meg-icon>
      </meg-tooltip>
      <img
        v-show="taskListStatus === 'hasTasking'"
        class="task-ing-icon"
        :src="taskGif"
        width="16"
        height="16" />
      <span
        v-show="taskIngNum > 0"
        class="task-ing-num">{{ taskIngNum }}</span>
    </div>
  </meg-popover>
  <!-- eslint-disable vue/valid-v-for -->
</template>

<script>
import moment from 'moment';
import _ from 'lodash';
import { getModulePathInfo, openByNewTab } from '@/utils/utils';
// import NProgress from 'nprogress';
import taskGif from './tasking.gif';
import LayoutSrv from './task.service';
// import 'nprogress/nprogress.css';

export default {
  name: 'Task',
  data() {
    return {
      taskGif,
      taskPopoverVisable: false,
      taskType: this.$store.getters.dataMapByType('task_notice_type'),
      // {alias: 门户使用（扁平化路由） source:服务器部署层级目录名,根目录可为空 path：前端路由}
      taskSource: {
        '0': {
          taskName: '未知任务',
          module: 'unknownTask'
        },
        '1': {
          taskName: '报警检索',
          module: {
            alias: 'alarm-history'
          }
        },
        '2': {
          taskName: '布控任务',
          module: {
            alias: 'surveillance-task'
          }
        },
        '3': {
          taskName: '抓拍检索',
          module: {
            alias: 'capture-search'
          }
        },
        '4': {
          taskName: '人像检索',
          module: {
            alias: 'face-search',
          }
        },
        '5': {
          taskName: '底库管理',
          module: {
            alias: 'portrait-library',
            child: 'batch-tasks'
          }
        },
        '6': {
          taskName: '相机管理',
          module: {
            alias: 'camera',
          }
        },
        '7': {
          taskName: '日志',
          module: {
            alias: 'search-log'
          }
        },
        '8': {
          taskName: '我的收藏',
          module: {
            alias: 'search-log',
          }
        },
        '9': {
          taskName: '频繁出没',
          module: {
            alias: 'frequency',
          }
        },
        '10': {
          taskName: '同行分析',
          module: {
            alias: 'peer',
          }
        },
        '11': {
          taskName: '落脚点分析',
          module: {
            alias: 'hiding-place'
          }
        },
        '12': {
          taskName: '底库碰撞',
          module: {
            alias: 'collision',
          }
        },
        '13': {
          taskName: '多人检索',
          module: {
            alias: 'multi-person'
          }

        },
        '14': {
          taskName: '视频找人',
          module: {
            alias: 'video-search',
          }
        },
        '15': {
          taskName: '一人一档',
          module: {
            alias: 'doc',
          }
        },
        '16': {
          taskName: '分发机检索记录',
          module: {
            alias: 'doc',
          }
        },
        '17': {
          taskName: '区域碰撞',
          module: {
            alias: 'region',
          }
        },
        '18': {
          taskName: '轨迹分析',
          module: {
            alias: 'track',
          }
        },
        '19': {
          taskName: '区域底库碰撞',
          module: {
            alias: 'album-region',
          }
        },
        '20': {
          taskName: '批量检索',
          module: {
            alias: 'capture-search',
          }
        },
        '21': {
          taskName: '任务管理',
          module: {
            alias: 'device-task',
          }
        },
        '22': {
          taskName: '智能盒管理',
          module: {
            alias: 'device-task',
          }
        },
        '23': {
          taskName: '人员聚类',
          module: {
            alias: 'person-gather',
          }
        },
        '24': {
          taskName: '探针设备管理',
          module: {
            alias: 'detection',
          }
        },
        '26': {
          taskName: '人体库管理',
          module: {
            alias: 'body-library',
            child: 'batch-tasks',
          }
        },
        '27': {
          taskName: '车辆管理',
          module: {
            alias: 'vehicle-library',
            child: 'vehicle-batch-tasks',
          }
        },
        '28': {
          taskName: '车牌管理',
          module: {
            alias: 'license-plate-library',
            child: 'license-plate-batch-tasks',
          }
        },
        '29': {
          taskName: '文件管理',
          module: {
            alias: 'file-center',
          }
        }
      },
      isTaskLoading: false, // 控制全局的任务列表加载状态 todo 改进
      taskList: [],
      taskPollingTimer: null,
      taskNoticePollingTimer: null,
      taskListStatus: '',
      taskIngNum: 0,
      taskSourceModule: {},
      isUnifiedPortal: this.$store.getters.systemByType('isUnifiedPortal').value === 'true'
    };
  },
  computed: {
    taskIconName() {
      if (this.taskListStatus === 'allDone') {
        return 'mission_notify_succeed';
      }
      if (this.taskListStatus === 'hasFailed') {
        return 'mission_notify_failed';
      }
      return 'mission_menu';
    }
  },
  created() {
    // module名称取字典表
    this.$store.getters.dataMapByType('task_type').forEach((item) => {
      this.taskSourceModule[item.code] = item.value;
    });
  },
  mounted() {
    // 归纳起来，只有非双网或者双网里的公安网才有任务通知功能
    // const { isDual, dualPlatformType } = this.$store.getters.dualAndScene;
    // if (isDual === 'false' || (isDual === 'true' && dualPlatformType === '1')) {
    this.pollingGetTasks();
    // }
  },
  methods: {
    transformTaskName(name) {
      if (name === '相机拉取') return '激活相机';
      if (name === '相机移除') return '停用相机';
      return name;
    },
    /**
     * 销毁定时器
     */
    destroyed() {
      if (this.taskNoticePollingTimer)clearTimeout(this.taskNoticePollingTimer);
      if (this.taskPollingTimer)clearTimeout(this.taskPollingTimer);
    },
    /**
     * 任务popover show
     */
    taskPopoverShow() {
      // 任务面板打开后去获取任务列表
      if (this.taskPollingTimer) {
        window.clearTimeout(this.taskPollingTimer);
        this.getTaskList();
      } else {
        this.getTaskList();
      }
    },
    /**
     * 轮询调用任务通知
     */
    pollingGetTasks() {
      this.getTaskList();
      this.getRecentTask();
    },
    /**
     * 通知打开的查看操作，下载类任务打开通知列表，分析和导入
     */
    noticeAction(e) {
      e.stopPropagation();
      this.taskPopoverVisable = true;
    },
    /**
     * 获取任务列表
     */
    getTaskList() {
      if (!this.taskPollingTimer) {
        this.isTaskLoading = true;
      } else {
        window.clearTimeout(this.taskPollingTimer);
      }
      LayoutSrv.getTaskList().then((res) => {
        if (res.code === 0) {
          // mock dev-ue 交互优化测试使用
          res.data = this.mockForDevUE(res.data);

          this.taskList.forEach((task) => {
            if (task.t) {
              window.clearInterval(task.t);
            }
          });

          this.taskList = res.data;

          // 如果任务列表过长，截取显示，最多显示100条
          if (this.taskList.length > 100) this.taskList.length = 100;

          this.updateTaskIngNum();
          this.updateTaskListStatus();
          this.taskPollingTimer = window.setTimeout(() => {
            window.requestAnimationFrame(this.getTaskList);
          }, 5000);
        }
        this.isTaskLoading = false;
      });
    },
    /**
     * 任务popover close
     */
    onTaskPopoverClose() {
      this.taskPopoverVisable = false;
    },
    /**
     * 获取任务类型名称
     */
    getTaskTypeName(task) {
      const { taskTypeId, ctime, nameLabel } = task;
      if (this.taskType[taskTypeId.toString()].value) {
        if (nameLabel !== undefined) {
          return `${this.taskType[taskTypeId.toString()].value}${moment(ctime).format('MM')}${moment(ctime).format('DD')}-${nameLabel}`;
        }
        return this.taskType[taskTypeId.toString()].value;
      }
      return '';
    },
    /**
     * 获取任务来源名称
     */
    getTaskSourceName(sourceId) {
      return this.taskSourceModule[sourceId];
    },
    /**
     * 获取显示时间
     */
    getTime(timestamp) {
      return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
    },
    /**
     * 任务状态名称
     */
    getTaskStatus(task) {
      const { taskStatus } = task;
      const taskStatusMap = this.$store.getters.dataMapByType('task_notice_status');

      const taskObj = taskStatusMap.filter((item) => item.code === taskStatus.toString())[0];

      // 进行中的任务，显示进度
      const taskingStatusId = [1, 11, 13, 21, 38, 45];
      // 完成成功的任务
      const taskedSuccessStatusId = [4, 6, 15, 17, 24, 40, 41, 46];

      if (_.indexOf(taskedSuccessStatusId, taskStatus) !== -1) {
        return taskObj.value;
      } if (_.indexOf(taskingStatusId, taskStatus) !== -1) {
        return `${task.progress}%`;
      }
      if (!taskObj) {
        return '';
      }
      return taskObj.value;
    },
    mockForDevUE(taskList) {
      const taskTypeMap = {};

      taskList.forEach((task) => {
        if (!taskTypeMap[task.taskTypeId]) {
          taskTypeMap[task.taskTypeId] = [];
          taskTypeMap[task.taskTypeId].unshift(task);
        } else {
          taskTypeMap[task.taskTypeId].unshift(task);
        }

        // if (task.progress > 0) {
        task.progressForBar = task.progress;
        // }
        if (task.progress !== 100) {
          task.t = window.setInterval(() => {
            if (task.progressForBar < 100) {
              task.progressForBar += 0.1;
            }
          }, 80);
        }
      });
      Object.keys(taskTypeMap).forEach((key) => {
        taskTypeMap[key].forEach((t, index) => {
          t.nameLabel = index + 1;
        });
      });
      return taskList;
    },
    /**
     * @description 导入和编辑的成功与失败的数量
     * @param {string} msg 消息
     * @param {string} prop 属性字段
     * @returns msg的对象形式或空值
     */
    getProcessNum(msg, prop) {
      return (/{/).test(msg) ? JSON.parse(msg)[prop] : '';
    },
    /**
     * 取消任务
     */
    onCancelTask(task = {}) {
      const { id } = task;
      this.$confirm('您确定要取消此任务吗？', '取消任务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        LayoutSrv.cancelTaskById(id).then((res) => {
          if (res.code === 0) {
            this.$message.success('取消任务成功');
            window.clearTimeout(this.taskPollingTimer);
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    /**
     * 删除任务
     */
    onDeleteTask(task = {}) {
      const { id } = task;
      this.$confirm('您确定要删除此任务吗？删除后将不可恢复', '删除任务', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        LayoutSrv.deleteTaskById(id).then((res) => {
          if (res.code === 0) {
            this.$message.success('删除任务成功');
            window.clearTimeout(this.taskPollingTimer);
            this.getTaskList();
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    /**
     * 更新进行中的任务总数
     */
    updateTaskIngNum() {
      const tasksIng = _.filter(this.taskList, (task) => task.taskStatus === 1 || task.taskStatus === 13 || task.taskStatus === 21);
      this.taskIngNum = tasksIng.length ? tasksIng.length : 0;
    },
    /**
     * 更新任务状态
     */
    updateTaskListStatus() {
      const taskingStatus = [1, 13, 21];
      const failedStatus = [2, 12, 19, 22];
      for (let i = 0; i < this.taskList.length; i += 1) {
        if (_.indexOf(failedStatus, this.taskList[i].taskStatus) !== -1) {
          this.taskListStatus = 'hasFailed';
          return;
        }
        if (_.indexOf(taskingStatus, this.taskList[i].taskStatus) !== -1) {
          this.taskListStatus = 'hasTasking';
          return;
        }
      }
      this.taskListStatus = 'allDone';
    },
    /**
     * 获取最新已完成/失败的任务，显示通知消息
     */
    getRecentTask() {
      window.clearTimeout(this.taskNoticePollingTimer);
      LayoutSrv.getRecentTasks().then((res) => {
        if (res.code === 0) {
          const recentTask = res.data;
          recentTask.forEach((task) => {
            const sourceName = this.getTaskSourceName(task.taskSourceId);
            const { taskName } = task;
            setTimeout(() => {
              this.$notify({
                duration: 5000,
                offset: 40,
                customClass: 'recent-task',
                dangerouslyUseHTMLString: true,
                message: (
                  <div>
                    <div class="status">{ this.getTaskStatusShow(task) }</div>
                    <div class="source">
                    <meg-tooltip class="item" effect="meg" content={ sourceName } placement="bottom">
                      <p class="source-name">{ this.getTaskSourceName(task.taskSourceId) }</p>
                    </meg-tooltip>
                    <meg-tooltip class="item" effect="meg" content={ taskName } placement="bottom">
                      <p class="task-name">{ task.taskName }</p>
                    </meg-tooltip>
                    </div>
                    <div class="actions">
                      <div class="action-btn" on-click={ this.noticeAction }>查看</div>
                    </div>
                  </div>
                )
              });
            }, 0);
          });
          // 5s 调用一次
          this.taskNoticePollingTimer = window.setTimeout(() => {
            window.requestAnimationFrame(this.getRecentTask);
          }, 5000);
        }
      });
    },
    getTaskStatusShow(task) {
      const { taskStatus } = task;
      const taskingStatusId = [1, 13, 21];
      const taskedSuccessStatusId = [4, 15, 24, 17, 34, 35];
      if (_.indexOf(taskedSuccessStatusId, taskStatus) !== -1) {
        return '任务已完成';
      } if (_.indexOf(taskingStatusId, taskStatus) !== -1) {
        return `${task.progress}%`;
      }
      return '任务失败';
    },
    /**
     * 下载
     */
    onDownloadTask(downloadUrl) {
      window.location = downloadUrl;
    },
    /**
     * 跳转查看详情
     */
    onDetailTask(task) {
      const { taskSourceId, detailUri, id } = task;
      const { module } = this.taskSource[taskSourceId];
      const judgeAfterModules = this.$store.getters.modulesByAlias('judge-after').childPermissions;

      let url = '/';
      // 如果是module里的子页面（page）
      let modulePathInfo = {};

      modulePathInfo = getModulePathInfo({
        module: module.alias,
      });
      if (module.child) {
        url = `${modulePathInfo.href}/${module.child}/${detailUri}`;
      } else {
        const fileCenter = taskSourceId === 29;
        url = `${modulePathInfo.href + (fileCenter ? `/${id}` : '')}`;
      }
      judgeAfterModules.forEach((m) => {
        if (m.alias === module.alias) {
          url += '?pageType=single';
        }
      });
      consola.info('task detail url: ', url);
      // window.open(url);
      openByNewTab(url);
    },
    /**
     * 是否可以取消任务
     */
    isCancelShow(task) {
      const { taskStatus, taskSourceId } = task;
      // 文件管理单独判断
      if (taskSourceId === 29 && taskStatus === 38) {
        return true;
      }
      // 导出和分析正在进行中的任务可取消操作
      // 研判分析类任务不可取消
      // ntp校时、固件升级、批量编辑不可取消
      // 智能盒管理不可取消
      // 拉取相机 导出相机不可取消 10 1
      if (taskStatus === 1 && task.taskTypeId !== 6
       && task.taskTypeId !== 7 && task.taskTypeId !== 8
       && task.taskSourceId !== 22 && task.taskTypeId !== 10
       && task.taskTypeId !== 1 && task.taskTypeId !== 2) {
        return true;
      }
      // taskStatus: 11/13  --> 文件未上传/入库中 （入库中不显示取消按钮 https://jira.megvii-inc.com/browse/GALAXY-1188）
      if ((taskStatus === 11) && (taskSourceId === 5 || taskSourceId === 26 || taskSourceId === 27 || taskSourceId === 28)) {
        return true;
      }
      return false;
    },
    /**
     * 是否可以删除任务
     */
    isDeleteShow(task) {
      const { taskTypeId } = task;
      // 研判分析类任务的任何阶段都可以删除
      return taskTypeId === 3;
    },
    /**
     * 是否可以查看任务
     */
    isDetailShow(task) {
      const { taskStatus, taskTypeId, taskSourceId } = task;
      // 底库导入的任务，研判分析类任务进行中，完成，取消
      const detailStatusId = [21, 23, 24];
      // taskTypeId: 2  --> 批量导入
      // taskStatus: 15 --> 入库成功
      // taskSourceId --> 人像，人体，车辆，车牌
      if (taskTypeId === 2 && taskStatus === 15) {
        if (taskSourceId === 5 || taskSourceId === 26 || taskSourceId === 27 || taskSourceId === 28) {
          return true;
        }
      }
      // 文件管理上传成功文件显示详情按钮
      if (taskSourceId === 29 && taskStatus === 40) {
        return true;
      }
      if (_.indexOf(detailStatusId, taskStatus) !== -1) {
        return true;
      }
      return false;
    },
    /**
     * 是否可以下载
     */
    isDownloadShow(task) {
      const { taskStatus } = task;
      // 导出完成
      return taskStatus === 4 || taskStatus === 19 || taskStatus === 36 || taskStatus === 37 || taskStatus === 47 || taskStatus === 48;
    },
    // getProgressForBar(task) {
    //   if (task.progress !== 100) {
    //     setTimeout(() => {
    //       task.progressForBar += 0.3;
    //       this.getProgressForBar(task);
    //       console.log('task.progressForBar', `${task.progressForBar}%`);
    //     }, 1000);
    //     return `${task.progressForBar}%`;
    //   }
    //   return `${task.progress}%`;
    // }
  }
};
</script>

<style lang="scss" scoped>
.recent-task {
  width: 340px;
  height: 72px;
  font-size: 14px;
  color: #435068;
  border-radius: 2px !important;

  .status {
    font-size: 14px;
    color: #a2a9b7;
    width: 100px;
  }

  &.right {
    right: 0;
  }

  .source {
    width: 225px;
    overflow: hidden;
    display: flex;
  }

  .source-name {
    display: inline-block;
    max-width: 85px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .task-name {
    display: inline-block;
    margin-left: 5px;
    max-width: 135px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    position: absolute;
    right: 40px;
    bottom: 13px;

    .action-btn {
      width: 48px;
      height: 24px;
      background-color: #ebecee;
      color: #596167;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      right: 0;
      bottom: 10px;
      cursor: pointer;
    }
  }
}

.task-info {
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;

  .task-ing-num {
    font-size: 14px;
    margin-left: 2px;
  }
}

.task-body {
  height: 100%;

  .task-head {
    height: 48px;
    background-color: #fff;
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: bold;
    padding: 0 12px;
    box-sizing: border-box;
    justify-content: space-between;
    box-shadow: 0 5px 21px 6px rgba(0, 0, 0, 0.1);

    .title {
      color: #435068;
      font-weight: 600;
    }

    .task-close-btn {
      cursor: pointer;
    }
  }

  .no-datas {
    position: absolute;
    top: 50%;
    left: 50%;
  }

  .task-content {
    // height: calc(100% - 55px);
    overflow-x: hidden;
    overflow-y: hidden;
    padding: 10px;
    box-sizing: border-box;
    position: relative;

    .task-item {
      height: 102px;
      position: relative;
      font-size: 14px;
      margin-bottom: 4px;
      background-color: #fff;

      .task-process-bar {
        position: absolute;
        top: 0;
        height: 3px;
        width: 100%;
        background-color: #009852;
        transition: all 0.2s;
      }

      .task-type {
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 16px;
        color: #435068;
        font-weight: 600;
      }

      .task-source-name {
        position: absolute;
        top: 40px;
        left: 10px;
        color: #616c80;
      }

      .task-create-time {
        position: absolute;
        bottom: 11px;
        left: 10px;
        color: #94a0a8;
        font-size: 12px;
      }

      .task-progress {
        position: absolute;
        top: 10px;
        right: 14px;
        font-size: 16px;
        color: #435068;
        font-weight: 600;

        &.error {
          color: #f05353;
        }

        .task-progress-num {
          display: inline-block;
          padding-right: 10px;
          font-size: 12px;
          color: #dcdfe6;

          .success {
            color: rgb(103, 194, 58);
          }

          .error {
            color: rgb(245, 108, 108);
          }
        }
      }

      .task-name {
        position: absolute;
        top: 40px;
        right: 14px;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 155px;
        color: #616c80;
      }

      .task-actions {
        position: absolute;
        right: 11px;
        bottom: 8px;
        // height: 14px;
        display: flex;

        .task-action-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          // margin-left: 10px;
          width: 26px;
          height: 26px;
          cursor: pointer;

          &:hover {
            background: rgba(67, 80, 104, 0.18);
            border-radius: 2px;
          }
        }
      }

      .task-actions-icon {
        width: 14px;
        height: 14px;
        color: #8a97a0;
        cursor: pointer;
      }
    }
  }
}
</style>
<style lang="scss">
.meg-popover {
  &.task-popover {
    left: auto !important;
    right: 0 !important;
    border-radius: 0;
    top: 44px !important;
    padding: 0;
    height: calc(100% - 58px) !important;
    background-color: #eae9ea;

    .task-content-wrap {
      height: calc(100% - 48px);
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}
</style>
