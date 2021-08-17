<template>
  <div>
    <!--相机标注图层-->
    <meg-vector-layer
      :name="name"
      :z-index="zIndex"
      :visible="isVisible"
      ref="pointFeatureLayer"
      :style-function="deviceStyleFn">
      <meg-feature-array
        geom-type="Point"
        ref="feature"
        :feature-data="featureData">
      </meg-feature-array>
      <meg-select-interaction
        v-if="isActive"
        ref="selectInteraction"
        :name="`${name}cameraClicktInteraction`"
        select-type="click"
        :active="isActive"
        @select-change="onClick">
      </meg-select-interaction>
      <meg-select-interaction
        :name="`${name}cameraHoverInteraction`"
        select-type="mouse-move"
        :active="true"
        @select-change="onHover">
      </meg-select-interaction>
      <meg-draw-select-interaction
        :name="`${name}drawSelectInteraction`"
        :select-type="drawType || 'Box'"
        :active="drawType!==''&&isVisible"
        @select-end="onSelectDrawEnd">
      </meg-draw-select-interaction>
    </meg-vector-layer>
  </div>
</template>

<script>
import { calcIsPointInPolygon } from '@megvii-gis/calc-api';
import { cameraStyleFn } from '../styles/camera';

export default {
  props: {
    // 框选类型
    drawType: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: 'pointFeatureLayer'
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isActive: true
    };
  },
  computed: {

    featureData() {
      return this.mapData(this.data);
    },

  },
  created() {
    this.deviceStyleFn = cameraStyleFn;
  },
  methods: {
    mapData(data) {
      const list = [];
      data.forEach((val) => {
        if (val.lon && val.lat) {
          list.push(
            {
              type: 'Point',
              coordinates: [val.lon, val.lat],
              params: {
                selected: this.isSelected,
                ...val
              }
            }
          );
        }
      });
      return list;
    },
    /**
     * 外部设置设备数据
     */
    setFeature(data = []) {
      this.$refs.feature.setFeatures(this.mapData(data));
    },
    /**
     * @description 相机框选结束事件
     * @param {string} id 特征id
     * @param {Object} feature 特征点
     * @param {Object} featureGeom 特征点坐标
     */
    onSelectDrawEnd(id, feature, features) {
      this.$emit('draw-select', features.map((item) => item.feature.get('params')), feature, id);
    },
    onClick(select) {
      this.$emit('select', select);
    },
    /**
     * 清除标注的选中状态
     */
    cancelSelect() {
      // this.$refs.selectInteraction.cancelSelect();
      // todo 通过重新初始化手势组件的方式清除选中状态
      this.isActive = false;
      this.$nextTick(() => {
        this.isActive = true;
      });
    },
    onHover(select) {
      this.$emit('hover', select);
    },
    getFeaturesInGeometryExtent(orgGeometry) {
      return this.featureData.filter((item) => calcIsPointInPolygon(item, orgGeometry));
    }
  }
};
</script>

<style lang='scss' scoped>

</style>
