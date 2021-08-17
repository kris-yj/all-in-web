<template>
  <!-- :close-on-click-modal="false" -->
  <meg-dialog
    class="map-camera-filter-wrapper"
    :close-on-press-escape="false"
    :show-close="false"
    :visible.sync="visible"
    append-to-body>
    <div class="map-camera-filter-content">
      <div class="map-camera-select-left">
        <div class="left-trigger">
          <span
            class="frame-select"
            :class="{active: selectType === 'box'}"
            @click.stop="selectBox">
            <meg-icon
              name="frame_select"
              width="20"
              height="20"
              :color="'#94a9c9 #21539b white white'">
            </meg-icon>
            <span class="text">框选</span>
          </span>
          <span
            class="circle-select"
            :class="{active: selectType === 'circle'}"
            @click.stop="selectCircle">
            <meg-icon
              name="Circle_default"
              width="21"
              height="21"
              :color="'#21539b #94a9c9 #21539b white'">
            </meg-icon>
            <span class="text">圈选</span>
          </span>
          <span
            class="polygon-select"
            :class="{active: selectType === 'polygon'}"
            @click.stop="selectPolygon">
            <meg-icon
              name="polygon_default"
              width="21"
              height="21"
              :color="'#94a9c9 #21539b white white'">
            </meg-icon>
            <span class="text">多边选</span>
          </span>
        </div>
      </div>
      <div class="meg-map-content">
        <select-camera-map
          ref="map"
          :draw-type="selectType"
          @draw-select="drawSelect"
          no-alalysis
          @delect-select="delectSelect"
          @click-select="clickSelect">
          <template v-slot:hover="{params}">
            <div
              v-tooltip="true"
              class="tooltipPopup">
              {{ params.name }}
            </div>
          </template>
        </select-camera-map>
      </div>
      <task-form
        ref="form"
        :form="form"
        :type="2"
        :form-type="formType"
        :task-data="taskData"
        :cameras-count="selectedCameraIds.length"
        @monitoring-type-change="monitoringTypeChange">
        <template v-slot:select-camera>
          <div
            style="width:345px;"
            class="right-camera-content">
            <camera-select
              ref="cameraSelect"
              mode="">
              <template v-slot:filter-tree="scope">
                <filter-tree
                  ref="tree"
                  :tree-height="460"
                  :filter-condition="scope.filterCondition"
                  @change="onTreeCheckedChanged"
                  @tree-update-ready="treeUpdateReady">
                  <template v-slot:tree-after="{node, data}">
                    <!-- && !['2', '3', '11', '12', '13', '14', '15'].includes(node.type.toString()) -->
                    <template v-if="node.flag === 'camera'">
                      <meg-icon
                        style="margin-right: 6px;"
                        name="full_play"
                        width="16"
                        height="16"
                        color="#21539b"
                        @click.stop="playon(node, data, false)">
                      </meg-icon>
                      <meg-icon
                        name="setting_roi"
                        color="#21539b"
                        height="16"
                        width="16"
                        @click.stop="playon(node, data, true)"></meg-icon>
                    </template>
                  </template>
                </filter-tree>
              </template>
            </camera-select>
          </div>
        </template>
      </task-form>
      <!-- <analysis-select-button
        :count="selectedCameraIds.length"
        @click.native="handleSelectButton"></analysis-select-button>
      </div> -->
      <analysis-player
        v-if="showPlayer"
        :task-data="playerInfo"
        :show-roi="showRoi"
        :init-roi-value="initRoi"
        @roi-data="getRoiData"
        v-model="showPlayer"></analysis-player>
    </div>
    <template v-slot:footer>
      <div class="dialog-title">
        新建任务
      </div>
      <div class="dialog-footer">
        <meg-button
          type="primary"
          :loading="adding"
          @click="confirm">
          {{ $t('确定') }}
        </meg-button>
        <meg-button @click="cancel">
          {{ $t('取消') }}
        </meg-button>
      </div>
    </template>
  </meg-dialog>
</template>
<script>
import _ from 'lodash';
import CameraSelect, { FilterTree } from '@/common-components/common-camera-selector';
// import AnalysisSelectButton from '@/components/analysis/analysis-select-button';
import SelectCameraMap from '@/common-components/common-maps/select-camera-map';
import AnalysisPlayer from '@/components/analysis/analysis-player';
import commonMapList from '@/utils/data-map.utils';
import TaskForm from './task-form';

const roiDatas = new Map();

