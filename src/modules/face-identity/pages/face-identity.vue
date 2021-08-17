<template>
  <page-layout>
    <common-layout>
      <face-identity-form
        slot="left"
        @search="search"></face-identity-form>
      <div
        class="face-identity-result"
        slot="right"
        v-loading="loading">
        <div class="common-main-header">
          <span v-if="checkedItem.length">{{ $t('已选择{count}条',{count:checkedItem.length}) }}</span>
          <span v-else>{{ $t('检索结果：共{count}条',{count:totalRecords}) }}</span>
          <div>
            <export-setting-button
              v-if="exportPermission"
              type="default"
              :disabled="!resultList.records.length"
              @click-export="exportResult()"
              @click-setting="exportSetting()">
            </export-setting-button>
            <meg-button
              v-show="checkedItem.length"
              type="default"
              style="margin-left: 10px;"
              @click="clearChecked">
              {{ $t('退出选择') }}
            </meg-button>
          </div>
        </div>
        <div
          class="common-main-content"
          v-background="ifEmpty">
          <face-identity-content
            ref="resultContent"
            :result-list="resultList"
            :is-select-mode="!!checkedItem.length"
            :load-more="loadMore"
            @checked-change="checkedChange"
            @load-more="formatResult"></face-identity-content>
        </div>
      </div>
    </common-layout>
  </page-layout>
</template>

<script>
import CommonLayout from '@/common-components/common-layout';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import FaceSearchSrv from '../face-identity.service.js';
import FaceIdentityForm from '../components/face-identity-form';
import FaceIdentityContent from '../components/face-identity-content';

export default {
  components: {
    CommonLayout,
    FaceIdentityForm,
    ExportSettingButton,
    FaceIdentityContent
  },
  data() {
    return {
      checkedItem: [],
      totalRecords: 0,
      result: {
        records: [],
        totalPage: 0
      },
      resultList: {
        records: [],
        page: 0
      },
      loading: false,
      choosed: [],
      exportSettingManger: {}
    };
  },
  computed: {
    ifEmpty() {
      return !this.loading && this.resultList.records.length === 0 ? { icon: 'icon_1', text: '检索无结果' } : false;
    },
    loadMore() {
      return Boolean(this.resultList.page < this.result.totalPage);
    },
    exportPermission() {
      return Boolean(this.$store.getters.modulePermissonsByAlias('face-identity').length);
    }
  },
  mounted() {
    this.exportSettingManger = new ExportSettingManager(this.$store, 'face-identity', 'search_export_column');
  },
  methods: {
    // 检索
    search(formData) {
      this.eventTracking('FaceIdentitySearch');
      this.loading = true;
      this.resultList = {
        records: [],
        page: 0
      };
      FaceSearchSrv.search(formData).then((res) => {
        if (res.code === 0) {
          this.totalRecords = res.data.records.length;
          this.result = {
            records: res.data.records,
            totalPage: Math.ceil(this.totalRecords / 60)
          };
          this.formatResult();

          this.loading = false;
        }
      });
    },
    // 结果分页/点击下一页
    formatResult() {
      this.resultList.page += 1;
      if (this.resultList.page === this.result.totalPage) {
        this.resultList.records = this.result.records;
      } else {
        this.resultList.records = this.result.records.slice(0, this.resultList.page * 60);
      }
    },
    // 导出
    exportResult() {
      this.eventTracking('FaceIdentityExport');
      const exportColumns = this.exportSettingManger.getExportFiledCode();
      const params = { exportColumns };
      if (this.checkedItem.length) {
        params.exportList = this.checkedItem;
      } else {
        params.exportList = this.result.records;
      }
      FaceSearchSrv.export(params).then((res) => {
        if (res.code === 0) {
          window.location.href = res.data;
        }
      });
    },
    // 导出设置
    async exportSetting() {
      this.eventTracking('FaceIdentityExportSet');
      await this.exportSettingManger.setExportSetting();
    },
    // 退出选择
    clearChecked() {
      this.checkedItem = [];
    },
    // 选中卡片
    checkedChange(items) {
      this.checkedItem = items;
    }
  }
};
</script>

<style lang="scss" scoped>
.face-identity-result {
  height: 100%;
}
</style>
