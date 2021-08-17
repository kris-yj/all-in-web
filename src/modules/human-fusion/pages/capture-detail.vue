<template>
  <page-layout>
    <div class="capture-detail">
      <div class="datail-info">
        <div class="back-button">
          <meg-return-button
            :title="$t('返回')"></meg-return-button>
        </div>
        <body-info
          v-if="detailType === 'body'"
          :body-info-data="infoData">
        </body-info>
        <face-info
          v-else
          :face-info-data="infoData">
        </face-info>
      </div>
      <div
        v-loading="detailLoading"
        class="data-analysis">
        <meg-tabs
          v-model="activeName"
          @tab-click="handleTabClick">
          <meg-tab-pane
            :label="$t('抓拍图片')"
            name="capture">
            <snap-picture
              ref="snapPicture"
              :face-list.sync="faceList"
              :body-list.sync="bodyList"
              @delete-card="deleteCard">
            </snap-picture>
          </meg-tab-pane>
          <meg-tab-pane
            :label="$t('轨迹分析')"
            name="track">
            <div
              class="loading-body">
              <track-play-map
                :track-list="trackList"
                v-if="activeName === 'track' && !detailLoading"
                @date-change="dateChange">
                <template
                  v-slot:freeInfoBody="{params}">
                  <div
                    v-if="JSON.stringify(params) !== '{}'"
                    class="map-mark-box">
                    <div
                      class="mark-box-right"
                      v-tooltip="true">
                      {{ params.cameraName }}
                    </div>
                    <div class="mark-box-bottom">
                      {{ $t('抓拍次数') }}：{{ cameraCount(params) }}{{ $t('次') }}
                      <div
                        class="mark-button"
                        @click="handleHeatMapClick(params, 'track')">
                        {{ $t('查看') }}
                        <meg-icon
                          name="arrow_right">
                        </meg-icon>
                      </div>
                    </div>
                  </div>
                </template>
              </track-play-map>
            </div>
          </meg-tab-pane>
          <meg-tab-pane
            :label="$t('落脚点分析')"
            name="foothold">
            <div
              class="loading-body">
              <foothold-display-map
                ref="foothold"
                v-if="activeName === 'foothold' && !detailLoading"
                :capture-array="footholdList"
                :feature-array="footholdList">
                <template v-slot:list="{params}">
                  <div class="device-list">
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
                      @close="handleClose"
                      :data="params"></captured-card>
                  </div>
                </template>
              </foothold-display-map>
            </div>
          </meg-tab-pane>
          <meg-tab-pane
            :label="$t('规律分析')"
            name="law">
            <meg-histogram
              height="100%"
              v-if="activeName === 'law'"
              :legend-visible="false"
              :data="initLawData"
              :settings="histogramSetting"></meg-histogram>
          </meg-tab-pane>
          <meg-tab-pane
            :label="$t('活动时段')"
            name="time">
            <meg-line
              height="100%"
              :legend-visible="false"
              v-if="activeName === 'time'"
              :data="initTimeData"
              :settings="chartLineSettings"></meg-line>
          </meg-tab-pane>
        </meg-tabs>
        <div class="time-sizer">
          <div class="time-slot">
            <meg-date-picker
              :value="dateValue"
              type="datetimerange"
              :readonly="true"
              :prefix-icon-visible="false"
              format="yyyy-MM-dd HH:mm"
              range-separator="-"
              :start-placeholder="$t('开始日期')"
              :end-placeholder="$t('结束日期')"
              align="right">
            </meg-date-picker>
          </div>
          <div class="change-title">
            {{ $t('当前目标抓拍时间前后') }}
          </div>
          <meg-select
            v-model="timeSelectValue"
            @change="timeChange"
            :placeholder="$t('请选择')">
            <meg-option
              v-for="item in timeOptions"
              :key="item"
              :label="item"
              :value="item">
            </meg-option>
          </meg-select>
        </div>
      </div>
      <capture-list
        @close="handleCloseCaptureModal"
        title="抓拍列表"
        :visible.sync="captureVisible"
        @detail="handleListDetail"
        :list="captureListData"></capture-list>
      <common-capture-detail
        :index="detailSelectIndex"
        :visible.sync="detailVisible"
        :show-temporary="false"
        :result-list="detailList"
        @close="closeCaptureDetail">
      </common-capture-detail>
    </div>
  </page-layout>
