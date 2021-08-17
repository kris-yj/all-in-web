<template>
  <!-- 区域碰撞选择地图 -->
  <map-wrap
    ref="mapView"
    @zoom-changed="zoomChanged"
    :limit-min-zoom="limitMinZoom"
    auto-fit-layer="featureLayer">
    <camera-layer
      ref="deviceLayer"
      :draw-type="drawType"
      @draw-select="onSelectDrawEnd"
      @hover="hoverCamera"
      :is-visible="!isMerge&&!open"></camera-layer>
    <camera-layer
      ref="deviceAnalysisLayer"
      name="deviceAnalysisLayer"
      :draw-type="drawType"
      @draw-select="onSelectDrawEnd"
      @hover="hoverCamera"
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
    <!-- 区域图层 -->
    <meg-vector-layer
      name="lineFeatureLayer"
      :style-function="lineStyleLayerFn"
      ref="featureLayer">
      <meg-feature-collection
        name="coreFeature"
        :feature-data="lineGeomData">
      </meg-feature-collection>
    </meg-vector-layer>
    <!--相机名称-->
    <meg-overlay
      name="cameraOverlay"
      :options="cameraOverlayOptions"
      :visible="cameraOverlayVisible"
      :params="cameraOverlayInfo"
      :position="cameraOverlayPosition">
      <template v-slot:default="{params}">
        <div class="title-feature">
          {{ params.params && params.params.name }}
        </div>
      </template>
    </meg-overlay>
    <!--删除区域范围-->
    <meg-overlay
      name="mapOverlay"
      :options="overlayOptions"
      :visible="overlayVisible"
      :position="overlayPosition">
      <template v-slot:default>
        <div
          class="delete-feature"
          @click="deleteFeature">
          <meg-icon
            name="close"
            color="#ffffff"
            width="10px"
            height="10px"></meg-icon>
        </div>
      </template>
    </meg-overlay>
    <template slot="control">
      <draw-select
        ref="drawSelect"
        @change="drawTypeChange"></draw-select>
      <feture-filter
        @node-click="selectCamera"
        ref="featureFilter"></feture-filter>
      <select-toolbar
        @filter-change="filterChange"
        @change="statusChange"></select-toolbar>
    </template>
  </map-wrap>
</template>
<script>

import { lineStyleLayerFn, deviceStyleFn, lineActiveStyleFn } from './styles/common';

import CameraLayer from './common/camera-layer';
import MapWrap from './common/map-wrap';
import DeviceMergeLayer from './common/device-merge-layer';
import FetureFilter from './common/feture-filter';
import SelectToolbar from './common/select-toolbar';
import DrawSelect from './common/draw-select';

export default {
  name: 'AreaSelectorMap',
  components: {
    MapWrap,
    DeviceMergeLayer,
    CameraLayer,
    FetureFilter,
    SelectToolbar,
    DrawSelect
  },
  props: {
    // 限制最小zoom 为兼容大数据量性能
    limitMinZoom: {
      type: Number,
      default: undefined,
    },
    // 展示的区域
    defaultFeature: {
      type: String,
      default: ''
    },

  },
  data() {
    return {
      drawType: '',
      isEdit: false,

      overlayOptions: {
        offset: [0, 7]
      },
      open: true,
      // 相机名称信息
      cameraOverlayInfo: {
        name: 'overlay'
      },
      cameraOverlayVisible: false,
      cameraOverlayOptions: {
        offset: [0, -45]
      },
      cameraOverlayPosition: null,
      zoom: 13,
      limitMergeZoom: 12
    };
  },
  computed: {
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    },
    /**
     * 区域数据
     */
    defaultGeom() {
      if (this.defaultFeature) {
        return JSON.parse(this.defaultFeature);
      }
      return '';
    },

    // 是否显示叉号经纬度判断
    overlayVisible() {
      return !!this.overlayPosition;
    },
    // 区域删除按钮定位
    overlayPosition() {
      if (this.defaultGeom) {
        return this.defaultGeom.lastPosition;
      }
      return undefined;
    },
    /**
     * 绘制区域范围数据
     */
    lineGeomData() {
      if (this.defaultGeom) {
        console.log(this.defaultGeom.type);
        return [{
          geometry: {
            type: this.defaultGeom.type,
            coordinates: this.defaultGeom.coordinates
          }
        }];
      }
      return undefined;
    }

  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    const { clusterThreshold, zoom } = this.$adaptConfigForMegviiGisSystem(systemConfig);
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;
    this.lineStyleLayerFn = lineStyleLayerFn;
    this.deviceStyleFn = deviceStyleFn;
    this.featureArray = [];
    this.featureMap = {};
    this.lineActiveStyleFn = lineActiveStyleFn;
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
    /**
     * 框选事件
     */
    drawTypeChange(type) {
      this.drawType = type;
    },
    /**
     * 鼠标移上相机
     */
    hoverCamera(select) {
      if (select) {
        this.cameraOverlayPosition = select.lonLat;
        this.cameraOverlayVisible = true;
        this.cameraOverlayInfo = select;
        return;
      }
      this.cameraOverlayVisible = false;
    },
    /**
     * 点击删除当前选中的区域范围
     */
    deleteFeature() {
      this.drawType = this.defaultGeom.type;
      this.$emit('draw-change');
      this.$emit('select-change', this.defaultGeom.features, false);
    },

    /**
     * 区域绘制结束事件
     */
    onSelectDrawEnd(features, featureGeom) {
      const featureArray = features;
      this.$refs.drawSelect.setDrawType();
      this.$emit('draw-change', JSON.stringify({
        type: this.drawType === 'Box' ? 'Polygon' : this.drawType,
        coordinates: featureGeom.geometry.coordinates,
        lastPosition: featureGeom.lastPosition,
        features: [...features]
      }));
      this.$emit('select-change', featureArray.map((item) => item.id), true);
      this.drawType = '';
    },
    /**
     * 地图自适应
     */
    fitForLayer() {
      this.$refs.mapView.fitForLayer();
    },
    /**
     * 外部设置框选类型
     */
    setDrawType(type) {
      this.drawType = type;
      this.$refs.drawSelect.setDrawType(type);
    },
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    /**
     * 选择相机点位
     */
    selectCamera(node) {
      this.moveTo(node.params);
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

  },
};
</script>
<style lang='scss' scoped>
.position-edit,
.position-exit {
  position: absolute;
  right: 20px;
  top: 10px;
  z-index: 100;
}

.title-feature {
  padding: 3px;
  background: #fff;
}
.delete-feature {
  width: 18px;
  height: 18px;
  background: red;
  border-radius: 15px;
  text-align: center;
  line-height: 18px;
  cursor: pointer;
}
</style>
