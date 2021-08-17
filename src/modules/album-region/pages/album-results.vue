<template>
  <page-layout>
    <div class="album-results">
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
          <search-form
            :form-data="initFormData"
            :camera-list="cameraList"
            :album-list="albumList"
            @confirm="formSearch">
          </search-form>
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
            <div style="width:230px">
              <div
                v-show="!isSelectMode"
                style="color:#435068">
                {{ $t('检索结果：共') }} <span class="number-font">{{ totalNum }}</span> {{ $t('条') }}
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
                v-if="exportPermission && isSelectMode"
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
              :is-select-mode="isSelectMode"
              :content="collapseData"
              :loading="collapseInnerLoading"
              @card-click="cardClick"
              @delete="deleteItem"
              @change="onCollapseIndexChange"
              @selected-num-change="selectedNumChange"
              @update="loadMore"
              @change-mode="changeMode"></sort-collapse>
          </div>
        </div>
      </div>
      <card-detail
        :visible.sync="detailVisible"
        :info="detailInfo"
        :list="detailList"
        @change="changeDetail"
        :select-index="detailSelectIndex">
      </card-detail>
      <detail-dialog
        :form-data="taskDetailData"
        :visible.sync="detailDialogVisible"
        @modifyJobName="modifyJobName"
        :response-flag="responseFlag"
        :if-auth="true">
      </detail-dialog>
    </div>
  </page-layout>
</template>

<script>
import moment from 'moment';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import AlbumRegionSrv from '../album-region.service.js';
import SortCollapse from '../components/album-sort-collapse';
import SortBox from '../components/album-sort-box';
import SearchForm from '../components/album-search-form';
import CardDetail from '../components/card-detail/card-detail';
import DetailDialog from '../components/detail-dialog';

const GroupTypeMap = ['appearDate', 'similarityCategory', 'cameraId', 'name'];
const TaskFormDetail = function () {
  this.jobName = '';
  this.threshold = 80;
  this.region = {
    beginTime: '',
    endTime: '',
    cameraVos: [],
    regionLocation: '',
  };
  this.compareMode = 'SEARCH_EQUIVALENT';
  this.albumVos = [];
};

