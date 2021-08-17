<template>
  <!--轨迹找人地图-->
  <map-wrap
    :cursor="isCursor"
    is-zoom
    auto-fit-layer="traceLineLayer"
    :limit-min-zoom="limitMinZoom"
    @zoom-changed="zoomChanged"
    @ready="ready"
    ref="mapView">
    <!-- 绘制相机标注 -->
    <camera-layer
      @hover="hoverCamera"
      @select="selectCamera"
      :is-visible="!isMerge"
      ref="deviceLayer"></camera-layer>
    <!-- 选中设备点 -->
    <camera-layer
      :is-visible="!isMerge"
      is-selected
      name="activeLayer"
      ref="activeLayer"></camera-layer>
    <!-- 设备聚类  -->
    <device-merge-layer
      ref="deviceMergeLayer"
      :is-visible="isMerge"></device-merge-layer>
    <trace-layer
      :is-point="false"
      @select-change="ontrackNodeClickSelectChange"
      @hover="onCursorChange"
      :data="trackNodeArray"></trace-layer>
    <!-- 绘制轨迹点 -->
    <meg-vector-layer
      :style-function="()=>{}"
      name="featureLayer">
      <meg-feature-container
        name="drawFeatureContainer"
        ref="drawFeatureContainer">
      </meg-feature-container>
      <!-- 轨迹点绘制手势 -->
      <meg-draw-interaction
        name="drawInteraction"
        draw-type="Point"
        :style-function="()=>{}"
        :active="drawInteractionActive"
        @draw-end="onDrawEnd">
      </meg-draw-interaction>
    </meg-vector-layer>
    <!-- 修改范围大小手势 -->
    <meg-vector-layer
      name="vectorLayer"
      :style-function="circleStyleFn">
      <meg-modify-interaction
        :custom="true"
        name="modifyInteraction"
        @modify-start="modifyStart"
        @modify-end="modifyEnd"
        :active="!isMerge">
      </meg-modify-interaction>
      <meg-feature
        @geom-changed="geomChanged"
        :geometry="geomData">
      </meg-feature>
    </meg-vector-layer>
    <template v-slot:overlay>
      <!--相机hover-->
      <meg-overlay
        name="cameraHoverOverlay"
        :options="cameraOverlayOptions"
        :visible="cameraOverlayVisible"
        :params="cameraOverlayInfo"
        :position="cameraOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params"></slot>
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
            :params="params"></slot>
        </template>
      </meg-overlay>
      <!-- 自由弹窗 -->
      <meg-overlay
        name="overlay"
        :options="overlayOptions"
        :visible="overlayVisible"
        :params="selectFeature"
        :position="overlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
            :params="params"></slot>
        </template>
      </meg-overlay>
      <!-- 自由弹窗 -->
      <meg-overlay
        name="limit"
        :visible="!!orgGeometry.coordinates.lastPosition"
        :params="orgGeometry"
        :options="{autoPan:false}"
        :position="orgGeometry.coordinates.lastPosition">
        <template v-slot:default="{params}">
          <div class="km">
            <span v-if="params.coordinates.radius">{{ params.coordinates.radius.toFixed(2) }}km</span>
          </div>
        </template>
      </meg-overlay>
    </template>
    <template #control>
      <feture-filter
        @node-click="nodeClick"
        ref="featureFilter"></feture-filter>
    </template>
  </map-wrap>
</template>
<script>
import { calcIsPointInPolygon } from '@megvii-gis/calc-api';
import {
  circleStyleFn
} from './styles/common';
// eslint-disable-next-line import/no-unresolved
import TraceLayer from './common/trace-layer';
// eslint-disable-next-line import/no-unresolved
import CameraLayer from './common/camera-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import DeviceMergeLayer from './common/device-merge-layer';
import FetureFilter from './common/feture-filter';