export default {
  components: {
    AnalysisPlayer,
    // AnalysisSelectButton,
    CameraSelect,
    FilterTree,
    TaskForm,
    SelectCameraMap
  },
  props: {
    formType: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    },
    adding: {
      type: Boolean,
      default: false
    },
    taskData: {
      type: Object,
      default: () => ({})
    },
    fromModule: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const supportMotorOrNonmotor = window.config.globalConfig.clientAppId === 'bigdata-web';
    return {
      playerInfo: {},
      initRoi: {},
      showRoi: false,
      showPlayer: false,
      showMapDialog: false,
      selectType: '',
      cameraType: 1,
      showSelectTree: false,
      supportMotorOrNonmotor,
      // analysisTypeArr: commonMapList.analysisTypeArr,
      selectedCameraIds: [],
      lastChecked: [],
      form: {
        cameras: [],
        scheduleType: 0,
        startTime: null,
        endTime: null,
        includeDays: [],
        startHour: null,
        endHour: null,
        sourceType: 1
      }
    };
  },
  computed: {
    analysisTypeArr() {
      const { analysisTypeArr } = commonMapList;
      if (this.supportMotorOrNonmotor) {
        const supportBody = this.$store.getters.systemByType('body_enable').value === '1';
        const regex = /\u{975e}?\u{673a}\u{52a8}\u{8f66}/gu; // 机动车非机动车
        Object.entries(analysisTypeArr).forEach(([key, value]) => {
          const filterValue = value.filter((item) => {
            regex.lastIndex = 0;
            return !regex.test(item.label);
          });
          if (filterValue.length > 0) {
            analysisTypeArr[key] = filterValue;
          } else {
            delete analysisTypeArr[key];
          }
        });
        if (!supportBody) {
          Object.entries(analysisTypeArr).forEach(([key, value]) => {
            const filterValue = value.filter((item) => {
              regex.lastIndex = 0;
              return !/人体/.test(item.label);
            });
            if (filterValue.length > 0) {
              analysisTypeArr[key] = filterValue;
            } else {
              delete analysisTypeArr[key];
            }
          });
        }
      }
      return analysisTypeArr;
    },
  },
  watch: {
    showSelectTree() {
      console.log(this.$refs.tree.$refs.tree);
    }
  },
  mounted() {
    let defType = this.$store.getters.systemByType('analysisBayonetDefaultType').value;
    if (this.formType === 'copy' && this.taskData && this.taskData.monitoringType) {
      defType = this.taskData.monitoringType;
    }
    this.$emit('monitoring-type-change', defType, 'add');
  },
  destroyed() {
    roiDatas.clear();
  },
  methods: {
    setTreeData(data) {
      if (data && data.length) {
        this.$nextTick(() => {
          this.$refs.tree.setTreeData(data);
        });
      }
      if (data && data.length && this.fromModule && !this.selected) {
        this.selected = true;
        let { cameraIds = [] } = this.taskData;
        if (!Array.isArray(cameraIds)) {
          cameraIds = [cameraIds];
        }
        this.$nextTick(() => {
          this.selectedCameraIds = cameraIds;
          this.form.cameras = cameraIds.map((item) => ({ cameraId: item }));
          this.$refs.tree.setCheckedKeys(cameraIds);
          // this.activeFeature = cameraIds;
        });
      }
    },
    getRoiData(data) {
      if (this.showRoi) {
        const { cameraId } = this.playerInfo;
        roiDatas.set(cameraId, data);
      }
    },
    playon(node, data, roi) {
      this.showRoi = roi;
      this.showPlayer = true;
      this.playerInfo.cameraId = data.id;
      if (roi) {
        this.initRoi = roiDatas.get(data.id) || {};
      }
    },
    selectPolygon() {
      this.selectType = 'polygon';
      this.eventTracking('FealtimeAnalysisTaskNewTaskDSelete');
    },
    selectCircle() {
      this.selectType = 'circle';
      this.eventTracking('FealtimeAnalysisTaskNewTaskQSelete');
    },
    selectBox() {
      this.selectType = 'box';
      this.eventTracking('FealtimeAnalysisTaskNewTaskKSelete');
    },
    monitoringTypeChange(v) {
      this.$emit('monitoring-type-change', v, 'add');
      this.delectSelect();
      this.$refs.map.deleteFeature();
    },
    clickSelect() {
      //
    },
    drawSelect(featrues) {
      const ids = featrues.map((item) => item.id);
      this.selectedCameraIds = ids;
      this.$refs.tree.setCheckedKeys(ids);
      this.$refs.map.selectFeatures(ids);
      this.form.cameras = ids.map((item) => ({ cameraId: item }));
      this.selectType = '';
      const { cameraSelect } = this.$refs;
      if (cameraSelect) {
        cameraSelect.selectedCameraIds = ids;
      }
    },
    delectSelect() {
      this.selectedCameraIds = [];
      this.$refs.map.selectFeatures([]);
      this.$refs.tree.setCheckedKeys([]);
      this.form.cameras = [];
      this.selectType = '';
    },
    treeUpdateReady(list) {
      console.log(list);
      // TODO: 选中
      this.$nextTick(() => {
        this.$refs.map.setFeatures(list);
        if (this.lastChecked.length) {
          const lastChecked = [];
          this.lastChecked.forEach((id) => {
            if (!list.some((el) => el.id === id)) {
              lastChecked.push(id);
            }
          });
          this.lastChecked = lastChecked;
        }
        this.onTreeCheckedChanged();
      });
    },
    onTreeCheckedChanged() {
      const { tree } = this.$refs;
      const ids = tree.getCheckedKeys();
      let realIds = this.lastChecked.length ? ids.concat(this.lastChecked) : ids;
      realIds = Array.from(new Set(realIds));
      this.form.cameras = realIds.map((item) => ({ cameraId: item }));

      this.$refs.map.selectFeatures(realIds);
      this.selectedCameraIds = realIds;
      const { cameraSelect } = this.$refs;
      if (cameraSelect) {
        cameraSelect.selectedCameraIds = realIds;
      }
    },
    handleSelectButton() {
      this.showSelectTree = !this.showSelectTree;
    },
    confirm() {
      console.log('add');
      const { taskForm, monitoringType } = this.$refs.form;
      const [startTime, endTime] = taskForm.time;
      const analysisType = this.supportMotorOrNonmotor && monitoringType.toString() === '3' ? '5' : monitoringType;
      const datas = this.analysisTypeArr[analysisType];
      let analysisTypes = {};
      datas.forEach((item) => {
        if (item.id === taskForm.analysisType) {
          analysisTypes = item.val;
        }
      });
      let newForm = _.pick(taskForm, Object.keys(this.form));
      const { cameras } = this.form;
      if (cameras.length) {
        cameras.forEach((item) => {
          const roi = roiDatas.get(item.cameraId);
          if (roi) {
            item.recognitionArea = roi;
          }
          if (!item.recognitionArea || (Array.isArray(item.recognitionArea) && !item.recognitionArea.length)) {
            delete item.recognitionArea;
          }
        });
        console.log(cameras, roiDatas);
      }
      newForm = {
        ...newForm,
        ...analysisTypes,
        startTime: startTime && startTime.getTime(),
        endTime: endTime && endTime.getTime(),
        cameras
      };
      if (!newForm.cameras.length) {
        return this.$message.error({
          message: '请选择相机',
          showClose: true
        });
      }
      const hasTypes = ['doBody', 'doFace', 'doMotor', 'doNonMotor'].some((item) => newForm[item] !== undefined);
      if (!hasTypes) {
        return this.$message.error({
          message: '请选择解析类型',
          showClose: true
        });
      }
      if (newForm.scheduleType) {
        if (!newForm.startTime || !newForm.endTime) {
          return this.$message.error({
            message: '请选择有效时间',
            showClose: true
          });
        }
        if (!newForm.includeDays.length) {
          return this.$message.error({
            message: '请选择循环每周',
            showClose: true
          });
        }
        if (!newForm.startHour || !newForm.endHour) {
          return this.$message.error({
            message: '请选择循环时间段',
            showClose: true
          });
        }
      }
      newForm.includeDays = (newForm.includeDays || []).map((item) => Number(item) + 1);
      newForm.startHour = parseInt(newForm.startHour, 10);
      newForm.endHour = parseInt(newForm.endHour, 10);
      this.$emit('confirm', newForm);
      return false;
    },
    cancel() {
      this.$emit('cancel');
    },
  },
};
</script>
<style lang="scss">
.map-camera-filter-wrapper {
  .meg-map-content {
    position: fixed;
    top: 55px;
    left: 399px;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
  .dialog-title {
    font-size: 16px;
    color: #64718E;
    font-weight: bold;
  }
  .meg-dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    min-height: auto;
  }
  .meg-dialog__body {
    padding: 0 !important;
    height: 100%;
  }
  .meg-dialog__footer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 10px 25px;
    display: flex;
    justify-content: space-between;
    line-height: 34px;
    box-shadow: 0 2px 6px 0 rgba(0,0,0,0.12);
    z-index: 191;
    background: #fff;
  }
  .camera-selector-content {
    box-shadow: 0 0 5px #ddd;
    padding: 10px 25px;
  }
  .meg-form-item__content {
    line-height: 2;
  }
  .meg-radio {
    width: 85px;
  }
}
.map-camera-select-left{
  position: absolute;
  background: #fff;
  right: 140px;
  top: 66px;
  z-index: 11;
  width: 320px;
  display: flex;
  flex-direction: column;
  line-height: 40px;
  box-shadow: 2px 2px 4px 0 rgba(0,0,0,0.10);
  .left-trigger{
    line-height: 20px;
    flex: 1;
    display: none;
    text-align: center;
    >span{
      padding: 10px 0;
      position: relative;
      .text{
        margin-left: 10px;
      }
      &.active{
        background-color: #e6f2ff;
      }
      &:after{
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        content: "";
        padding: 10px 0;
        border-right: 1px solid #dce1e5;
      }
    }
    .circle-select, .frame-select{
      width: 100px;
      cursor: pointer;
    }
    .polygon-select{
      flex:1;
      cursor: pointer;
    }
  }
}
.right-camera-content {
  .meg-base-tree__node {
    .tree-node-right {
      opacity: 0;
    }
    &:hover {
      .tree-node-right {
        opacity: 1;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.tooltipPopup {
  box-sizing: border-box;
  width: 130px;
  height: 40px;
  padding: 0 5px;
  line-height: 40px;
  font-size: 12px;
  background: #fff;
  color: #444;
  text-align: center;
  box-shadow: 0 3px 1px rgba(0,0,0,.1);
}
</style>
