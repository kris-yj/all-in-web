<template>
  <!--实时报警 报警地图-->
  <map-wrap
    ref="mapView"
    :cursor="isCursor"
    @zoom-changed="zoomChanged"
    :is-visible="isShowMap"
    auto-fit-layer="cameraVectorLayer">
    <camera-layer
      ref="cameraLayer"
      @hover="onCameraHoverChange"
      @select="onCameraClickChange"
      :is-visible="!isMerge&&isShowMap&&!open"></camera-layer>
    <camera-layer
      ref="cameraAnalysisLayer"
      name="cameraAnalysisLayer"
      @hover="onCameraHoverChange"
      @select="onCameraClickChange"
      :is-visible="!isMerge&&isShowMap&&open"></camera-layer>
    <!-- 设备聚类  -->
    <device-merge-layer
      ref="deviceMergeLayer"
      :is-visible="isMerge"></device-merge-layer>

    <!-- 重点单位 -->
    <meg-vector-layer
      name="unitVectorLayer"
      :visible="!isMerge"
      :style-function="unitStyleFn">
      <meg-feature-array
        geom-type="Point"
        ref="unitLayer">
      </meg-feature-array>
      <!-- 重点单位节点hover手势 -->
      <meg-select-interaction
        name="unitHoverSelectInteraction"
        select-type="mouse-move"
        :active-style-function="unitActiveStyleFn"
        @select-change="onCameraHoverChange">
      </meg-select-interaction>
      <!-- 重点单位节点click手势 -->
      <meg-select-interaction
        name="unitClickSelectInteraction"
        :active="isShowMap"
        select-type="single-click"
        :active-style-function="unitActiveStyleFn"
        @select-change="onUnitClickChange">
      </meg-select-interaction>
    </meg-vector-layer>
    <template v-slot:overlay>
      <meg-image-view
        name="mapImageView"
        ref="imageView"
        v-model="isShowScene">
        <!--展示平面图层-->
        <meg-static-image-layer
          v-for="item in planArray"
          :key="item.id"
          :name="item.id"
          :z-index="0"
          v-model="item.selected"
          :url="item.url"
          :size="[item.width,item.height]">
        </meg-static-image-layer>
        <camera-layer
          :z-index="1"
          name="imageVectorLayer"
          :data="featureData"
          @hover="onCameraHoverChange"
          @select="onCameraClickChange"
          :is-visibl="!isMerge&&isShowScene"></camera-layer>
      </meg-image-view>

      <!-- 设备选中弹窗 -->
      <meg-overlay
        name="cameraDetailOverlay"
        auto-move-center
        :params="cameraDetailData"
        :options="cameraOverlayOptions"
        :visible="cameraOverlayVisible"
        :position="cameraOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="select"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- 设备hover弹窗 -->
      <meg-overlay
        name="cameraNameOverlay"
        :params="cameraInfo"
        :options="cameraOverlayOptions"
        :visible="cameraNameVisible"
        :position="cameraNamePosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <overlay-list
        :is-visible="true"
        :auto-fit="false"
        :options="{autoPan:false}"
        :data="alarmList">
        <template v-slot:list="{params}">
          <slot
            name="alarm"
            :params="params"></slot>
        </template>
      </overlay-list>
    </template>
    <!-- 控件插槽 -->
    <template slot="control">
      <slot name="control"></slot>
      <select-toolbar
        @filter-change="filterChange"
        @change="statusChange"></select-toolbar>
      <meg-button
        v-show="isShowScene"
        @click="exitImage"
        type="danger"
        class="scene-exit">
        退出
      </meg-button>
      <map-scene-setting
        ref="scenes"
        :scene-data="planList"
        @scene-change="sceneChange"
        @scene-select-changed="selectPlans"
        class="place-list"></map-scene-setting>
      <!-- 位置重置控件 -->
      <meg-reset-control
        v-if="!isShowScene"
        :control-style="{bottom:'190px',right:'10px'}"
        auto-fit-layer="cameraVectorLayer">
      </meg-reset-control>
      <meg-reset-control
        v-show="isShowScene"
        :control-style="{bottom:'190px',right:'10px'}"
        auto-fit-layer="imageVectorLayer">
      </meg-reset-control>
      <!-- zoom控件 -->
      <meg-zoom-control
        :control-style="{bottom:'120px',right:'10px'}">
      </meg-zoom-control>
    </template>
  </map-wrap>
