<template>
  <page-layout :show-immidately="showImmidately">
    <common-layout>
      <!-- 左侧检索条件 -->
      <attribute-search-form
        ref="searchForm"
        slot="left"
        @search="searchClick"></attribute-search-form>
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
              v-show="(!quality || clusterList.length) && !checkedItemNum"
              v-model="quality">
              显示低质量
            </meg-checkbox>
            <export-setting-button
              v-if="exportPermission"
              type="default"
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
          <attribute-search-content
            ref="captureSearchContent"
            :cluster-list="clusterList"
            :date-time="dateTime"
            :total-records="clusterTotalRecords"
            :loading="ifLoading"
            :list-loading="listLoading"
            :capture-list="captureList"
            @check-list-change="checkListChange"
            @show-detail="showDetail"
            @fetch-data="fetchCaptureData"
            @change="categoryChange"></attribute-search-content>
        </div>
      </div>
    </common-layout>
    <common-capture-detail
      :visible.sync="visible"
      :result-list="captureDetail.list"
      :index="captureDetail.index"
      @close="hideDetail"></common-capture-detail>
  </page-layout>
</template>

<script>
import doAddCameraSelectHistory from '@/utils/camera.utils.js';
import CommonLayout from '@/common-components/common-layout';
import AttributeSearchSrv from '@/modules/attribute-search/attribute-search.service';
import AttributeSearchContent from '@/modules/attribute-search/components/attribute-search-content';
import SearchTypeSelector from '@/modules/capture-search/components/search-type-selector';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import exportMessageBox from '@/common-components/common-export-message-box';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import { mapGetters } from 'vuex';
import AttributeSearchForm from '../components/attribute-search-form';

const COMMONTABSMAP = {
  'DETECTTYPE': '目标',
  'DATE': '时间',
  'ADDRESS': '地点',
  'BAYONET': '卡口',
  'TASKNAME': '任务',
};
const COMMON_CAMERA_TABS = [
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
    label: '时间',
    value: 'DATE',
  },
  {
    label: '任务',
    value: 'TASKNAME',
  }
];

const TARGET_TAB = [
  {
    label: '目标',
    value: 'DETECTTYPE',
  },
];

