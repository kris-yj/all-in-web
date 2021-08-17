<template>
  <map-wrap
    name="mapView"
    ref="mapView"
    @center-changed="centerChange"
    @zoom-changed="zoomChanged"
    :limit-min-zoom="limitMinZoom"
    auto-fit-layer="featureLayer"
    is-zoom>
    <camera-layer
      ref="deviceLayer"
      :draw-type="drawType"
      @draw-select="onSelectDrawEnd"
      @hover="hoverCamera"
      @select="onClickCamera"
      :is-visible="!isMerge&&!open"></camera-layer>
    <camera-layer
      ref="deviceAnalysisLayer"
      name="deviceAnalysisLayer"
      :draw-type="drawType"
      @draw-select="onSelectDrawEnd"
      @hover="hoverCamera"
      @select="onClickCamera"
      :is-visible="!isMerge&&open"></camera-layer>
    <camera-layer
      name="activeLayer"
      ref="activeLayer"
      is-selected
      :is-visible="!isMerge&&!open"></camera-layer>
    <camera-layer
      name="activeAnalysisLayer"
      ref="activeAnalysisLayer"
      is-selected
      :is-visible="!isMerge&&open"></camera-layer>
    <!-- 设备聚类  -->
    <device-merge-layer
      ref="deviceMergeLayer"
      :is-visible="isMerge"></device-merge-layer>
    <meg-vector-layer
      name="lineFeatureLayer"
      :style-function="lineStyleLayerFn"
      ref="featureLayer">
      <meg-feature-collection
        name="coreFeature"
        :feature-data="lineGeomData">
      </meg-feature-collection>
      <meg-modify-interaction
        :custom="true"
        name="modifyInteraction"
        @modify-end="modifyEnd">
      </meg-modify-interaction>
    </meg-vector-layer>
    <template v-slot:overlay>
      <!--相机hover-->
      <meg-overlay
        name="cameraOverlay"
        :options="cameraOverlayOptions"
        :visible="cameraOverlayVisible"
        :params="cameraOverlayInfo"
        :position="cameraOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!--相机选中-->
      <meg-overlay
        name="cameraSelectOverlay"
        :options="cameraSelectOverlayOptions"
        :visible="cameraSelectOverlayVisible"
        :params="cameraSelectOverlayInfo"
        :position="cameraSelectOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="select"
            :params="params">
            <camera-detail
              @close="hideFreeOverlay"
              @play="playVideo"
              :id="params.id"></camera-detail>
          </slot>
        </template>
      </meg-overlay>
    </template>
    <template slot="control">
      <slot name="control"></slot>
      <meg-button
        class="draw-cancel"
        type="danger"
        v-show="lineGeomData.length>0&&isSelectStyle"
        plain
        @click="deleteFeature">
        取消地图已选
      </meg-button>
      <feture-filter
        @node-click="nodeClick"
        ref="featureFilter"></feture-filter>
      <draw-select
        ref="drawSelect"
        @change="drawTypeChange"></draw-select>
      <select-toolbar
        @filter-change="filterChange"
        :no-alalysis="noAlalysis"
        :is-deploy="isDeploy"
        @change="statusChange"></select-toolbar>
      <video-detail
        @close="closeVideo"
        :video-info="videoInfo"
        v-if="isVideoShow"></video-detail>
    </template>
  </map-wrap>
</template>
<script>
import { calcIsPointInPolygon } from '@megvii-gis/calc-api';
import { lineStyleLayerFn } from './styles/common';
import deleteIcon from './images/delete.svg';
// eslint-disable-next-line import/no-unresolved
import CameraLayer from './common/camera-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import DeviceMergeLayer from './common/device-merge-layer';
import FetureFilter from './common/feture-filter';
import SelectToolbar from './common/select-toolbar';
import CameraDetail from './common/camera-detail';
import VideoDetail from './common/video-detail';
import DrawSelect from './common/draw-select';

