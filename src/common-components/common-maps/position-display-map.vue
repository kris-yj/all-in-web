<template>
  <!-- 定位地图 -->
  <map-wrap
    ref="mapView"
    is-zoom>
    <position :feature-data="featureData"></position>
    <template v-slot:overlay>
      <!-- 自由信息弹窗 -->
      <meg-overlay
        name="freeInfoOverlay"
        auto-move-center
        :params="featureData"
        :options="freeInfoOverlayOptions"
        :visible="!!freeInfoOverlayPosition"
        :position="freeInfoOverlayPosition">
        <template v-slot:default="{params}">
          <slot
            name="overlay"
            :params="params">
          </slot>
        </template>
      </meg-overlay>
    </template>
  </map-wrap>
</template>
<script>
// eslint-disable-next-line import/no-unresolved
import Position from './common/position-layer';
// eslint-disable-next-line import/no-unresolved
import MapWrap from './common/map-wrap';

export default {
  name: 'PositionDisplayMap',
  components: {
    Position,
    MapWrap
  },
  props: {
    featureData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      freeInfoOverlayOptions: {
        offset: [0, -30],
      },
    };
  },
  computed: {
    freeInfoOverlayPosition() {
      const { lon = '', lat = '' } = this.featureData;
      if (lon && lat) return [lon, lat];
      return undefined;
    }
  },
  watch: {
    featureData() {
      this.$nextTick(() => {
        this.$refs.mapView.fitForLayer();
      });
    }
  },
  created() {
  },
  methods: {
  }
};
</script>
