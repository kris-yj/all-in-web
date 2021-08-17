<template>
  <!-- 区域态势地图 -->
  <map-wrap auto-fit-layer="highLayer">
    <region-layer
      name="highLayer"
      :data="featureArray"
      ref="selectInteraction"
      :is-auto-select="false"
      @hover="onHoverChange"
      @select="onSelectChange"></region-layer>
    <template v-slot:overlay>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        :params="freeInfoData"
        :options="freeInfoOverlayOptions"
        :visible="freeInfoOverlayVisible"
        :position="freeInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
      <!-- hover弹窗 -->
      <meg-overlay
        name="hoverOverlay"
        :auto-move-center="false"
        :params="hoverData"
        :options="freeInfoOverlayOptions"
        :visible="hoverVisible"
        :position="hoverPosition">
        <template v-slot:default="{params}">
          <slot
            name="hover"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
  </map-wrap>
</template>
<script>
import { calcBBox } from '@megvii-gis/calc-api';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';
// eslint-disable-next-line import/no-unresolved
import regionLayer from './common/region-layer';

export default {
  components: {
    MapWrap,
    regionLayer
  },
  props: {

    regionData: {
      type: Array,
      default: () => []
    },
    isAutoClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      freeInfoOverlayOptions: {
        offset: [0, -5],
      },
      freeInfoOverlayVisible: false,
      freeInfoOverlayPosition: undefined,
      freeInfoData: {},

      hoverData: {},
      hoverVisible: false,
      hoverPosition: undefined
    };
  },
  computed: {
    featureArray() {
      return this.regionData.map((item) => ({
        ...item,
        selected: item.id === this.freeInfoData.id
      }));
    }
  },
  created() {
  },
  methods: {
    /**
     * 选中区域事件
     */
    onSelectChange(select) {
      if (select) {
        this.$emit('select', {
          ...select.params,
          centerPosition: select.centerPosition
        });
        return;
      }
      if (this.isAutoClose) {
        this.hideFreeOverlay();
        this.$emit('close');
      }
    },

    /**
     * 鼠标移上区域事件
     */
    onHoverChange(select) {
      if (select) {
        this.hoverVisible = true;
        this.hoverPosition = select.centerPosition;
        this.hoverData = select.params;
      } else {
        this.hoverVisible = false;
      }
    },
    /**
     * 显示overlay弹窗
     */
    showFreeOverlay(feature) {
      /**
       * 如果外部传入可能没有中心点坐标
       */
      if (!feature.centerPosition) {
        const bbox = calcBBox([{
          type: 'Polygon',
          coordinates: feature.coordinates,
          params: feature
        }]);
        const [,, leftTop, rightTop] = bbox.coordinates[0];
        feature.centerPosition = [(rightTop[0] + leftTop[0]) / 2, leftTop[1]];
        this.$refs.selectInteraction.select(feature.id);
      }

      this.freeInfoOverlayPosition = feature.centerPosition;
      this.freeInfoData = feature;

      this.freeInfoOverlayVisible = true;
    },
    /**
     * 隐藏overlay弹窗
     */
    hideFreeOverlay() {
      this.freeInfoOverlayVisible = false;
      this.freeInfoData = {};
      this.$refs.selectInteraction.cancelSelect();
    },

  }
};
</script>
