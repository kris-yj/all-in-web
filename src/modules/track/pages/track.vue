<template>
  <page-layout>
    <div class="track-module">
      <div class="aside">
        <div class="aside-header">
          <meg-return-button
            :title="$t('轨迹回放')"
            :button-visible="false"></meg-return-button>
        </div>
        <div class="aside-body">
          <search-form
            ref="searchForm"
            @confirm="search"></search-form>
        </div>
      </div>
      <div
        class="result"
        v-loading="resultLoading">
        <div
          class="result-box"
          style="height:100%">
          <div
            class="result-body"
            v-background="resultBackground">
            <div class="info-layer">
              <div class="result-title">
                <div
                  class="capture-count"
                  v-tooltip="true">
                  {{ titleText }}
                </div>
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
                  class="cancel-button"
                  @click="toggleSelectMode">
                  {{ $t('取消') }}
                </meg-button>
              </div>
              <simple-collapse
                ref="sortCollapse"
                :more-page="collapseMorePage"
                :state="searchState"
                :is-select-mode="isSelectMode"
                :content="collapseData"
                :sort-type="sortType"
                @card-click="cardClick"
                @selected-num-change="selectedNumChange"
                @change-mode="changeMode"></simple-collapse>
            </div>
            <trace-play-map
              class="tracePlayMap"
              ref="tracePlayMap"
              :track-data="tackList">
              <template v-slot:freeInfoOverlay="{params}">
                <captured-card
                  v-if="params"
                  @detail="handleCaptureDetail(params)"
                  @close="handleCloseFreeInfoOverflay"
                  :data="params"></captured-card>
              </template>
            </trace-play-map>
          </div>
        </div>
        <common-capture-detail
          :index="detailSelectIndex"
          :upload-list="uploadList"
          :visible.sync="detailVisible"
          :result-list="detailList"
          @close="closeCaptureDetail">
        </common-capture-detail>
      </div>
    </div>
  </page-layout>
</template>

<script>
import TracePlayMap from '@/common-components/common-maps/trace-play-map';
import CapturedCard from '@/components/judge/captured-card';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import SimpleCollapse from '@/components/judge/simple-collapse';
import TrackSrv from '@/modules/track/track.service.js';
import SearchForm from '../components/search-form';

