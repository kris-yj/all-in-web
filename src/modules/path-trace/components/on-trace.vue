<template>
  <div class="on-trace">
    <meg-dialog
      :visible="isShowOnTrace"
      title="正在追踪"
      :append-to-body="true"
      custom-class="on-trace-dialog"
      @close="closeDialog"
      :fullscreen="true">
      <div class="body-content">
        <div class="content-box">
          <div
            class="clues-library">
            <div class="library-title">
              <div class="title-tips">
                {{ `线索（${libraryData.length}）` }}
              </div>
              <div>
                <meg-button
                  :disabled="libraryData.length === 0"
                  @click="joinEvent">
                  加入事件
                </meg-button>
                <meg-button
                  :disabled="libraryData.length === 0"
                  @click="exportInfo">
                  导出
                </meg-button>
              </div>
            </div>
            <div class="library-content">
              <div
                class="content-default"
                v-if="libraryData.length === 0">
                请在下方选择抓拍加入线索进行追踪
              </div>
              <common-collapse
                ref="collapse"
                :categories="threadLibraryData"
                :show-checkbox="false"
                list-fetch="innerPage">
                <template v-slot="{item, index, list}">
                  <thread-card
                    :card-data="item"
                    :ind="item.index"
                    :is-show-del-button="true"
                    :is-show-detail="true"
                    :actived="item.id === selectFeature.id"
                    :is-show-base-button="['jump']"
                    @click.native="selectTread(item)"
                    @show-detail="showDetail({item, index, list}, 'thread')"
                    @delete-card="deleteTreadCard">
                  </thread-card>
                </template>
              </common-collapse>
            </div>
          </div>
          <div
            class="trace-map">
            <track-modify-map
              ref="trackModifyMap"
              :select-feature="selectFeature"
              :track-list="libraryData"
              @click-select="showCameraDetail"
              @node-click="selectTread"
              @modify-change="modifyChange"
              @ready="ready"
              @device-change="deviceChange">
              <template
                v-slot:select="{params}">
                <div>
                  <camera-msg
                    ref="cameraMsg"
                    v-if="isShowCameraMsg"
                    v-loading="cameraDetailLoading"
                    :camera-data="params"
                    :history-tasks="historyTasks"
                    :realtime-tasks="realtimeTasks"
                    @close-detail="closeDetail">
                  </camera-msg>
                </div>
              </template>
              <!-- 轨迹点slot -->
              <template
                v-slot:overlay>
                <div
                  class="map-slot">
                  <div class="map-slot-title">
                    时间范围
                  </div>
                  <meg-select
                    v-model="timeTitle"
                    class="map-slot-select"
                    placeholder="请选择">
                    <meg-option
                      v-for="item in judgeGlobalTrackingTimeRange"
                      :key="item.code"
                      :label="item.value"
                      :value="item">
                    </meg-option>
                  </meg-select>
                  <meg-select
                    v-model="timeValue"
                    class="map-slot-select"
                    placeholder="请选择">
                    <meg-option
                      v-for="item in judgeGlobalTrackingTime"
                      :key="item.code"
                      :label="item.value"
                      :value="item">
                    </meg-option>
                  </meg-select>
                  <meg-button
                    class="tracing-button"
                    @click="traceSearch">
                    追踪
                  </meg-button>
                </div>
              </template>
            </track-modify-map>
            <div
              class="result-control"
              @click="unwind"
              v-show="!isShowResults">
              <span class="control-title">解析结果</span>
              <meg-icon name="packUp"></meg-icon>
            </div>
            <div class="control-wrap">
              <div class="camera-control">
                <div
                  class="task-control"
                  @click="cameraControlClick">
                  <meg-icon
                    name="camera"
                    color="#435068"></meg-icon>
                  <div
                    class="control-msg">
                    相机{{ featureArray.length }}个
                  </div>
                  <meg-icon
                    name="library"
                    color="#21539B"></meg-icon>
                </div>
                <common-camera-selector
                  class="camera-selector"
                  ref="commonCameraSelector"
                  v-show="isShowMapCamera"
                  @filter="getCameraData"
                  @cameras-updated="camerasUpdated">
                  <template
                    v-slot:filter="{filterCondition}">
                    <filter-form
                      :filter-condition="filterCondition"
                      @confirm="filterConfirm">
                    </filter-form>
                  </template>
                </common-camera-selector>
              </div>
              <task-control
                :visible="isShowMapCamera"
                ref="taskControl"
                :cameras-id="camerasId">
              </task-control>
            </div>
          </div>
        </div>
        <div
          v-show="isShowResults">
          <div
            class="search-results"
            :style="{height: isSpread ? 'calc(100% - 20px)' : '300px'}"
            v-loading="traceLoading">
            <div class="results-title">
              <div class="title-tips">
                解析结果
              </div>
              <div class="results-button">
                <meg-button
                  v-for="(item, ind) of resultsType"
                  :disabled="onceType === 'event'"
                  :key="ind"
                  :class="selectedButton === item.code ? 'activeButton' : ''"
                  @click="changeResults(item.code)">
                  {{ selectedButton === item.code ? `按${item.value}排序` : item.value }}
                </meg-button>
              </div>
              <div>
                <meg-icon
                  class="change-button"
                  @click="spread"
                  :name="isSpread ? 'fold' : 'packUp'"></meg-icon>
                <meg-icon
                  class="change-button"
                  :style="{marginLeft: '20px'}"
                  @click="shrink"
                  name="close"></meg-icon>
              </div>
            </div>
            <div
              class="results-content"
              v-background="traceResultData.length > 0 ? false: {icon:'icon_2',text:$t('检索无结果')}">
              <div>
                <common-collapse
                  ref="collapse"
                  v-model="nowIndex"
                  :categories="traceResultData"
                  :show-checkbox="false"
                  list-fetch="innerPage"
                  :card-min-width="270">
                  <template v-slot="{item, index, list}">
                    <common-card
                      :card-data="item"
                      :is-show-thread-button="true"
                      @join-library="joinLibrary"
                      @click.native.stop="showDetail({item, index, list})">
                    </common-card>
                  </template>
                </common-collapse>
              </div>
            </div>
          </div>
        </div>
      </div>
      <meg-dialog
        title="提示"
        :visible.sync="eventVisible"
        width="380px">
        <div class="event-content">
          <div class="event-title">
            事件名称
          </div>
          <meg-select
            v-model="eventMsg"
            placeholder="请选择"
            @change="eventChange">
            <meg-option
              v-for="(item, ind) in eventList"
              :key="ind"
              :label="item.eventName"
              :value="item.id">
            </meg-option>
          </meg-select>
        </div>
        <span
          slot="footer"
          class="dialog-footer">
          <meg-button @click="eventVisible = false">取 消</meg-button>
          <meg-button
            type="primary"
            @click="submitEvent">确 定</meg-button>
        </span>
      </meg-dialog>
      <event-dialog
        class="event-dialog"
        ref="eventDialog"
        width="1100px"
        title="新建事件"
        :visible="eventDialogVisible"
        @success="handleEventSave"
        @cancel="cancelEventDialog"></event-dialog>
    </meg-dialog>
    <common-capture-detail
      v-if="showTemporary === true"
      :visible.sync="detailVisible"
      feaker
      :result-list="captureDetail.list"
      :upload-list="uploadList"
      :index="captureDetail.index"
      :show-temporary="true"
      @close="hideDetail"></common-capture-detail>
    <common-capture-detail
      v-else
      :visible.sync="detailVisible"
      feaker
      :result-list="captureDetail.list"
      :index="captureDetail.index"
      :show-temporary="false"
      @close="hideDetail"></common-capture-detail>
  </div>
