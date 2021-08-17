<template>
  <map-wrap
    ref="mapView"
    is-zoom
    auto-fit-layer="featureLayer">
    <camera-layer
      :draw-type="drawType"
      @draw-select="onSelectDrawEnd"
      @hover="hoverCamera"
      @select="onClickCamera"
      :data="deviceArray"></camera-layer>
    <!-- 区框选图层 -->
    <area-layer
      :data="lineList"
      ref="selectInteraction"
      @on-draw-end="onDrawEnd"
      @on-feature-add="onFeatureAdd"
      @select="onSelectChange"
      :is-draw="interactionActive"
      :is-select="isEdit"></area-layer>
    <!-- 地图控件插槽 -->
    <template slot="control">
      <div
        class="map-camera-select"
        v-show="!isEdit">
        <div class="left-trigger">
          <span
            class="frame-select"
            @click.stop="drawType ='Box'">
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
            @click.stop="drawType = 'Circle'">
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
            @click.stop="drawType = 'Polygon'">
            <meg-icon
              name="polygon_default"
              width="21"
              height="21"
              :color="'#94a9c9 #21539b white white'">
            </meg-icon>
            <span class="text">多边形选择</span>
          </span>
        </div>
      </div>
      <meg-button
        v-show="!isSelectCamera&&isEdit&&!interactionActive"
        @click.native.stop="activeLocation"
        class="position-select">
        绘制
      </meg-button>
      <meg-button
        v-show="!isSelectCamera"
        @click.stop="isEdit = true "
        v-if="!isEdit"
        class="position-edit">
        绘制区域范围
      </meg-button>
      <meg-button
        v-else
        v-show="!interactionActive"
        @click.stop="exitDrop"
        class="position-exit">
        退出绘制
      </meg-button>
    </template>
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
          <img
            :src="deleteImg" />
        </div>
      </template>
    </meg-overlay>
  </map-wrap>
</template>
<script>

import deleteImg from './images/delete.svg';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import CameraLayer from './common/camera-layer';
// eslint-disable-next-line import/no-unresolved
import AreaLayer from './common/area-layer';

export default {
  components: {
    MapWrap,
    CameraLayer,
    AreaLayer
  },
  props: {
    featureArray: {
      type: Array,
      default: () => []
    },
    lineList: {
      type: Array,
      default: () => []
    },
    // 限制最小zoom 为兼容大数据量性能
    limitMinZoom: {
      type: Number,
      default: undefined,
    },
    activeFeature: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      deleteImg,
      interactionActive: false,
      drawType: '',
      isEdit: false,
      overlayVisible: false,
      overlayOptions: {
        offset: [0, 7]
      },
      overlayPosition: null,
      lastFeatureId: '',
      cameraOverlayInfo: {
        name: 'overlay'
      },
      cameraOverlayVisible: false,
      cameraOverlayOptions: {
        offset: [0, -35]
      },
      cameraOverlayPosition: null,
    };
  },
  computed: {
    deviceArray() {
      const { featureArray } = this;
      return featureArray.map((item) => ({
        ...item,
        selected: this.activeFeature.indexOf(item.id) >= 0
      }));
    },
    isSelectCamera() {
      return !!this.drawType;
    },
  },
  created() {
    // 如果属性值设置最小zoom限制，则使用该值
    if (this.limitMinZoom) this.options.minZoom = this.limitMinZoom;
  },
  methods: {
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
     * 退出地图绘制
     */
    exitDrop() {
      this.isEdit = false;
      this.$refs.selectInteraction.cancelSelect();
    },
    /**
     * 点选地图上的相机
     */
    onClickCamera(select) {
      if (select) {
        this.$emit('select', [select.feature.get('params')]);
      }
    },
    /**
     * 点击删除当前选中的区域范围
     */
    deleteFeature() {
      this.$refs.selectInteraction.cancelSelect();
      const array = [...this.lineList];
      array.splice(this.lastFeatureId, 1);
      this.$emit('draw-change', array);
    },
    /**
     * 点选区域
     */
    onSelectChange(select) {
      if (select) {
        this.lastFeatureId = select.params.id;
        this.overlayPosition = select.featureGeom.lastPosition;
        this.overlayVisible = true;
        return;
      }
      this.overlayVisible = false;
    },
    /**
     * 新增区域范围事件
     */
    onFeatureAdd(feature) {
      this.$emit('draw-change', feature.coordinates);
    },
    /**
     * 开启标记区域范围
     */
    activeLocation() {
      this.interactionActive = true;
    },

    /**
     * 区域框选结束事件
     */
    onDrawEnd() {
      this.interactionActive = false;
    },
    /**
     * 相机框选结束事件
     */
    onSelectDrawEnd(features) {
      this.$emit('select', features);
      this.drawType = '';
    },
    /**
     * 地图自适应
     */
    fitForLayer() {
      this.$refs.mapView.fitForLayer();
    }

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
.delete-feature {
  width: 18px;
  height: 18px;
  cursor: pointer;
}
</style>
