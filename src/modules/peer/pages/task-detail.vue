<template>
  <page-layout>
    <div class="task-detail">
      <div class="aside">
        <div class="aside-header">
          <meg-return-button
            width="160px"
            :disable="true"
            @click.native="retrunPeer"
            :title="taskFormData.jobName||''"></meg-return-button>
          <span
            class="check-detail-button"
            @click="checkDetail"
            type="text">{{ $t('查看任务详情') }}
          </span>
        </div>
        <div class="aside-body">
          <div class="aside-body-header">
            {{ $t('分析对象') }}
          </div>
          <div class="analysis-peroson">
            <div class="card-box">
              <meg-card
                :img-src="analysisPersonData.photoUrl"
                :useful-frame="analysisPersonData.rect"
                img-margin="0">
              </meg-card>
            </div>
            <div class="analysis-count">
              <div>{{ $t('经过相机') }}<span class="count-num">{{ analysisPersonData.faceGroupIdDuplicateCount }}</span>{{ $t('个') }}</div>
              <div>{{ $t('抓拍图像') }}<span class="count-num">{{ analysisPersonData.capturePhotoCount }}</span>{{ $t('个') }}</div>
            </div>
          </div>
          <div class="aside-body-header">
            {{ $t('分析结果') }}
            <span class="header-tip">{{ $t("共{count}人",{count:cardList.length }) }}</span>
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
                  <span class="count-num">{{ item.companionAdressCount }}</span>{{ $t('个同行地点') }}
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
            <div style="width:fit-content">
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
              @card-click="cardClick"
              @delete="deleteItem"
              @change-mode="changeMode"
              @selected-num-change="selectedNumChange"></sort-collapse>
          </div>
        </div>
      </div>
      <common-capture-detail
        :index="detailSelectIndex"
        :visible.sync="detailVisible"
        :result-list="detailList"
        @close="closeCaptureDetail">
      </common-capture-detail>
      <peer-dialog
        ref="peerDialog"
        :form-data="taskFormData"
        :response-flag="responseFlag"
        type="check"
        :visible.sync="taskDialogVisible"
        @modifyJobName="modifyJobName">
      </peer-dialog>
    </div>
  </page-layout>
</template>
<script>
import _ from 'lodash';
import { utils, switchToModule } from '@/utils/utils';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import SortCollapse from '@/components/judge/sort-collapse';
import PeerSrv from '@/modules/peer/peer.service.js';
import SortBox from '../components/sort-box';
import PeerDialog from '../components/peer-dialog';