</template>

<script>
import commonCollapse from '@/common-components/common-collapse';
import CommonCameraSelector, { FilterForm } from '@/common-components/common-camera-selector';
import commonCard from '@/common-components/common-card';
import trackModifyMap from '@/common-components/common-maps/track-modify-map';
import threadCard from '@/components/judge/thread-card';
import EventDialog from '@/modules/events-manage/components/event-dialog';
import CommonCaptureDetail from '@/common-components/common-capture-detail';
import cameraMsg from './camera-msg';
import taskControl from './task-control';
import pathTraceSrv from '../path-trace.service';

const formatDay = function (capturedTime) {
  const now = new Date(capturedTime);
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  return `${year}-${month}-${date}`;
};

const flatData = function (data = []) {
  return data.reduce((arc, item) => arc.concat((item.flag !== 'camera' ? flatData(item.items) : item)), []);
};
export default {
  components: {
    trackModifyMap,
    cameraMsg,
    commonCollapse,
    commonCard,
    threadCard,
    CommonCameraSelector,
    FilterForm,
    taskControl,
    EventDialog,
    CommonCaptureDetail,
  },
  props: {
    isShowOnTrace: {
      type: Boolean
    },
    traceResultData: {
      type: Array,
      default: () => []
    },
    traceScope: {
      type: Number,
      default: 100
    },
    traceLoading: {
      type: Boolean,
      default: () => false
    },
    uploadPhoto: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      traceParams: {},
      captureDetail: {},
      detailVisible: false,
      singleCameraId: '',
      cameraDetailLoading: false,
      historyTasks: {},
      realtimeTasks: {},
      isShowMapCamera: false,
      isShowMapAnaylysis: false,
      categories: [],
      selectCameraIds: [],
      libraryData: [],
      timeTitle: {},
      timeValue: {},
      // 当前展开的风琴褶
      nowIndex: 0,
      featureArray: [],
      selectFeature: {
      },
      isShowResults: true,
      isSpread: false,
      value: '',
      eventList: [],
      eventMsg: '',
      onceType: '',
      selectedButton: 'SCORE',
      showTemporary: true,
      uploadList: [],
      resultsType: [
        {
          value: '相似度',
          code: 'SCORE'
        },
        {
          value: '目标',
          code: 'DETECTTYPE'
        },
        {
          value: '地点',
          code: 'ADDRESS'
        }
      ],
      eventVisible: false,
      eventDialogVisible: false,
      isShowCameraMsg: false,
      searchParams: {},
      delay: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })()
    };
  },
  computed: {
    /**
     * @description 线索库数据转换
     */
    threadLibraryData() {
      const transformObj = this.libraryData.reduce((arc, item) => {
        const displayName = formatDay(item.capturedTime);
        if (!arc[displayName]) {
          arc[displayName] = [];
        }
        arc[displayName].push(item);
        return arc;
      }, {});
      const polymerData = Object.keys(transformObj).map((item) => ({
        displayName: item,
        count: transformObj[item].length,
        listResults: transformObj[item]
      }));
      return polymerData;
    },
    /**
     * @description 追踪时间转换
     */
    getTraceTime() {
      const capturedTime = new Date(this.selectFeature.capturedTime).getTime();
      let startTime = '';
      let endTime = '';
      const timeTitle = this.timeTitle.code;
      const timeValue = parseFloat(this.timeValue.code) * 1000;
      if (timeTitle === '0') {
        startTime = capturedTime - timeValue;
        endTime = capturedTime;
      } else if (timeTitle === '1') {
        startTime = capturedTime;
        endTime = capturedTime + timeValue;
      } else {
        startTime = capturedTime - timeValue;
        endTime = capturedTime + timeValue;
      }
      return { startTime, endTime };
    },
    judgeGlobalTrackingTimeRange() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_time_range');
    },
    judgeGlobalTrackingTime() {
      return this.$store.getters.dataMapByType('kunlun_judge_global_tracking_time');
    },
    /**
     * @description 导出字段
     */
    presetChosen() {
      return this.$store.getters.dataMapByType('capture_export_column');
    },
    camerasId() {
      return this.featureArray.map((item) => item.id);
    },
  },
  watch: {
    camerasId() {
      this.$nextTick(() => {
        this.$refs.taskControl.getBatchTask();
      });
    }
  },
  created() {
    this.uploadList = this.uploadPhoto;
    this.initTraceCondition();
  },
  methods: {
    spread() {
      this.isSpread = !this.isSpread;
    },
    shrink() {
      this.isShowResults = false;
    },
    unwind() {
      this.isSpread = false;
      this.isShowResults = true;
    },
    ready() {
      this.delay.r();
    },
    showDetail(detail, type = 'has') {
      // 线索详情无暂存架
      if (type === 'thread') this.showTemporary = false;
      else this.showTemporary = true;
      this.detailVisible = true;
      this.captureDetail = detail;
    },
    hideDetail() {
      this.detailVisible = false;
    },
    closeDialog() {
      this.$confirm('退出追踪后，将清空所有检索结果，您确定要继续吗？', '退出追踪', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('close-on-trace');
      }).catch(() => {
      });
    },
    reset() {
      this.libraryData = [];
      this.selectFeature = {};
      this.isShowResults = true;
    },
    /**
     * @description init追踪条件
     */
    initTraceCondition() {
      [this.timeTitle] = this.judgeGlobalTrackingTimeRange;
      [this.timeValue] = this.judgeGlobalTrackingTime;
    },
    modifyChange(data) {
      this.libraryData.forEach((item) => {
        if (item.id === this.selectFeature.id) {
          item.radius = data.radius;
        }
      });
    },
    deviceChange(data) {
      this.libraryData.forEach((item) => {
        if (item.id === this.selectFeature.id) {
          item.features = data;
        }
      });
      this.selectCameraIds = data.map((item) => item.id);

      this.$refs.trackModifyMap.selectFeatures(this.selectCameraIds);
    },
    /**
     * @description 筛选之后相机列表
     */
    getCameraData(cameraData) {
      this.featureArray = flatData(cameraData);

      this.$refs.trackModifyMap.setFeatures(this.featureArray);
    },
    /**
     * @description init 所有的相机
     */
    camerasUpdated(cameraData) {
      this.featureArray = cameraData;

      this.$refs.trackModifyMap.setFeatures(this.featureArray);
    },
    /**
     * @description 筛选条件获取
     */
    filterConfirm(filterParams) {
      this.isShowMapCamera = false;
      this.$refs.commonCameraSelector.filterCameras(filterParams);
    },
    cameraControlClick() {
      this.isShowMapCamera = !this.isShowMapCamera;
    },
    analysisControlClick() {
      this.isShowMapAnaylysis = !this.isShowMapAnaylysis;
    },
    changeResults(code) {
      this.selectedButton = code;
      this.searchParams = {
        ...this.searchParams,
        aggType: code,
      };
      this.$emit('change-results', this.searchParams);
    },
    traceSearch() {
      if (this.selectCameraIds.length === 0) {
        this.$message.error('请选择相机');
        return;
      }
      this.onceType = '';
      this.selectedButton = 'SCORE';
      const photos = this.libraryData.map((item) => ({
        featureInfos: [{
          id: item.cluesId,
          detectType: item.detectType,
          licensePlateText: item.licensePlateText || null
        }],
        searchPhotoUri: item.cropUrl
      }));
      this.uploadList = this.libraryData.map((item) => ({
        photo: item.cropUrl || item.url,
        detectType: item.detectType
      }));
      const params = {
        ...this.getTraceTime,
        aggType: this.selectedButton,
        cameraIds: this.selectCameraIds,
        photos
      };
      this.searchParams = params;
      this.$emit('change-results', params);
    },
    joinLibrary(cardData) {
      if (this.libraryData.some((item) => item.id === cardData.id)) {
        this.$message.warning('请不要重复添加');
      } else {
        this.libraryData.push({
          ...cardData,
          lat: cardData.latitude,
          lon: cardData.longitude,
          radius: this.traceScope
        });
        this.handlerLibraryData();
      }
    },
    handlerLibraryData() {
      this.libraryData.sort((a, b) => a.capturedTime - b.capturedTime);
      this.libraryData = this.libraryData.map((item, ind) => {
        item.index = ind + 1;
        return item;
      });
    },
    eventSetData(data) {
      this.onceType = 'event';
      this.libraryData = data.map((item) => ({ ...item, radius: this.traceScope }));
      this.handlerLibraryData();
      this.$nextTick(() => {
        this.delay.p.then(() => {
          if (this.libraryData.length > 0) {
            this.selectTread(this.libraryData[0]);
          }
        });
      });
    },
    /**
     * @description 地图选中或者直接点击轨迹卡片
     */
    selectTread(treadCardMsg) {
      this.initTraceCondition();
      this.selectFeature = treadCardMsg;
      if (this.selectFeature && this.selectFeature.features) {
        this.selectCameraIds = this.selectFeature.features.map((item) => item.id);
        this.$refs.trackModifyMap.selectFeatures(this.selectCameraIds);
      }
    },
    deleteTreadCard(treadCardMsg) {
      let ind = null;
      this.libraryData.forEach((item, index) => {
        if (item.id === treadCardMsg.id) {
          ind = index;
        }
        if (item.id === this.selectFeature.id) {
          this.selectFeature = {};
        }
      });
      this.libraryData.splice(ind, 1);
      this.selectCameraIds = [];

      this.$refs.trackModifyMap.selectFeatures(this.selectCameraIds);
      this.handlerLibraryData();
    },
    async joinEvent() {
      this.eventMsg = '';
      this.selectFeature = {};
      const params = {
        pageSize: 10000
      };
      await pathTraceSrv.getEventList(params).then((res) => {
        if (res.code === 0) {
          this.eventList = res.data.records;
        }
      });
      const newEventType = {
        id: 'new',
        eventName: '+ 新建事件'
      };
      this.eventList = [...this.eventList, newEventType];
      this.eventVisible = true;
    },
    eventChange() {
      if (this.eventMsg === 'new') {
        this.eventDialogVisible = true;
        this.eventVisible = false;
      }
    },
    submitEvent() {
      this.newEvent();
      this.eventVisible = false;
    },
    newEvent(id = this.eventMsg) {
      const clueList = this.libraryData.map((item) => ({
        ...item,
        url: item.cropUrl || item.url,
        captureId: item.cluesId,
        operationCode: '10'
      }));
      const params = {
        id,
        clueList,
        operationCode: 10
      };
      pathTraceSrv.addEventThread(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('加入事件成功');
        }
      });
    },
    /**
     * @description 相机详情及数据展示
     */
    showCameraDetail(params) {
      this.isShowCameraMsg = true;
      this.cameraDetailLoading = true;
      this.$refs.trackModifyMap.showFreeOverlay(params);
      const singleCameraId = params.id;
      Promise.all([this.getRealtimeTask(singleCameraId), this.getHistoryTask(singleCameraId)]).then(() => {
        this.cameraDetailLoading = false;
      });
      this.$nextTick(() => {
        if (this.$refs.cameraMsg) {
          this.$refs.cameraMsg.getVideoInfo();
        }
      });
    },
    /**
     * @description 新建事件
     */
    handleEventSave(id) {
      this.eventDialogVisible = false;
      this.newEvent(id);
    },
    cancelEventDialog() {
      this.eventDialogVisible = false;
    },
    /**
     * 关闭新建事件弹窗
     */
    handleCloseEventDialog() {
      this.$refs.eventDialog.onClickClearLocation();
      this.eventDialogVisible = false;
    },
    /**
     * @description 关闭相机详情
     */
    closeDetail() {
      this.isShowCameraMsg = false;
      this.$refs.trackModifyMap.hideFreeOverlay();
    },
    getRealtimeTask(id) {
      const params = {
        cameraIds: [id],
        sourceType: 1
      };
      return pathTraceSrv.getRealtimeList(params).then((res) => {
        if (res.code === 0) {
          this.realtimeTasks = res.data;
        }
      });
    },
    getHistoryTask(id) {
      const params = {
        cameraIds: [id]
      };
      return pathTraceSrv.getBatchTask(params).then((res) => {
        if (res.code === 0) {
          this.historyTasks = res.data;
        }
      });
    },
    /**
     * @description 导出
     */
    exportInfo() {
      const exportForm = {};
      exportForm.exportColumns = this.presetChosen;
      exportForm.exportData = this.libraryData.map((item) => ({ captureId: (item.captureId || item.id), score: item.score }));
      pathTraceSrv.export(exportForm).then((res) => {
        if (res.code === 0) {
          this.$message.success(this.$t('导出成功，请前往任务列表下载'));
        } else {
          this.$message.error(res.msg);
        }
      });
    },
  }
};

