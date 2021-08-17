<template>
  <page-layout>
    <div class="task-detail">
      <div class="aside">
        <div class="aside-header">
          <meg-return-button
            width="160px"
            :title="taskFormData.jobName||''"></meg-return-button>
          <span
            class="check-detail-button"
            @click="checkDetail"
            type="text">{{ $t('查看任务详情') }}
          </span>
        </div>
        <div class="aside-body">
          <div class="aside-body-header">
            {{ $t('分析结果') }}
            <span class="header-tip">{{ $t('共有{count}个碰撞结果',{count:cardList.length }) }}</span>
          </div>
          <div class="aside-body-content">
            <div
              class="task-card-box"
              v-for="(item,index) in taskList"
              @click="taskCardClick(item.personId,index)"
              :key="index">
              <meg-card
                :img-src="item.photoUrl"
                :img-border="index === activeIndex ? '2px solid #0074FF':''"
                img-margin="0">
                <div
                  slot="bottom"
                  class="count-num-box">
                  <span>{{ item.count===1000 ? $t('超') : '' }}</span>
                  <span class="count-num">{{ item.count }}</span>{{ $t('次') }}
                </div>
              </meg-card>
            </div>
            <div
              class="load-more-box"
              v-show="morePageVisible">
              <meg-button
                class="load-more-button"
                @click.native="loadMore">
                {{ $t('加载更多') }}
              </meg-button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="result"
        v-background="resultBackground">
        <div
          class="result-box"
          v-loading="resultLoading"
          style="height:100%">
          <div class="result-header">
            <div style="width:230px;margin-left:3px">
              <div
                v-show="!isSelectMode"
                style="color:#435068">
                {{ $t('分析结果：共') }} <span class="number-font">{{ totalNum }}</span> {{ $t('条') }}
              </div>
              <div v-show="isSelectMode">
                {{ $t('已选择') }} <span class="number-font">{{ selectedNum }}</span> {{ $t('条') }}
              </div>
            </div>
            <div>
              <sort-box @change="setSortType"></sort-box>
            </div>
            <div class="option-group">
              <export-setting-button
                v-if="exportPermission"
                :type="isSelectMode && selectedNum ? 'primary' : 'default'"
                :disabled="!totalNum"
                button-text="导出"
                dropdown-text="导出设置"
                @click-export="onClickExport"
                @click-setting="onClickSetting">
              </export-setting-button>
              <meg-button
                v-if="isSelectMode"
                @click="toggleSelectMode"
                :disabled="!totalNum">
                {{ $t('退出选择') }}
              </meg-button>
            </div>
          </div>
          <div
            class="result-body"
            v-loading="collapseLoading">
            <sort-collapse
              ref="sortCollapse"
              :more-page="collapseMorePage"
              :state="searchState"
              :is-select-mode="isSelectMode"
              :content="collapseData"
              :sort-type="sortType"
              :loading="collapseInnerLoading"
              @change="changeCollapseData"
              @card-click="cardClick"
              @delete="deleteItem"
              @selected-num-change="selectedNumChange"
              @change-mode="changeMode"></sort-collapse>
          </div>
        </div>
      </div>
      <common-capture-detail
        :index="detailSelectIndex"
        :visible.sync="detailVisible"
        :result-list="detailList"
        @close="closeCaptureDetail">
      </common-capture-detail>
      <task-detail-dialog
        ref="taskDetail"
        :form-data="taskdetailData"
        :visible.sync="taskDetailDialogVisible"
        @modifyJobName="modifyJobName"
        :response-flag="responseFlag"
        :if-auth="analysisManage">
      </task-detail-dialog>
      <date-detail-dialog
        ref="dateDetail"
        :form-data="dateDetailData"
        :visible.sync="dateDetailDialogVisible"
        @modifyJobName="modifyJobName"
        :response-flag="responseFlag"
        :if-auth="analysisManage">
      </date-detail-dialog>
    </div>
  </page-layout>
</template>

<script>
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import RegionSrv from '@/modules/region/region.service.js';
import SortCollapse from '@/components/judge/sort-collapse';
import SortBox from '../components/sort-box';
import TaskDetailDialog from '../components/task-detail-dialog';
import DateDetailDialog from '../components/date-detail-dialog';