export default {
  components: {
    SortCollapse,
    SortBox,
    SearchForm,
    CardDetail,
    DetailDialog,
    ExportSettingButton
  },
  data() {
    return {
      cameraList: [], // 相机列表
      albumList: [], // 底库列表
      resultsAuth: false,
      activeIndex: 0, // 选中的卡片
      taskDialogVisible: false, // 任务弹窗显隐
      detailSelectIndex: 0, // 详情底部的卡片列表的选中值
      detailList: [], // 详情底部的卡片列表
      detailInfo: {}, // 卡片详情
      detailVisible: false, // 抓拍详情是否显示
      resultBackground: false,
      resultLoading: false,
      activeCategoryIndex: 0,
      collapseLoading: false,
      collapseMorePage: false,
      collapseData: [],
      sortType: 'DAY',
      collapseInnerLoading: false,
      cardList: [], // 任务的全量列表
      taskList: [], // 任务的分页显示列表
      fileNum: 0,
      taskFormData: {},
      isSelectMode: false, // 是否为选择模式
      exportSettingVisible: false, // 是否显示导出设置
      exportDialogVisible: false,
      exportFormData: {}, // 导出弹框form数据
      totalNum: 0, // 查询结果的总数
      selectedNum: 0,
      cardSelection: [],
      exportContent: 'all',
      responseFlag: 'success',
      initFormData: {},
      groupType: GroupTypeMap[0],
      searchFormData: {
        albumIds: [],
        cameraIds: [],
        ageLevel: '',
        beginTime: '',
        endTime: '',
        cardNo: '',
        cardType: 'sfz',
        cmnt: '',
        gender: '',
        groupType: this.groupType,
        jobId: '',
        name: '',
        origin: '',
        similarityMax: 100,
        similarityMin: 0
      },
      resultFormData: {
        categoryId: '',
        pageNo: 0,
        pageSize: 60,
      },
      taskDetailData: new TaskFormDetail(),
      detailDialogVisible: false,
      exportSettingManger: new ExportSettingManager(this.$store, 'album-region', 'region_album_collision_export_column')

    };
  },
  computed: {
    choosed() {
      return this.exportSettingManger.getExportSetting();
    },
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('album-region', 'export');
    }
  },
  created() {
    const jobId = this.$route.query.uid;
    AlbumRegionSrv.jobDetail(jobId).then((res) => {
      if (res.code === 0) {
        const { data } = res;
        this.taskFormData = data;
        this.cameraList = this.dataAdaptor(data.region.cameraVos);
        this.albumList = this.dataAdaptor(data.albumVos);
        this.searchFormData.albumIds = this.getArrayIds(data.albumVos);
        this.searchFormData.cameraIds = this.getArrayIds(data.region.cameraVos);
        this.searchFormData.beginTime = data.region.beginTime;
        this.searchFormData.endTime = data.region.endTime;
        this.searchFormData.jobId = jobId;
        this.initFormData = { ...this.searchFormData };
        this.search();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    /**
     * 退出选择模式
     */
    toggleSelectMode() {
      this.isSelectMode = false;
    },
    changeMode(val) {
      this.isSelectMode = val;
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
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
    },
    /**
     * 条件导出,调用接口
     * @param {params} 需要导出的检索条件
     * @returns
     */
    exportInfo() {
      const exportForm = {};
      // 如果已选字段大于0，则导出对应字段，否则默认导出全部字段，即此状态下的剩余字段
      exportForm.columnCode = this.choosed.map((item) => item.code);
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.resultIds = this.cardSelection.map((val) => val.resultId);
          AlbumRegionSrv.export(exportForm).then((res) => {
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
        exportForm.condition = this.searchFormData;
        AlbumRegionSrv.export(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    openExport() {
      this.exportInfo();
    },
    /**
     * 打开任务弹窗
     */
    createdTask() {
      this.taskDialogVisible = true;
    },
    /**
       * 返回上一个路由页面
       * @augments
       */
    returnLits() {
      this.$router.go(-1);
    },
    /**
     * 设置排序类型
     * @param {type}
     * @returns
     */
    setSortType(type) {
      this.groupType = GroupTypeMap[type];
      this.search();
    },
    // 设置点击卡片信息
    taskCardClick(id, index) {
      this.activeIndex = index;
      this.activePersonId = id;
      this.search();
    },
    formSearch(data) {
      this.searchFormData = data;
      this.search();
    },
    search() {
      this.isSelectMode = false;
      this.collapseLoading = true;
      this.resultFormData.pageNo = 0;
      this.searchFormData.groupType = this.groupType;
      AlbumRegionSrv.groupCount(this.searchFormData).then((res) => {
        if (res.code === 0) {
          if (res.data.length) {
            this.totalNum = 0;
            res.data.forEach((item) => {
              this.totalNum += item.count;
              item.allChecked = false;
              item.indeterminate = false;
              item.loading = false;
              item.records = [];
            });
            this.collapseData = res.data;
            this.resultFormData.categoryId = this.collapseData[0].categoryId;
            this.loadMore(0);
            this.resultBackground = false;
          } else {
            this.resultBackground = { icon: 'icon_2', text: this.$t('检索无结果') };
          }
        } else {
          this.$message.error(res.msg);
        }
        this.collapseLoading = false;
      });
    },
    /**
     * 需要展示详情的卡片信息
     */
    cardClick(index, key) {
      this.activeCategoryIndex = index;
      this.setDetail(index, key);
      this.detailList = this.collapseData[index].records;
      this.detailVisible = true;
    },
    /**
     * 改变详情内容
     * @param {index} 抓拍详情Id
     * @returns
     */
    changeDetail(index) {
      this.setDetail(this.activeCategoryIndex, index);
    },
    /**
     * 设置抓拍详情的内容
     * @param {index, key}分类索引 卡片索引
     * @returns
     */
    setDetail(index, key) {
      const card = this.collapseData[index].records[key];
      AlbumRegionSrv.cardDetail(card.resultId).then((res) => {
        this.detailInfo = res.data;
      });
      this.detailSelectIndex = key;
    },
    /**
     * 删除元素
     */
    deleteItem(item) {
      const param = {
        personId: this.activePersonId,
        photoId: item.photoId
      };
      AlbumRegionSrv.deleteResult(param).then((res) => {
        if (res.code === 0) {
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
      AlbumRegionSrv.modifyJobName(params).then((res) => {
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
    loadMore(index) {
      this.resultFormData.pageNo += 1;
      const formData = { ...this.searchFormData, ...this.resultFormData };
      this.collapseData[index].loading = true;
      AlbumRegionSrv.groupResult(formData).then((res) => {
        if (res.code === 0) {
          res.data.records.forEach((obj) => {
            obj.cardChecked = false;
            obj.captureTime = moment(obj.captureTime).format('YYYY-MM-DD HH:mm:ss');
          });
          this.collapseData[index].records.push(...res.data.records);
          this.collapseData[index].morePage = res.data.totalPage > res.data.pageNo;
        } else {
          this.$message.error(res.msg);
        }
        this.collapseData[index].loading = false;
      });
    },
    /**
     * 当折叠面板切换时，关闭选择模式
     */
    onCollapseIndexChange(targetIndex, sourceIndex) {
      this.collapseData[sourceIndex].records.length = 0;
      this.resultFormData.pageNo = 0;
      this.resultFormData.categoryId = this.collapseData[targetIndex].categoryId;
      this.loadMore(targetIndex);
    },
    /**
     * 查看任务详情
     */
    checkDetail() {
      // debugger;
      // AlbumRegionSrv.jobDetail(this.FormData.jobId).then((res) => {
      //   if (res.code === 0) {
      //     this.taskDetailData = res.data;
      //     this.detailDialogVisible = true;
      //   } else {
      //     this.$message.error(res.msg);
      //   }
      // });
      this.taskDetailData = this.taskFormData;
      this.detailDialogVisible = true;
    },
    /**
     * 处理数组，获取对应元素的id
     */
    getArrayIds(arr) {
      return arr.map((item) => item.id);
    },
    /**
     * 数据适配
     */
    dataAdaptor(arr) {
      arr.forEach((e) => {
        e.flag = 'node';
        e.name = e.cameraName || e.albumName;
      });
      return [{
        id: 'root',
        name: this.$t('全部'),
        flag: 'root',
        items: arr
      }];
    }
  }
};
</script>

<style lang="scss" scoped>
.album-results{
  display: flex;
  height: 100%;
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
      overflow: scroll;
      ::v-deep .leftInteractive {
        width: 310px;
      }
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
  .album-results .meg-return-button .return-title{
    font-size: 14px;
  }
  .album-results .aside .aside-header{
    padding: 0 20px 0 0;
  }
}
</style>
