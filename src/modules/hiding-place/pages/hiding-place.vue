<template>
  <page-layout>
    <div class="hiding-place-module">
      <div class="aside">
        <div class="aside-header">
          <meg-return-button
            :title="$t('落脚点分析')"
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
                class="cancel-button"
                v-if="isSelectMode"
                @click="toggleSelectMode"
                :disabled="!totalNum">
                {{ $t('退出选择') }}
              </meg-button>
            </div>
            <simple-collapse
              ref="sortCollapse"
              :more-page="collapseMorePage"
              :state="searchState"
              :is-select-mode="isSelectMode"
              :content="collapseData"
              :sort-type="sortType"
              :default-index="defaultIndex"
              @card-click="cardClick"
              @selected-num-change="selectedNumChange"
              @change-mode="changeMode"></simple-collapse>
          </div>
          <foothold-display-map
            ref="foothold"
            :capture-array="collapseData"
            :feature-array="featureArray">
            <template v-slot:list="{params}">
              <div
                class="device-list"
                v-show="params.count">
                <div
                  class="hover-tooltip"
                  @click="handleHeatMapClick(params)">
                  <h3>抓拍<span>{{ params.count }}</span>张</h3>
                </div>
              </div>
            </template>
            <template v-slot:overlay="{params}">
              <div>
                <captured-card
                  v-if="params"
                  @detail="handleCaptureDetail"
                  @close="handleCloseFreeInfoOverflay"
                  :data="params"></captured-card>
              </div>
            </template>
          </foothold-display-map>
        </div>
      </div>
      <common-capture-detail
        :index="detailSelectIndex"
        :visible.sync="detailVisible"
        :upload-list="uploadList"
        :result-list="detailList"
        @close="closeCaptureDetail">
      </common-capture-detail>
      <capture-list
        v-if="captureVisible"
        @detail="handleListDetail"
        @close="handleCloseCaptureModal"
        title="抓拍列表"
        :visible="captureVisible"
        :list="captureListData"></capture-list>
    </div>
  </page-layout>
</template>

<script>
import FootholdDisplayMap from '@/common-components/common-maps/foothold-display-map';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import { ExportSettingButton, ExportSettingManager } from '@/common-components/common-export-setting';
import CapturedCard from '@/components/judge/captured-card';
import SimpleCollapse from '@/components/judge/simple-collapse';
import HidingPlaceSrv from '../hiding-place.service.js';
import SearchForm from '../components/search-form';
import CaptureList from '../components/capture-list';

