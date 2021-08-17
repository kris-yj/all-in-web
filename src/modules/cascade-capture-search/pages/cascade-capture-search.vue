<template>
  <page-layout>
    <common-layout>
      <cascade-capture-search-form
        ref="searchForm"
        slot="left"
        @search="searchClick"></cascade-capture-search-form>
      <div
        class="common__search-content"
        slot="right">
        <div class="common-main-header">
          <span v-if="selectList.length">{{ $t('已选择{count}条',{count:selectList.length}) }}</span>
          <span v-else>{{ $t('检索结果：共{count}条',{count:totalRecords}) }}</span>
          <div class="action">
            <meg-button
              v-show="selectList.length"
              type="default"
              style="margin-right: 10px;vertical-align: bottom;"
              @click="jumpToTrack">
              {{ $t('生成轨迹') }}
            </meg-button>
            <export-setting-button
              type="default"
              :disabled="!activeResult.length"
              button-text="导出"
              dropdown-text="导出设置"
              @click-export="exportResult"
              @click-setting="exportSetting">
            </export-setting-button>
            <meg-button
              v-show="selectList.length"
              type="default"
              style="margin-left: 10px;"
              @click="clearChecked">
              {{ $t('退出选择') }}
            </meg-button>
          </div>
        </div>
        <div
          class="common-main-content"
          v-background="isEmpty">
          <cascade-capture-search-content
            ref="searchContent"
            v-model="activeIndex"
            :loading="loading"
            :result="result"
            @check-list-change="selectListChange"
            @show-detail="showDetail">
          </cascade-capture-search-content>
        </div>
      </div>
    </common-layout>
    <common-capture-detail
      cascade
      :visible.sync="detailVisible"
      :result-list="activeResult"
      :index="index"
      :search-id="searchId"
      :show-temporary="false"
      :cascade-node-reg-id="cascadeNodeRegId"
      :upload-list="uploadList"></common-capture-detail>
  </page-layout>
</template>

<script>
import CommonLayout from '@/common-components/common-layout';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import commonSwitchParams from '@/common-components/common-switch-params';
import CascadeCaptureSearchForm from '../components/cascade-capture-search-form';
import CascadeCaptureSearchContent from '../components/cascade-capture-search-content';
import CascadeCaptureSearchSrv from '../cascade-capture-search.service';

export default {
  components: {
    CommonLayout,
    CascadeCaptureSearchForm,
    CascadeCaptureSearchContent,
    ExportSettingButton,
    CommonCaptureDetail,
  },
  data() {
    return {
      loading: false, // 加载效果
      detailVisible: false,
      uploadList: [],
      index: -1,
      selectList: [], // 选中目标
      totalRecords: 0,
      activeIndex: -1, // 选中聚合
      result: [], // 检索结果
      searchId: '', // 多级检索ID[用于导出]
      exportSettingManger: {} // 导出设置
    };
  },
  computed: {
    isEmpty() {
      return !this.loading && this.totalRecords === 0 ? { icon: 'icon_1', text: '检索无结果' } : false;
    },
    activeResult() {
      return this.activeIndex > -1 && this.result.length ? this.result[this.activeIndex].records : [];
    },
    cascadeNodeRegId() {
      return this.activeIndex > -1 && this.result.length ? this.result[this.activeIndex].cascadeNodeRegId : '';
    }
  },
  mounted() {
    this.exportSettingManger = new ExportSettingManager(this.$store, 'cascade-capture-search', 'search_export_column');
  },
  methods: {
    // 检索
    searchClick(formData) {
      this.loading = true;
      this.result = [];
      CascadeCaptureSearchSrv.cascadeSearch(formData).then((res) => {
        if (res.code === 0) {
          this.uploadList = formData.photos;
          this.totalRecords = 0;
          this.searchId = res.data.searchId;
          res.data.records.forEach((record) => {
            this.totalRecords += record.records.length;
            const category = {
              ...record,
              displayName: record.cascadeNodeRegName,
              count: record.records.length,
            };
            this.result.push(category);
          });
          this.loading = false;
        }
      });
    },
    // 跳转到生成轨迹
    jumpToTrack() {
      const moduleInfo = {
        isBlank: true,
        pageType: 'single',
        module: 'shelf-track-analysis',
        query: {
          searchId: this.searchId,
          cascadeNodeRegId: this.cascadeNodeRegId,
          ids: this.selectList.join(','),
          from: 'cascade-capture-search',
        }
      };
      new commonSwitchParams.FormatSwitchParams(moduleInfo).switchToModule();
    },
    // 导出
    exportResult() {
      const exportColumns = this.exportSettingManger.getExportSetting();
      const params = {
        items: exportColumns,
        photos: this.photos,
        searchId: this.searchId,
        isTask: false
      };
      if (this.selectList.length) { // 选择导出
        params.ids = this.selectList;
      } else { // 批量导出
        params.isTask = true;
      }
      CascadeCaptureSearchSrv.export(params).then((res) => {
        if (res.code === 0) {
          if (this.selectList.length) {
            window.location.href = res.data.url;
          } else {
            this.$message({
              message: this.$t('导出成功，请前往任务列表下载'),
              type: 'success'
            });
          }
        }
      });
    },
    // 导出设置
    async exportSetting() {
      await this.exportSettingManger.setExportSetting();
    },
    // 清除选中
    clearChecked() {
      this.selectList = [];
      this.$refs.searchContent.cancelSelect();
    },
    // 选中变更
    selectListChange(list) {
      this.selectList = list;
    },
    // 显示详情
    showDetail(index) {
      this.index = index;
      this.detailVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
  .common__search-content{
    height: 100%;
  }
</style>
