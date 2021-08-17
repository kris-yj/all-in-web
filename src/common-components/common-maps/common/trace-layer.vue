<template>
  <div>
    <!-- 轨迹线图层 -->
    <meg-animate-vector-layer
      name="traceLineLayer"
      :animate="isAnimating"
      :animate-options="animateOptions"
      :style-function="traceLineStyleFn">
      <meg-feature
        name="traceLineFeature"
        :geometry="traceLineGeomData">
      </meg-feature>
    </meg-animate-vector-layer>
    <!-- 轨迹节点图层 -->
    <meg-vector-layer
      name="traceNodeLayer"
      :style-function="traceNodeStyleFn">
      <!-- 轨迹节点标注 -->
      <meg-feature-array
        name="traceNodeFeatures"
        type="Point"
        :feature-data="traceNodeData">
      </meg-feature-array>
      <!-- 轨迹节点hover选择手势 -->
      <meg-select-interaction
        name="traceNodeHoverSelectInteraction"
        active
        select-type="mouse-move"
        :active-style-function="traceNodeSelectFn"
        @select-change="onTraceNodeHoverSelectChange">
      </meg-select-interaction>
      <!-- 轨迹节点click选择手势 -->
      <meg-select-interaction
        name="traceNodeClickSelectInteraction"
        active
        select-type="single-click"
        ref="selectInteraction"
        :active-style-function="traceNodeSelectFn"
        @select-change="onTraceNodeClickSelectChange">
      </meg-select-interaction>
    </meg-vector-layer>
  </div>
</template>

<script>
import {
  traceNodeStyleFn, traceNodeSelectFn, traceLineStyleFn
} from '../styles/common';

import CustomLineAnimate from '../styles/animate';

export default {
  props: {
    data: {
      type: Array,
      default: () => []
    },
    isVisible: {
      type: Boolean,
      default: false
    },
    /**
     * 是否显示起终点
     */
    isPoint: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isSelect: false,
      isAnimating: true,
      animateOptions: {
        Ctor: CustomLineAnimate,
        speed: 2,
        duration: 2000,
        repeat: Infinity
      }
    };
  },
  computed: {
    // 轨迹线渲染数据
    traceLineGeomData() {
      return {
        type: 'LineString',
        coordinates: this.featureArray.map((item) => [item.lon, item.lat]),
      };
    },
    // 轨迹显示可用数据
    featureArray() {
      // 先将经纬度为空的过滤掉;
      return this.data.filter((val) => val.lon && val.lat);
    },
    // 轨迹点数据
    traceNodeData() {
      // @TODO 考虑代码的健壮性
      const map = new Map();
      const { featureArray } = this;
      let repetitionFlag = false;
      // 判断起点和终点是否覆盖，覆盖优先显示终点
      if (featureArray.length && (`${featureArray[0].lat}${featureArray[0].lon}` === `${featureArray[featureArray.length - 1].lat}${featureArray[featureArray.length - 1].lon}`)) {
        repetitionFlag = true;
      }
      // 防止点位覆盖先把瞄点去重
      featureArray.forEach((item) => {
        if (map.get(`${item.lat}${item.lon}`)) {
          if (!map.get(`${item.lat}${item.lon}`).isSelected) map.set(`${item.lat}${item.lon}`, item);
        } else {
          map.set(`${item.lat}${item.lon}`, item);
        }
      });

      const tempArr = [...map.values()];
      return tempArr.map((item, index) => ({
        id: item.captureId || item.id,
        coordinates: [item.lon, item.lat],
        params: Object.assign(item, {
          start: (index === 0 && !repetitionFlag) && this.isPoint,
          // start_end在起终点重合的时候优先设置为true
          start_end: (repetitionFlag && index === 0) && this.isPoint,
          end: (repetitionFlag ? index === 0 : index === tempArr.length - 1) && this.isPoint,
          index: item.index || index + 1,
        })
      }));
    },
  },
  created() {
    this.traceNodeSelectFn = traceNodeSelectFn;
    this.traceLineStyleFn = traceLineStyleFn;
  },
  methods: {
    /**
     * 轨迹点选中状态动态判断
     */
    traceNodeStyleFn(feature) {
      const params = feature.get('params');
      return params.isSelected ? traceNodeSelectFn(feature) : traceNodeStyleFn(feature);
    },
    // 轨迹节点hover选择事件回调
    onTraceNodeHoverSelectChange(select) {
      if (select) {
        this.$emit('hover', select);
      } else {
        this.$emit('hover',);
      }
    },
    /**
     * 通过params中id选中区域
     */
    select(id) {
      this.$refs.selectInteraction.select(id);
    },
    cancelSelect() {
      this.$refs.selectInteraction.cancelSelect();
    },
    // 轨迹节点click选择事件回调
    onTraceNodeClickSelectChange(select, unselect) {
      if (select) {
        this.$emit('select-change', true, select);
        this.isSelect = true;
      }

      if (unselect) {
        if (!select) {
          this.isSelect = false;
          this.$emit('select-change', false);
        }
      }
    },

  }
};
</script>

<style lang='scss' scoped>

</style>