</script>
<style lang='scss' scoped>

::v-deep .meg-dialog__body{
  height: calc(100% - 55px);
  padding: 0;
  .meg-dialog__footer {
    background: white;
  }
}
.event-dialog {
  ::v-deep .meg-dialog__body{
    box-sizing: border-box;
    padding: 20px 30px 0;
  }
  ::v-deep .meg-dialog__footer {
    background: white;
  }
}
.camera-selector ::v-deep .camera-filter-box{
  width: 280px;
}
.change-button {
  cursor: pointer;
}
::v-deep .on-trace-dialog {
  min-height: 0!important;
  div {
    box-sizing: border-box;
  }
  .modal-container {
    padding:20px 25px;
  }
  .event-content {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top:20px;
    .event-title{
      margin-right: 10px;
    }
  }
  .body-content {
    height: 100%;
    position: relative;
  }
  .clues-library {
    width: 320px;
    height: 100%;
    background: #F2F4F8;
    .library-title{
      padding: 11px 25px;
      display: flex;
      justify-content: space-between;
      background: #F9F9F9;
      .title-tips {
        font-family: SourceHanSansCN-Bold;
        font-size: 16px;
        color: #435068;
        line-height: 34px;
        height: 34px;
      }

    }
    .library-content {
      padding: 0 10px;
      overflow: scroll;
      height: calc(100%-56px);
      .content-default {
        font-family: SourceHanSansCN-Regular;
        font-size: 14px;
        color: rgba(67,80,104,0.50);
        text-align: center;
        margin-top: 174px;
      }
    }
  }
  .search-results {
    width: 100%;
    height: 300px;
    position: absolute;
    z-index: 2000;
    left: 0;
    right: 0;
    bottom: 0;
    background: #DBE1E5;
    box-shadow: 0 2px 4px 4px rgba(0,0,0,0.08);
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    .results-content {
      overflow: scroll;
      flex: 1;
    }
  }
  .results-title {
    display: flex;
    justify-content: space-between;
    padding: 11px 25px;
    .results-button {
      display: flex;
      .activeButton{
        color: #fff;
        background-color: #21539b;
        border-color: #21539b;
      }
      ::v-deep .meg-button{
        background: none;
        border: 1px solid #D2D6DE ;
      }
      ::v-deep .meg-button+.meg-button {
        margin-left: 0;
      }
    }
  }
  .title-tips {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    color: #435068;
    height: 34px;
    line-height: 34px;
  }
  .trace-map {
    flex: 1;
    position: relative;
    .task-control {
      width: 280px;
      height: 40px;
      padding: 0 20px;
      background: #FFFFFF;
      border: 1px solid #D2D6DE;
      box-shadow: 2px 2px 4px 0 rgba(0,0,0,0.10);
      border-radius: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      .control-msg{
        flex: 1;
        text-align: left;
        padding-left: 6px;
        font-family: SourceHanSansCN-Regular;
        font-size: 14px;
        color: #435068;
      }
    }
    .control-wrap {
      position: absolute;
      top: 20px;
      right: 40px;
    }
    .camera-control {
      margin-bottom: 10px;
    }
    .map-slot {
      padding: 20px;
      width: 200px;
      height: 195px;
      background: #FFFFFF;
      box-shadow: 4px 4px 6px 0 rgba(0,0,0,0.20);
      border-radius: 2px;
      position: relative;
    }
    .tracing-button {
      width: 100%;
      height: 34px;
      background: #21539B;
      border-radius: 2px;
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #FFFFFF;
      text-align: center;
      margin-top: 10px;
    }
    .map-slot-title {
      font-family: SourceHanSansCN-Regular;
      font-size: 14px;
      color: #435068;
      margin-bottom: 9px;
    }
    .map-slot-select {
      background: #F7F8F9;
      border-radius: 2px;
      margin-bottom: 10px;
    }
    .map-slot::after{
      content: '';
      position: absolute;
      left: 88px;
      bottom: -16px;
      border-right: 8px solid rgba(0,0,0,0);
      border-left: 8px solid rgba(0,0,0,0);
      border-top: 8px solid #FFFFFF;
      border-bottom: 8px solid rgba(0,0,0,0);
    }
  }
  .result-control {
    width: 180px;
    height: 38px;
    background: #FFFFFF;
    border-radius: 2px 2px 0 0;
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .control-title {
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #21539B;
      margin-right: 8px;
    }
  }
  .content-box{
    width: 100%;
    height: 100%;
    display: flex;
  }
}

</style>
<style lang="scss">
.v-modal{
    display: none;
  }
</style>
