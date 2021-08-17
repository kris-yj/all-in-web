<template>
  <div class="analysis-result">
    <div class="result-header">
      <meg-return-button
        class="return-site"
        title="分析结果"></meg-return-button>
      <div class="content-title">
        <span v-if="!isSelectMode">{{ $t("分析结果：共{count}条", {count: activeCardData.length }) }}</span>
        <span v-else>{{ $t('选中结果{selectedNum}条', {selectedNum: selectedNum}) }}</span>
        <div class="title-options">
          <export-setting-button
            v-if="exportPermission && activeCardData.length > 0"
            :type="isSelectMode && selectedNum ? 'primary' : 'default'"
            button-text="导出"
            dropdown-text="导出设置"
            @click-export="onClickExport"
            @click-setting="onClickSetting">
          </export-setting-button>
          <meg-button
            @click="toggleSelectMode"
            v-if="exportPermission && activeCardData.length > 0 && isSelectMode">
            {{ $t('退出选择') }}
          </meg-button>
        </div>
      </div>
    </div>
    <div
      class="content-background"
      v-loading="analysisLoading">
      <div
        class="content-background"
        v-background="activeCardData.length > 0 ? false: {icon:'icon_2',text:$t('检索无结果')}">
        <meg-scrollbar>
          <div
            class="result-content">
            <meg-card-frame
              tag="div"
              class="card-frame"
              :gap="10"
              :card-min-width="230">
              <record-card
                v-for="(item, index) of activeCardData"
                :key="index"
                card-type="track"
                :card-data="item"
                @click.native="jumpToRecord(item)">
                <template v-slot:custom="{isShowCustom}">
                  <div
                    class="card-mask"
                    slot="custom"
                    v-if="isSelectMode"
                    @click.stop="onCardMaskClick(index,item)">
                  </div>
                  <div
                    v-show="isSelectMode || isShowCustom"
                    class="card-checkbox"
                    @click.stop>
                    <meg-checkbox
                      v-model="item.cardChecked"
                      @change="onCheckChanged(index,item)">
                    </meg-checkbox>
                  </div>
                </template>
              </record-card>
            </meg-card-frame>
          </div>
        </meg-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import recordCard from '@/modules/record-crash/components/record-card';
import trackAnalysisSrv from '../track-analysis.service';

export default {
  components: {
    recordCard,
    ExportSettingButton
  },
  data() {
    return {
      exportPermission: true,
      isSelectMode: false,
      activeCardData: [],
      selectedNum: 0,
      residue: [],
      cardSelection: [],
      analysisLoading: true,
      exportSettingManger: new ExportSettingManager(this.$store, 'track-analysis', 'profile_track_export_column')

    };
  },
  computed: {
    searchParams() {
      return JSON.parse(this.$route.query.searchParams);
    }
  },
  created() {
    this.searchRecordData();
  },
  methods: {
    searchRecordData() {
      trackAnalysisSrv.searchRecord(this.searchParams).then((res) => {
        this.analysisLoading = false;
        if (res.code === 0) {
          this.activeCardData = res.data;
        }
      });
    },
    jumpToRecord(item) {
      const profileType = item.profileType === 0 ? 3 : item.profileType;
      const query = {
        id: item.profileId,
        profileType
      };
      switchToModule({
        module: 'document',
        child: 'document-detail',
        query,
        isBlank: true
      });
    },
    onCardMaskClick(ind, item) {
      item.cardChecked = !item.cardChecked;
      this.changeMode();
      this.updateCheckState();
    },
    onCheckChanged() {
      this.changeMode();
      this.updateCheckState();
    },
    changeMode() {
      if (this.activeCardData.length > 0) {
        if (this.activeCardData.some((child) => child.cardChecked)) {
          this.isSelectMode = true;
        } else {
          this.isSelectMode = false;
        }
      }
    },
    exportInfo() {
      let exportForm = {};
      // 如果已选字段大于0，则导出对应字段，否则默认导出全部字段，即此状态下的剩余字段
      exportForm.items = this.exportSettingManger.getExportSetting();
      exportForm.isTask = !this.isSelectMode;
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.data = this.cardSelection;
          trackAnalysisSrv.recordSelectExport(exportForm).then((res) => {
            this.isSelectMode = false;
            if (res.code === 0) {
              this.resetCheckState();
              window.location.href = res.data.url;
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          this.$message.warning(this.$t('请先选择需要导出的检索卡片'));
        }
      } else {
        exportForm = { ...{}, ...exportForm, ...this.searchParams };
        trackAnalysisSrv.recordTaskExport(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    onClickExport() {
      console.log('export');
      this.exportInfo();
    },
    async onClickSetting() {
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
      // 获取导出设置项'
    },
    /**
     * 退出选择模式
     */
    toggleSelectMode() {
      if (this.isSelectMode) this.resetCheckState();
      this.isSelectMode = false;
    },
    updateCheckState() {
      this.selectedNum = 0;
      this.cardSelection = [];
      this.activeCardData.forEach((val) => {
        if (val.cardChecked) {
          this.selectedNum += 1;
          this.cardSelection.push(val);
        }
      });
    },
    resetCheckState() {
      this.selectedNum = 0;
      this.cardSelection = [];
      this.activeCardData.forEach((val) => {
        if (val.cardChecked) {
          val.cardChecked = false;
        }
      });
    }
  }
};
</script>
<style lang='scss' scopde>
.analysis-result {
  height: 100%;
  background-color: #dbe1e5;
  .result-header {
    height: 56px;
    position: relative;
    .return-site{
      position: absolute;
      left: 0;
      top: 13px;
    }
    .content-title{
      height: 56px;
      line-height: 56px;
      font-size: 12px;
      display: flex;
      padding-left: 120px;
      padding-right: 40px;
      justify-content: space-between;
    }
  }
  .content-background{
    height: 100%;
  }
  .result-content{
    padding-left: 40px;
    padding-right: 40px;
    height: calc(100% + 50px);
    padding-bottom: 90px;
    min-width: 1400px;
  }
  .card-mask {
    position: absolute;
    z-index: 7;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }
  .card-checkbox {
    position: absolute;
    top: 5px;
    left: 5px;
  }
}
</style>
