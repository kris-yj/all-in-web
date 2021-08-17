<template>
  <div
    class="analysis-result">
    <div class="radio-group">
      <meg-radio-group
        v-model="analysisStatus"
        @change="handleChange">
        <template v-for="radioButton in radioButtonInfo">
          <meg-radio-button
            :key="radioButton.value"
            :label="radioButton.value">
            {{ radioButton.text }}({{ radioButton.count }})
          </meg-radio-button>
        </template>
      </meg-radio-group>
      <meg-button
        v-if="permission"
        class="create-task"
        type="primary"
        @click="createTask">
        新建任务
      </meg-button>
    </div>
    <div
      v-show="selections.length"
      class="select-ctrl">
      <span class="select-count">
        <meg-checkbox
          @change="acrossChange"
          v-model="acrossPage">
          跨页全选
        </meg-checkbox>
        <span>已选{{ acrossPage ? tableData.totalRecords : selections.length }}项</span>
      </span>
      <div
        v-if="permission"
        class="select-ctrl-btns">
        <meg-button
          v-if="showBatchResume"
          :loading="batchResumeLoading"
          @click="restartSelections">
          批量继续
        </meg-button>
        <meg-button
          v-if="showBatchPause"
          :loading="batchPauseLoading"
          @click="pauseSelections">
          批量暂停
        </meg-button>
        <meg-button
          v-if="showBatchRestart"
          :loading="batchRestartLoading"
          @click="resumeSelections">
          批量重启
        </meg-button>
        <meg-button
          @click="removeSelections">
          批量删除
        </meg-button>
        <meg-button
          @click="resetSelection">
          退出选择
        </meg-button>
      </div>
    </div>
    <div class="analysis-list">
      <common-table
        ref="analysisList"
        stripe
        selectable
        height="100%"
        :background="background"
        :loading="loading"
        :columns="columns"
        :data="tableData.records"
        @selection-change="columnsSelect"
        @sort-change="sortChange"
        :pagination-props="tablePagination"
        :pagination-events="paginationEvents"
        :row-selectable="rowSelectable">
        <!-- 相机名称 -->
        <template v-slot:cameraName="scope">
          <div
            class="active-text"
            @click="taskDetail(scope)"
            v-tooltip="true">
            {{ scope.value }}
          </div>
        </template>
        <!-- 任务名称 -->
        <template v-slot:taskName="scope">
          <div
            class="active-text"
            @click="taskDetail(scope)"
            v-tooltip="true">
            {{ scope.value }}
          </div>
        </template>
        <!-- 卡口类型 -->
        <template v-slot:monitoringType="{ value }">
          {{ getMonitoringTypeValue(value) }}
        </template>
        <!-- 进度 -->
        <template v-slot:progress="scope">
          <meg-progress
            :stroke-width="5"
            :show-text="false"
            :percentage="Number(scope.value) || 0"></meg-progress>
          <div class="analysis-progress-info">
            <span class="analysis-progress">{{ Number(scope.value) }}%</span><span class="status-txt">{{ progressText(scope) }}</span>
          </div>
        </template>
        <!-- 失败数 录像解析 -->
        <template
          v-if="type === 'video'"
          v-slot:failedNum="{ row, value }">
          <meg-button
            type="text"
            v-if="value > 0"
            @click="showErrors(row)">
            {{ value }}
          </meg-button>
          <span
            v-else>{{ value }}</span>
        </template>
        <!-- 完成数 录像解析 -->
        <template v-slot:finishNum="{ row }">
          {{ row.successNum }}/{{ row.totalNum }}
        </template>
        <!-- 完成数 文件解析 -->
        <template v-slot:finishedNum="{ row }">
          {{ row.finishedNum }}/{{ row.totalTaskItemNum }}
        </template>
        <!-- 创建时间 -->
        <template v-slot:createTime="{ value }">
          {{ value | formatTime('YYYY-MM-DD HH:mm') }}
        </template>
        <!-- 解析时间 -->
        <template v-slot:analysisTime="{ row }">
          {{ getAnalysisTime(row) }}
        </template>
        <!-- 解析类型 -->
        <template v-slot:analysisType="{ row }">
          <analysis-type-icons :init-property-data="row"></analysis-type-icons>
        </template>
        <template v-slot:creatorName="{ value }">
          <div v-tooltip="true">
            {{ value }}
          </div>
        </template>
        <!-- 操作 -->
        <template v-slot:operate="{ row }">
          <!-- 操作交互调整，待交互稿更新后对接 -->
          <common-collapse-btns
            v-if="permission">
            <template v-if="row.status !== 6">
              <meg-button
                type="text"
                v-if="showRestartButton(row)"
                @click="commandFn(row, 'restart')">
                {{ $t('失败重启') }}
              </meg-button>
              <meg-button
                type="text"
                v-if="showPauseButton(row)"
                @click="commandFn(row, 'pause')">
                {{ $t('暂停') }}
              </meg-button>
              <meg-button
                type="text"
                v-if="showResumeButton(row)"
                @click="commandFn(row, 'resume')">
                {{ $t('继续') }}
              </meg-button>
              <meg-dropdown
                trigger="click"
                class="judge-btn"
                v-if="showJudgeButton(row)">
                <meg-button
                  type="text"
                  @click="getJudgeButtonList(row)">
                  {{ $t('研判') }}
                </meg-button>
                <meg-dropdown-menu slot="dropdown">
                  <meg-dropdown-item
                    v-for="item in judgeActionConfig"
                    :key="item.label">
                    <meg-button
                      type="text"
                      @click="judgeHandle(row, item.value, item)">
                      {{ item.label }}
                    </meg-button>
                  </meg-dropdown-item>
                </meg-dropdown-menu>
              </meg-dropdown>
              <!-- 文件解析去掉复制按钮 -->
              <meg-button
                type="text"
                v-if="permission && type !== 'realtime' && type !== 'file'"
                @click="commandFn(row, 'copy')">
                {{ $t('复制') }}
              </meg-button>
            </template>
            <meg-button
              type="text"
              v-if="hasAttributeSearch"
              @click="commandFn(row, 'target')">
              {{ $t('解析结果') }}
            </meg-button>
            <meg-button
              type="text"
              v-if="hasAlarmHistory"
              @click="commandFn(row, 'alarm')">
              {{ $t('报警结果') }}
            </meg-button>
            <template v-if="row.status !== 6">
              <meg-button
                type="text"
                v-if="permission"
                @click="commandFn(row, 'edit')">
                {{ $t('编辑') }}
              </meg-button>
            </template>
            <meg-button
              type="text"
              @click="commandFn(row, 'delete')">
              {{ $t('删除') }}
            </meg-button>
          </common-collapse-btns>
        </template>
      </common-table>
    </div>
    <meg-dialog
      class="errors-list"
      title="失败列表"
      :visible.sync="dialogVisible"
      width="800px">
      <div style="height:400px;">
        <common-table
          height="100%"
          :pagination-props="errorsPagination"
          :pagination-events="errorsPageEvents"
          :loading="loadErrors"
          :data="errInfos"
          :columns="[{
            label: '相机名称',
            prop: 'cameraInfo',
            width: 200
          }, {
            label: '解析时间',
            prop: 'time',
            width: 300
          }, {
            label: '失败原因',
            prop: 'errors'
          }]">
          <template v-slot:cameraInfo="{ value }">
            <span>{{ value && value.cameraName }}</span>
          </template>
          <template v-slot:time="{ row }">
            {{ showErrorTime(row) }}
          </template>
          <template v-slot:errors="{ value }">
            {{ errorsText(value) }}
          </template>
        </common-table>
      </div>
      <!-- <span
        slot="footer"
        class="dialog-footer">
        <meg-button @click="dialogVisible = false">取 消</meg-button>
        <meg-button
          type="primary"
          @click="dialogVisible = false">确 定</meg-button>
      </span> -->
    </meg-dialog>
  </div>