</template>
<script>
import MapSceneSetting from './common/map-scene-setting';
import OverlayList from './common/overlay-list';
import MapWrap from './common/map-wrap';
import DeviceMergeLayer from './common/device-merge-layer';
import CameraLayer from './common/camera-layer';
import SelectToolbar from './common/select-toolbar';
import {
  unitStyleFn,
  unitActiveStyleFn
} from './styles/common';
import MapSrv from './common/meg-map.service';

export default {
  components: {
    MapSceneSetting,
    OverlayList,
    MapWrap,
    DeviceMergeLayer,
    CameraLayer,
    SelectToolbar
  },
  props: {
    featureArray: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      open: true,
      // 地图实时报警
      alarmList: [],
      // 限制显示聚合zoom 为兼容大数据量性能
      limitMergeZoom: 12,
      // 自由弹窗
      freeInfo: {},
      freeInfoOverlayOptions: {
        offset: [0, -20],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,
      isShowMap: true,
      isShowScene: false,
      // 设备信息
      cameraInfo: {},
      cameraDetailData: {},
      cameraOverlayOptions: {
        offset: [0, -35],
      },
      // 区域关联图层数据
      unitData: {
        'cameras': [],
        'plans': [],

      },
      cameraNameVisible: false,
      cameraNamePosition: undefined,
      cameraOverlayVisible: false,
      cameraOverlayPosition: undefined,
      planMap: new Map(),
      planArray: [],
      targetSceneId: '',
      isCursor: false,
      zoom: 13
    };
  },
  computed: {
    // 平面图相机标注数据
    featureData() {
      if (this.planMap.has(this.targetSceneId)) {
        return this.planMap.get(this.targetSceneId).linkCameras.map((item) => ({
          ...item,
          unitId: this.unitData.unitId,
          lon: item.linkPlan.leftPixel,
          lat: item.linkPlan.topPixel,
          selected: this.cameraDetailData.id === item.id
        }));
      }
      return [];
    },
    // 平面图列表
    planList() {
      return [...this.planMap.values()];
    },
    // 是否显示聚合图层
    isMerge() {
      return this.zoom <= this.limitMergeZoom;
    }
  },
  watch: {
    'alarmList.length': function () {
      if (this.alarmList.length && !this.timer) {
        this.timer = setInterval(() => {
          this.loopAlarmList();
        }, 1000);
      }
      if (this.timer && !this.alarmList.length) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  },
  destroyed() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    const { clusterThreshold, zoom } = this.options;
    this.limitMergeZoom = clusterThreshold;
    this.zoom = zoom;

    this.unitStyleFn = unitStyleFn;
    this.unitActiveStyleFn = unitActiveStyleFn;
    this.initPlanMap();
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
      this.$refs.cameraLayer.setFeature(data);
      this.$refs.cameraAnalysisLayer.setFeature(data.map((item) => ({ ...item, analysis: true })));
      this.$refs.deviceMergeLayer.setFeature(data);
    },
    /**
     * 外部设置设备数据
     */
    setFeature(data) {
      const cameraList = [];
      const unitList = [];
      data.forEach((val) => {
        if (val.lon && val.lat && !val.unitId && val.flag === 'camera') {
          cameraList.push({
            ...val
          });
        } else if (val.lon && val.lat && val.flag === 'unit') {
          unitList.push({
            id: val.id,
            coordinates: [val.lon, val.lat],
            params: {
              ...val
            }
          });
        }
      });
      this.featureUnityArray = unitList;
      this.$refs.cameraLayer.setFeature(cameraList);
      this.$refs.cameraAnalysisLayer.setFeature(cameraList.map((item) => ({ ...item, analysis: true })));
      this.$refs.deviceMergeLayer.setFeature(cameraList);
      this.$refs.unitLayer.setFeatures(unitList);
    },
    /**
     * 鼠标移上地图
     */
    onCursorChange(isCursorPointer) {
      this.isCursor = isCursorPointer;
    },
    /**
     * 缩放事件
     */
    zoomChanged(zoom) {
      this.zoom = zoom;
    },
    /**
     * 平台图数据更新
     */
    sceneChange(list) {
      this.planArray = list;
    },
    /**
     * 初始化
     */
    initPlanMap() {
      if (!this.unitData.plans) {
        this.planMap.clear();
        return;
      }
      const planMap = new Map();
      this.unitData.plans.forEach((val) => {
        planMap.set(val.id, { ...val, linkCameras: [] });
      });
      const arr = [].concat(this.unitData.cameras);
      arr.forEach((val) => {
        if (val.linkPlans.length) {
          val.linkPlans.forEach((item) => {
            const unitData = planMap.get(item.planId) || { linkCameras: [] };
            unitData.linkCameras.push({
              ...val,
              linkPlan: item
            });
            planMap.set(item.planId, unitData);
          });
        }
      });
      this.planMap = planMap;
    },
    /**
     * 设备click事件
     */
    onCameraClickChange(select) {
      if (select) {
        this.$emit('select', {
          ...select.params,
          lonLat: select.lonLat
        });
      } else {
        this.hideCameraOverlay();
      }
    },
    // 设备hover选择事件回调
    onCameraHoverChange(select) {
      if (select) {
        this.cameraInfo = select.params;
        this.cameraNamePosition = select.lonLat;
        this.onCursorChange(true);
        this.cameraNameVisible = true;
      } else {
        this.cameraNameVisible = false;
        this.onCursorChange(false);
      }
    },
    /**
     * 退出平面图
     */
    exitImage() {
      this.isShowScene = false;
      this.isShowMap = true;
      this.targetSceneId = '';
      this.cameraDetailData = {};
      this.cameraOverlayVisible = false;
      this.initPlanMap();
      this.$refs.scenes.resetSelect();
    },
    /**
     * 选中区域平面图
     * @param {Object} scene 当前选中的平面图
     * @param {Array} list 更新后的平面图列表
     */
    selectPlans(scene, list) {
      this.alarmList = [];
      this.isShowScene = true;
      this.isShowMap = false;
      this.targetSceneId = scene.id;
      this.planArray = list;
    },
    /**
     * 重点单位click事件
     */
    async onUnitClickChange(select) {
      if (select) {
      // 选中区域先关闭相机详情
        this.cameraDetailData = {};
        this.cameraOverlayVisible = false;
        const res = await MapSrv.getPlanListForScene({ id: select.params.id });
        if (res.code !== 0) {
          this.$message.error(res.msg);
          return;
        }
        this.unitData = res.data;
        this.initPlanMap();
      } else {
        this.unitData = {
          'cameras': [],
          'plans': [],
        };
        this.initPlanMap();
      }
    },

    /**
     * 打开相机自由弹窗
     * 处理地图定位
     */
    showCameraOverlay(data = {}) {
      // 非平面图模式
      if (!this.isShowScene) {
        this.cameraDetailData = data;
        let unit = '';
        if (data.unitId) {
          unit = this.featureUnityArray.find((item) => item.id === data.unitId);
        }
        if (unit) {
          const [lon, lat] = unit.coordinates;
          data.lon = lon;
          data.lat = lat;
        }
        this.cameraOverlayPosition = [data.lon, data.lat];
        this.$refs.mapView.moveTo(this.cameraOverlayPosition);
        this.cameraOverlayVisible = true;
      }

      // 平面图模式且当前设备在平面图下
      if (this.isShowScene) {
        if (data.unitId === this.unitData.unitId) {
          this.cameraDetailData = { ...data };
          const featureData = this.featureData.find((items) => items.id === data.id) || {};
          this.cameraOverlayPosition = [featureData.linkPlan.leftPixel, featureData.linkPlan.topPixel];
          this.$refs.imageView.moveTo(this.cameraOverlayPosition);
          this.cameraOverlayVisible = true;
        } else {
          this.cameraDetailData = {};
          this.cameraOverlayVisible = false;
        }
      }
    },
    /**
     * 关闭相机自由弹窗
     */
    hideCameraOverlay() {
      this.cameraDetailData = {};
      if (this.open) {
        this.$refs.cameraAnalysisLayer.cancelSelect();
      } else {
        this.$refs.cameraLayer.cancelSelect();
      }
      this.cameraOverlayVisible = false;
    },
    /**
     * 轮训报警列表清除失效报警
     */
    loopAlarmList() {
      this.alarmList.forEach((item) => {
        item.time -= 1;
      });
      this.alarmList = this.alarmList.filter((item) => item.time > 0);
    },
    /**
     * 添加报警弹窗队列
     */
    onAddFeature(alarmData) {
      alarmData.forEach((item) => {
        item.unitId = item.unitId || item.camera.unitId;
        if (this.alarmList.length >= this.maxFeatureNum) {
          this.alarmList.pop();
        }
        // 如果是平面图模式下，属于当前重点单位显示报警
        if ((item.unitId === this.unitData.unitId) && this.isShowScene) {
          const featureData = this.featureData.find((items) => items.id === item.camera.id) || {};
          if (featureData.linkPlan && featureData.linkPlan.leftPixel && featureData.linkPlan.topPixel) {
            this.alarmList.unshift({
              ...item,
              lon: featureData.linkPlan.leftPixel,
              lat: featureData.linkPlan.topPixel,
              time: 5
            });
          }

          return;
        }
        // 地图模式下，归属于重点单位的相机参数的报警显示在重点单位上
        if (item.unitId && this.isShowMap) {
          const { params } = this.featureUnityArray.find((items) => items.id === item.unitId) || { params: {} };
          if (params.lon && params.lat) {
            this.alarmList.unshift({
              ...item,
              lon: params.lon,
              lat: params.lat,
              time: 5
            });
            this.animate({
              lon: params.lon,
              lat: params.lat
            });
          }

          return;
        }
        // 瓦片地图模式下直接移动到相机中心点
        if (!item.unitId && this.isShowMap && item.camera.lon && item.camera.lat) {
          this.alarmList.unshift({
            ...item,
            lon: item.camera.lon,
            lat: item.camera.lat,
            time: 5
          });
          this.animate({
            lon: item.camera.lon,
            lat: item.camera.lat
          });
        }
      });
    },
    /**
     * 报警产生后移动到指定位置
     */
    animate({ lon = '', lat = '' }) {
      this.$nextTick(() => {
        this.$refs.mapView.animate({
          lonlat: [lon, lat],
          zoom: this.options.zoom,
        });
      });
    },
    /**
     * 点击相机地图移动到指定位置
     */
    moveTo({ lon = '', lat = '' }) {
      console.log(lon, lat);
      if (!lon || !lat) return;
      this.$refs.mapView.moveTo([lon, lat]);
    },
  },

};
</script>
<style scoped>
  .place-list {
    position: absolute;
    z-index: 100;
    right: 10px;
    bottom: 240px;
  }
  .scene-exit {
    position: absolute;
    top: 10px;
    left: 50%;
    z-index: 100;
    margin-left: -34px;
  }
</style>
