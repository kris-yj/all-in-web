<template>
  <div class="camera-space-time-map">
    <meg-map
      ref="cameraMap">
      <meg-tile-view
        name="mapView"
        ref="tileView"
        @zoom-changed="zoomChanged"
        :type="options.type"
        :zoom="options.zoom"
        :extent="options.extent"
        :center="options.center"
        :min-zoom="options.minZoom"
        :max-zoom="options.maxZoom"
        auto-fit-layer="vectorLayer">
        <meg-tile-layer
          :type="options.type"
          :url="options.url"
          :extent="options.extent"
          :min-zoom="options.minZoom"
          :max-zoom="options.maxZoom"
          name="mapLayer">
        </meg-tile-layer>
        <!-- 相机图标展示层 -->
        <meg-vector-layer
          name="cameraLayer"
          ref="deviceNodeLayer"
          :visible="!isMerge"
          :style-function="cameraSpaceTimeStyleFn">
          <meg-feature-array
            ref="deviceLayer"
            name="deviceNodeFeatures"
            type="Point">
          </meg-feature-array>
          <meg-select-interaction
            name="selectInteraction"
            select-type="mouse-move"
            @select-change="onHoverSelectChange">
          </meg-select-interaction>
        </meg-vector-layer>
        <!-- 设备选中图层 -->
        <meg-vector-layer
          name="pointSelectedFeatureLayer"
          :visible="!isMerge"
          :style-function="cameraSpaceTimeStyleFn">
          <meg-feature-array
            ref="deviceSelected"
            geom-type="Point">
          </meg-feature-array>
        </meg-vector-layer>
        <!-- 设备聚类  -->
        <meg-cluster-layer
          name="clusterLayer"
          :visible="isMerge"
          :style-function="clusterLayerFn">
          <meg-feature-array
            ref="deviceMergeLayer"
            geom-type="Point">
          </meg-feature-array>
        </meg-cluster-layer>
        <!-- 修改半径交互层 -->
        <meg-vector-layer
          name="radiusLayer"
          :style-function="styleLayerFn">
          <meg-feature
            ref="radius"
            :geometry="geom">
          </meg-feature>
          <meg-modify-interaction
            name="modifyInteraction"
            :snap-pixel="50"
            @modify-end="modifyEnd"
            :active="interactionModifyActive">
          </meg-modify-interaction>
        </meg-vector-layer>
      </meg-tile-view>
      <meg-overlay
        name="mapOverlay"
        :params="overlayInfo"
        :options="overlayOptions"
        :visible="overlayVisible"
        :position="overlayPosition">
        <template v-slot:default="{params}">
          <div
            class="overlay">
            {{ params.name }}
            <div class="triangle"></div>
          </div>
        </template>
      </meg-overlay>
    </meg-map>
    <div
      class="megmap-interact-select middle"
      :class="interactionModifyActive?'active':''"
      @click="openCircleDrawType">
      <i> <meg-icon
        name="Circle_default"
        width="20px"
        height="20px"
        color="#94a9c9 #21539b #21539b white">
      </meg-icon>
      </i>
      <span>{{ $t('圈选') }}</span>
    </div>
  </div>
</template>
<script>
import { cameraSpaceTimeStyleFn, styleLayerFn, clusterLayerFn } from './styles/space-time';