export default {
  components: {
    CameraLayer,
    MapWrap,
    DeviceMergeLayer,
    FetureFilter,
    SelectToolbar,
    CameraDetail,
    VideoDetail,
    DrawSelect
  },
  props: {
    // 限制最小zoom 为兼容大数据量性能
    limitMinZoom: {
      type: Number,
      default: undefined,
    },
    // 是否显示框选区域样式
    isSelectStyle: {
      type: Boolean,
      default: true
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
      deleteIcon,
      open: true,
      drawType: '',
      cameraOverlayInfo: {
        name: 'overlay'
      },
      cameraOverlayVisible: false,
      cameraOverlayOptions: {
        offset: [0, -35]
      },
      cameraOverlayPosition: null,

      cameraSelectOverlayInfo: {
        name: 'overlay'
      },
      cameraSelectOverlayVisible: false,
      cameraSelectOverlayOptions: {
        offset: [0, -35]
      },
      cameraSelectOverlayPosition: null,

      lineGeomData: [],
      zoom: 13,
      limitMergeZoom: 12,
      isVideoShow: false,
      videoInfo: {}
    };
  },
  computed: {
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    }
  },
  watch: {
    drawType(val) {
      if (val && this.isMerge) {
        setTimeout(() => {
          this.$refs.mapView.animate({
            lonlat: this.centLonLat,
            zoom: this.limitMergeZoom + 1,
          });
        }, 100);
      }
    }
  },
  created() {
    this.lineStyleLayerFn = lineStyleLayerFn;
    const systemConfig = this.$getMegviiGisSystemOptions();
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    const { clusterThreshold, zoom } = this.options;
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;
    this.featureArray = [];
    this.featureMap = {};
    this.selectCamera = new Map();
  },
  methods: {
    /**
     * 是否显示解析状态
     */
    statusChange(type) {
      this.open = type;
      this.$emit('status-change', type);
    },
    /**
     * 筛选后的相机数据
     */
    filterChange(data) {
      this.$refs.deviceLayer.setFeature(data);
      this.$refs.deviceAnalysisLayer.setFeature(data.map((item) => ({ ...item, analysis: true })));
      this.$refs.deviceMergeLayer.setFeature(data);
    },
    /**
     * @param {String} type 'Box', 'Circle', 'Polygon'
     */
    setDrawType(type) {
      this.drawType = type;
    },
    drawTypeChange(type) {
      this.drawType = type;
    },
    /**
     * @description 获取中心点坐标
     * @param [lon:number,lat:number] lonlat 变更后的经纬度
    */
    centerChange([lon, lat]) {
      this.centLonLat = [lon, lat];
    },
    /**
     * 播放相机视频
     */
    playVideo(videoInfo) {
      this.videoInfo = videoInfo;
      this.isVideoShow = true;
    },
    /**
     * 关闭相机视频
     */
    closeVideo() {
      this.isVideoShow = false;
    },
    /**
     * 渲染设备点
     */
    setFeatures(data = []) {
      const cameraList = [];
      data.forEach((item) => {
        if (item.lon && item.lat && item.flag === 'camera') {
          cameraList.push(item);
          this.featureMap[item.id] = item;
        }
      });
      this.featureArray = cameraList;
      this.$refs.deviceLayer.setFeature(cameraList);
      this.$refs.deviceAnalysisLayer.setFeature(cameraList.map((item) => ({ ...item, analysis: true })));
      this.$refs.featureFilter.setFeature(cameraList);
      this.$refs.deviceMergeLayer.setFeature(cameraList);
    },
    /**
     * 显示选中设备点
     */
    selectFeatures(data = []) {
      const cameraList = [];
      data.forEach((id) => {
        if (this.featureMap[id] && this.featureMap[id].lon && this.featureMap[id].lat) {
          cameraList.push(this.featureMap[id]);
        }
      });
      this.$refs.activeAnalysisLayer.setFeature(cameraList.map((item) => ({ ...item, analysis: true })));
      this.$refs.activeLayer.setFeature(cameraList);
    },
    // 设置框选
    setLineGeoData(lineGeomData) {
      this.lineGeomData = lineGeomData;
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    },
    /**
     * 区域半径修改完成
     */
    modifyEnd(id, feature, featureGeom, fetureGeoms) {
      const map = new Map();
      let updateId = id;
      this.lineGeomData.forEach((item) => {
        map.set(item.id, item);
      });
      fetureGeoms.forEach((geom) => {
        const obj = map.get(geom.id);

        if (!obj) return;
        const { coordinates: coordinates1 } = obj.geometry;
        const { coordinates: coordinates2 } = geom.geometry;
        if (obj.geometry.type === 'Circle') {
          if (coordinates2.radius !== coordinates1.radius) {
            updateId = geom.id;
            featureGeom = geom;
          }
        }
        if (obj.geometry.type === 'Polygon') {
          if ((Math.abs(coordinates2[0].map((item) => item[0] + item[1]).reduce((a, b) => a + b) - coordinates1[0].map((item) => item[0] + item[1]).reduce((a, b) => a + b)) * 1000000) > 1) {
            updateId = geom.id;
            featureGeom = geom;
          }
        }
      });
      const featureArray = this.featureArray.filter((item) => calcIsPointInPolygon({
        type: 'Point',
        coordinates: [item.lon, item.lat]
      }, featureGeom.geometry));
      this.lineGeomData = this.lineGeomData.filter((item) => item.params.id !== updateId);
      this.onSelectDrawEnd(featureArray, featureGeom, updateId);
    },
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    /**
     * @description 鼠标移上相机
     * @param {Object} select
     */
    hoverCamera(select) {
      if (select) {
        if (this.cameraSelectOverlayInfo.id === select.params.id) return;
        this.cameraOverlayPosition = select.lonLat;
        this.cameraOverlayVisible = true;
        this.cameraOverlayInfo = select.params;
        return;
      }
      this.cameraOverlayVisible = false;
    },
    /**
     * @description 点选地图上的相机
     * @param {Object} select
     */
    onClickCamera(select) {
      if (select) {
        this.cameraOverlayVisible = false;
        this.$emit('click-select', select.feature.get('params'));
        this.showFreeOverlay(select.feature.get('params'));
      }
    },
    /**
     * 显示相机详情
     */
    showFreeOverlay(data = {}) {
      this.cameraSelectOverlayInfo = { ...data };
      this.cameraSelectOverlayPosition = [data.lon, data.lat];
      this.cameraSelectOverlayVisible = true;
    },
    /**
     * 隐藏相机详情
     */
    hideFreeOverlay() {
      this.cameraSelectOverlayVisible = false;
      this.$refs.deviceLayer.cancelSelect();
    },
    /**
     * 点选相机节点
     */
    nodeClick(select) {
      this.moveTo(select.params);
      this.$emit('click-select', select.params);
      this.showFreeOverlay(select.params);
    },
    /**
     * 相机框选结束事件
     */
    /**
     * @description 相机框选结束事件
     * @param {Object} features 特征点
     * @param {Object} featureGeom 特征点坐标
     */
    onSelectDrawEnd(features, featureGeom, id) {
      this.drawType = '';
      this.$refs.drawSelect.setDrawType();
      if (this.isSelectStyle) {
        this.lineGeomData.push({
          params: { id },
          id,
          geometry: featureGeom.geometry
        });
        this.overlayPosition = featureGeom.lastPosition;
        this.overlayVisible = true;
      }
      const res = new Map();
      this.selectCamera.set(id, features);
      [...this.selectCamera.values()].forEach((item) => {
        item.forEach((items) => {
          res.set(items.id, items);
        });
      });
      this.$emit('draw-select', [...res.values()], this.lineGeomData);
    },
    /**
     * 点击相机地图移动到指定位置
     */
    moveTo({ lon = '', lat = '' }) {
      if (!lon || !lat) return;
      if (this.isMerge) {
        this.$refs.mapView.fitForExtent([lon, lat, lon, lat]);
      } else {
        this.$refs.mapView.moveTo([lon, lat]);
      }
    },
    /**
     * 删除框选的区域
     */
    deleteFeature() {
      this.lineGeomData = [];
      this.$emit('delect-select', [...this.selectCamera]);
      this.selectCamera = new Map();
    }
  },
};
</script>
<style lang="scss" scoped>

.draw-cancel {
  position: absolute;
  z-index: 1;
  right: 420px;
  top: 10px;
  height: 46px;
}
</style>
