<template>
  <!-- 综合态势地图 -->
  <map-wrap
    :cursor="isCursor"
    auto-fit-layer="pointFeatureLayer"
    ref="map">
    <!-- 设备态势地图 -->
    <device-layer
      name="pointFeatureLayer"
      :data="featureArray"
      @hover="onDeviceHover"
      @select="onDeviceSelect"></device-layer>
    <template v-slot:overlay>
      <!-- 设备hover弹窗 -->
      <meg-overlay
        name="deviceHoverOverlay"
        :auto-move-center="false"
        :params="deviceHoverData"
        :options="freeInfoOverlayOptions"
        :visible="deviceHoverVisible"
        :position="deviceHoverPosition">
        <template v-slot:default="{params}">
          <slot
            name="deviceHover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- 设备点击弹窗 -->
      <meg-overlay
        name="deviceOverlay"
        :auto-move-center="false"
        :params="deviceSelectData"
        :options="freeInfoOverlayOptions"
        :visible="deviceOverlayVisible"
        :position="deviceOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="deviceSelect"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
    <template v-slot:control>
      <slot name="control"></slot>
    </template>
  </map-wrap>
</template>
<script>
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import deviceLayer from './common/device-layer';

export default {
  components: {
    MapWrap,
    deviceLayer,
  },
  props: {
    deviceData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      freeInfoOverlayOptions: {
        offset: [0, -35],
      },
      deviceSelectData: {},
      deviceOverlayVisible: false,
      deviceOverlayPosition: undefined,

      deviceHoverData: {},
      deviceHoverVisible: false,
      deviceHoverPosition: undefined,
      isCursor: false
    };
  },
  computed: {
    featureArray() {
      return this.deviceData.map((item) => ({
        ...item,
        selected: item.id === this.deviceSelectData.id
      }));
    }
  },
  watch: {
    featureArray() {
      this.$nextTick(() => {
        this.$refs.map.fitForLayer();
      });
    }
  },
  methods: {
    /**
     * 自适应地图
     */
    fitForLayer() {
      this.$refs.map.fitForLayer();
    },
    /**
     * 设备hover
     */
    onDeviceHover(select) {
      if (select) {
        this.isCursor = true;
        this.deviceHoverVisible = true;
        this.deviceHoverPosition = select.featureGeom.lastPosition;
        this.deviceHoverData = select.params;
      } else {
        this.isCursor = false;
        this.deviceHoverVisible = false;
      }
    },
    /**
     * 设备选中
     */
    onDeviceSelect(select) {
      if (select) {
        this.$emit('select-device', select.params);
      }
    },
    /**
     * 隐藏设备选中overlay
     */
    hideDeviceOverlay() {
      this.deviceOverlayVisible = false;
    },
    /**
     * 显示设备选中overlay
     */
    showDeviceOverlay(feature = { lon: '', lat: '' }) {
      const { lon, lat } = feature;
      this.deviceOverlayPosition = [lon, lat];
      this.deviceOverlayVisible = true;
      this.deviceSelectData = feature;
    }
  }
};
</script>
