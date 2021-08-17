<template>
  <page-layout>
    <div
      class="path-trace"
      v-loading="traceLoading">
      <search-form
        ref="searchForm"
        @form-search="formSearch"
        @disabled-map="disabledMap"
        @reset-form="resetForm"
        @set-camera-id="setCameraId">
        <template slot="camera">
          <meg-form-item :label="$t('已选择{count}个相机', {count: selectedCarema})">
            <camera-select
              ref="cameraOnly"
              class="camera-select"
              :camera-list="transformData"
              @cameraChoosed="cameraChoosed"></camera-select>
          </meg-form-item>
        </template>
      </search-form>
      <div class="path-trace-map">
        <select-camera-map
          ref="selectCameraMap"
          :draw-type="drawType"
          @draw-select="drawSelect"
          @delect-select="delectSelect"
          @click-select="clickSelect">
          <template
            v-slot:select="{params}">
            <div>
              <camera-msg
                ref="cameraMsg"
                v-if="isShowCameraMsg"
                v-loading="cameraDetailLoading"
                :mode="'other'"
                :camera-data="{...params, ...cameraMsg, cameraCount}"
                :labels-map="labelsMap"
                :history-tasks="historyTasks"
                :realtime-tasks="realtimeTasks"
                @close-detail="closeDetail">
              </camera-msg>
            </div>
          </template>
        </select-camera-map>
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
      </div>
      <insufficient-dialog
        :dialog-visible.sync="isShowInsufficient"
        :remain-video-power="remainVideoPower"
        :hashrate="hashrate"
        @close-insufficient-dialog="closeInsufficientDialog">
      </insufficient-dialog>
      <no-parse-file
        v-if="isNoParseVisible"
        :is-visible.sync="isNoParseVisible"
        @close-no-parse-dialog="closeNoParseDialog"
        @direct-search="directSearch"
        @auto-create-task="autoCreateTask"
        @manual-create-task="manualCreateTask"></no-parse-file>
      <on-trace
        ref="onTrace"
        v-if="isShowOnTrace"
        :is-show-on-trace="isShowOnTrace"
        :upload-photo="uploadList"
        :trace-result-data="traceResultData"
        :trace-loading="onTraceLoading"
        :trace-scope="Number((formContent.traceScope.code) || 100)"
        @change-results="changeResults"
        @close-on-trace="closeOnTrace"></on-trace>
    </div>
  </page-layout>
</template>

<script>
import moment from 'moment';
import CommonCameraSelector, { FilterForm } from '@/common-components/common-camera-selector';
import { CreateLabelMap } from '@/common-components/utils/utils';
import cameraSelect from '@/components/judge/judge-camera-select';
import selectCameraMap from '@/common-components/common-maps/select-camera-map';
import { switchToModule } from '@/utils/utils';
import searchForm from '../components/search-form';
import insufficientDialog from '../components/insufficient-dialog';
import noParseFile from '../components/no-parse-file';
import onTrace from '../components/on-trace';
import cameraMsg from '../components/camera-msg';
import pathTraceSrv from '../path-trace.service';

