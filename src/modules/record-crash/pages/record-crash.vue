<template>
  <page-layout>
    <div class="record-crash">
      <search-form
        @search-crash="searchRecordData">
      </search-form>
      <div
        v-loading="loadding"
        class="record-crash-content">
        <div
          v-background="activeCardData.length ? false : {icon:'icon_3',text:$t('暂无结果')}"
          class="content-background">
          <div class="content-title">
            <span v-if="!isSelectMode">{{ $t('分析结果：共{count}条', {count: cardData.length}) }}</span>
            <span v-else>{{ $t('选中结果') }}{{ selectedNum }}{{ $t('条') }}</span>
            <div class="title-options">
              <export-setting-button
                v-if="exportPermission && cardData.length > 0"
                :type="isSelectMode && selectedNum ? 'primary' : 'default'"
                :disabled="!totalNum"
                button-text="导出"
                dropdown-text="导出设置"
                @click-export="onClickExport"
                @click-setting="onClickSetting">
              </export-setting-button>
              <meg-button
                @click="toggleSelectMode"
                :disabled="!totalNum"
                v-if="exportPermission && cardData.length > 0 && isSelectMode">
                {{ $t('退出选择') }}
              </meg-button>
            </div>
          </div>
          <meg-scrollbar>
            <div
              class="content-body">
              <meg-card-frame
                tag="div"
                class="card-frame"
                :card-min-width="230">
                <record-card
                  v-for="(item, index) in activeCardData"
                  :card-data="item"
                  :key="index"
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
              <div
                v-if="isShowLoad"
                @click="loadMore"
                class="load-more-box">
                <meg-button>
                  {{ $t('加载更多') }}
                </meg-button>
              </div>
            </div>
          </meg-scrollbar>
        </div>
      </div>
    </div>
  </page-layout>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import searchForm from '../components/search-form.vue';
import recordCard from '../components/record-card';
import recordCrashSrv from '../record-crash.service.js';

export default {
  components: {
    searchForm,
    recordCard,
    ExportSettingButton
  },
  data() {
    return {
      selection: [],
      selectedNum: 0,
      exportPermission: true,
      totalNum: 11,
      residue: [], // 导出剩余可选字段
      choosed: [], // 导出已选择字段
      exportSettingVisible: false,
      exportContent: 'all',
      isSelectMode: false,
      cardData: [],
      activeCardData: [],
      activeInd: 0,
      isShowLoad: false,
      loadding: false,
      searchParams: {},
      exportSettingManger: new ExportSettingManager(this.$store, 'record-crash', 'profile_collision_export_column'),
    };
  },
  methods: {
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
    searchRecordData(params, profileId) {
      this.loadding = true;
      this.activeCardData = [];
      this.activeInd = 0;
      this.searchParams = {
        appearCount: params.appearCount,
        interval: params.interval,
        startTime: params.startTime,
        endTime: params.endTime,
        profileId,
        profileType: params.profileType,
        albumIds: params.albumIds
      };
      recordCrashSrv.searchRecord(this.searchParams).then((res) => {
        this.loadding = false;
        if (res.code === 0) {
          this.cardData = res.data;
          this.loadMore();
        }
      });
    },
    /**
     * @description 裁切数据
     */
    loadMore() {
      this.activeInd += 1;
      let item = [];
      if (this.cardData.length / 60 > this.activeInd) {
        item = this.cardData.slice((this.activeInd - 1) * 60, this.activeInd * 60);
        this.isShowLoad = true;
      } else {
        this.isShowLoad = false;
        item = this.cardData.slice((this.activeInd - 1) * 60);
      }
      this.activeCardData = this.activeCardData.concat(item);
    },
    exportInfo() {
      let exportForm = {};
      // 如果已选字段大于0，则导出对应字段，否则默认导出全部字段，即此状态下的剩余字段
      exportForm.items = this.exportSettingManger.getExportSetting();
      exportForm.isTask = !this.isSelectMode;
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.data = this.selection;
          recordCrashSrv.recordSelectExport(exportForm).then((res) => {
            this.resetCheckState();
            this.isSelectMode = false;
            this.selection = [];
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
        exportForm = { ...{}, ...exportForm, ...this.searchParams };
        recordCrashSrv.recordTaskExport(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    /* 当卡片遮罩层在选择模式被点击时，判断卡片选中状态
    * @param {index} 分类索引
    * @param {key} 卡片位于分类中的索引
    */
    onCardMaskClick(key, item) {
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
    onClickExport() {
      console.log('export');
      this.exportInfo();
    },
    async onClickSetting() {
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
    },
    /**
     * 当某一个选择框状态改变时，为当前分类的全选框判断状态
     * @param {index} 分类索引
     */
    updateCheckState() {
      this.selectedNum = 0;
      this.selection = [];
      this.activeCardData.forEach((val) => {
        if (val.cardChecked) {
          this.selectedNum += 1;
          this.selection.push(val);
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
    },
    /**
     * 导出设置关闭
     */
    exportClose() {
      this.exportSettingVisible = false;
    },
    /**
     * 切换选择模式
     */
    toggleSelectMode() {
      if (this.isSelectMode) this.resetCheckState();
      this.isSelectMode = !this.isSelectMode;
    },
  }
};
</script>
<style lang='scss' scoped>
.record-crash{
  display: flex;
  height: 100%;
  &-content{
    box-sizing: border-box;
    flex: 1;
    background: #DBE1E5;
    padding: 0 19px;
    ::v-deep .meg-scrollbar {
      height: calc(100% - 56px);
    }
  }
  .content-body {
    padding-bottom: 80px;
  }
}
.content-background{
  height: 100%;
}
.collection-box{
  position: absolute;
  top: 10px;
  right: 10px;
  .meg-icon{
    width: 25px;
    height: 25px;
  }
}
.card-mask {
  position: absolute;
  z-index: 7;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.1);
}
.card-checkbox {
  position: absolute;
  top: 5px;
  left: 5px;
}
.export-button{
  margin-right: 14px;
}
.content-title{
  height: 56px;
  line-height: 56px;
  font-size: 12px;
  display: flex;
  padding-right: 20px;
  justify-content: space-between;
}
.load-more-box{
  text-align: center;
  width: 100%;
  height: 56px;
  button{
    width: 300px;
    margin-top: 10px;
  }
}
</style>
