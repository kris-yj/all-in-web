<template>
  <!-- 区域碰撞详情地图 -->
  <map-wrap
    ref="mapView"
    is-zoom
    @zoom-changed="zoomChanged"
    :limit-min-zoom="limitMinZoom"
    auto-fit-layer="featureLayer">
    <camera-layer
      ref="deviceLayer"
      @hover="hoverCamera"
      :is-visible="!isMerge"></camera-layer>
    <camera-layer
      name="activeLayer"
      ref="activeLayer"
      is-selected
      :is-visible="!isMerge"></camera-layer>
    <!-- 设备聚类  -->
    <device-merge-layer
      ref="deviceMergeLayer"
      :is-visible="isMerge"></device-merge-layer>
    <meg-vector-layer
      name="featureLayer"
      :style-function="lineStyleLayerFn"
      ref="featureLayer">
      <meg-feature-collection
        name="collection"
        :feature-data="lineGeomData">
      </meg-feature-collection>
    </meg-vector-layer>
    <meg-overlay-list
      name="mapOverlayList"
      :capacity="5"
      :auto-fit="false"
      :options="{autoPan: false}"
      :overlay-list="overlayList"
      :visible="true">
      <template v-slot:default="{params}">
        <div
          v-if="params.params && params.params.id"
          class="overlay">
          {{ `${$t("区域")}${params.params.id}` }}
        </div>
      </template>
    </meg-overlay-list>
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
  </map-wrap>
</template>
<script>
import { lineStyleLayerFn, lineActiveStyleFn } from './styles/common';
import MapWrap from './common/map-wrap';
import CameraLayer from './common/camera-layer';
import DeviceMergeLayer from './common/device-merge-layer';

export default {
  name: 'AreaDisplayMap',
  components: {
    MapWrap,
    CameraLayer,
    DeviceMergeLayer
  },
  props: {
    // 限制最小zoom 为兼容大数据量性能
    limitMinZoom: {
      type: Number,
      default: undefined,
    },
    // 当前区域数据
    areasData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isEdit: false,

      overlayOptions: {
        offset: [0, 7]
      },

      // 相机名称信息
      cameraOverlayInfo: {
        name: 'overlay'
      },
      cameraOverlayVisible: false,
      cameraOverlayOptions: {
        offset: [0, -35]
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

    // 区域范围数据
    lineGeomData() {
      const areasData = this.areasData.filter((item) => item.regionLocation);
      console.log(areasData);
      return areasData.map((item, index) => {
        const data = JSON.parse(item.regionLocation);
        return {
          params: { id: index + 1 },
          geometry: data
        };
      });
    },
    overlayList() {
      if (this.lineGeomData.length) {
        return this.lineGeomData.map((item) => ({
          position: item.geometry.lastPosition,
          params: item
        }));
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
    this.lineActiveStyleFn = lineActiveStyleFn;
    this.featureMap = {};
  },
  methods: {
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
     * 地图自适应
     */
    fitForLayer() {
      this.$refs.mapView.fitForLayer();
    },

  },
};
</script>
<style lang='scss' scoped>
.position-select,
.position-edit,
.position-exit {
  position: absolute;
  right: 20px;
  top: 10px;
  z-index: 100;
}
.position-select {
  right: 150px;
}
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
    padding: 10px 0;
    flex: 1;
    display: flex;
    text-align: center;
    > span {
      border-right: 1px solid #dce1e5;
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
.overlay {
  padding: 5px;
  background: rgb(253, 74, 74);
  color: #fff;
}
</style>
