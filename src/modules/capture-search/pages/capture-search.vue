<template>
  <page-layout :show-immidately="showImmidately">
    <common-layout>
      <capture-search-form
        ref="searchForm"
        slot="left"
        :shield-upload="shieldUpload"
        :show-history-record="showHistoryRecord"
        :upload-prompt-text="uploadPromptText"
        :analyze-type="analyzeType"
        :background="background"
        :face-threshold-hidden="faceThresholdHidden"
        :other-threshold-hidden="otherThresholdHidden"
        :other-threshold-text="otherThresholdText"
        :go-init-search="goInitSearch"
        :source-types="sourceTypes"
        @upload-click="$emit('upload-click')"
        @search="searchClick"></capture-search-form>
      <div
        class="common__search-content"
        slot="right">
        <div class="common-main-header">
          <span v-if="checkedItemNum">已选择 {{ checkedItemNum }} 条</span>
          <span v-else>检索结果：共 {{ totalRecords }} 条</span>
          <search-type-selector
            :result-tabs="resultTabs"
            v-model="aggType"
            v-show="clusterList.length && !checkedItemNum"></search-type-selector>
          <div class="action">
            <meg-checkbox
              v-show="clusterList.length && !faceThresholdHidden && !checkedItemNum && showOnlyFaceCapture"
              v-model="onlyFaceCapture">
              只看带脸抓拍
            </meg-checkbox>
            <meg-checkbox
              v-show="(!quality || clusterList.length) && !faceThresholdHidden && !checkedItemNum"
              v-model="quality">
              显示低质量
            </meg-checkbox>
            <meg-button
              v-show="showTrackBtn"
              type="default"
              style="margin-right: 10px;"
              @click="jumpToTrack">
              查看轨迹
            </meg-button>
            <export-setting-button
              type="default"
              v-if="showExportButton && exportPermission"
              :disabled="!clusterList.length"
              button-text="导出"
              dropdown-text="导出设置"
              @click-export="exportResult"
              @click-setting="exportSetting">
            </export-setting-button>
            <meg-button
              v-show="checkedItemNum"
              type="default"
              style="margin-left: 10px;"
              @click="clearChecked">
              退出选择
            </meg-button>
          </div>
        </div>
        <div
          class="common-main-content"
          v-background="ifEmpty">
          <capture-search-content
            ref="captureSearchContent"
            :cluster-list="clusterList"
            :total-records="clusterTotalRecords"
            :loading="ifLoading"
            :list-loading="listLoading"
            :capture-list="captureList"
            :list-card-buttons="listCardButtons"
            :date-time="dateTime"
            @check-list-change="checkListChange"
            @show-detail="showDetail"
            @fetch-data="fetchCaptureData"
            @change="categoryChange">
          </capture-search-content>
        </div>
      </div>
    </common-layout>
    <common-capture-detail
      :visible.sync="visible"
      :show-full-img-jump="showFullImgJump"
      :result-list="captureDetail.list"
      :index="captureDetail.index"
      :upload-list="uploadList"
      :custom-full-img-handler="customFullImgHandler"
      :show-temporary="showTemporary"
      :show-compare="showCompare"
      :show-peer="showPeer"
      :show-video="showVideo"
      :custom-target-list="customTargetList"
      :show-feed-back="showFeedBack"
      @close="hideDetail"></common-capture-detail>
    <meg-dialog
      class="face-body-selector"
      :title="$t('深度检索')"
      width="420px"
      :visible.sync="showDeepSearch"
      append-to-body>
      <div class="text">
        系统正在进行深度检索，可能需要等待较长时间，请耐心等待...
      </div>
      <div
        slot="footer"
        class="dialog-footer">
        <meg-button @click="closeDeepSearch">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </meg-dialog>
    <drag-image-animation
      v-if="animation"
      :show-animation="showAnimation"></drag-image-animation>
  </page-layout>
</template>

