<template>
  <div class="camera-map-select">
    <meg-dialog
      :visible="visible"
      :append-to-body="true"
      :show-close="false"
      custom-class="camera-map-select-dialog"
      :fullscreen="true">
      <div
        slot="title"
        class="dialog-title-box">
        <div class="dialog-title">
          {{ $t('地图选择相机') }}
        </div>
        <div>
          <span class="count-tip">{{ $t('地图已选 {count} 个',{count: hasSelectedIds.length}) }}</span>
          <meg-button
            :disabled="hasSelectedIds.length > 0 ? false : true"
            type="primary"
            @click="save">
            {{ $t('保存') }}
          </meg-button>
          <meg-button @click="cancel">
            {{ $t('取消') }}
          </meg-button>
        </div>
      </div>
      <div
        class="dialog-content"
        v-loading="contentLoading">
        <div
          class="map-box"
          v-if="visibleMap">
          <camera-select-map
            ref="map"
            :no-alalysis="noAlalysis"
            :is-deploy="isDeploy"
            @delect-select="onDelectSelect"
            @click-select="cameraClickChange"
            @draw-select="cameraSelectChange">
            <template slot="cameraDetail">
              <camera-card
                v-loading="cameraLoading"
                @play="playVideo"
                @close="closeDetail"
                :scenes-type-map="typesMap"
                :labels-map="labelsMap"
                :camera-info="cameraInfo"></camera-card>
            </template>
          </camera-select-map>
        </div>
        <div
          v-if="isVideoShow"
          class="video-box">
          <meg-stream-player
            :socket-url="videoInfo.url"
            :title="cameraInfo.name"
            @close="closeVideo">
          </meg-stream-player>
        </div>
      </div>
    </meg-dialog>
  </div>
</template>

<script>
import CameraSelectMap from '@/common-components/common-maps/select-camera-map';
import CameraCard from './camera-card';
import { CreateIdMap, CreateLabelMap } from '../../utils/utils';

export default {
  components: {
    CameraSelectMap,
    CameraCard,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    cameraInfo: {
      type: Object,
      default: () => {
      }
    },
    videoInfo: {
      type: Object,
      default: () => {
      }
    },
    filterCondition: {
      type: Array,
      default: () => []
    },
    mapLoading: {
      type: Boolean,
      default: false,
    },
    // 是否只显示未解析的设备
    noAlalysis: {
      type: Boolean,
      default: false
    },
    // 是否只查询布控报警数据
    isDeploy: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeFeature: [],
      cameraMode: [],
      socketUrl: '',
      videoName: '',
      streamType: 'file',
      isVideoShow: false,
      cameraLoading: false,
      visibleMap: false,
      contentLoading: false,
      hasSelectedIds: [],
    };
  },
  computed: {
    labelOptions() {
      let target = [];
      this.filterCondition.forEach((item) => {
        if (item.label === 'labels') {
          target = item.value;
        }
      });
      return target;
    },
    typeOptions() {
      let target = [];
      this.filterCondition.forEach((item) => {
        if (item.label === 'types') {
          target = item.value;
        }
      });
      return target;
    },
    labelsMap() {
      return CreateLabelMap(this.labelOptions);
    },
    typesMap() {
      return CreateIdMap(this.typeOptions, 'code', 'value');
    },
  },
  watch: {
    mapLoading: {
      handler(value) {
        this.contentLoading = value;
      },
      immediate: true,
    },
    cameraInfo() {
      this.cameraLoading = false;
    },
  },
  methods: {
    /**
     * @description 相机点选
     * @param {Object} item 选中的相机
     */
    cameraClickChange(item) {
      this.$emit('get-camera-info', item.id);
      this.cameraLoading = true;
      this.$refs.map.showFreeOverlay(item);
      this.$refs.map.moveTo({
        lon: item.lon,
        lat: item.lat
      });
    },
    /**
     * 关闭相机详情浮层
     */
    closeDetail() {
      if (this.$refs.map) {
        this.$refs.map.hideFreeOverlay();
      }
    },
    /**
     * 保存当前选择
     */
    save() {
      this.$emit('change', this.activeFeature);
      this.$emit('update:visible', false);
      this.closeDetail();
    },
    /**
     * 取消当前选择
     */
    cancel() {
      // 取消关闭地图相机选择，同时清空选择的数据
      this.visibleMap = false;
      // this.activeFeature = [];
      this.hasSelectedIds = [];
      this.closeDetail();
      this.$emit('update:visible', false);
    },
    /**
     * 播放相机视频
     */
    playVideo() {
      this.isVideoShow = true;
    },
    /**
     * 关闭相机视频
     */
    closeVideo() {
      this.isVideoShow = false;
    },
    // 设置地图渲染数据
    setMapFeatureData(featureArray) {
      this.featureArray = featureArray;
      this.$nextTick(() => {
        this.$refs.map.setFeatures(featureArray);
        if (localStorage.getItem('selectData')) {
          this.$nextTick(() => {
            const selectData = JSON.parse(localStorage.getItem('selectData'));
            this.hasSelectedIds = selectData.selectCamera.map((item) => item.id);
            this.caculateSelectCameraCount();
            this.setMapSelectedFeatureData();
            this.$refs.map.setLineGeoData(selectData.lineGeomData);
          });
        }
      });
    },
    // 计算选中的相机数
    caculateSelectCameraCount() {
      if (!this.hasSelectedIds) {
        this.hasSelectedIds = [];
      }
      this.activeFeature = [...(new Set(this.defaultIds.concat(this.hasSelectedIds)))];
    },
    // 设置默认选中的相机
    setActiveFeature(defaultIds) {
      this.defaultIds = defaultIds;
      this.caculateSelectCameraCount();
      this.$nextTick(() => {
        this.setMapSelectedFeatureData();
      });
    },
    // 设置选中图层
    setMapSelectedFeatureData() {
      this.$refs.map.selectFeatures(this.featureArray);
    },

    // 取消选择
    onDelectSelect() {
      if (localStorage.getItem('selectData')) {
        localStorage.removeItem('selectData');
      }
      this.activeFeature = [];
      this.hasSelectedIds = [];
      this.$refs.map.selectFeatures([]);
    },

    /**
     * @description 地图框选相机集合
     * @param {Array} select
     */
    cameraSelectChange(select, lineGeomData) {
      try {
        const selectData = {
          selectCamera: select,
          lineGeomData
        };
        localStorage.setItem('selectData', JSON.stringify(selectData));
      } catch (e) {
        console.log(e);
      } finally {
        this.hasSelectedIds = select.map((item) => item.id);
        this.caculateSelectCameraCount();
        this.setMapSelectedFeatureData();
      }
    },

    /**
     * 打开地图
    */
    openMap() {
      this.visibleMap = true;
    },
  }
};
</script>
<style lang="scss">
.camera-map-select-dialog{
  .dialog-title-box{
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 55px;
    .dialog-title{
      font-size: 18px;
    }
    .count-tip{
      font-size: 12px;
      color: #869ABB;
      margin-right: 20px;
    }
  }
  .meg-dialog__body{
    padding: 0;
    height: calc(100% - 55px);
  }
  .dialog-content{
    display: flex;
    height: 100%;
    .map-box{
      flex: 1;
    }
    .video-box{
      width: 600px;
      height: 400px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-left: -300px;
      margin-top: -200px;
      z-index: 1111;
    }
  }
}
</style>