export default {
  components: {
    SimpleCollapse,
    CapturedCard,
    CommonCaptureDetail,
    SearchForm,
    ExportSettingButton,
    TracePlayMap
  },
  data() {
    return {
      captureAreaCount: 0,
      captureCount: 0,
      detailSelectIndex: -1, // 详情底部的卡片列表的选中值
      detailList: [], // 详情底部的卡片列表
      detailInfo: {}, // 卡片详情
      detailVisible: false, // 抓拍详情是否显示
      resultBackground: { icon: 'icon_2', text: this.$t('检索无结果') },
      resultLoading: false,
      photoBase64: '',
      collapseMorePage: false,
      searchState: +new Date(),
      collapseData: [],
      sortType: 'DAY',
      isSelectMode: false, // 是否为选择模式
      totalNum: 0, // 查询结果的总数
      selectedNum: 0,
      cardSelection: [],
      tackList: [],
      uploadList: [],
      exportSettingManger: new ExportSettingManager(this.$store, 'track', 'galaxy_capture_allinone_export_column')
    };
  },
  computed: {
    titleText() {
      return this.isSelectMode ? `已选择${this.selectedNum}个` : `共经过${this.captureAreaCount}个地方,出现${this.captureCount}次`;
    },
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('track', 'export');
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
    /**
     * 条件导出,调用接口
     * @param {params} 需要导出的检索条件
     * @returns
     */
    exportInfo() {
      const exportForm = {};
      // 如果已选字段大于0，则导出对应字段，否则默认导出全部字段，即此状态下的剩余字段
      const choosed = this.exportSettingManger.getExportSetting();
      exportForm.exportColumns = choosed;
      exportForm.uploadPhotoData = this.photoBase64;
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.exportData = this.cardSelection;
          exportForm.isTask = false;
          TrackSrv.export(exportForm).then((res) => {
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
        exportForm.isTask = true;
        exportForm.exportData = data;
        TrackSrv.export(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    onClickExport() {
      this.exportInfo();
    },
    async onClickSetting() {
      await this.exportSettingManger.setExportSetting();
    },
    search(params, base64) {
      this.isSelectMode = false;
      this.photoBase64 = base64;
      this.resultLoading = true;
      const transiformParams = {
        passByInfos: params.passByInfos.map((item) => ({
          ...item,
          captureTime: item.capturedTime,
          lon: item.longitude,
          lat: item.latitude,
          captureId: item.id
        }))
      };
      TrackSrv.getTrack(transiformParams).then((res) => {
        if (res.code === 0) {
          if (!res.data.captureAreaCount) {
            this.resultBackground = { icon: 'icon_2', text: this.$t('检索无结果') };
            this.resultLoading = false;
            this.captureAreaCount = 0;
            return;
          }
          let ind = 0;
          res.data.list.forEach((item) => {
            this.totalNum += item.count;
            item.title = item.areaName;
            item.captureList = item.captureList.map((obj) => {
              if (obj.lat && obj.lon) {
                ind += 1;
                obj.ind = ind;
              }
              return {
                ...obj,
                cardChecked: false,
                id: obj.captureId,
                cropUrl: obj.photoUrl,
                searchPhotoIndex: obj.searchTargetIndex,
                showScore: parseFloat(obj.score).toFixed(2)
              };
            });
            item.list = item.captureList;
          });
          this.tackList = res.data.list.reduce((arc, item) => [...arc, ...item.captureList], []);
          this.collapseData = res.data.list;
          this.captureAreaCount = res.data.captureAreaCount;
          this.captureCount = res.data.captureCount;
          this.resultBackground = false;
        }
        this.resultLoading = false;
      });
      this.uploadList = this.$refs.searchForm.getUploadedPhotos();
    },
    /**
     * 需要展示详情的卡片信息
     */
    cardClick(index, key, list, card) {
      this.detailList = list;
      this.detailSelectIndex = key;
      this.activeCategoryIndex = index;
      this.$refs.tracePlayMap.showFreeOverlay(card);
    },
    /**
     * 点击地图中的卡片显示详情
     * @param {info} 卡片详情
     * @returns
     */
    onClickTraceImage(info) {
      const index = info.categoryIndex;
      this.activeCategoryIndex = index;
      this.detailVisible = true;
    },
    closeCaptureDetail() {
      this.detailVisible = false;
    },
    handleCaptureDetail(params) {
      this.collapseData.forEach((item, ind) => {
        if (item.captureList.findIndex((obj) => obj.captureId === params.captureId) !== -1) {
          this.$refs.sortCollapse.setActiveIndex(ind);
          this.detailList = item.captureList;
          this.detailSelectIndex = item.captureList.findIndex((obj) => obj.captureId === params.captureId);
        }
      });
      this.detailVisible = true;
    },
    // 关闭自由弹窗
    handleCloseFreeInfoOverflay() {
      this.$refs.tracePlayMap.hideFreeOverlay();
    },
  }
};
</script>

<style lang="scss" scoped>
::v-deep .meg-form-item__content{
  height: 100%;
  .img-upload .upload-select .upload-container .upload-prompt-text {
    top: 80%;
  }
}
.tracePlayMap {
  ::v-deep .playbar {
    left: 57%;
  }
}
.track-module {
  display: flex;
  height: 100%;
  .aside {
    width: 320px;
    height: 100%;
    .aside-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 56px;
      padding: 0 25px;
      font-size: 16px;
      color: #435068;
      background-color: #eee;
    }
    .aside-body {
      height: calc(100% - 56px);
    }
    .return-icon {
      margin-top: -2px;
      transform: rotate(90deg);
      margin-right: 8px;
      cursor: pointer;
    }
    .task-card-box {
      display: inline-block;
      width: 130px;
      margin: 0 20px 16px 0;
      .meg-card {
        margin: 0;
        box-shadow: none;
      }
      .count-num-box {
        padding-top: 7px;
        .count-num {
          font-size: 16px;
          margin: 0 7px;
          font-family: "meg-number";
        }
      }
    }
  }
  .result {
    flex: 1;
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
        margin: 0 14px;
      }
      .result-count-box {
        padding-left: 20px;
        .number-font {
          font-size: 14px;
        }
      }
    }
    .result-body {
      flex: 1;
      height: 100%;
      position: relative;
      overflow: hidden;
      .info-layer{
        position: absolute;
        top: 0;
        left: 0;
        width: 300px;
        height: 100%;
        z-index: 10;
        background: #F2F4F8;
        .result-title {
          display: flex;
          background-color: #f9f9f9;
          padding: 0 20px;
          align-items: center;
           .capture-count{
            flex: 1;
            margin-right: 20px;
            height: 60px;
            line-height: 60px;
            font-size: 14px;
          }
          .cancel-button {
            margin-left: 20px;
          }
        }
        ::v-deep .meg-scrollbar{
          height: calc(100%-60px);
        }
      }
      .map-box {
        background-color: #efefef;
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}
</style>
<style lang="scss">
.i18n-en-US {
  .track-module {
    .leftInteractive .searchOperate {
      .title {
        font-size: 12px;
      }
      .el-button--text {
        font-size: 12px;
      }
      .el-button{
        padding: 10px 18px;
      }
    }
  }
}
</style>