export default {
  name: 'CameraSpaceTimeMap',
  components: {},
  props: {
    cameraInfo: {
      type: Object,
      default: () => {}
    },
  },
  data() {
    return {
      featureData: [],
      cameraSpaceTimeStyleFn,
      styleLayerFn,
      clusterLayerFn,
      overlayInfo: {},
      overlayPosition: [],
      overlayOptions: {
        offset: [0, -50]
      },
      interactionModifyActive: false,
      geom: {
        type: 'Circle',
        coordinates: {
          center: [116.397458, 39.908697],
          radius: 0.001
        }
      },
      init: false,
      // geom: undefined,
      featureDataMap: {},
      overlayVisible: false,
      limitMergeZoom: 12,
      zoom: 13,
    };
  },
  computed: {
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    },
  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    const { clusterThreshold, zoom } = this.options;
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;
  },
  mounted() {
    if (this.cameraInfo && this.cameraInfo.lon && this.cameraInfo.lat) {
      this.$refs.tileView.moveTo([Number(this.cameraInfo.lon), Number(this.cameraInfo.lat)]);
    }
  },
  methods: {
    /**
     * 外部设置渲染设备点
     */
    setFeatures(data = []) {
      const list = [];
      data.forEach((val) => {
        if (val.lon && val.lat) {
          list.push(
            {
              id: val.id,
              type: 'Point',
              coordinates: [Number(val.lon), Number(val.lat)],
              params: val
            }
          );
        }
      });
      this.$refs.deviceLayer.setFeatures(list);
      this.$refs.deviceMergeLayer.setFeatures(list);
      this.geom = {
        type: 'Circle',
        coordinates: {
          center: [Number(this.cameraInfo.lon), Number(this.cameraInfo.lat)],
          radius: this.cameraInfo.shapeValue / 1000 || 0.2
        }
      };
    },
    // 设置选中层features数据
    setSelectedFeatureData(data) {
      const list = [];
      data.forEach((val) => {
        list.push({
          id: val.id,
          type: 'Point',
          coordinates: [Number(val.lon), Number(val.lat)],
          params: {
            ...val.params,
            selected: true
          }
        });
      });
      this.$refs.deviceSelected.setFeatures(list);
    },
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    moveTo(cameraPosition) {
      // debugger;
      if (cameraPosition.lon && cameraPosition.lat) {
        this.$refs.tileView.moveTo([cameraPosition.lon, cameraPosition.lat]);
        this.onHoverSelectChange(cameraPosition);
      }
    },
    /**
     * @description
     * @param {any}
     * @returns
     */
    // geomChanged(...argu) {
    //   if (!this.init) {
    //     // this.getFeatures(argu[2]);
    //     this.init = true;
    //   }
    // },
    /**
     * @description 修改交互事件结束
     * @param {number} id 新绘制标注的id
     * @param {object} olFeature 原始ol标注对象，用于深层操作
     * @param {object} featureGeom 标注的地理几何信息
     */
    modifyEnd(...argu) {
      this.sendRadius(argu[2]);
      this.interactionModifyActive = false;
    },
    /**
     * @description 向外发送radius
     * @param {object} featureGeom 标注的地理几何信息
     * @returns
     */
    sendRadius(featureGeom) {
      this.$emit('radius-change', featureGeom.geometry.coordinates.radius * 1000);
    },
    /**
     * @description 开启圈选
     */
    openCircleDrawType() {
      this.interactionModifyActive = true;
    },
    /**
     * @description 鼠标hover相机点位时
     * @param {object} select 选中标注信息
     * @returns
     */
    onHoverSelectChange(select) {
      if (select) {
        this.overlayInfo = select;
        this.overlayPosition = [select.lon, select.lat];
        this.overlayVisible = true;
        return;
      }
      this.overlayVisible = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.camera-space-time-map {
  position: relative;
  height: 100%;
  width: 100%;
  .overlay {
    width: 130px;
    // height: 40px;
    line-height: 40px;
    font-size: 12px;
    background: #fff;
    color: #444;
    text-align: center;
    position: relative;
    box-shadow: 0 3px 1px rgba(0, 0, 0, 0.1);
    .triangle {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      display: block;
      // height: 0;
      // width: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid white;
    }
  }
    .megmap-interact-select {
    height: 34px;
    line-height: 34px;
    position: absolute;
    top: 10px;
    border-radius: 2px;
    padding: 0 10px;
    font-size: 14px;
    color: #21539b;
    border: 1px #a5bed5 solid;
    background-color: #fff;
    cursor: pointer;
    box-shadow: 0 3px 1px rgba(0, 0, 0, 0.1);

    &.middle {
      right: 20px;
    }
    &.active {
      background-color: #21539b;
      color: #fff;
    }
  }
}
</style>