export default {
  components: {
    SimpleCollapse,
    CapturedCard,
    CommonCaptureDetail,
    SearchForm,
    ExportSettingButton,
    FootholdDisplayMap,
    CaptureList
  },
  data() {
    return {
      captureVisible: false,
      areaCount: 0,
      detailSelectIndex: -1, // 详情底部的卡片列表的选中值
      detailList: [], // 详情底部的卡片列表
      detailVisible: false, // 抓拍详情是否显示
      resultBackground: { icon: 'icon_2', text: this.$t('检索无结果') },
      resultLoading: false,
      photoBase64: '',
      collapseMorePage: false,
      searchState: +new Date(),
      sourceData: [], // 数据集，会将从接口的数据自动格式化，加入默认参数
      collapseData: [],
      sortType: 'DAY',
      defaultIndex: { key: 0 }, // 折叠面板的默认索引
      isSelectMode: false, // 是否为选择模式
      totalNum: 0, // 查询结果的总数
      selectedNum: 0,
      cardSelection: [],
      featureArray: [],
      captureListData: [],
      uploadList: [],
      exportSettingManger: new ExportSettingManager(this.$store, 'track', 'galaxy_capture_allinone_export_column')
    };
  },
  computed: {
    titleText() {
      return this.isSelectMode ? `已选择${this.selectedNum}个` : `共有${this.areaCount}个点可能成为落脚点`;
    },
    choosed() {
      return this.exportSettingManger.getExportSetting();
    },
    exportPermission() {
      return this.$store.getters.modulePermissonsByAlias('hiding-place', 'export');
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
      this.isSelectMode = !this.isSelectMode;
    },
    changeMode(val) {
      this.isSelectMode = val;
    },
    onClickExport() {
      this.exportInfo();
    },
    async onClickSetting() {
      // 设置导出设置
      await this.exportSettingManger.setExportSetting();
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
      exportForm.exportColumns = this.choosed;
      exportForm.isTask = !this.isSelectMode;
      exportForm.uploadPhotoData = this.photoBase64;
      if (this.isSelectMode) {
        if (this.selectedNum) {
          exportForm.exportData = this.cardSelection;
          HidingPlaceSrv.export(exportForm).then((res) => {
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
        HidingPlaceSrv.export(exportForm).then((res) => {
          if (res.code === 0) {
            this.$message.success(this.$t('导出成功，请前往任务列表下载'));
          }
        });
      }
    },
    handleHeatMapClick(params) {
      if (params.list.length && params.list.length > 1) {
        this.captureVisible = true;
        this.captureListData = [];
        this.captureListData = params.list;
      } else {
        this.$refs.foothold.showFreeOverlay(params);
      }
    },
    closeCaptureDetail() {
      this.detailVisible = false;
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
        })),
        appearCount: params.appearCount
      };
      HidingPlaceSrv.getTrack(transiformParams).then((res) => {
        if (res.code === 0) {
          if (!res.data.areaCount) {
            this.resultBackground = { icon: 'icon_2', text: this.$t('检索无结果') };
            this.resultLoading = false;
            this.areaCount = 0;
            return;
          }
          let ind = 0;
          res.data.list.forEach((item) => {
            this.totalNum += item.count;
            item.title = item.areaName;
            item.captureList = item.captureList.map((obj) => {
              ind += 1;
              obj.ind = ind;
              return {
                ...obj,
                ind,
                id: obj.captureId,
                cropUrl: obj.photoUrl,
                cardChecked: false,
                searchPhotoIndex: obj.searchTargetIndex,
                showScore: parseFloat(obj.score).toFixed(2)
              };
            });
            item.list = item.captureList;
          });
          this.collapseData = res.data.list.map((item) => ({
            ...item,
            lon: item.captureList[0].lon,
            lat: item.captureList[0].lat,
          }));
          this.featureArray = res.data.list.map((item) => ({
            ...item,
            lon: item.captureList[0].lon,
            lat: item.captureList[0].lat,
            cameraId: item.captureList[0].cameraId,
            type: 0,
            status: 0
          })).filter((val) => val.lon && val.lat);
          this.sourceData = res.data.list;
          this.areaCount = res.data.areaCount;
          this.resultBackground = false;
        }
        this.resultLoading = false;
        // 获取上传图
        this.uploadList = this.$refs.searchForm.getUploadedPhotos();
        // 隐藏地图slot
        this.handleCloseFreeInfoOverflay();
      });
    },
    /**
     * 需要展示详情的卡片信息 index - 父, key - 子
     */
    cardClick(index, key, list, card) {
      this.detailList = list;
      this.$refs.foothold.showFreeOverlay(card);
      this.detailSelectIndex = key;
    },
    handleListDetail(list, index) {
      this.captureVisible = false;
      this.detailList = list;
      this.detailSelectIndex = index;
      this.detailVisible = true;
    },
    /**
     * 函数作用
     * @param {any}
     * @returns
     */
    clickPlace(item) {
      const vm = this;
      this.sourceData.forEach((element, key) => {
        if (element.areaId === item.areaId) {
          vm.defaultIndex = { key };
        }
      });
    },
    handleCaptureDetail() {
      this.detailVisible = true;
    },
    handleCloseFreeInfoOverflay() {
      this.$refs.foothold.hideFreeOverlay();
    },
    handleCloseCaptureModal() {
      this.captureVisible = false;
    },
  }
};
</script>

<style lang="scss" scoped>
.hiding-place-module{
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
      padding: 0 25px;
      font-size: 16px;
      color: #435068;
      background-color: #eee;
    }
    .return-icon{
      margin-top: -2px;
      transform:rotate(90deg);
      margin-right: 8px;
      cursor: pointer;
    }
    .task-card-box{
      display: inline-block;
      width: 130px;
      margin: 0 20px 16px 0;
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
    height: 100%;
    background-color: #dce1e5;
    .result-body{
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
        background: #F2F4F8;
        z-index: 10;
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
    }
  }
}
 .device-list {
    position: relative;
    margin-bottom: 50px;
    .camera-icon {
      width: 30px;
      height: 30px;
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
    }
  }
  .hover-tooltip {
    padding: 0 12px 0 12px;
    height: 34px;
    background-color: #fff;
    cursor: pointer;
    position: relative;
    z-index: 999;
    >h3 {
      font-size: 14px;
      color: #21539B;
      text-align: center;
      line-height: 34px;
      >span {
        font-family: HEMIHEAD;
        padding: 0 4px 0 4px;
      }
    }
    &:after {
      content: ' ';
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #FFFFFF;
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
    }
  }

</style>
<style lang="scss">
.i18n-en-US {
  .hiding-place-module{
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
