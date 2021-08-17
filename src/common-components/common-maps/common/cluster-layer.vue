<template>
  <!-- 抓拍聚合 -->
  <meg-cluster-layer
    :name="name"
    :visible="isVisible"
    :style-function="clusterLayerFn">
    <meg-feature-array
      :name="`${name}FeaturesArray`"
      :feature-data="clusterGeomData">
    </meg-feature-array>
    <meg-select-interaction
      :name="`${name}hoverInteraction`"
      select-type="mouse-move"
      :active="isMouse"
      :active-style-function="clusterHoverLayerFn"
      @select-change="onHover">
    </meg-select-interaction>
    <meg-select-interaction
      :name="`${name}selectInteraction`"
      :ref="`${name}selectInteraction`"
      select-type="single-click"
      :active="isMouse"
      :active-style-function="clusterSelectLayerFn"
      @select-change="onSelect">
    </meg-select-interaction>
  </meg-cluster-layer>
</template>

<script>
import {
  createText,
  STATICSIZE,
  createRadius,
} from '../styles/common';
import { hxCreateRadius } from '../styles/hx-home-style';

export default {
  props: {
    isVisible: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: () => []
    },
    name: {
      type: String,
      default: 'clusterLayer'
    },
    formatText: {
      type: Function,
      default: (number, count) => `${number}人\n相机: ${count}`
    },
    /**
     * 是否开启手势
     */
    isMouse: {
      type: Boolean,
      default: false
    },
    /**
     * 是否慧寻用
     */
    isHx: {
      type: Boolean,
      default: false
    },
    isDatabase: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const vm = this;
    const raduisLevel = (number) => {
      let raduis = '';
      if (number > 2000) {
        raduis = 'large';
        number = '>2000';
      } else if (number > 500) {
        raduis = 'middle';
      } else if (number > 100) {
        raduis = 'small';
      } else {
        raduis = 'single';
      }
      return raduis;
    };
    const radiusNomal = createRadius();
    const radiusHover = createRadius('rgba(23,124,206,.9)');
    const radiusSelect = createRadius('rgba(16,73,130,.9)');

    const hxRadius = hxCreateRadius();
    console.log(hxRadius);
    /**
     * nomal样式
     */
    const clusterLayerFn = (feature) => {
      const count = feature.get('features') ? feature.get('features').length : 1;
      let number = 0;
      const params = [];
      if (feature.get('features')) {
        feature.get('features').forEach((item) => {
          params.push(item.get('params'));
          number += item.get('params').captureNum;
        });
      }

      if (this.isDatabase) {
        const map = new Map();
        params.forEach((item) => {
          if (item.profileIds) {
            item.profileIds.forEach((items) => {
              map.set(items, items);
            });
          }
        });
        number = [...map.keys()].length;
      }
      const raduis = raduisLevel(number);
      const raduisStyle = this.isHx ? hxRadius[raduis] : radiusNomal[raduis];
      // TO DO 后期API对外暴露 createText
      raduisStyle.setText(createText(vm.formatText(number, count, params), STATICSIZE[raduis]));
      return raduisStyle;
    };
    /**
     * hover样式
     */
    const clusterHoverLayerFn = (feature) => {
      const count = feature.get('features') ? feature.get('features').length : 1;
      let number = 0;
      const params = [];
      if (feature.get('features')) {
        feature.get('features').forEach((item) => {
          params.push(item.get('params'));
          number += item.get('params').captureNum;
        });
      }
      if (this.isDatabase) {
        const map = new Map();
        params.forEach((item) => {
          if (item.profileIds) {
            item.profileIds.forEach((items) => {
              map.set(items, items);
            });
          }
        });
        number = [...map.keys()].length;
      }
      const raduis = raduisLevel(number);
      const raduisStyle = radiusHover[raduis];
      // TO DO 后期API对外暴露 createText
      raduisStyle.setText(createText(vm.formatText(number, count, params), STATICSIZE[raduis]));
      return raduisStyle;
    };
    /**
     * 选中样式
     */
    const clusterSelectLayerFn = (feature) => {
      const count = feature.get('features') ? feature.get('features').length : 1;
      let number = 0;
      const params = [];
      if (feature.get('features')) {
        feature.get('features').forEach((item) => {
          params.push(item.get('params'));
          number += item.get('params').captureNum;
        });
      }
      if (this.isDatabase) {
        const map = new Map();
        params.forEach((item) => {
          if (item.profileIds) {
            item.profileIds.forEach((items) => {
              map.set(items, items);
            });
          }
        });
        number = [...map.keys()].length;
      }
      const raduis = raduisLevel(number);
      const raduisStyle = radiusSelect[raduis];
      // TO DO 后期API对外暴露 createText
      raduisStyle.setText(createText(vm.formatText(number, count, params), STATICSIZE[raduis]));
      return raduisStyle;
    };
    return {
      clusterLayerFn,
      clusterHoverLayerFn,
      clusterSelectLayerFn
    };
  },
  computed: {
    clusterGeomData() {
      const featureData = this.data.filter((val) => val.lon && val.lat);
      return featureData.map((item) => ({
        coordinates: [item.lon, item.lat],
        params: item
      }));
    },
  },
  created() {
  },
  methods: {
    cancelSelect() {
      this.$refs[`${this.name}selectInteraction`].cancelSelect();
    },
    onHover(select) {
      if (select) {
        const features = select.feature.get('features');
        this.$emit('hover', select.lonLat, features.map((item) => item.get('params')));
      } else {
        this.$emit('hover');
      }
    },
    onSelect(select) {
      if (select) {
        const features = select.feature.get('features');
        this.$emit('select', select.lonLat, features.map((item) => item.get('params')));
      } else {
        this.$emit('select');
      }
    }
  }
};
</script>

<style lang='scss' scoped>

</style>
