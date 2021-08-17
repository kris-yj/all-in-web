<template>
  <div
    class="analysis-map__wrapper"
    v-background="bgVisible">
    <div
      class="analysis-map__container"
      v-loading="loading">
      <div class="analysis-map__main">
        <foothold-display-map
          ref="foothold"
          :feature-array="featureArray"
          :capture-array="captureArray">
          <template v-slot:list="{params}">
            <div class="device-list">
              <div
                class="hover-tooltip"
                @click="handleHeatMapClick(params)">
                <h3>抓拍<span>{{ params.count }}</span>张</h3>
              </div>
              <!-- eslint-disable-next-line -->
                <div class="camera-icon" v-html="cameraIcon"></div>
            </div>
          </template>
          <template v-slot:overlay="{params}">
            <div>
              <trace-free-overlay
                v-if="params &&params.listResults"
                @detail="handleSingleCaptureDetail(params.listResults)"
                @close="handleCloseFreeInfoOverflay"
                :data="params.listResults[0]"></trace-free-overlay>
            </div>
          </template>
        </foothold-display-map>
        <modal-capture-list
          v-if="captureVisible"
          @detail="handleCaptureDetail"
          @close="handleCloseCaptureModal"
          title="抓拍列表"
          :visible="captureVisible"
          :list="captureList"></modal-capture-list>
        <common-capture-detail
          :show-temporary="false"
          :feaker="true"
          :visible.sync="captureDialogVisible"
          :result-list="detailList"
          :index="captureIdx">
        </common-capture-detail>
      </div>
    </div>
  </div>
</template>
<script>
import FootholdDisplayMap from '@/common-components/common-maps/foothold-display-map';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import EventManageApi from '../events-manage.service';
import TraceFreeOverlay from '../components/trace-free-overlay';
import ModalCaptureList from '../components/modal-capture-list';

// import TraceFreeOverlay from '../components/trace-free-overlay';
import { CAMERA_ICON } from '../utils';

export default {
  name: 'AddressAnalysis',
  components: {
    FootholdDisplayMap, // 落脚点分析地图
    TraceFreeOverlay, // 单人弹窗
    ModalCaptureList, // 多人列表弹窗
    CommonCaptureDetail, // 卡片详情
    // TraceFreeOverlay,
  },
  data() {
    return {
      captureList: [],
      featureArray: [],
      captureArray: [],
      loading: false,
      cameraIcon: CAMERA_ICON,
      captureVisible: false,
      captureDialogVisible: false, // 查看详情弹窗
      captureIdx: 0, // 查看详情下标
      detailList: [], // 查看详情list
    };
  },
  computed: {
    bgVisible() {
      const background = {
        icon: 'icon_2',
        text: '暂无数据'
      };
      if (this.featureArray.length > 0 || this.loading) return false;
      return background;
    },
    addSelf() {
      return this.$store.getters['shelf/eventAddData'];
    },
  },
  watch: {
    addSelf(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getClueCategory();
      }
    },
  },
  created() {
    this.getClueCategory();
  },
  methods: {
    getClueCategory() {
      const reqParams = {
        aggType: 'camera',
        eventId: this.$route.query.eventId,
        limitLonLat: true,
        order: 'asc'
      };
      this.loading = true;
      EventManageApi.clueCategory(reqParams).then((res) => {
        this.loading = false;
        if (res.code === 0) {
          const records = res.data.records.map((item) => ({
            displayName: item.aggName,
            count: item.count,
            lon: item.longitude,
            lat: item.latitude,
            ...item
          }));
          this.featureArray = records;
          this.captureArray = records;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleHeatMapClick(params) {
      if (params.listResults.length && params.listResults.length > 1) {
        this.captureVisible = true;
        this.captureList = [];
        this.captureList = params.listResults;
      } else {
        this.$refs.foothold.showFreeOverlay(params);
      }
    },
    handleCloseFreeInfoOverflay() {
      this.$refs.foothold.hideFreeOverlay();
    },
    handleCloseCaptureModal() {
      this.captureVisible = false;
    },
    // 多张卡片详情
    handleCaptureDetail({ index }) {
      this.captureDialogVisible = true;
      this.captureIdx = index;
      this.detailList = this.captureList;
    },
    // 单张卡片详情
    handleSingleCaptureDetail(list) {
      this.detailList = list;
      this.captureIdx = 0;
      this.captureDialogVisible = true;
    }
  },
};
</script>
<style lang="scss" scoped>
  .device-list {
    position: relative;
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
  .analysis-map__wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    .analysis-map__container {
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
    }
    .analysis-map__main {
      width: 100%;
      height: 100%;
    }
  }
</style>
