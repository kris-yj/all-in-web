<template>
  <div class="realtime-task-camera">
    <span class="current-checked-item">已选{{ currentCheckedNum }}个</span>
    <!-- <span
      @click="showMapCameraSelector"
      class="map-icon">
      <meg-icon
        class="map-icon-inner"
        name="map_mode"
        color="#21539b"
        width="17">
      </meg-icon>
    </span> -->
    <div class="task-camera">
      <meg-tree
        ref="cameraTree"
        standard-tree-data
        :data="cameraTreeData"
        :show-checkbox="showCheckbox"
        :default-checked-keys="defaultCameraId"
        default-expand-all
        @check-change="checkChange">
        <span
          class="custom-tree-node"
          slot-scope="{ node, data }">
          <span
            class="node-icon">
            <meg-icon
              :name="data.flag === 'dept' ? 'department' : 'camera_normal'"
              width="14"
              height="14"
              color="#b4b9c2">
            </meg-icon>
          </span>
          <span
            v-tooltip="true"
            class="item-name">
            {{ data.label }}
          </span>
          <span class="item-play">
            <meg-icon
              v-if="data.flag === 'camera' && showCameraPlayBtn"
              name="full_play"
              color="#21539b"
              height="16"
              width="16"
              @click="cameraPlay(data)">
            </meg-icon>
            <meg-icon
              v-if="data.flag === 'camera' && showCameraPlayBtn"
              name="setting_roi"
              color="#21539b"
              height="16"
              width="16"
              @click="cameraPlay(data)"></meg-icon>
          </span>
          <span class="analysis-type-wrapper">
            <span
              class="analysis-type"
              v-for="(item, key) in doPropertyIconObj"
              :key="key">
              <meg-icon
                v-if="data[key] && key !== 'doNonVehicle' && data.flag === 'camera'"
                :name="item"
                width="13"
                height="14"
                color="#9ea5b0">
              </meg-icon>
              <meg-icon
                v-if="data['doVehicle'] && key === 'doNonVehicle' && data.flag === 'camera'"
                :name="item"
                width="13"
                height="14"
                color="#9ea5b0">
              </meg-icon>
            </span>
          </span>
        </span>
      </meg-tree>
    </div>
    <!-- <vsr-map-camera-filter-dialog
      ref="cameraMapSelectorDialog"
      :is-show-yes="isShowYes"
      :map-camera-arr="cameraList"
      :default-filter-obj="defaultFilterObj"
      :default-scenes-type="defaultScenesType"
      :default-analysis-status="defaultAnalysisStatus"
      @overlay-camera-data="overlayCameraData"></vsr-map-camera-filter-dialog> -->
  </div>
</template>

<script>
// import vsrMapCameraFilterDialog from '@/components/common/vsr-camera-selector/vsr-map-camera-filter-dialog';

export default {
  // components: {
  // vsrMapCameraFilterDialog
  // },
  props: {
    // 请求到的树的数据
    cameraTreeData: {
      type: Array,
      default: () => []
    },
    // 显示播放按钮
    showCameraPlayBtn: {
      type: Boolean,
      default: true
    },
    // 显示多选按钮
    showCheckbox: {
      type: Boolean,
      default: true
    },
    // 默认选中的相机
    defaultCameraId: {
      type: Array,
      default: () => []
    },
    // 相机列表
    cameraList: {
      type: Array,
      default: () => []
    },
    // defaultScenesType: {
    //   type: Array,
    //   default: () => []
    // },
    // defaultAnalysisStatus: {
    //   type: Array,
    //   default: () => []
    // },
    // 是否显示有解析相机
    // isShowYes: {
    //   type: Boolean,
    //   default: true
    // }
  },
  data() {
    return {
      // 当前搜索的相机
      // currentCamera: '',
      // currentCameraId: '',
      currentCheckedNum: 0,
      // mapCameraArr: [],
      // analysisStatus: [0, 1],
      // scenesType: [0, 1, 2, 3],
      doPropertyIconObj: {
        'doFace': 'card_face',
        'doBody': 'person',
        'doVehicle': 'car',
        'doNonVehicle': 'non_motor_vehicle'
      },
      // 初始化的时候的相机筛选条件
      // defaultFilterObj: {
      //   scenesTypeArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      //   hasTask: '',
      // },
    };
  },
  methods: {
    /**
     * 点击相机的播放按钮
     */
    cameraPlay(data) {
      this.$emit('camera-play', data);
    },
    setChecked(keys) {
      this.currentCheckedNum = keys.length;
      this.$nextTick(() => {
        this.$refs.cameraTree.setCheckedKeys(keys);
      });
    },
    getCurrentNode() {
      return this.$refs.cameraTree.getCurrentNode();
    },
    getCheckedKeys() {
      return this.$refs.cameraTree.getCheckedKeys((item) => item.flag === 'camera');
    },
    getCheckedNodes() {
      return this.$refs.cameraTree.getCheckedNodes((item) => item.flag === 'camera');
    },
    /**
     * @description 展示地图选择相机dialog
     */
    // showMapCameraSelector() {
    //   this.analysisStatus = [...this.defaultAnalysisStatus];
    //   this.scenesType = [...this.defaultScenesType];
    //   this.$refs.cameraMapSelectorDialog.initShowMap({
    //     analysisStatus: this.analysisStatus,
    //     scenesType: this.scenesType,
    //   });
    // },
    /**
     * @description 增加地图中的相机列表
     */
    overlayCameraData(val) {
      // const originalCheckedCamera = this.$refs.cameraTree.getCheckedKeys();
      const { overlayCameraArr } = val;
      // const cameraSets = new Set(originalCheckedCamera.concat(overlayCameraArr));
      // const cameraArr = [...cameraSets];
      const cameraArr = [...overlayCameraArr];
      this.$refs.cameraTree.setCheckedKeys(cameraArr);
      this.checkChange();
    },
    /**
     * 选择相机列表中的某几项的时候
     */
    checkChange() {
      const checkedNodes = this.getCheckedKeys();
      this.currentCheckedNum = checkedNodes.length;
    }
  },
};
</script>
<style scoped lang='scss'>
.realtime-task-camera{
  width:100%;
  height: 100%;
  position: relative;
  .map-icon{
    position: absolute;
    right: 0;
    top: -6px;
    display: block;
    height: 24px;
    line-height: 24px;
    text-align: center;
    width: 32px;
    box-sizing: border-box;
    background: #f7f8f9;
    border: 1px solid #d2d6de;
    cursor: pointer;
    .map-icon-inner{
      margin-top: -5px;
    }
  }
  .current-checked-item{
    margin-bottom: 8px;
    display: inline-block;
  }
  .task-camera{
    width:100%;
    height: calc(100% - 50px);
    box-sizing: border-box;
    background-color: #fff;
    overflow-y: auto;
    border: 1px solid #DCE1E5;
    padding: 13px 15px 0;
  }
  .custom-tree-node{
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 1;
    width: 100%;
    .node-icon {
      float: left;
    }
    .item-name{
      margin-left: 3px;
      margin-right: 65px;
      float: left;
      width: 150px;
    }
    .item-play{
      display: none;
      position: absolute;
      right: 0;
      >svg{
        margin-right: 10px;
      }
    }
    .analysis-type-wrapper{
      position: absolute;
      right: 5px;
      top: 0;
      .analysis-type{
        margin-left: 3px;
      }
    }
  }
  v::deep .meg-base-tree__node:hover{
    .item-name{
      margin-right: 30px;
    }
    .analysis-type-wrapper{
      display: none;
    }
    .item-play{
      display: block;
    }
  }
}
</style>
