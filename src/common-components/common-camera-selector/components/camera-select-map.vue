<template>
  <meg-map
    @ready="handleReady"
    :cursor="cursor">
    <meg-tile-view
      @center-changed="centerChange"
      @zoom-changed="zoomChanged"
      ref="mapView"
      name="mapView"
      auto-fit-layer="featureLayer"
      :type="options.type"
      :zoom="options.zoom"
      :center="options.center"
      :extent="options.extent"
      :min-zoom="options.minZoom"
      :max-zoom="options.maxZoom">
      <!-- 瓦片图层 -->
      <meg-tile-layer
        name="mapTileLayer"
        :type="options.type"
        :url="options.url"
        :extent="options.extent"
        :min-zoom="options.minZoom"
        :max-zoom="options.maxZoom">
      </meg-tile-layer>
      <!--相机标注图层-->
      <meg-vector-layer
        name="pointFeatureLayer"
        :visible="!isMerge"
        ref="pointFeatureLayer"
        :style-function="deviceStyleFn">
        <meg-feature-array
          :feature-data="featureData"
          ref="device"
          geom-type="Point">
        </meg-feature-array>
        <meg-select-interaction
          ref="clicktInteraction"
          name="clicktInteraction"
          select-type="click"
          @select-change="onClickCamera">
        </meg-select-interaction>
        <meg-select-interaction
          name="hoverInteraction"
          select-type="mouse-move"
          :active="true"
          @select-change="hoverCamera">
        </meg-select-interaction>
      </meg-vector-layer>
      <!-- 设备选中图层 -->
      <meg-vector-layer
        name="pointSelectedFeatureLayer"
        :visible="!isMerge"
        ref="pointSelectedFeatureLayer"
        :style-function="deviceSelectedStyleFn">
        <meg-feature-array
          :feature-data="featureData"
          ref="deviceSelected"
          geom-type="Point">
        </meg-feature-array>
        <meg-select-interaction
          ref="selectedClicktInteraction"
          name="selectedClicktInteraction"
          select-type="click">
        </meg-select-interaction>
      </meg-vector-layer>
      <!--相机框选手势-->
      <meg-vector-layer
        :style-function="deviceStyleFn"
        name="selectLayer">
        <meg-feature-container
          origin="target"
          unique
          :name="`featureContainer`"
          ref="featureContainer">
        </meg-feature-container>
        <!-- 框选手势 -->
        <meg-draw-interaction
          name="boxSelectInteraction"
          draw-type="Box"
          :active="boxSelectInteractionActive"
          @draw-end="onSelectDrawEnd">
        </meg-draw-interaction>
        <!-- 圈选手势 -->
        <meg-draw-interaction
          name="circleSelectInteraction"
          draw-type="Circle"
          :active="circleSelectInteractionActive"
          @draw-end="onSelectDrawEnd">
        </meg-draw-interaction>
        <!-- 多边形选手势 -->
        <meg-draw-interaction
          name="polygonSelectInteraction"
          draw-type="Polygon"
          :active="polygonSelectInteractionActive"
          @draw-end="onSelectDrawEnd">
        </meg-draw-interaction>
      </meg-vector-layer>
      <!-- 设备聚类  -->
      <meg-cluster-layer
        name="clusterLayer"
        animated
        :visible="isMerge"
        :style-function="clusterLayerFn">
        <meg-feature-array
          :feature-data="featureData"
          ref="cluster"
          geom-type="Point">
        </meg-feature-array>
      </meg-cluster-layer>
    </meg-tile-view>
    <meg-overlay
      name="cameraDetailOverlay"
      :options="detailOverlayOptions"
      :visible="detailOverlayVisible"
      :params="detailOverlayInfo"
      :position="detailOverlayPosition">
      <template v-slot:default="{params}">
        <slot
          name="cameraDetail"
          :params="params"></slot>
      </template>
    </meg-overlay>
    <!-- 地图控件插槽 -->
    <template slot="control">
      <div
        class="map-camera-select">
        <div class="left-trigger">
          <span
            :class="{'frame-select': true, active: drawType === 'box'}"
            @click.stop="handleSelectActions('box')">
            <meg-icon
              name="frame_select"
              width="20"
              height="20"
              :color="'#94a9c9 #21539b white white'">
            </meg-icon>
            <span class="text">{{ $t("框选") }}</span>
          </span>
          <span
            :class="{'circle-select': true, active: drawType === 'circle'}"
            @click.stop="handleSelectActions('circle')">
            <meg-icon
              name="Circle_default"
              width="21"
              height="21"
              :color="'#21539b #94a9c9 #21539b white'">
            </meg-icon>
            <span class="text">{{ $t("圈选") }}</span>
          </span>
          <span
            :class="{'polygon-select': true, active: drawType === 'polygon'}"
            @click.stop="handleSelectActions('polygon')">
            <meg-icon
              name="polygon_default"
              width="21"
              height="21"
              :color="'#94a9c9 #21539b white white'">
            </meg-icon>
            <span class="text">{{ $t("多边形选") }}</span>
          </span>
        </div>
      </div>
      <meg-reset-control
        :control-style="{bottom:'90px',right:'10px'}"
        auto-fit-layer="featureLayer">
      </meg-reset-control>
      <meg-zoom-control
        :control-style="{bottom:'20px',right:'10px'}">
      </meg-zoom-control>
    </template>
  </meg-map>