</template>
<script>
import CommonTable from '@/common-components/common-table';
import CommonCollapseBtns from '@/common-components/common-collapse-btns';
import AnalysisTypeIcons from '@/components/analysis/analysis-type-icons';
import analysisDetailSer from '@/modules/file-analysis/analysis-detail.service';
import videotapeSer from '@/modules/videotape-analysis/videotape-analysis.service';
import _ from 'lodash';
import moment from 'moment';

export default {
  components: {
    CommonTable,
    AnalysisTypeIcons,
    CommonCollapseBtns
  },
  props: {
    monitoringType: {
      type: [String, Number],
      default: '2'
    },
    type: {
      type: String,
      default: 'realtime'
    },
    // 表格的快速筛选按钮配置
    countInfo: {
      type: Object,
      default: () => ({})
    },
    // 表格配置
    columns: {
      type: Array,
      default: () => []
    },
    // 表格数据
    tableData: {
      type: Object,
      default: () => {}
    },
    // 是否数据正在加载中
    loading: {
      type: Boolean,
      default: false
    },
    // 研判按钮配置
    // {
    //   label: '这是一个数组元素示例',
    //   value: 'module_alias'
    // }
    judgeActionConfig: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 表格无数据背景配置
    this.background = {
      icon: 'icon_4',
      text: '暂无数据'
    };
    // 表格分页事件配置
    this.paginationEvents = {
      change: this.paginationChange,
      // 'sync:currentPage': this.syncCurrentPage
    };
    this.errorsPageEvents = {
      change: this.handleErrorPageChange
    };
    return {
      errorParams: {
        batchTaskId: '',
        pageSize: 20,
        pageNo: 1
      },
      errorTotal: 0,
      errsVal: this.$store.getters.dataMapByType('analysis_history_exception'),
      loadErrors: true,
      errInfos: [],
      dialogVisible: false,
      rowSelectable() {
        return true;
      },
      batchPauseLoading: false,
      batchResumeLoading: false,
      batchRestartLoading: false,
      allSelectable: true,
      monitorType: this.monitoringType,
      acrossPage: false,
      selections: [],
      analysisStatus: '', // 当前筛选显示的解析状态
      resources: {}
    };
  },
  computed: {
    hasAttributeSearch() {
      return this.$store.getters.modulesByAlias('attribute-search');
    },
    hasAlarmHistory() {
      return this.$store.getters.modulesByAlias('alarm-history');
    },
    radioButtonInfo() {
      const videoRadioButtonInfo = [
        {
          label: 'totalNum',
          value: '',
          count: 0,
          text: this.$t('全部'),
          eventLabel: 'VideotapeAnalysisTaskAllTab'
        }, {
          label: 'runningCount',
          value: 1,
          count: 0,
          text: this.$t('正在进行'),
          eventLabel: 'VideotapeAnalysisTaskDoingTab'
        }, {
          label: 'waitingCount',
          value: 0,
          count: 0,
          text: this.$t('等待中'),
          eventLabel: 'VideotapeAnalysisTaskWaitTab'
        }, {
          label: 'pausedCount',
          value: 3,
          count: 0,
          text: this.$t('已暂停'),
          eventLabel: 'VideotapeAnalysisTaskStopTab'
        }, {
          label: 'finishCount',
          value: 2,
          count: 0,
          text: this.$t('已完成'),
          eventLabel: 'VideotapeAnalysisTaskOverTab'
        }
      ];
      const realtimeRadioButtonInfo = [
        {
          label: 'totalNum',
          value: '',
          count: 0,
          text: this.$t('全部'),
          eventLabel: 'FealtimeAnalysisTaskAllTab'
        }, {
          label: 'runningCount',
          value: 2,
          count: 0,
          text: this.$t('正在进行'),
          eventLabel: 'FealtimeAnalysisTaskDoingTab'
        }, {
          label: 'waitingCount',
          value: 1,
          count: 0,
          text: this.$t('等待中'),
          eventLabel: 'FealtimeAnalysisTaskWaitTab'
        }, {
          label: 'pausedCount',
          value: 4,
          count: 0,
          text: this.$t('已暂停'),
          eventLabel: 'FealtimeAnalysisTaskStopTab'
        }, {
          label: 'finishCount',
          value: 3,
          count: 0,
          text: this.$t('已完成'),
          eventLabel: 'FealtimeAnalysisTaskOverTab'
        }, {
          label: 'noStartCount',
          value: 5,
          count: 0,
          text: this.$t('未开始'),
          eventLabel: 'FealtimeAnalysisTaskUnstart'
        }, {
          label: 'errorCount',
          value: 6,
          count: 0,
          text: this.$t('异常'),
          eventLabel: ''
        }
      ];
      const { countInfo } = this;
      const radioInfo = this.type === 'realtime' ? realtimeRadioButtonInfo : videoRadioButtonInfo;
      radioInfo.forEach((item) => {
        item.count = parseInt(countInfo[item.label], 10) || 0;
      });
      return radioInfo;
    },
    // 表格的分页配置
    tablePagination() {
      return {
        align: 'center',
        layout: 'prev, pager, next, sizes, total',
        currentPage: _.isEmpty(this.tableData) ? 1 : this.tableData.pageNo,
        pageSizes: [20, 50, 100, 500],
        total: _.isEmpty(this.tableData) ? 0 : this.tableData.totalRecords
      };
    },
    errorsPagination() {
      return {
        align: 'center',
        layout: 'prev, pager, next, sizes, total',
        currentPage: 1,
        pageSizes: [20, 50, 100, 500],
        total: this.errorTotal
      };
    },
    // 卡口类型
    monitoringTypeList() {
      return this.$store.getters.dataMapByType('kunlun_analysis_bayonet_type') || [];
    },
    showBatchRestart() {
      const { type, analysisStatus } = this;
      const hasFaileds = this.selections.find((item) => item.failedNum > 0);
      return (type === 'video' || type === 'file') && analysisStatus === 2 && hasFaileds;
    },
    showBatchPause() {
      const { type, analysisStatus } = this;
      if (type === 'realtime') {
        return [1, 2].includes(analysisStatus); // && Number(monitoringType) === 2;
      }
      return [0, 1].includes(analysisStatus);
    },
    showBatchResume() {
      const { type, analysisStatus } = this;
      if (type === 'realtime') {
        return analysisStatus === 4;
      }
      return analysisStatus === 3;
    },
    permission() {
      const alias = this.type === 'video' ? 'videotape-analysis' : `${this.type}-analysis`;
      return this.$store.getters.modulePermissonsByAlias(alias).length;
    }
  },
  watch: {
    acrossPage(checked) {
      this.rowSelectable = () => !checked;
    },
    // tableData({ records = [] }) {
    // if (this.acrossPage && records.length) {
    //   this.$nextTick(() => {
    //     console.log('across');
    //     this.handleAllSelect(true);
    //   });
    // } else {
    //   this.rowSelectable = () => true;
    // }
    // },
    monitoringType(v) {
      this.monitorType = v;
      // const { analysisList } = this.$refs;
      // if (analysisList) {
      //   analysisList.clearSelection();
      // }
    },
    tableData(v) {
      console.log(v, 'vvvvvv');
    }
  },
  methods: {
    handleErrorPageChange(pageInfo) {
      this.errorParams.pageSize = pageInfo.pageSize;
      this.errorParams.pageNo = pageInfo.pageNo;
      this.getErrors();
    },
    errorsText(errs) {
      const defTxt = this.errsVal[0].value;
      if (!errs) {
        return defTxt;
      }
      return errs.map((item) => this.errsVal.filter((err) => err.code === item.code)[0].value).join(', ');
    },
    showErrorTime(row) {
      const { startTime, endTime } = row || {};
      if (startTime && endTime) {
        return `${moment(startTime).format('YYYY-MM-DD hh:mm')} 至 ${moment(endTime).format('YYYY-MM-DD hh:mm')}`;
      }
      return '';
    },
    async getErrors() {
      this.loadErrors = true;
      const { code, data, msg } = await videotapeSer.showTaskErrors(this.errorParams);
      this.loadErrors = false;
      if (code === 0) {
        this.errInfos = data.records || [];
        this.errorTotal = data.totalRecords;
      } else {
        this.$message.error(msg);
      }
    },
    async showErrors(row) {
      this.dialogVisible = true;
      this.errorParams.batchTaskId = row.batchTaskId;
      await this.getErrors();
    },
    handleEvt(evtId) {
      this.eventTracking(evtId);
    },
    /**
     * @description 表头排序
     * @param {Object} sortInfo 排序信息
     */
    sortChange(sortInfo) {
      this.$emit('sort-change', sortInfo);
    },
    handleAllSelect(v) {
      const { analysisList } = this.$refs;
      if (analysisList) {
        const { multipleTable } = analysisList.$refs;
        this.tableData.records.forEach((item) => {
          multipleTable.toggleRowSelection(item, v);
        });
        this.rowSelectable = function () {
          return !v;
        };
        // this.allSelectable = !v;
      }
    },
    acrossChange(v) {
      this.handleAllSelect(v);
    },
    /**
     * @description 查询研判列表
     * @param {Object} row 当前表格行数据
     */
    async getJudgeButtonList(row) {
      const { id } = row;
      if (this.type === 'file') {
        let resourceIds = this.resources[id];
        if (!resourceIds) {
          const { data, code } = await analysisDetailSer.getDetailFileList({
            pageNo: 1,
            pageSize: 60,
            taskId: id
          });
          if (code === 0) {
            if (data) {
              resourceIds = data.records.map((item) => item.resourceId);
              this.resources[id] = resourceIds;
            }
          }
        }
        this.$emit('get-judge-button-list', resourceIds);
      } else {
        this.$emit('get-judge-button-list', row);
      }
    },
    /**
     * @description 研判按钮点击事件
     * @param {Object} row 当前行数据
     * @param {String} alias 要跳转到的模块别名
     */
    judgeHandle(row, alias, item) {
      this.$emit('judge-handle', {
        ...row,
        alias,
        resourceIds: this.resources[row.id],
      }, item);
    },
    progressText(scope) {
      let text = '';
      this.radioButtonInfo.forEach((item) => {
        if (item.value === scope.row.status) {
          text = item.text;
        }
      });
      return text;
    },
    showRestartButton(row) {
      const { type, permission } = this;
      return (type === 'video' || type === 'file') && row.status === 2 && row.failedNum > 0 && permission;
    },
    showPauseButton(row) {
      const { type, permission } = this;
      // const { monitoringType } = row;
      const status = type === 'realtime' ? [1, 2] : [0, 1];
      const showBtn = status.includes(row.status) && permission;
      // if (type === 'realtime') {
      //   return showBtn && monitoringType === 2;
      // }
      return showBtn;
    },
    showResumeButton(row) {
      const { type, permission } = this;
      const status = type === 'realtime' ? 4 : 3;
      const showBtn = row.status === status && permission;
      return showBtn;
    },
    showJudgeButton({ status, totalMinute }) {
      const { type } = this;
      const fileJudgePermission = !!this.$store.getters.modulesByAlias(['person-gather']).length;
      const videoJudgePermission = !!this.$store.getters.modulesByAlias(['frequency', 'peer']).length;
      return (type === 'video' && videoJudgePermission && status === 2) || (type === 'file' && totalMinute > 0 && fileJudgePermission && status === 2);
    },
    taskDetail(data) {
      this.$emit('task-detail', data.row);
    },
    createTask() {
      this.$emit('create-task');
    },
    /**
     * 批量继续
     */
    restartSelections() {
      this.batchResumeLoading = true;
      this.$emit('batch-resume', {
        acrossPage: this.acrossPage,
        selections: this.selections
      });
    },
    /**
     * 批量暂停
     */
    pauseSelections() {
      this.batchPauseLoading = true;
      this.$emit('batch-pause', {
        acrossPage: this.acrossPage,
        selections: this.selections
      });
    },
    /**
     * 批量重启
     */
    resumeSelections() {
      this.batchRestartLoading = true;
      this.$emit('batch-restart', {
        acrossPage: this.acrossPage,
        selections: this.selections
      });
    },
    /**
     * 批量删除
     */
    removeSelections() {
      this.$emit('batch-delete', {
        acrossPage: this.acrossPage,
        selections: this.selections
      });
    },
    resetSelection() {
      this.acrossPage = false;
      this.$refs.analysisList.clearSelection();
      this.rowSelectable = function () {
        return true;
      };
    },
    handleChange(value) {
      this.$emit('radio-change', value);
      this.radioButtonInfo.forEach((item) => {
        if (item.value === value) {
          this.eventTracking(item.eventLabel);
        }
      });
    },
    /**
     * @param {data} 单行表格数据
     * @param {type} 点击的类型
     * 操作中的按钮点击时执行的方法
     */
    commandFn(data, catrlType) {
      console.log('data', data);
      switch (catrlType) {
        case 'pause':
          this.$emit('pause-task', data);
          break;
        case 'resume':
          this.$emit('resume-task', data);
          break;
        case 'edit':
          this.$emit('edit-task', data);
          break;
        case 'delete':
          this.$emit('delete-task', data);
          break;
        case 'copy':
          this.$emit('copy-task', data);
          break;
        case 'restart':
          this.$emit('restart-task', data);
          break;
        case 'target':
          this.$emit('target', data);
          break;
        case 'alarm':
          this.$emit('alarm', data);
          break;
        default:
          console.log(1);
      }
    },
    /**
     * @description 获取解析时间字符串
     * @param {Object} tabRowData 表格行数据
     * @returns 返回解析时间字符串模板
     */
    getAnalysisTime(tableRowData) {
      if (tableRowData.scheduleType) {
        return `${moment(tableRowData.startTime).format('YYYY-MM-DD')}${this.$t(' 至 ') + moment(tableRowData.endTime).format('YYYY-MM-DD')}`;
      }
      return this.$t('长期有效');
    },
    /**
     * @description 获取卡口类型明文
     * @param {String} monitoringTypeCode 卡口类型码
     * @returns {String} 卡口类型明文
     */
    getMonitoringTypeValue(monitoringTypeCode) {
      let monitoringType = '';
      this.monitoringTypeList.forEach((item) => {
        if (item.code === monitoringTypeCode.toString()) {
          monitoringType = item.value;
        }
      });
      return monitoringType;
    },
    /**
     * @description 被选中的表格数据
     * @param {Array} columnsSelectedValList 被选中的行数据组成的数组
     */
    columnsSelect(columnsSelectedValList) {
      this.selections = columnsSelectedValList;
      if (!columnsSelectedValList.length) {
        this.acrossPage = false;
      }
    },
    /**
     * @description 当前表格分页改变
     * @param {Object} paginationInfo 分页信息
     */
    paginationChange(paginationInfo) {
      this.$emit('page-change', paginationInfo);
    }
  }
};
</script>
<style lang="scss" scoped>
.errors-list {
  ::v-deep .meg-dialog__body {
    padding: 0;
  }
}
.analysis-result {
  height: 100%;
  position: relative;
  .active-text {
    cursor: pointer;
    color: #1e4b8c;
  }
  .radio-group {
    height: 55px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .meg-radio-group {
      flex: 1;
      text-align: center;
    }
    .create-task {
      margin-right: 20px;
    }
  }
  .analysis-list {
    height: calc(100% - 55px);
    background: #ffffff;
    ::v-deep .meg-progress-bar__inner {
      transition: none;
    }
  }
  .analysisTime {
    &:before {
      content: '';
      width: 13px;
      display: inline-block;
    }
  }
  .select-ctrl {
    position: absolute;
    background: #dce1e5;
    z-index: 12;
    left: 0;
    top: 0;
    width: 100%;
    height: 53px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .select-ctrl-btns {
    padding-right: 20px;
  }
  .analysis-progress-info {
    line-height: 1;
    margin-top: 5px;
  }
  .analysis-progress {
    font-size: 12px;
  }
  .status-txt {
    font-size: 12px;
    color: rgba(88, 102, 129, 0.5);
    margin-left: 3px;
    margin-top: 5px;
  }
  .meg-button {
    &+.judge-btn {
      margin-left: 15px;
    }
  }
  .judge-btn {
    &+.meg-button {
      margin-left: 15px;
    }
  }
}
</style>
<style lang="scss">
.judge-loading {
  height: 80px;
  width: 58px;
  .circular {
    width: 30px;
  }
}
.analysis-list {
  .meg-table .cell {
    padding-left: 5px;
    padding-right: 5px;
  }
}
</style>