</template>

<script>
import TrackPlayMap from '@/common-components/common-maps/track-play-map';
import FootholdDisplayMap from '@/common-components/common-maps/foothold-display-map';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import CaptureList from '@/modules/hiding-place/components/capture-list';
import CapturedCard from '@/components/judge/captured-card';
import bodyInfo from '../components/body-info';
import faceInfo from '../components/face-info';
import snapPicture from '../components/snap-picture';
import humanFusionSrv from '../human-fusion.service';

export default {
  components: {
    bodyInfo,
    snapPicture,
    FootholdDisplayMap,
    TrackPlayMap,
    faceInfo,
    CapturedCard,
    CaptureList,
    CommonCaptureDetail
  },
  data() {
    return {
      activeName: 'capture',
      loading: false,
      detailList: [],
      timeSelectValue: '1天',
      timeOptions: ['1天', '3天', '5天'],
      chartLineSettings: {
        labelMap: {
          'count': this.$t('抓拍数量'),
        },
      },
      captureListData: [],
      detailSelectIndex: 0,
      captureVisible: false,
      detailVisible: false,
      faceList: [],
      bodyList: [],
      // 活动轨迹数据
      // 落脚点分析数据
      footholdList: [],
      trackList: [],
      histogramSetting: {
        labelMap: {
          count: this.$t('抓拍数量'),
        }
      },
      lawRecords: [],
      timeRecords: [],
      targetDay: '',
      dialogVisible: false,
      captureData: [],
      searchId: null,
      detailLoading: false,
    };
  },
  computed: {
    dateValue() {
      let dateValue = [];
      if (this.detailType === 'face') {
        dateValue = [new Date().getTime() - 3600 * 1000 * 24 * parseFloat(this.timeSelectValue), new Date().getTime()];
      } else {
        let captureAfterTime = this.infoData.bodyCapturedTime + 3600 * 1000 * 24 * parseFloat(this.timeSelectValue);
        if (captureAfterTime > new Date().getTime()) {
          captureAfterTime = new Date().getTime();
        }
        dateValue = [this.infoData.bodyCapturedTime - 3600 * 1000 * 24 * parseFloat(this.timeSelectValue), captureAfterTime];
      }
      return dateValue;
    },
    initLawData() {
      const histogramData = {};
      histogramData.columns = ['captureDay', 'count'];
      histogramData.rows = this.lawRecords;
      return histogramData;
    },
    initTimeData() {
      const histogramData = {};
      histogramData.columns = ['captureHour', 'count'];
      histogramData.rows = this.timeRecords;
      return histogramData;
    },
    detailType() {
      return this.infoData.type;
    },
    infoData() {
      return this.$route.query;
    },
    profileId() {
      return this.infoData.profileId;
    },
    detailParams() {
      const params = {
        interval: parseFloat(this.timeSelectValue),
        profileId: this.profileId,
        searchId: this.searchId
      };
      if (this.detailType === 'body') {
        params.bodyId = this.infoData.bodyId;
        params.captureTime = this.infoData.bodyCapturedTime;
      }
      return params;
    },
    initTractData() {
      const obj = {};
      this.trackList.forEach((val) => {
        obj[val.captureDay] = {};
        val.captures.forEach((capture) => {
          if (!(Object.keys(obj[val.captureDay]).includes(`${capture.cameraId}`))) {
            obj[val.captureDay][capture.cameraId] = [];
          }
          obj[val.captureDay][capture.cameraId].push(capture);
        });
      });
      return obj;
    },
  },
  created() {
    this.getItemData();
  },
  destroyed() {
    sessionStorage.removeItem('humanPhoto');
  },
  methods: {
    // 关闭自由弹窗
    handleCloseFreeInfoOverflay() {
      this.$refs.tracePlayMap.hideFreeOverlay();
    },
    handleClose() {
      this.$refs.foothold.hideFreeOverlay();
    },
    handleCloseCaptureModal() {
      this.captureVisible = false;
    },
    /**
     * @description 轨迹 当前相机次数
     * @param {any}
     * @return
     */
    cameraCount(camerParams) {
      if (JSON.stringify(camerParams) === '{}') {
        return 0;
      }
      return [`${camerParams.cameraId}`] && this.initTractData[this.targetDay][`${camerParams.cameraId}`].length;
    },
    handleHeatMapClick(params, type) {
      this.captureListData = [];
      if (type === 'track') {
        this.captureListData = this.initTractData[this.targetDay][`${params.cameraId}`] && this.initTractData[this.targetDay][`${params.cameraId}`];
      } else {
        this.captureListData = params.captures;
      }
      this.captureVisible = true;
    },
    handleListDetail(list, index) {
      this.captureVisible = false;
      this.detailList = list.map((item) => ({
        ...item,
        cropUrl: item.photoUrl || item.url,
      }));
      this.detailSelectIndex = index;
      this.detailVisible = true;
    },
    closeCaptureDetail() {
      this.detailVisible = false;
    },
    /**
     * @description 点击tab
     */
    handleTabClick() {
      this.getItemData();
    },
    /**
     * @description 点击时间改变
     */
    timeChange() {
      this.getItemData();
    },
    /**
     * @description 删除人像/人体卡片
     */
    deleteCard(type, cardData) {
      const params = {
        interval: parseFloat(this.timeSelectValue),
        profileId: this.profileId,
        searchId: this.searchId
      };

      if (type === 'face') params.deleteFaceId = cardData.faceId;
      else params.deleteBodyId = cardData.id;

      humanFusionSrv.deleteCard(params).then((res) => {
        if (res.code === 0) {
          this.getCaptureData();
          this.$message.success(this.$t('删除成功'));
        }
      });
    },
    getItemData() {
      if (this.activeName === 'capture') this.getCaptureData();
      else if (this.activeName === 'track') this.getTrackData();
      else if (this.activeName === 'foothold') this.getFootholdData();
      else if (this.activeName === 'law') this.geLawData();
      else if (this.activeName === 'time') this.getTimeData();
    },
    getCaptureData() {
      this.detailLoading = true;
      this.faceList = [];
      this.bodyList = [];
      humanFusionSrv.detailCapture(this.detailParams).then((res) => {
        if (res.code === 0) {
          this.detailLoading = false;
          this.faceList = res.data.faceList;
          this.bodyList = res.data.bodyList;
          this.searchId = res.data.searchId;
          this.$nextTick(() => {
            this.$refs.snapPicture.resetData();
            this.$refs.snapPicture.loadMore();
          });
        }
      });
    },
    getTrackData() {
      this.detailLoading = true;
      humanFusionSrv.detailTrace(this.detailParams).then((res) => {
        if (res.code === 0) {
          this.trackList = res.data.records.map((item) => ({
            ...item,
            captures: (item.captures.map((val) => ({
              ...val,
              lon: val.longitude,
              lat: val.latitude,
              photoUrl: val.url,
            })))
          }));
          this.searchId = res.data.searchId;
          this.detailLoading = false;
        }
      });
    },
    dateChange(targetDay) {
      this.targetDay = targetDay;
    },
    getFootholdData() {
      this.detailLoading = true;
      humanFusionSrv.detailFoothold(this.detailParams).then((res) => {
        if (res.code === 0) {
          this.detailLoading = false;
          this.footholdList = res.data.records.map((item) => ({
            ...item,
            type: 0,
            status: 0,
            lon: item.longitude,
            lat: item.latitude,
            photoUrl: item.url
          }));
          this.searchId = res.data.searchId;
        }
      });
    },
    geLawData() {
      this.detailLoading = true;
      humanFusionSrv.detailRegular(this.detailParams).then((res) => {
        if (res.code === 0) {
          this.detailLoading = false;
          this.lawRecords = res.data.records;
          this.searchId = res.data.searchId;
        }
      });
    },
    getTimeData() {
      this.detailLoading = true;
      humanFusionSrv.detailActivityPeriod(this.detailParams).then((res) => {
        this.detailLoading = false;
        if (res.code === 0) {
          this.timeRecords = res.data.records;
          this.searchId = res.data.searchId;
        }
      });
    }
  }
};
</script>
<style lang='scss' scoped>
.capture-detail {
  background: white;
  min-width: 1400px;
  height: 100%;
  display: flex;
  flex-direction: column;
  ::v-deep .meg-background {
    z-index: 1;
  }
  ::v-deep .slider-popover-right {
    display: none;
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
.datail-info {
  position: relative;
  box-sizing: border-box;
  height: 177px;
  padding: 14px 0;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #ebebeb;
  background: white;
  .back-button {
    position: absolute;
    top: 11px;
    left: 25px;
    font-family: SourceHanSansCN-Bold;
    font-size: 16px;
    color: #435068;
  }
}
.data-analysis {
  height: 100%;
  position: relative;
  ::v-deep .meg-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  ::v-deep .meg-tabs__nav-scroll {
    padding-left: 51px;
  }
  ::v-deep .meg-tabs__item {
    height: 54px;
    line-height: 54px;
  }
  ::v-deep .meg-tabs__nav-wrap:after {
    height: 1px;
    background-color: #ebebeb;
  }
  ::v-deep .meg-tabs__active-bar {
    height: 3px;
  }
  ::v-deep .meg-tabs__content {
    flex: 1;
    .meg-tab-pane {
      height: 100%;
    }
  }
  ::v-deep .meg-tabs__header {
    margin: 0;
  }
  .time-sizer {
    position: absolute;
    min-width: 500px;
    height: 54px;
    line-height: 54px;
    top: 0;
    right: 37px;
    display: flex;
    .time-slot {
      ::v-deep .meg-date-editor {
        border: 0;
        padding: 0;
        min-width: 300px;
        width: 0;
        .meg-range-input {
          font-family: SourceHanSansCN-Regular;
          font-size: 12px;
          color: #869abb;
        }
        .meg-range-separator {
          font-size: 12px;
          color: #869abb;
        }
      }
    }
    .change-title {
      font-family: SourceHanSansCN-Normal;
      font-size: 14px;
      color: #435068;
      padding: 0 14px;
    }
  }
}
.map-mark-box{
  width: 244px;
  height: 72px;
  position: relative;
  background: #FFFFFF;
  box-shadow: 4px 4px 6px 0 rgba(0,0,0,0.20);
  padding: 0 12px;
  .mark-box-right {
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #435068;
    box-sizing: border-box;
    height: 36px;
    line-height: 36px;
    border-bottom: 1px solid #DCE1E5;
  }
  .mark-box-bottom {
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #435068;
    box-sizing: border-box;
    height: 36px;
    line-height: 36px;
    display: flex;
    justify-content: space-between;
    .mark-button {
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #21539B;
      text-align: center;
    }
  }
}
.loading-body {
  height: 100%;
}
.map-mark-box::after{
  content: '';
  position: absolute;
  left: 120px;
  bottom: -12px;
  border-right: 6px solid rgba(0,0,0,0);
  border-left: 6px solid rgba(0,0,0,0);
  border-top: 6px solid white;
  border-bottom: 6px solid rgba(0,0,0,0);
}
</style>
<style lang="scss">
.imgScaled {
  z-index: 2001;
}
</style>