</template>
<script>
import { DEFAULT_OPTIONS } from '@megvii-gis/core-api/lib/Const';
import { deviceStyleFn, clusterLayerFn, deviceSelectedStyleFn } from '../map-style';

export default {
  props: {
    // 限制最小zoom 为兼容大数据量性能
    limitMinZoom: {
      type: Number,
      default: undefined,
    },
  },
  data() {
    return {
      options: DEFAULT_OPTIONS,
      drawType: '',

      cameraOverlayInfo: {
        name: 'overlay'
      },
      cameraOverlayVisible: false,
      cameraOverlayOptions: {
        offset: [0, -35]
      },
      cameraOverlayPosition: null,

      detailOverlayInfo: {},
      detailOverlayVisible: false,
      detailOverlayOptions: {
        offset: [0, -35]
      },
      detailOverlayPosition: null,
      cursor: '',
      limitMergeZoom: 12,
      zoom: 13,
      featureData: [],
    };
  },
  computed: {
    // 矩形
    boxSelectInteractionActive() {
      return this.drawType === 'box';
    },
    // 圆形
    circleSelectInteractionActive() {
      return this.drawType === 'circle';
    },
    // 多边形
    polygonSelectInteractionActive() {
      return this.drawType === 'polygon';
    },
    // 触发框选相机
    isSelectCamera() {
      return this.boxSelectInteractionActive || this.circleSelectInteractionActive || this.polygonSelectInteractionActive;
    },
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    },
  },
  watch: {
    isMerge(isMerge) {
      if (isMerge) {
        this.isMergeTimer = setTimeout(() => {
          this.$refs.featureContainer.clear();
          this.drawType = '';
        }, 300);
      }
    }
  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    const { clusterThreshold, zoom } = this.options;
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;
    // 如果属性值设置最小zoom限制，则使用该值
    if (this.limitMinZoom) this.options.minZoom = this.limitMinZoom;
    this.deviceStyleFn = deviceStyleFn;
    this.deviceSelectedStyleFn = deviceSelectedStyleFn;
    this.clusterLayerFn = clusterLayerFn;
  },
  destroyed() {
    if (this.selectTimer) clearTimeout(this.selectTimer);
    if (this.isMergeTimer) clearTimeout(this.isMergeTimer);
  },

  methods: {
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
        this.cameraOverlayPosition = select.lonLat;
        this.cameraOverlayVisible = true;
        this.cameraOverlayInfo = select;
        this.cursor = 'pointer';
        return;
      }
      this.cursor = '';
      this.cameraOverlayVisible = false;
    },
    /**
     * @description 点选地图上的相机
     * @param {Object} select
     */
    onClickCamera(select) {
      if (select) {
        this.$emit('click-select', select.feature.get('params'));
      }
    },
    /**
     * 相机框选结束事件
     */
    /**
     * @description 相机框选结束事件
     * @param {string} id 特征id
     * @param {Object} feature 特征点
     * @param {Object} featureGeom 特征点坐标
     */
    onSelectDrawEnd(id, feature, featureGeom) {
      const features = this.$refs.pointFeatureLayer.getFeaturesInGeometryExtent(featureGeom.orgGeometry);
      this.$emit('draw-select', features.map((item) => item.get('params')));
      this.selectTimer = setTimeout(() => {
        this.$refs.featureContainer.clear();
        this.drawType = '';
      }, 300);
    },
    /**
     * @description 获取中心点坐标
     * @param [lon:number,lat:number] lonlat 变更后的经纬度
    */
    centerChange([lon, lat]) {
      this.centLonLat = [lon, lat];
    },
    /**
     * @description 显示弹窗
     * @param {Object} feature 特征点
     */
    showOverLayer(feature) {
      if (feature.lon && feature.lat) {
        this.detailOverlayInfo = feature;
        this.detailOverlayVisible = true;
        this.detailOverlayPosition = [feature.lon, feature.lat];
      }
    },
    /**
     * 地图移动到指定位置
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
     * 隐藏弹窗
     */
    hideOverLayer() {
      this.detailOverlayVisible = false;
      this.$refs.clicktInteraction.cancelSelect();
    },
    /**
     * 设置features数据
    */
    setFeatureData(featureData) {
      this.$refs.cluster.setFeatures(featureData);
      this.$refs.device.setFeatures(featureData);
    },
    // 设置选中层features数据
    setSelectedFeatureData(featureData) {
      this.$refs.deviceSelected.setFeatures(featureData);
    },
    handleReady() {
      // map ready事件偶尔不会触发
      this.$emit('map-ready');
    },
    handleSelectActions(type) {
      this.drawType = type;
      if (!this.isMerge) return;
      setTimeout(() => {
        this.$refs.mapView.animate(
          {
            lonlat: this.centLonLat,
            zoom: this.limitMergeZoom + 1,
          }
        );
      }, 0);
    },
  },
};
</script>
<style lang="scss" scoped>
.map-camera-select {
  position: absolute;
  background: #fff;
  left: 20px;
  top: 10px;
  z-index: 1;
  width: 320px;
  display: flex;
  flex-direction: column;
  line-height: 40px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
  .left-trigger {
    line-height: 20px;
    flex: 1;
    display: flex;
    text-align: center;
    > span {
      padding: 10px 0;
      position: relative;
      &:after {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        content: '';
        padding: 10px 0;
        border-right: 1px solid #dce1e5;
      }
      &:last-child{
        &:after {
          display: none;
        }
      }
      &.active{
        background-color: #e6f2ff;
      }
      .text {
        margin-left: 10px;
      }
    }
    .circle-select,
    .frame-select {
      width: 100px;
      cursor: pointer;
    }
    .polygon-select {
      flex: 1;
      cursor: pointer;
    }
  }
  .left-count {
    flex: 1;
    border-top: 1px solid #f3f3f3;
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    box-sizing: border-box;
    line-height: 40px;
    .list {
      position: relative;
      top: -1px;
      margin-left: 10px;
      cursor: pointer;
    }
  }
  .left-selected-wrap {
    border-top: 1px solid #f3f3f3;
  }
  .left-selected-content {
    max-height: 145px;
    line-height: 16px;
    box-sizing: border-box;
    padding: 2px 5px 5px 5px;
    overflow: hidden;
    .camera-tag {
      margin-right: 3px;
      margin-top: 3px;
    }
  }
}
.title-feature {
  padding: 3px;
  background: #fff;
}
</style>
