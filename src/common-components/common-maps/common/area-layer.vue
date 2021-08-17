<template>
  <div>
    <meg-vector-layer
      name="interactionLayer"
      :style-function="lineStyleLayerFn">
      <meg-feature-container
        name="featureContainer"
        ref="featureContainer"
        @feature-add="onFeatureAdd">
      </meg-feature-container>
      <!-- 区域框选手势标注容器 -->
      <meg-draw-interaction
        name="drawInteraction"
        :active="isDraw"
        draw-type="Polygon"
        @draw-end="onDrawEnd">
      </meg-draw-interaction>
    </meg-vector-layer>
    <meg-vector-layer
      name="featureLayer"
      :style-function="lineStyleLayerFn"
      ref="featureLayer">
      <meg-feature-array
        geom-type="Polygon"
        :feature-data="lineGeomData">
      </meg-feature-array>
      <meg-select-interaction
        name="selectInteraction"
        ref="selectInteraction"
        select-type="click"
        :active="isSelect"
        :active-style-function="lineActiveStyleFn"
        @select-change="onSelectChange">
      </meg-select-interaction>
    </meg-vector-layer>
  </div>
</template>

<script>
import { lineStyleLayerFn, lineActiveStyleFn } from '../styles/common';

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    isSelect: {
      type: Boolean,
      default: false
    },
    isDraw: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {

    };
  },
  computed: {
    lineGeomData() {
      return this.data.map((item, index) => ({
        params: { id: index },
        coordinates: item
      }));
    }
  },
  created() {
    this.lineStyleLayerFn = lineStyleLayerFn;
    this.lineActiveStyleFn = lineActiveStyleFn;
  },
  methods: {
    /**
     * feature有新增时
     */
    onFeatureAdd(id, feature, featureGeom) {
      this.$emit('on-feature-add', featureGeom.geometry);
      this.$nextTick(() => {
        this.$refs.featureContainer.clear();
      });
    },
    /**
     * 选中区域
     */
    onSelectChange(select) {
      this.$emit('select', select);
    },
    /**
     * 区域绘制结束
     */
    onDrawEnd() {
      this.$emit('on-draw-end');
    },
    cancelSelect() {
      this.$refs.selectInteraction.cancelSelect();
    }
  }
};
</script>

<style lang='scss' scoped>

</style>
