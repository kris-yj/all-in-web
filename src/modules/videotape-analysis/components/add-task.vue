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
        :form-type="formType"
        :monitor-info="monitorInfo"
        :albums="albums"
        :init-data="detailData"
        :cameras-count="selectedCameraIds.length">
        <template v-slot:select-camera>
          <camera-select
            mode=""
            style="width:265px"
            ref="cameraSelect"
            @filter="onCameraDataReady"
            :default-params="{ monitoringTypes: [4, 5, 12], needLocal: true }">
            <template v-slot:filter-tree="scope">
              <filter-tree
                ref="tree"
                :tree-height="460"
                :filter-condition="scope.filterCondition"
                @change="onTreeCheckedChanged"
                @tree-update-ready="treeUpdateReady">
              </filter-tree>
            </template>
          </camera-select>
        </template>
      </task-form>
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
import SelectCameraMap from '@/common-components/common-maps/select-camera-map';
import commonMapList from '@/utils/data-map.utils';
import videoService from '../videotape-analysis.service';
import taskForm from './task-form';

export default {
  components: {
    taskForm,
    CameraSelect,
    FilterTree,
    SelectCameraMap
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    albums: {
      type: Object,
      default: () => ({})
    },
    adding: {
      type: Boolean,
      default: false
    },
    monitorInfo: {
      type: Object,
      default: () => ({})
    },
    initData: {
      type: Object,
      default: () => ({})
    },
    formType: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      showMapDialog: false,
      selectType: '',
      cameraType: 1,
      analysisTypeArr: commonMapList.analysisTypeArr,
      selectedCameraIds: [],
      showSelectTree: false,
      lastChecked: [],
      form: {
        cameras: [],
        speed: 0,
        autoCompare: 0,
        priority: 0,
        taskName: ''
      },
      detailData: {},
    };
  },
  watch: {
    initData: {
      immediate: true,
      handler(data) {
        this.detailData = data;
        this.detailDataChange();
      }
    }
  },
  created() {
    const { cameraIds } = this.$route.query;
    const ids = Array.isArray(cameraIds) ? cameraIds : [cameraIds];
    this.$nextTick(() => {
      this.$refs.map.selectFeatures(ids);
    });
  },
  methods: {
    onCameraDataReady(camerasData) {
      this.$nextTick(() => {
        this.$refs.tree.setTreeData(camerasData);
      });
    },
    selectPolygon() {
      this.selectType = 'polygon';
      this.eventTracking('VideotapeAnalysisTaskNewTaskDSelete');
    },
    selectCircle() {
      this.selectType = 'circle';
      this.eventTracking('VideotapeAnalysisTaskNewTaskQSelete');
    },
    selectBox() {
      this.selectType = 'box';
      this.eventTracking('VideotapeAnalysisTaskNewTaskKSelete');
    },
    handleOutClick() {
      if (this.showSelectTree) {
        this.showSelectTree = false;
      }
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
      this.selectType = '';
    },
    filterCameraNodes(array = []) {
      const temp = [];
      array.forEach((item) => {
        if (item.items && item.items.length) {
          temp.push(...this.filterCameraNodes(item.items));
        } else if (item.flag === 'camera') {
          temp.push(item);
        }
      });
      return temp;
    },
    treeUpdateReady(list) {
      this.$nextTick(() => {
        console.log('treeUpdateReady');

        this.$refs.map.setFeatures(list);
        if (this.initData && this.initData.$cameraIds) {
          const { $cameraIds } = this.initData;
          const ids = Array.isArray($cameraIds) ? $cameraIds : [$cameraIds];
          this.selectedCameraIds = ids;
          this.form.cameras = ids.map((item) => ({ cameraId: item }));
          this.$refs.tree.setCheckedKeys(ids);
        } else {
          if (this.lastChecked.length) {
            const lastChecked = [];
            this.lastChecked.forEach((id) => {
              if (!list.some((el) => el.id === id)) {
                lastChecked.push(id);
              }
            });
            this.lastChecked = lastChecked;
          }

          this.detailDataChange();
        }
      });
    },
    detailDataChange() {
      const { detailData } = this;
      console.log('datas', detailData);
      if (detailData && detailData.cameras && detailData.cameras.length) {
        const checked = detailData.cameras.map((item) => item.cameraId);
        this.form.cameras = detailData.cameras;
        this.$refs.tree.setCheckedKeys(checked);
        this.$refs.map.selectFeatures(checked);
        this.selectedCameraIds = checked;
      }
    },
    onTreeCheckedChanged(ids) {
      let realIds = this.lastChecked.length ? ids.concat(this.lastChecked) : ids;
      realIds = Array.from(new Set(realIds));
      this.form.cameras = realIds.map((item) => ({ cameraId: item }));
      this.selectedCameraIds = realIds;
      this.$refs.map.selectFeatures(realIds);
      const { cameraSelect } = this.$refs;
      if (cameraSelect) {
        cameraSelect.selectedCameraIds = realIds;
      }
      // this.allCameraNodes = this.filterCameraNodes(this.$refs.tree.getCheckedNodes());
    },
    handleSelectButton() {
      this.showSelectTree = !this.showSelectTree;
    },
    checkValue(speed) {
      const { monitorInfo } = this;
      if (!/^\d+$/.test(speed)) {
        return false;
      }
      if (speed > monitorInfo.totalVideoPower || speed < 0) {
        return false;
      }
      return true;
    },
    async confirm() {
      const { form } = this.$refs.form;
      const [startTime, endTime] = form.time || [];
      const datas = commonMapList.analysisTypeArr[2];
      let analysisTypes = {};
      datas.forEach((item) => {
        if (item.id === form.analysisType) {
          analysisTypes = item.val;
        }
      });
      console.log('111');
      let newForm = _.pick(form, Object.keys(this.form));
      newForm = {
        ...newForm,
        ...analysisTypes,
        startTime,
        endTime,
        cameras: this.form.cameras,
        albums: this.$refs.form.chosedAlbums()
      };
      if (newForm.autoCompare) {
        newForm.alarmType = 0;
      }
      if (!newForm.taskName) {
        return this.$message.error({
          message: '请输入任务名称',
          showClose: true
        });
      }
      if (newForm.taskName.length < 2 || newForm.taskName.length > 50) {
        return this.$message.error({
          message: '任务名称为2-50个字符',
          showClose: true
        });
      }
      if (!/^(?:[^'“”!@#$%^&*`~！＠＃＄％＾＆＊￥……<>/,，。]+)$/.test(newForm.taskName)) {
        return this.$message.error({
          message: '任务名称不能包含特殊字符',
          showClose: true
        });
      }
      const checked = await this.checkName(newForm.taskName);
      if (checked) {
        return false;
      }
      if (!newForm.startTime || !newForm.endTime) {
        return this.$message.error({
          message: '请选择起止时间',
          showClose: true
        });
      }
      if (newForm.startTime.toString() === newForm.endTime.toString()) {
        return this.$message.error({
          message: '起止时间不能相同',
          showClose: true
        });
      }
      newForm.startTime = +newForm.startTime;
      newForm.endTime = +newForm.endTime;
      if (!(typeof form.analysisType === 'number' && form.analysisType >= 0)) {
        return this.$message.error({
          message: '请选择解析类型',
          showClose: true
        });
      }
      if (newForm.speed === '') {
        return this.$message.error({
          message: '请填写解析倍速',
          showClose: true
        });
      }
      if (newForm.speed <= 0) {
        return this.$message.error({
          message: '请输入大于0的解析倍速',
          showClose: true
        });
      }
      if (!this.checkValue(newForm.speed)) {
        const { totalVideoPower } = this.monitorInfo;
        return this.$message.error({
          message: `请输入1-${totalVideoPower}的解析倍速`,
          showClose: true
        });
      }
      if (newForm.autoCompare) {
        console.log('this.$refs.form.chosedAlbums', this.$refs.form.chosedAlbums());
        if (!newForm.albums || !newForm.albums.length) {
          return this.$message.error({
            message: '请选择底库！',
            showClose: true
          });
        }
      }
      if (!newForm.cameras.length) {
        return this.$message.error({
          message: '请选择相机',
          showClose: true
        });
      }

      this.$emit('confirm', newForm);
      return false;
    },
    async checkName(taskName) {
      const { code, data } = await videoService.checkName({
        taskName
      });
      if (code === 0 && data) {
        this.$message.error({
          message: '任务名称重复',
          showClose: true
        });
        return true;
      }
      return false;
    },
    cancel() {
      this.$emit('cancel');
    }
  },
};
</script>
<style lang="scss">
.map-camera-filter-wrapper {
  .meg-map-content {
    position: fixed;
    top: 55px;
    left: 414px;
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
.map-camera-filter-content{
  height: 100%;
  position: relative;
  .hover-info-pop{
    display: block;
    background: #fff;
    padding: 15px 20px;
  }
  .click-info-pop{
    display: block;
    background: #fff;
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
    // z-index: 123;
    // position: fixed;
    // top: 75px;
    // right: 20px;
    // box-shadow: 0 0 4px 0 rgba(0,0,0,.1);
    // .placeholder-box,.filter-head {
    //   display: none!important;
    // }
    .wrapper {
      // position: absolute;
      // right: 0;
      // width: 290px;
      // top: 55px;
      // box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
      // z-index: 1;
      // padding-top: 16px;
      // background: #fff;
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