const PAGESIZE = 30;
export default {
  components: {
    SortCollapse,
    SortBox,
    CommonCaptureDetail,
    PeerDialog,
    ExportSettingButton
  },
  data() {
    return {
      activeIndex: 0, // 选中的卡片
      taskDialogVisible: false, // 任务弹窗显隐
      detailSelectIndex: -1, // 详情底部的卡片列表的选中值
      detailList: [], // 详情底部的卡片列表
      detailVisible: false, // 抓拍详情是否显示
      resultBackground: false,
      resultLoading: false,
      collapseLoading: false,
      collapseMorePage: false,
      searchState: +new Date(),
      sourceData: [], // 数据集，会将从接口的数据自动格式化，加入默认参数
      collapseData: [],
      sortType: 'DAY',
      collapseInnerLoading: false,
      cardList: [], // 任务的全量列表
      taskList: [], // 任务的分页显示列表
      morePageVisible: false, // 任务的分页显示按钮
      fileNum: 0,
      taskFormData: {},
      isSelectMode: false, // 是否为选择模式
      exportSettingVisible: false, // 是否显示导出设置
      exportDialogVisible: false,
      exportFormData: {}, // 导出弹框form数据
      photoBase64: '',
      totalNum: 0, // 查询结果的总数
      selectedNum: 0,
      activeCategoryIndex: 0,
      cardSelection: [],
      exportContent: 'all',
      responseFlag: 'success',
      analysisPersonData: {},
      exportSettingManger: new ExportSettingManager(this.$store, 'peer', 'galaxy_capture_allinone_export_column')
    };
  },
  computed: {
    choosed() {
      return this.exportSettingManger.getExportSetting();
    },
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('peer', 'export');
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
    this.getData();
    const jobId = this.$route.query.uid;
    PeerSrv.jobDetail(jobId).then((res) => {
      this.taskFormData = res.data;
      this.$nextTick(() => {
        this.$refs.peerDialog.setFormData(res.data);
      });
      utils.getExactImg(this.taskFormData.photoInfo.photoUrl, this.taskFormData.photoInfo.rect).then((base64) => {
        this.photoBase64 = base64;
      });
    });
  },
  methods: {
    changeMode(val) {
      this.isSelectMode = val;
    },
    /**
     * 退出选择模式
     */
    toggleSelectMode() {
      this.isSelectMode = false;
    },
    retrunPeer() {
      switchToModule({
        module: 'peer',
      });
    },
    closeCaptureDetail() {
      this.detailVisible = false;
    },
    /**
     * 卡片选中数目切换
     */
    selectedNumChange(num, arr) {
      this.selectedNum = num;
      this.cardSelection = arr;
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
    /**
     * 条件导出,调用接口
     * @param {params} 需要导出的检索条件
     * @returns
     */
    exportInfo() {
      const exportForm = {
        taskName: this.taskFormData.jobName
      };
      // 获取导出设置项'
      exportForm.exportColumns = this.choosed;
      exportForm.isTask = !this.isSelectMode;
      exportForm.uploadPhotoData = this.photoBase64;
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.exportData = this.cardSelection;
          PeerSrv.export(exportForm).then((res) => {
            if (res.code === 0) {
              window.location.href = res.data.url;
            } else {
              this.$message.error(res.msg);
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
        PeerSrv.export(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    /**
     * 数据处理函数，取消数据成对的数据结构，将对象数组降维
     */
    dataResolve(objArray) {
      const temp = [];
      objArray.forEach((obj) => {
        obj.companion.source = 'companion';
        obj.companion.pairId = obj.pairId;
        obj.companion.cardChecked = false;
        obj.target.source = 'target';
        obj.target.pairId = obj.pairId;
        obj.target.cardChecked = false;
        if (obj.companion.captureTime < obj.target.captureTime) {
          temp.push(obj.companion, obj.target);
        } else {
          temp.push(obj.companion, obj.target);
        }
      });
      return temp;
    },
    /**
     * 获取上传图像卡片数据
     * @augments
     */
    getData() {
      const jobId = this.$route.query.uid;
      PeerSrv.taskDetail(jobId).then((res) => {
        this.cardList = res.data.companionPersonVOList;
        const { capturePhotoCount, faceGroupIdDuplicateCount } = res.data;
        this.analysisPersonData = {
          capturePhotoCount,
          faceGroupIdDuplicateCount,
          photoUrl: res.data.photoInfo.photoUrl,
          rect: res.data.photoInfo.rect
        };
        this.fileNum = res.data.length;
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
      PeerSrv.personResult(params).then((res) => {
        if (res.code === 0) {
          this.totalNum = 0;
          res.data.forEach((item) => {
            this.totalNum += item.count;
            item.allChecked = false;
            item.indeterminate = false;
            item.list.forEach((obj) => {
              obj.cardChecked = false;
            });
          });
          this.sourceData = res.data;
          const temp = _.cloneDeep(this.sourceData);
          temp.forEach((item) => {
            item.list = this.dataResolve(item.list);
          });
          this.collapseData = temp;
        } else {
          this.$message.error(res.msg);
        }
        this.collapseLoading = false;
      });
    },
    /**
     * 查看任务详情
     * @param {any}
     * @returns
     */
    checkDetail() {
      this.taskDialogVisible = true;
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
        pairId: item.pairId
      };
      PeerSrv.deleteResult(param).then((res) => {
        if (res.code === 0) {
          this.$message.success('删除成功');
          this.search();
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
    modifyJobName(params) {
      PeerSrv.modifyJobName(params).then((res) => {
        const timeStamp = new Date().getTime();
        if (res.code === 0) {
          this.responseFlag = `success_${timeStamp}`;
          this.taskFormData.jobName = params.jobName;
        } else {
          this.responseFlag = `error_${timeStamp}`;
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * 加载更多
     */
    loadMore() {
      const len = this.taskList.length;
      let slen = 0;// 需要剪切的长度
      if (this.cardList && this.cardList.length > len + PAGESIZE) {
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

<style lang="scss" >
.task-detail {
  display: flex;
  height: 100%;
  .analysis-peroson {
    padding: 0 20px;
    display: flex;
    .card-box {
      width: 112px;
    }
    .analysis-count {
      color: #435068;
      margin-left: 17px;
      display: flex;
      justify-content: center;
      flex-direction: column;
      line-height: 30px;
      .count-num {
        font-size: 20px;
        margin: 0 7px 0 12px;
        font-family: "meg-number";
      }
    }
  }
  .aside {
    width: 320px;
    height: 100%;
    .aside-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      padding: 0 20px;
      font-size: 16px;
      color: #435068;
      background-color: #eee;
      .check-detail-button {
        float: right;
        color: #21539b;
        font-size: 12px;
        cursor: pointer;
      }
    }
    .aside-body {
      height: calc(100% - 56px);
      background-color: #FFF;
      overflow: scroll;
      .aside-body-header {
        height: 52px;
        line-height: 52px;
        border-bottom: 1px solid #f9f9f9;
        padding-left: 20px;
        .header-tip {
          float: right;
          padding-right: 20px;
          font-size: 12px;
          color: #435068;
        }
      }
      .aside-body-content {
        padding: 10px 0 0 0px;
        .load-more-box {
          text-align: center;
          width: 100%;
          height: 56px;
          button {
            margin-top: 10px;
          }
        }
      }
    }
    .task-card-box {
      display: inline-block;
      width: 130px;
      margin: 0 0 16px 20px;
      .meg-card {
        margin: 0;
        box-shadow: none;
      }
      .count-num-box {
        padding-top: 7px;
        .count-num {
          font-size: 16px;
          margin: 0 7px 0 0;
          font-family: "meg-number";
        }
      }
    }
  }
  .result {
    height: 100%;
    flex: 1;
    padding-left: 16px;
    background-color: #dce1e5;
    .result-box {
      display: flex;
      flex-direction: column;
    }
    .result-header {
      height: 56px;
      line-height: 56px;
      font-size: 12px;
      display: flex;
      padding-right: 20px;
      justify-content: space-between;
      .meg-export-button {
        font-size: 18px;
      }
    }
    .result-body {
      flex: 1;
      max-height: calc(100% - 56px);
      overflow: scroll;
    }
  }
  .export-body {
    text-align: center;
    height: 110px;
    line-height: 110px;
  }
}
</style>
<style lang="scss">
.i18n-en-US{
  .task-detail{
    .return-title{
      width: 140px!important;
    }
  }
}
</style>