<script>
import doAddCameraSelectHistory from '@/utils/camera.utils.js';
import CommonLayout from '@/common-components/common-layout';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import exportMessageBox from '@/common-components/common-export-message-box';
import commonSwitchParams from '@/common-components/common-switch-params';
import DragImageAnimation from '@/components/search/drag-image-animation';
import { mapGetters } from 'vuex';
import CaptureSearchForm from '../components/capture-search-form';
import CaptureSearchContent from '../components/capture-search-content';
import SearchTypeSelector from '../components/search-type-selector';
import CaptureSearchSrv from '../capture-search.service';
import huixunMixins from '../mixins/huixun-mixins';

const COMMONTABSMAP = {
  'DETECTTYPE': '目标',
  'DATE': '时间',
  'ADDRESS': '地点',
  'BAYONET': '卡口',
  'TASKNAME': '任务',
  'SCORE': '相似度',
};
const COMMON_CAMERA_TABS = [
  {
    label: '目标',
    value: 'DETECTTYPE',
  },
  {
    label: '时间',
    value: 'DATE',
  },
  {
    label: '地点',
    value: 'ADDRESS',
  },
  {
    label: '卡口',
    value: 'BAYONET',
  }
];
const COMMON_FILE_TABS = [
  {
    label: '目标',
    value: 'DETECTTYPE',
  },
  {
    label: '时间',
    value: 'DATE',
  },
  {
    label: '任务',
    value: 'TASKNAME',
  }
];

const SCORE_TAB = [
  {
    label: '相似度',
    value: 'SCORE',
  },
];