const flatData = function (data = []) {
  return data.reduce((arc, item) => arc.concat((item.flag !== 'camera' ? flatData(item.items) : item)), []);
};
// 当天0点-当天24点
const defaultStartTime = moment().startOf('day').toDate().getTime();
const defaultEndTime = moment().endOf('day').toDate().getTime();
export default {
  components: {
    insufficientDialog,
    noParseFile,
    onTrace,
    searchForm,
    selectCameraMap,
    cameraSelect,
    CommonCameraSelector,
    FilterForm,
    cameraMsg
  },
  data() {
    return {
      traceParams: {},
      hashrate: 0,
      traceResultData: [],
      remainVideoPower: 0,
      cameraIds: [],
      isShowInsufficient: false,
      isShowOnTrace: false,
      isNoParseVisible: false,
      transcriptDrawType: '',
      drawType: '',
      activeFeature: [],
      isSelectStyle: false,
      cameraMsg: {},
      cameraCount: 0,
      iconsData: [
        {
          name: 'Circle_default',
          type: 'circle',
          value: this.$t('圈选')
        },
        {
          name: 'frame_select',
          type: 'box',
          value: this.$t('框选')
        },
        {
          name: 'polygon_default',
          type: 'polygon',
          value: this.$t('多边选')

        },
      ],
      featureArray: [],
      uploadList: [],
      isShowMapCamera: false,
      formContent: {
        traceScope: {
          code: 10
        }
      },
      unAnalysisIds: [], // 未解析相机ID
      traceLoading: false,
      onTraceLoading: false,
      isShowCameraMsg: false,
      cameraDetailLoading: false,
      realtimeTasks: {},
      historyTasks: {},
      delay: (() => {
        let r = () => {};
        const p = new Promise((_r) => { r = _r; });
        return { r, p };
      })(),
    };
  },
  computed: {
    selectedCarema() {
      return this.cameraIds.length;
    },
    transformData() {
      return [{
        id: 'root',
        name: this.$t('全部'),
        flag: 'root',
        items: this.featureArray
      }];
    },
  },
  watch: {
    cameraIds(val) {
      this.$refs.selectCameraMap.selectFeatures(val);
    }
  },
  created() {
    this.labelsMap = {};
    this.getLabels();
    // this.labelsMap = CreateLabelMap(pathTraceSrv.getLabels());
  },
  methods: {
    formSearch(serachType, formContent) {
      this.formContent = formContent;
      if (serachType === 'photo') {
        this.uploadList = this.$refs.searchForm.getUploadedPhotos();
        this.photoModel(formContent);
      } else {
        this.uploadList = [];
        this.eventModel(formContent);
      }
    },
    /**
     * @description 图片检索
     */
    photoModel(formContent) {
      // 判断是否选择相机
      if (this.cameraIds.length === 0) {
        this.$message.warning('请选择相机');
        return;
      }
      this.traceLoading = true;
      // 算力，追踪范围
      const { hashrate } = formContent;
      this.hashrate = parseFloat(hashrate);
      // 追踪参数
      this.traceParams = {
        cameraIds: this.cameraIds,
        faceThreshold: formContent.faceThreshold,
        otherThreshold: formContent.otherThreshold,
        startTime: formContent.startTime,
        endTime: formContent.endTime,
        photos: formContent.photos,
        aggType: 'SCORE'
      };
      this.judgeHandle();
    },
    getLabels() {
      pathTraceSrv.getLabels().then((res) => {
        console.log('res', CreateLabelMap(res.data));
        this.labelsMap = CreateLabelMap(res.data);
      });
    },
    /**
     * @description 事件ID检索
     */
    eventModel(formContent) {
      if (!formContent.eventId) {
        this.$message.error('请选择事件');
        return;
      }
      this.traceLoading = true;
      const params = {
        eventId: formContent.eventId,
        limitLonLat: true,
        aggType: 'date'
      };
      pathTraceSrv.searchClues(params).then((res) => {
        if (res.code === 0) {
          this.traceLoading = false;
          this.isShowOnTrace = true;
          const data = res.data.records.reduce((arc, item) => [...arc, ...item.listResults], []);
          const cluesData = data.map((item) => ({
            ...item,
            lon: item.longitude,
            lat: item.latitude,
            cluesId: item.captureId
          }));
          this.$nextTick(() => {
            this.$refs.onTrace.eventSetData(cluesData);
          });
        }
      });
    },
    async clickSelect(params) {
      this.isShowCameraMsg = true;
      this.cameraDetailLoading = true;
      this.$refs.selectCameraMap.showFreeOverlay(params);
      const singleCameraId = params.id;
      await Promise.all([this.getRealtimeTask(singleCameraId), this.getHistoryTask(singleCameraId), this.getCameraMsg(singleCameraId), this.getCaptureCount(singleCameraId)]).then(() => {
        this.cameraDetailLoading = false;
      });
      this.$nextTick(() => {
        if (this.$refs.cameraMsg) {
          this.$refs.cameraMsg.getVideoInfo();
        }
      });
    },
    getCaptureCount(id) {
      return pathTraceSrv.getCaptureCount({
        cameraIds: [id], sourceType: 'CAMERA', startTime: defaultStartTime, endTime: defaultEndTime
      }).then((res) => {
        console.log(res);
        const { code, data } = res;
        if (code === 0) {
          this.cameraCount = data.count;
        }
      });
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
    getCameraMsg(id) {
      const params = {
        id
      };
      return pathTraceSrv.cameraMsg(params).then((res) => {
        if (res.code === 0) {
          this.cameraMsg = res.data;
        }
      });
    },
    /**
     * @description 关闭相机详情
     */
    closeDetail() {
      this.isShowCameraMsg = false;
      this.$refs.selectCameraMap.hideFreeOverlay();
    },
    /**
     * @description 追踪前判断
     */
    async judgeHandle(params = this.traceParams) {
      // 获取算力 判断算力是否充足
      // await this.monitorRate();
      // 通过相机判断是否都在解析/ 首先调取实时解析 - 再调取录像
      // 获取未进行实时解析的相机ID
      const whetherAnalysisIds = await this.whetherAnalysis();
      this.unAnalysisIds = [];
      if (whetherAnalysisIds.length > 0) {
        // 通过未在实时解析的相机Id 获取未进行录像解析的相机ID
        this.unAnalysisIds = await this.historyAnalysis(whetherAnalysisIds);
      }
      if (this.unAnalysisIds.length > 0) {
        this.isNoParseVisible = true;
      } else {
        await this.traceResult(params);
        this.isShowOnTrace = true;
      }
      this.traceLoading = false;
    },
    deleteUploadList() {
      this.uploadList = [];
    },
    setCameraId(id) {
      this.delay.p.then(() => {
        this.cameraIds = [id];
        if (this.$refs.cameraOnly) this.$refs.cameraOnly.setTreeChecked(this.cameraIds);
      });
    },
    /**
     * @description 检索结果
     */
    traceResult(params) {
      this.onTraceLoading = true;
      this.traceResultData = [];
      const searchParams = {
        ...this.traceParams,
        ...params
      };
      return pathTraceSrv.traceSearch(searchParams).then((res) => {
        if (Number(res.code) === 0) {
          const data = res.data.records.map((item) => ({ ...item, listResults: item.listResults.map((val) => ({ ...val, cluesId: val.id })) }));
          this.traceResultData = data;
        }
        this.onTraceLoading = false;
      });
    },
    /**
     * @description 直接检索
     */
    async directSearch() {
      this.isNoParseVisible = false;
      await this.traceResult();
      this.isShowOnTrace = true;
    },
    /**
     * @description 自动创建解析任务
     */
    autoCreateTask() {
      const cameras = this.unAnalysisIds.map((item) => ({ cameraId: item }));
      const params = {
        taskName: `全域追踪-${moment(new Date()).format('YYYYMMDDHHmmss')}`,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1,
        doFace: 1,
        autoCompare: 0,
        startTime: this.formContent.startTime,
        endTime: this.formContent.endTime,
        priority: 0,
        speed: this.hashrate,
        cameras
      };
      pathTraceSrv.createBatchTask(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('创建成功');
          this.isNoParseVisible = false;
        }
      });
    },
    manualCreateTask() {
      const query = {
        cameraIds: JSON.stringify(this.cameraIds),
        startTime: this.formContent.startTime,
        endTime: this.formContent.endTime,
        doBody: 1,
        doMotor: 1,
        doNonMotor: 1,
        doFace: 1,
        autoCompare: 0,
        priority: 0,
        addTask: true,
        speed: this.hashrate
      };
      switchToModule({
        module: 'videotape-analysis',
        pageType: 'single',
        query,
        isBlank: true
      });
    },
    /**
     * @description 手动创建任务，跳转解析
     */
    /**
     * @description 聚合结果改变，追踪模式触发
     */
    changeResults(params) {
      this.traceResult(params);
    },
    /**
     * @description 算力
     */
    monitorRate() {
      return pathTraceSrv.monitorRate().then((res) => {
        if (res.code === 0) {
          this.remainVideoPower = parseFloat(res.data.remainVideoPower);
        }
      });
    },
    /**
     * @description 实时解析
     */
    whetherAnalysis() {
      const relatimeParams = {
        cameraIds: this.cameraIds,
        startTime: this.formContent.startTime,
        endTime: this.formContent.endTime
      };
      return pathTraceSrv.whetherAnalysisRealtime(relatimeParams).then((res) => { // eslint-disable-line
        if (res.code === 0) {
          return res.data;
        }
      });
    },
    historyAnalysis(unAnalysiscameraIds) {
      const relatimeParams = {
        cameraIds: unAnalysiscameraIds,
        startTime: this.formContent.startTime,
        endTime: this.formContent.endTime
      };
      return pathTraceSrv.whetherAnalysisHistory(relatimeParams).then((res) => { // eslint-disable-line
        if (res.code === 0) {
          return res.data;
        }
      });
    },
    resetForm() {
      this.cameraIds = [];
      this.$refs.cameraOnly.setTreeChecked([]);
      if (this.$refs.selectCameraMap) this.$refs.selectCameraMap.deleteFeature();
    },
    /**
     * @description 算力弹窗
     */
    closeInsufficientDialog() {
      this.isShowInsufficient = false;
    },
    /**
     * @description 追踪弹窗
     */
    closeOnTrace() {
      this.isShowOnTrace = false;
      this.traceResultData = [];
    },
    drawSelect(featrues) {
      // 状态副本，删除完之后使用
      this.transcriptDrawType = this.drawType;
      this.cameraIds = Array.from(new Set([...this.cameraIds, ...featrues.map((item) => item.id)]));
      this.drawType = '';
      if (this.$refs.cameraOnly) this.$refs.cameraOnly.setTreeChecked(this.cameraIds);
    },
    delectSelect() {
      if (this.$refs.cameraOnly) this.$refs.cameraOnly.setTreeChecked([]);
    },
    cameraControlClick() {
      this.isShowMapCamera = !this.isShowMapCamera;
    },
    closeNoParseDialog() {
      this.isNoParseVisible = false;
    },
    cameraChoosed(arr) {
      if (arr.length > 0) {
        this.cameraIds = arr;
      } else {
        this.cameraIds = [];
      }
    },
    /**
     * @description 筛选之后相机列表
     */
    getCameraData(cameraData) {
      this.featureArray = flatData(cameraData);
      this.$refs.selectCameraMap.setFeatures(this.featureArray);
      const ids = this.featureArray.map((item) => item.id);
      this.cameraIds = ids.filter((item) => this.cameraIds.includes(item.id));
    },
    /**
     * @description init 所有的相机
     */
    camerasUpdated(cameraData) {
      this.featureArray = flatData(cameraData);

      this.$refs.selectCameraMap.setFeatures(this.featureArray);
      this.delay.r();
    },
    filterConfirm(filterParams) {
      this.isShowMapCamera = false;
      this.$refs.commonCameraSelector.filterCameras(filterParams);
    },
    disabledMap() {
      this.drawType = '';
      this.cameraIds = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.path-trace {
  display: flex;
  height: 100%;
  div{
    box-sizing: border-box;
  }
  .camera-icon-box {
    display: flex;
    .control-icon {
      display: inline-block;
      width: 60px;
      text-align: center;
      cursor: pointer;
    }
    .active-icon {
      background: #E6F2FF;
      border-radius: 1px;
    }
    .camera-select {
      margin-left: 7px;
      flex: 1;
    }
  }
  .path-trace-map {
    flex: 1;
    position: relative;
    .task-control {
      width: 280px;
      height: 40px;
      padding: 0 20px;
      background: #FFF;
      border: 1px solid #D2D6DE;
      box-shadow: 2px 2px 4px 0 rgba(0,0,0,0.10);
      border-radius: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;

      .control-msg{
        flex: 1;
        text-align: left;
        padding-left: 6px;
        font-family: SourceHanSansCN-Regular;
        font-size: 14px;
        color: #435068;
      }
    }
    .camera-control {
      position: absolute;
      top: 20px;
      right: 40px;
      ::v-deep .camera-filter-box{
        width: 280px!important;
      }
    }
  }
}
</style>
