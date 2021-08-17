<template>
  <meg-map
    :plugins="plugins"
    :cursor="cursor?'pointer':''"
    @ready="ready">
    <!-- 地图视图 -->
    <meg-tile-view
      name="mapView"
      @center-changed="centerChange"
      ref="mapView"
      :auto-fit-layer="autoFitLayer"
      :type="options.type"
      :zoom="options.zoom"
      :center="options.center"
      :extent="options.extent"
      :min-zoom="options.minZoom"
      v-model="isVisible"
      @zoom-changed="zoomChanged"
      :max-zoom="options.maxZoom">
      <!-- 瓦片图层 -->
      <meg-tile-layer
        name="tileLayer"
        :type="options.type"
        :url="options.url"
        :extent="options.extent"
        :min-zoom="options.minZoom"
        :max-zoom="options.maxZoom">
      </meg-tile-layer>
      <slot></slot>
    </meg-tile-view>
    <slot name="overlay"></slot>
    <template slot="control">
      <slot name="control"></slot>
      <!-- 位置重置控件 -->
      <meg-reset-control
        v-if="isZoom"
        :control-style="{bottom:'90px',right:'10px'}"
        :auto-fit-layer="autoFitLayer">
      </meg-reset-control>
      <!-- zoom控件 -->
      <meg-zoom-control
        v-if="isZoom"
        :control-style="{bottom:'20px',right:'10px'}">
      </meg-zoom-control>
    </template>
  </meg-map>
</template>

<script>
import { DEFAULT_OPTIONS } from '@megvii-gis/core-api/lib/Const';

export default {
  props: {
    autoFitLayer: {
      type: String,
      default: 'featureLayer'
    },
    isZoom: {
      type: Boolean,
      default: false
    },
    limitMinZoom: {
      type: Number,
      default: 0
    },
    cursor: {
      type: Boolean,
      default: false
    },
    theme: {
      type: Number,
      default: 1
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    plugins: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      options: DEFAULT_OPTIONS,
    };
  },
  created() {
    const systemConfig = this.$getMegviiGisSystemOptions();
    systemConfig.theme = this.theme;
    this.options = this.$adaptConfigForMegviiGisSystem(systemConfig);
    // 如果属性值设置最小zoom限制，则使用该值
    if (this.limitMinZoom) this.options.minZoom = this.limitMinZoom;
  },
  methods: {
    ready() {
      this.$emit('ready');
    },
    fitForLayer() {
      this.$refs.mapView.fitForLayer();
    },
    zoomChanged(zoom) {
      this.$emit('zoom-changed', zoom);
    },
    moveTo([lon, lat]) {
      this.$refs.mapView.moveTo([lon, lat]);
    },
    animate(options) {
      this.$refs.mapView.animate(options);
    },
    centerChange(lonlat) {
      this.$emit('center-changed', lonlat);
    }
  }
};
</script>

<style lang='scss' scoped>

</style>