export default {
  components: {
    CommonLayout,
    CaptureSearchForm,
    CaptureSearchContent,
    SearchTypeSelector,
    ExportSettingButton,
    CommonCaptureDetail,
    DragImageAnimation
  },
  mixins: [huixunMixins],
  props: {
    showImmidately: {
      type: Boolean,
      default: true
    },
    // 是否屏蔽点击上传
    shieldUpload: {
      type: Boolean,
      default: undefined,
    },
    // 上传图片组件底部提示文字
    defaultUploadPromptText: {
      type: String,
      default: undefined,
    },
    // 检测类型
    defaultAnalyzeType: {
      type: Array,
      default: undefined,
    },
    // 上传图片组件背景
    defaultBackground: {
      type: String,
      default: undefined,
    },
    // 是否隐藏人脸阈值 （同时隐藏深度检索，以及 低质量复选框， 以及 只看带脸抓拍 复选框）
    faceThresholdHidden: {
      type: Boolean,
      default: false,
    },
    // 上传图是否必填
    captureImageRequired: {
      type: Boolean,
      default: false,
    },
    // 人机非相似度的 label 文字配置
    defaultOtherThresholdText: {
      type: String,
      default: undefined,
    },
    // 进入页面是否发起检索
    goInitSearch: {
      type: Boolean,
      default: true,
    },
    // 外部可以传入覆盖当前 service 的 service
    mergeSrv: {
      type: Object,
      default: () => ({})
    },
    animation: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 这里是为了提高组件的可定制范围，提供的参数，可以在 mixins 中根据其它系统修改，比如慧寻定制
      // 检测类型
      analyzeType: this.defaultAnalyzeType,
      // 上传图片组件背景
      background: this.defaultBackground,
      // 上传图片组件底部提示文字
      uploadPromptText: this.defaultUploadPromptText,
      // 人机非相似度的 label 文字配置
      otherThresholdText: this.defaultOtherThresholdText,
      // 是否隐藏人机非阈值
      otherThresholdHidden: undefined,
      // 检索中可选择的资源类型
      sourceTypes: undefined,
      // 暂存架&携图跳转按钮
      listCardButtons: undefined,
      // 不要查看轨迹功能
      noTrackBtn: undefined,
      // 显示暂存架
      showTemporary: undefined,
      // 显示badcase 反馈
      showFeedBack: undefined,
      // 详情中自定义跳转列表
      customTargetList: undefined,
      showHistoryRecord: undefined,
      // 是否使用全景图的携图跳转功能
      showFullImgJump: undefined,
      // 是否展示抓拍详情比对tab
      showCompare: undefined,
      // 是否展示抓拍详情同行tab
      showPeer: undefined,
      // 是否展示抓拍详情比对tab
      showVideo: undefined,
      // 是否展示导出按钮
      showExportButton: true,
      // 自定义全景图的拉取方式函数
      customFullImgHandler: undefined,
      // *** 额外参数结束 ***
      showOnlyFaceCapture: true,
      totalRecords: 0,
      resultTabs: [],
      searchType: 'allInOne',
      searchFormData: {
        type: 'allInOne',
        quality: '',
        onlyFaceCapture: '',
        aggType: '',
        withLink: true,
        bodyThreshold: 0,
        motorThreshold: 0,
        nonMotorThreshold: 0,
        photos: [],
        detectTypes: [0, 1, 5, 6],
      },
      quality: true,
      onlyFaceCapture: false,
      aggType: '',
      clusterList: [],
      ifLoading: false,
      listLoading: false,
      checkedItemNum: 0,
      visible: false,
      captureDetail: {},
      uploadList: [],
      exportManager: [],
      captureList: [],
      clusterTotalRecords: 0,
      showDeepSearch: false,
      dateTime: [],
      showAnimation: false
    };
  },
  computed: {
    ...mapGetters('shelf', [
      'deleteShelfData'
    ]),
    exportPermission() {
      const { name = '' } = this.$route;
      return this.$store.getters.modulePermissonsByAlias(name, 'export');
    },
    // 导出埋点id
    exportTrackingId() {
      const map = {
        'capture-search': 'CaptureSearchExport',
        // PS: 如果复用此检索模块也要添加埋点，则在这里添加 ID 即可
      };
      return map[this.$route.name] || '';
    },
    // 导出设置埋点id
    exportSetTrackingId() {
      const map = {
        'capture-search': 'CaptureSearchExportSet',
      };
      return map[this.$route.name] || '';
    },
    ifEmpty() {
      return !this.ifLoading && this.clusterList.length === 0 ? { icon: 'icon_1', text: '检索无结果' } : false;
    },
    showTrackBtn() {
      return !this.noTrackBtn && this.checkedItemNum && this.clusterList.length && this.searchFormData.sourceType === 'CAMERA' && this.searchFormData.photos.length;
    }
  },
  watch: {
    deleteShelfData(val) {
      const { id } = val;
      this.captureList.forEach((item, index) => {
        if (id.indexOf(item.id) > -1 || id === item.id) {
          item.temporaryFlag = false;
          this.$set(this.captureList, index, item);
        }
      });
    },
    aggType(val) {
      this.searchFormData.aggType = val;
      // 用来防止第一次给aggType赋值时重新请求列表
      if (this.ifLoading) return;
      this.aggCapture();
    },
    /**
     * @description 低质量选择发生变化的时候
     */
    quality(val) {
      console.log(val);
      this.searchFormData.quality = val ? '' : 1;
      this.aggCapture();
      this.eventTracking('CaptureSearchDZLCheck');
    },
    /**
     * @description 只看带脸抓拍 选择发生变化的时候
     */
    onlyFaceCapture(val) {
      console.log(val);
      this.searchFormData.onlyFaceCapture = val;
      this.aggCapture();
    },
  },
  created() {
    this.showAnimation = false;
    // 合并外部传入的 service
    Object.assign(CaptureSearchSrv, this.mergeSrv);
  },
  methods: {

    // 设置外部传入的图片
    setInitFile(files) {
      this.$refs.searchForm.setInitFile(files);
    },
    /**
     * @description 计算出正确的切换tab
     */
    getComputedTabs() {
      const { sourceType, photos } = this.searchFormData;
      let tabs = [];
      if (sourceType === 'CAMERA') {
        if (photos.length) {
          tabs = SCORE_TAB.concat(COMMON_CAMERA_TABS);
        } else {
          tabs = COMMON_CAMERA_TABS;
        }
      } else {
        if (photos.length) {//eslint-disable-line
          tabs = SCORE_TAB.concat(COMMON_FILE_TABS);
        } else {
          tabs = COMMON_FILE_TABS;
        }
      }
      return tabs;
    },
    getDateTime() {
      const { startTime, endTime } = this.searchFormData;
      this.dateTime = [startTime, endTime];
    },
    /**
     * @description 点击检索按钮进行检索
     */
    searchClick(formData) {
      const uploadList = this.$refs.searchForm.getUploadedPhotos();
      const photos = this.$refs.searchForm.getComputedPhotos(uploadList);
      // 如果上传图必须，则提示
      if (this.captureImageRequired && !photos.length) {
        this.$message.warning('请上传图片');
        return;
      }
      // 如果没有图片 隐藏只看人脸
      if (!photos.length) {
        this.showOnlyFaceCapture = false;
      } else {
        this.showOnlyFaceCapture = true;
      }
      this.uploadList = uploadList;
      this.searchFormData.photos = photos;
      const { otherThreshold } = formData;
      this.searchFormData = Object.assign(this.searchFormData, formData, {
        bodyThreshold: otherThreshold,
        motorThreshold: otherThreshold,
        nonMotorThreshold: otherThreshold
      });
      this.resultTabs = this.getComputedTabs();
      this.aggType = this.resultTabs[0].value;
      this.searchFormData.aggType = this.aggType;
      this.clusterList = [];
      if (!this.quality) {
        this.quality = true;
        return;
      }
      if (this.onlyFaceCapture) {
        this.onlyFaceCapture = false;
        return;
      }
      const { cameraIds } = this.searchFormData;
      if (cameraIds && cameraIds.length > 0) {
        doAddCameraSelectHistory(cameraIds);
      }
      const animation = localStorage.getItem('animation');
      if (!animation) {
        localStorage.setItem('animation', 'before');
      }
      this.getDateTime();
      this.aggCapture();
    },
    closeDeepSearch() {
      this.totalRecords = 0;
      this.captureList = [];
      this.showDeepSearch = false;
      this.ifLoading = false;
      if (this.captureResponse && this.captureResponse.cancel) this.captureResponse.cancel();
      if (this.aggResponse && this.aggResponse.cancel) this.aggResponse.cancel();
    },
    /**
     * @description 聚合结果
     */
    aggCapture() {
      if (this.aggResponse && this.aggResponse.cancel) this.aggResponse.cancel();
      if (this.captureResponse && this.captureResponse.cancel) this.captureResponse.cancel();
      this.ifLoading = true;
      this.clearChecked();
      if (this.clusterList.length) {
        this.clusterList = [this.clusterList[0]];
      } else {
        this.clusterList = [];
      }
      this.searchType = this.searchFormData.photos.length ? 'allInOne' : 'property';
      this.searchFormData.type = this.searchType;
      this.aggResponse = CaptureSearchSrv.aggCapture(this.searchFormData);
      if (this.searchType === 'allInOne' && this.searchFormData.deepSearch) {
        this.showDeepSearch = true;
      }
      this.aggResponse.then((res) => {
        if (res.code === 0) {
          this.clusterList = res.data.records;
          if (this.clusterList.length) {
            this.totalRecords = this.clusterList.reduce((total, value) => total + value.count, 0);
            this.categoryChange(0);
          } else {
            this.totalRecords = 0;
            this.captureList = [];
            this.showDeepSearch = false;
            this.ifLoading = false;
          }
        } else {
          // 如果后端报错，也不要出loading  BUG: LNH-7432
          this.showDeepSearch = false;
          this.totalRecords = 0;
          this.ifLoading = false;
        }
      });
    },
    dealCapture(res) {
      this.ifLoading = false;
      this.listLoading = false;
      if (res.code === 0) {
        this.captureList = this.captureList.concat(res.data.records);
        this.clusterTotalRecords = res.data.totalRecords;
      }
    },
    /**
     * @description 检索结果
     */
    fetchCaptureData(pageNo, pageSize, index) {
      if (pageNo === 1) this.ifLoading = true;
      this.listLoading = true;
      const { condition } = this.clusterList[index];
      const params = {
        pageNo, pageSize, type: this.searchType, deepSearch: this.searchFormData.deepSearch
      };
      if (this.searchType === 'allInOne') {
        this.captureResponse = CaptureSearchSrv.queryCapture({ ...params, ...condition });
        this.captureResponse.then((response) => {
          if (this.searchFormData.deepSearch) {
            this.showDeepSearch = false;
          }
          this.dealCapture(response);
          if (localStorage.getItem('animation') === 'before') {
            this.showAnimation = true;
            localStorage.setItem('animation', 'after');
          }
        }).catch(() => {
          if (this.searchFormData.deepSearch) {
            this.showDeepSearch = false;
          }
        });
      } else {
        this.captureResponse = CaptureSearchSrv.queryCapture({
          ...params, ...this.searchFormData, ...condition
        });
        this.captureResponse.then((response) => {
          this.dealCapture(response);
          if (localStorage.getItem('animation') === 'before') {
            this.showAnimation = true;
            localStorage.setItem('animation', 'after');
          }
        });
      }
    },
    categoryChange(nowIndex) {
      if (nowIndex || nowIndex === 0) {
        this.captureList = []; // 置空列表
        if (!this.clusterList.length) return;
        this.clusterTotalRecords = this.clusterList[nowIndex].count;
        this.fetchCaptureData(1, 60, nowIndex);
      }
    },
    /**
     * @description 选中卡片的事件
     */
    checkListChange(list) {
      const { length } = list;
      this.checkedItemNum = length || 0;
    },
    /**
     * @description 清空选中的卡片
     */
    clearChecked() {
      this.$refs.captureSearchContent.cancelSelect();
    },
    /**
     * @description 跳转到轨迹回放
     */
    jumpToTrack() {
      const moduleInfo = {
        isBlank: true,
        pageType: 'single',
        module: 'shelf-track-analysis',
        query: {
          ids: this.$refs.captureSearchContent.getCheckedItems().map((item) => item.id).join(','),
          from: 'capture-search',
        }
      };
      new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
    },
    /**
     * @description 点击导出结果
     */
    exportResult() {
      // 埋点请求
      if (this.exportTrackingId) this.eventTracking(this.exportTrackingId);
      if (this.searchFormData.photos.length) {
        this.exportManager = new ExportSettingManager(this.$store, 'capture_normal_export', 'galaxy_capture_allinone_export_column');
      } else {
        this.exportManager = new ExportSettingManager(this.$store, 'capture_property_export', 'galaxy_capture_property_export_column');
      }
      if (this.checkedItemNum) {
        // 选择导出
        this.captureExport();
      } else {
        // 批量导出
        this.batchCaptureExport();
      }
    },
    /**
     * @description 选择模式下导出结果
     */
    captureExport() {
      const exportItems = this.exportManager.getExportSetting();
      const checkedItems = this.$refs.captureSearchContent.getCheckedItems();
      const photos = this.$refs.searchForm.getComputedPhotos(this.uploadList);
      let searchPhotos = [];
      if (photos.length) {
        searchPhotos = photos.map((pItem) => ({
          searchPhotoUri: pItem.searchPhotoUri
        }));
      }
      const targetInfos = checkedItems.map((item) => {
        const {
          id, showScore, searchPhotoIndex
        } = item;
        return {
          id,
          showScore: showScore || '',
          searchPhotoIndex,
        };
      });
      const params = {
        exportItems,
        targetInfos,
        searchPhotos,
        sourceType: this.searchFormData.sourceType
      };
      CaptureSearchSrv.export(params).then((res) => {
        if (res.code === 0) {
          window.location.href = res.data.url;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    /**
     * @description 导出的方法
     */
    startToExport(params) {
      CaptureSearchSrv.batchExport(params).then((res) => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('导出成功，请前往任务列表下载'),
            type: 'success'
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    batchCommonExport(type, title, selects, callback) {
      exportMessageBox.showExportMessageBox({
        type,
        title: `按${title}导出`,
        selects
      }).then((select) => {
        callback(select);
      }, () => {});
    },
    /**
     * @description 批量导出
     */
    batchCaptureExport() {
      const exportItems = this.exportManager.getExportSetting();
      const photos = this.$refs.searchForm.getComputedPhotos(this.uploadList);
      console.log(photos);
      photos.forEach((item) => {
        item.featureInfos.forEach((cItem) => {
          cItem.base64 = '';
        });
      });
      let params = {
        exportItems,
        type: this.searchFormData.photos.length ? 'allInOne' : 'property',
        ...this.searchFormData,
        photos
      };
      if (this.aggType === 'SCORE') {
        const selects = [{
          label: '人脸阈值',
          hidden: this.faceThresholdHidden,
          value: this.searchFormData.faceThreshold
        }, {
          label: this.otherThresholdText || '人机非阈值',
          value: this.searchFormData.bodyThreshold
        }];
        // 相似度的情况下导出
        this.batchCommonExport('multiThreshold', COMMONTABSMAP.SCORE, selects, (select) => {
          params = {
            ...params,
            aggType: 'SCORE',
            faceThreshold: select[0],
            bodyThreshold: select[1],
            motorThreshold: select[1],
            nonMotorThreshold: select[1],
          };
          this.startToExport(params);
        });
      } else {
        if (this.searchFormData.sourceType === 'CAMERA') {//eslint-disable-line
          switch (this.aggType) {
          // 列表
            case 'ADDRESS':
              const selectedNodes = this.$refs.searchForm.getCameraSelectedNodes();//eslint-disable-line
              let list = [];//eslint-disable-line
              if (this.searchFormData.photos.length) {
                list = selectedNodes.map((item) => ({//eslint-disable-line
                  label: item.label,
                  value: item.id
                }));
              } else {
                list = this.clusterList.map((item) => ({//eslint-disable-line
                  label: item.displayName,
                  value: item.condition.cameraIds[0]
                }));
              }
              this.batchCommonExport('list', COMMONTABSMAP.ADDRESS, list, (select) => {
                params = {
                  ...params,
                  aggType: 'ADDRESS',
                  cameraIds: select
                };
                this.startToExport(params);
              });
              break;
              // 时间
            default:
              // 目标、卡口类型、时间排序 都按照时间导出
              const { startTime, endTime } = this.searchFormData;//eslint-disable-line
              this.batchCommonExport('time', COMMONTABSMAP[this.aggType], [startTime, endTime], (select) => {
                params = {
                  ...params,
                  aggType: this.aggType,
                  startTime: select[0],
                  endTime: select[1],
                };
                this.startToExport(params);
              });
              break;
          }
        } else {
          // 选中文件的时候 目标 文件 时间的tab情况都要按照任务列表导出
          const selectedNodes = this.$refs.searchForm.getFileSelectedNodes();
          const list = selectedNodes.map((item) => ({//eslint-disable-line
            label: item.label,
            value: item.id
          }));
          this.batchCommonExport('list', COMMONTABSMAP.TASKNAME, list, (select) => {
            params = {
              ...params,
              aggType: this.aggType,
              taskInfos: select.map((id) => ({ id }))
            };
            this.startToExport(params);
          });
        }
      }
    },
    /**
     * @description 导出设置
     */
    async exportSetting() {
      // 埋点请求
      if (this.exportSetTrackingId) this.eventTracking(this.exportSetTrackingId);
      if (this.searchFormData.photos.length) {
        this.exportManager = new ExportSettingManager(this.$store, 'capture_normal_export', 'galaxy_capture_allinone_export_column');
      } else {
        this.exportManager = new ExportSettingManager(this.$store, 'capture_property_export', 'galaxy_capture_property_export_column');
      }
      await this.exportManager.setExportSetting();
    },
    /**
     * @description 展示详情
     */
    showDetail(detail) {
      this.visible = true;
      this.captureDetail = detail;
    },
    /**
     * @description 隐藏详情
     */
    hideDetail() {
      this.visible = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.common__search-content {
  height: 100%;
}
</style>