export default {
  components: {
    TraceLayer,
    CameraLayer,
    MapWrap,
    DeviceMergeLayer,
    FetureFilter
  },
  props: {
    trackList: {
      type: Array,
      default: () => []
    },
    // 限制最小zoom 为兼容大数据量性能
    limitMinZoom: {
      type: Number,
      default: undefined,
    },
    /**
     * 选中的抓拍点
     */
    selectFeature: {
      type: Object,
      default: () => ({})
    },
    /**
     * 是否触发标记
     */
    drawInteractionActive: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      overlayOptions: {
        offset: [0, -45]
      },

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
      orgGeometry: {
        coordinates: {}
      },
      isCursor: false,
      zoom: 13,
      limitMergeZoom: 12
    };
  },
  computed: {
    overlayVisible() {
      return !!this.overlayPosition;
    },
    overlayPosition() {
      const { lat = '', lon = '' } = this.selectFeature;
      if (lat && lon) {
        return [lon, lat];
      }
      return undefined;
    },
    // 半径圆数据
    geomData() {
      const { lon, lat, radius } = this.selectFeature;
      if (!lon || !lat) return undefined;
      return {
        type: 'Circle',
        coordinates: { center: [lon, lat], radius: Number(radius / 1000) }
      };
    },

    // 轨迹显示可用数据
    trackNodeArray() {
      // 先将经纬度为空的过滤掉;
      const featureArray = this.trackList.filter((val) => val.lon && val.lat);
      return featureArray.map((item) => ({ ...item, isSelected: this.selectFeature.id === item.id }));
    },
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    }
  },
  watch: {
    selectFeature(feature) {
      if (feature.lon && feature.lat) {
        // this.$nextTick(() => {
        this.$refs.mapView.moveTo([feature.lon, feature.lat]);
        // });
      }
    },
  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    const { clusterThreshold, zoom } = this.$adaptConfigForMegviiGisSystem(systemConfig);
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;
    this.circleStyleFn = circleStyleFn;
    this.featureArray = [];
    this.featureMap = {};
  },
  methods: {
    /**
     * 渲染设备点
     */
    setFeatures(data = []) {
      const cameraList = [];
      data.forEach((item) => {
        if (item.lon && item.lat) {
          cameraList.push(item);
          this.featureMap[item.id] = item;
        }
      });
      this.featureArray = cameraList;
      this.$refs.featureFilter.setFeature(cameraList);
      this.$refs.deviceLayer.setFeature(cameraList);
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
      this.$refs.activeLayer.setFeature(cameraList);
    },
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    ready() {
      this.$emit('ready');
    },
    /**
     * 触发鼠标移上事件
     */
    onCursorChange(select) {
      this.isCursor = !!select;
    },
    /**
     * 圆改变的时候
     */
    geomChanged(id, feature, featureGeom) {
      const { geometry } = featureGeom;
      this.orgGeometry = geometry;
      this.deviceCount(geometry);
    },
    /**
     * 计算选中的设备
     */
    deviceCount(geometry) {
      const features = this.featureArray.filter((item) => calcIsPointInPolygon({
        type: 'Point',
        coordinates: [item.lon, item.lat]
      }, geometry));
      this.$emit('device-change', features);
    },

    /**
     * 鼠标移上相机
     */
    hoverCamera(select) {
      if (select) {
        this.cameraOverlayPosition = select.lonLat;
        this.cameraOverlayVisible = true;
        this.cameraOverlayInfo = select.params;
        return;
      }
      this.cameraOverlayVisible = false;
    },
    /**
     * 点选相机
     */
    selectCamera(select) {
      if (select) {
        this.$emit('click-select', select.feature.get('params'));
      }
    },
    /**
     * 点选相机节点
     */
    nodeClick(select) {
      this.$refs.mapView.moveTo([select.params.lon, select.params.lat]);
      this.showFreeOverlay(select.params);
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
     * 标记完成事件
     */
    onDrawEnd(id, feature, geom) {
      const [outLon, outLat] = geom.geometry.coordinates;
      this.$emit('location-change', [outLon, outLat]);
    },
    /**
     * 轨迹节点click选择事件回调
     */
    ontrackNodeClickSelectChange(type, select) {
      if (type) {
        this.$emit('node-click', select.params);
      }
    },
    /**
     * 区域半径开始修改
     */
    modifyStart() {
      this.freeInfoOverlayVisible = false;
    },
    /**
     * 区域半径修改完成
     */
    modifyEnd(id, feature, geom) {
      this.freeInfoOverlayVisible = true;
      // 获取区域范围内相机

      const params = {
        radius: Math.ceil(geom.geometry.coordinates.radius * 1000)
      };

      this.$emit('modify-change', params);
    }
  },

};
</script>
<style scoped>
.title-feature {
  padding: 5px 10px;
  background: #fff;
  color: #435068;
}
.km {
  background: #fff;
  color: #435068;
  padding: 5px;
  font-size: 12px;
  position: absolute;
  top: -12px;
  left: 10px;
}
</style>