export default {
  components: {
    CommonLayout,
    AttributeSearchForm,
    AttributeSearchContent,
    SearchTypeSelector,
    ExportSettingButton,
    CommonCaptureDetail
  },
  props: {
    // 外部可以传入覆盖当前 service 的 service
    mergeSrv: {
      type: Object,
      default: () => ({})
    },
    showImmidately: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      totalRecords: 0,
      resultTabs: [],
      searchFormData: {
        aggType: '',
        withLink: true,
      },
      quality: true,
      aggType: '',
      clusterList: [],
      ifLoading: false,
      listLoading: false,
      checkedItemNum: 0,
      visible: false,
      captureList: [],
      captureDetail: {},
      clusterTotalRecords: 0,
      exportManager: [],
      dateTime: []
    };
  },
  computed: {
    ...mapGetters('shelf', [
      'deleteShelfData'
    ]),
    exportPermission() {
      const { name = '' } = this.$route;
      return this.$store.getters.modulePermissonsByAlias(name, 'export') || name === 'subject-search'; // 主题检索没有权限控制，需要导出
    },
    // 导出埋点id
    exportTrackingId() {
      const map = {
        'capture-search': 'NatureSearchExport',
        // PS: 如果复用此检索模块也要添加埋点，则在这里添加 ID 即可
      };
      return map[this.$route.name] || '';
    },
    // 导出设置埋点id
    exportSetTrackingId() {
      const map = {
        'capture-search': 'NatureSearchExportSet',
      };
      return map[this.$route.name] || '';
    },
    ifEmpty() {
      return !this.ifLoading && this.clusterList.length === 0 ? { icon: 'icon_1', text: '检索无结果' } : false;
    },
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
      this.queryCapture();
    },
    quality(val) {
      this.searchFormData.quality = val ? '' : 1;
      this.queryCapture();
      this.eventTracking('NatureSearchDZLCheck');
    },
  },
  created() {
    // 合并外部传入的 service
    Object.assign(AttributeSearchSrv, this.mergeSrv);
    this.initExport();
  },
  methods: {
    getDateTime() {
      const { startTime, endTime } = this.searchFormData;
      this.dateTime = [startTime, endTime];
    },
    initExport() {
      this.exportManager = new ExportSettingManager(this.$store, 'attribute_export', 'galaxy_capture_property_export_column');
    },
    getComputedTabs() {
      console.log(this.searchFormData);
      const { sourceType, currentTab } = this.searchFormData;
      let tabs = [];
      if (sourceType === 'CAMERA') {
        tabs = currentTab === 'ALL' ? TARGET_TAB.concat(COMMON_CAMERA_TABS) : COMMON_CAMERA_TABS;
      } else {
        tabs = currentTab === 'ALL' ? TARGET_TAB.concat(COMMON_FILE_TABS) : COMMON_FILE_TABS;
      }
      return tabs;
    },
    searchClick(formData) {
      this.searchFormData = Object.assign(this.searchFormData, formData);
      this.resultTabs = this.getComputedTabs();
      this.aggType = this.resultTabs[0].value;
      this.searchFormData.aggType = this.aggType;
      this.clusterList = [];
      if (!this.quality) {
        this.quality = true;
        return;
      }
      this.getDateTime();
      this.queryCapture();
      const { cameraIds } = formData;
      if (cameraIds && cameraIds.length > 0) {
        doAddCameraSelectHistory(cameraIds);
      }
    },
    /**
     * @description 触发检索的方法
     */
    queryCapture() {
      if (this.aggResponse && this.aggResponse.cancel) this.aggResponse.cancel();
      if (this.captureResponse && this.captureResponse.cancel) this.captureResponse.cancel();
      this.ifLoading = true;
      if (this.clusterList.length) {
        this.clusterList = [this.clusterList[0]];
      } else {
        this.clusterList = [];
      }
      this.aggResponse = AttributeSearchSrv.queryAggCapture(this.searchFormData);
      this.aggResponse.then((res) => {
        this.ifLoading = false;
        if (res.code === 0) {
          this.clusterList = res.data.records;
          this.totalRecords = this.clusterList.reduce((total, value) => total + value.count, 0);
          this.categoryChange(0);
        }
      });
    },
    /**
     * @description 点击导出结果
     */
    exportResult() {
      // 埋点请求
      if (this.exportTrackingId) this.eventTracking(this.exportTrackingId);
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
      const targetInfos = checkedItems.map((item) => ({
        id: item.id
      }));
      const params = {
        exportItems,
        targetInfos,
        sourceType: this.searchFormData.sourceType
      };
      AttributeSearchSrv.export(params).then((res) => {
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
      AttributeSearchSrv.batchExport(params).then((res) => {
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
      let params = {
        exportItems,
        ...this.searchFormData,
      };
        if (this.searchFormData.sourceType === 'CAMERA') {//eslint-disable-line
        switch (this.aggType) {
          // 列表
          case 'ADDRESS':
              const list = this.clusterList.map((item) => ({//eslint-disable-line
              label: item.displayName,
              value: item.condition.cameraIds[0]
            }));
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
    },
    /**
     * @description 导出设置
     */
    async exportSetting() {
      // 埋点请求
      if (this.exportSetTrackingId) this.eventTracking(this.exportSetTrackingId);
      await this.exportManager.setExportSetting();
    },
    /**
     * @description 选中卡片的事件
     */
    checkListChange(list) {
      const { length } = list;
      this.checkedItemNum = length || 0;
    },
    clearChecked() {
      this.$refs.captureSearchContent.cancelSelect();
    },
    /**
     * @description 展示详情
     */
    showDetail(detail) {
      this.visible = true;
      console.log(detail);
      this.captureDetail = detail;
    },
    fetchCaptureData(pageNo, pageSize, index) {
      if (pageNo === 1) this.ifLoading = true;
      this.listLoading = true;
      const { condition } = this.clusterList[index];
      this.captureResponse = AttributeSearchSrv.queryCapture({
        pageNo, pageSize, ...this.searchFormData, ...condition
      });
      this.captureResponse.then((res) => {
        this.ifLoading = false;
        this.listLoading = false;
        if (res.code === 0) {
          this.captureList = this.captureList.concat(res.data.records);
          this.clusterTotalRecords = res.data.totalRecords;
        }
      });
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
::v-deep .search-common-condition {
  padding: 0 25px;
  margin-top: 20px;
}
</style>