const PAGESIZE = 30;
const TaskForm = function () {
  const DATE = new Date();
  const end = DATE.getTime();
  const start = new Date(new Date().setHours(0, 0, 0, 0)) - 1 * 24 * 60 * 60 * 1000;

  this.jobName = '';
  this.jobType = '2';
  this.threshold = 80;
  this.region1 = {};
  this.region1.beginTime = start;
  this.region1.endTime = end;
  this.region1.cameraIds = [];
  this.region1.regionLocation = '';
  this.region2 = {};
  this.region2.beginTime = start;
  this.region2.endTime = end;
  this.region2.cameraIds = [];
  this.region2.regionLocation = '';
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
    SortCollapse,
    SortBox,
    CommonCaptureDetail,
    TaskDetailDialog,
    DateDetailDialog,
    ExportSettingButton
  },
  data() {
    return {
      responseFlag: '',
      selectedNum: null,
      activeIndex: 0, // 选中的卡片
      detailSelectIndex: -1, // 详情底部的卡片列表的选中值
      detailList: [], // 详情底部的卡片列表
      detailVisible: false, // 抓拍详情是否显示
      resultBackground: false,
      resultLoading: false,
      collapseLoading: false,
      collapseMorePage: false,
      searchState: +new Date(),
      collapseData: [],
      sortType: 'DAY',
      collapseInnerLoading: false,
      cardList: [], // 任务的全量列表
      taskList: [], // 任务的分页显示列表
      morePageVisible: false, // 任务的分页显示按钮
      taskFormData: {},
      isSelectMode: false, // 是否为选择模式
      totalNum: 0, // 查询结果的总数
      cardSelection: [],
      activeCategoryIndex: 0,
      taskdetailData: new TaskForm(),
      dateDetailData: new TaskForm(),
      taskDetailDialogVisible: false,
      dateDetailDialogVisible: false,
      jobName: '',
      exportSettingManger: new ExportSettingManager(this.$store, 'region', 'galaxy_capture_property_export_column')
    };
  },
  computed: {
    choosed() {
      return this.exportSettingManger.getExportSetting();
    },
    analysisManage() {
      return this.$store.getters.modulePermissonsByAlias('region', 'analysisManage');
    },
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('region', 'export');
    }
  },
  watch: {
    detailList: {
      handler(val) {
        this.$refs.sortCollapse.setActiveList(val);
      },
      deep: true
    }
  },
  created() {
    RegionSrv.cameraList().then((res) => {
      if (res.code === 0) {
        const cameraList = flatData(res.data);
        this.$refs.taskDetail.setTreeData(cameraList);
        this.$refs.dateDetail.setTreeData(cameraList);
      }
    });

    this.getData();
    this.getTaskFormData();
  },
  methods: {
    getTaskFormData() {
      const jobId = this.$route.query.uid;
      RegionSrv.jobDetail(jobId).then((res) => {
        this.taskFormData = res.data;
      });
    },
    changeMode(val) {
      this.isSelectMode = val;
    },
    closeCaptureDetail() {
      this.detailVisible = false;
    },
    /**
     * 退出选择模式
     */
    toggleSelectMode() {
      this.isSelectMode = false;
    },
    /**
     * 卡片选中数目切换
     */
    selectedNumChange(num, arr) {
      this.selectedNum = num;
      this.cardSelection = arr;
    },
    /**
     * 条件导出,调用接口
     * @param {params} 需要导出的检索条件
     * @returns
     */
    exportInfo() {
      const exportForm = {
        taskName: this.taskFormData.jobName
      };
      // 如果已选字段大于0，则导出对应字段，否则默认导出全部字段，即此状态下的剩余字段
      // 获取导出设置项
      exportForm.exportColumns = this.choosed;
      exportForm.isTask = !this.isSelectMode;
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.exportData = this.cardSelection;
          RegionSrv.export(exportForm).then((res) => {
            if (res.code === 0) {
              window.location.href = res.data.url;
            }
          });
        } else {
          this.$message.warning(this.$t('请先选择需要导出的检索卡片'));
        }
      } else {
        let data = [];
        this.collapseData.forEach((element) => {
          data = data.concat(element.list);
        });
        exportForm.exportData = data;
        RegionSrv.export(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          }
        });
      }
    },
    onClickExport() {
      console.log('export');
      this.exportInfo();
    },
    async onClickSetting() {
      this.exportSettingManger.excludeExportCode(['nonMotor', 'motor', 'body']);
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
    },
    /*
     * 查看任务详情
     * @param {any}
     * @returns
     */
    checkDetail() {
      const jobId = this.$route.query.uid;
      this.jobName = this.$route.params.jobName;
      RegionSrv.jobDetail(jobId).then((res) => {
        if (res.code === 0) {
          if (res.data.jobType === '1') {
            this.dateDetailData = res.data;
            this.dateDetailDialogVisible = true;
          } else {
            this.taskdetailData = res.data;
            this.taskDetailDialogVisible = true;
          }
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
          this.getTaskFormData();
        } else {
          this.responseFlag = `error_${timeStamp}`;
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 获取上传图像卡片数据
     * @augments
     */
    getData() {
      const jobId = this.$route.query.uid;
      RegionSrv.taskDetail(jobId).then((res) => {
        this.cardList = res.data;
        this.loadMore();
        this.taskCardClick(this.cardList[0].personId, 0);
      });
    },
    /**
     * 设置排序类型
     * @param {type}
     * @returns
     */
    setSortType(type) {
      this.sortType = type;
      this.search();
    },
    // 设置点击卡片信息
    taskCardClick(id, index) {
      this.activeIndex = index;
      this.activePersonId = id;
      this.search();
    },
    search() {
      this.isSelectMode = false;
      this.collapseLoading = true;
      const params = {
        personId: this.activePersonId,
        groupType: this.sortType
      };
      RegionSrv.personResult(params).then((res) => {
        if (res.code === 0) {
          this.totalNum = 0;
          res.data.forEach((item) => {
            this.totalNum += item.count;
            this.allChecked = false;
            this.indeterminate = false;
            item.list.forEach((obj) => {
              obj.cardChecked = false;
            });
          });
          this.collapseData = res.data;
        } else {
          this.$message.error(res.msg);
        }
        this.collapseLoading = false;
      });
    },
    /**
     * 函数作用
     * @param {any}
     * @returns
     */
    changeCollapseData() {

    },
    /**
     * 需要展示详情的卡片信息
     */
    cardClick(index, key, list) {
      this.detailList = list.map((item) => ({
        ...item,
        id: item.captureId,
        cropUrl: item.photoUrl,
        temporaryFlag: item.temporaryFlag
      }));
      this.detailSelectIndex = key;
      this.activeCategoryIndex = index;
      this.detailVisible = true;
    },
    /**
     * 删除元素
     */
    deleteItem(item) {
      const param = {
        personId: this.activePersonId,
        photoId: item.captureId
      };
      RegionSrv.deleteResult(param).then((res) => {
        if (res.code === 0) {
          this.$message.success('删除成功');
          this.taskList = [];
          this.getData();
        }
      });
    },
    /**
     * 加载更多
     */
    loadMore() {
      const len = this.taskList.length;
      let slen = 0;// 需要剪切的长度
      if (this.cardList.length > len + PAGESIZE) {
        slen = PAGESIZE;
        this.morePageVisible = true;
      } else {
        slen = this.cardList.length - len;
        this.morePageVisible = false;
      }
      const temp = this.cardList.slice(len, len + slen);
      this.taskList.push(...temp);
    },
  }
};
</script>

<style lang="scss" scoped>
.task-detail{
  display: flex;
  height: 100%;
    .meg-scrollbar__bar.is-horizontal{
    display: none;
  }
  ::v-deep .meg-dialog__header{
    line-height: 54px;
    font-weight: 700;
    font-size: 16px;
    color: #435068;
  }
  .aside{
    width: 320px;
    height: 100%;
    .aside-header{
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      padding: 0 20px;
      font-size: 16px;
      color: #435068;
      background-color: #eee;
      .check-detail-button{
        float: right;
        color:#21539b;
        font-size: 12px;
        cursor: pointer;
      }
    }
    .aside-body{
      height: calc(100% - 56px);
      background-color: #FFF;
      overflow: scroll;
      .aside-body-header{
        height: 52px;
        line-height: 52px;
        border-bottom: 1px solid #f9f9f9;
        padding-left:20px;
        .header-tip{
          float: right;
          padding-right: 20px;
          font-size: 12px;
          color: #435068;
        }
      }
      .aside-body-content{
        padding:10px 0 0 0px;
          .load-more-box{
            text-align: center;
            width: 100%;
            height: 56px;
            button{
              margin-top: 10px;
            }
          }
      }
    }
    .task-card-box{
      display: inline-block;
      width: 130px;
      margin: 0 0 16px 20px;
      .meg-card{
        margin:0;
        box-shadow: none;
      }
      .count-num-box{
        padding-top: 7px;
        .count-num{
          font-size: 16px;
          margin: 0 7px;
          font-family: 'meg-number';
        }
      }
    }
  }
  .result{
    flex: 1;
    padding-left: 16px;
    background-color: #dce1e5;
    .result-box{
      display: flex;
      flex-direction: column;
    }
    .result-header{
      height: 56px;
      line-height: 56px;
      font-size: 12px;
      display: flex;
      padding-right: 20px;
      justify-content: space-between;
      .meg-export-button{
        font-size: 18px;
        margin:0 14px;
      }
    }
    .result-body{
      flex: 1;
      max-height: calc(100% - 56px);
      overflow: scroll;
    }
  }
  .export-body{
    text-align: center;
    height: 110px;
    line-height: 110px;
  }
}

</style>
<style lang="scss">
.i18n-en-US {
  .task-detail .meg-return-button .return-title{
    font-size: 14px;
  }
  .task-detail .aside .aside-header{
    padding: 0 20px 0 0;
  }
}
</style>
