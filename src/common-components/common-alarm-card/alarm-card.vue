<template>
  <meg-double-card
    class="alarm-card"
    :left-img-src="info.leftImgSrc"
    :right-img-src="info.rightImgSrc"
    :score="info.score"
    :single="info.single"
    :left-img-draggable="leftImgDraggable"
    :right-img-draggable="rightImgDraggable"
    @click="onCardClick">
    <template
      v-slot:header>
      <detection-header>
        <component
          :info="info.headerLeft"
          :is="info.headerLeft.component"></component>
        <status
          v-if="showProcessStatus"
          :info="info"></status>
      </detection-header>
    </template>
    <template
      v-if="info.rightCustom"
      v-slot:right-custom>
      <component
        :info="info.rightCustom"
        :is="info.rightCustom.component"></component>
    </template>
    <template v-slot:bottom>
      <simple-footer>
        <template v-slot:left>
          <component
            :info="info.footLeftTop"
            :is="info.footLeftTop.component"></component>
          <component
            v-if="info.footLeftBottom"
            :info="info.footLeftBottom"
            :is="info.footLeftBottom.component"></component>
        </template>
        <template v-slot:right>
          <component
            :info="info.footRightTop"
            :is="info.footRightTop.component"></component>
          <component
            :info="info.footRightBottom"
            v-if="info.footRightBottom"
            :is="info.footRightBottom.component"></component>
        </template>
      </simple-footer>
    </template>
  </meg-double-card>
</template>

<script>

import DetectionHeader from './header/detection-header';
import Status from './header/status';
import SimpleFooter from './footer/simple-footer';
import Tip from './header/tip';
import Normal from './footer/normal';
import Camera from './footer/camera';
import RightCustom from './right-custom/right-custom';

export default {
  name: 'AlarmCard',
  components: {
    DetectionHeader,
    Status,
    SimpleFooter,
    Tip,
    Normal,
    Camera,
    RightCustom,
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    // 左侧图片是否支持拖拽
    leftImgDraggable: {
      type: Boolean,
      default: true,
    },
    // 右侧图片是否支持拖拽
    rightImgDraggable: {
      type: Boolean,
      default: true,
    },
    // 是否显示处理状态（战果內部展示的详情，不展示处理状态）
    showProcessStatus: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    onCardClick() {
      this.$emit('click');
    }
  }
};
</script>
<style lang="scss" scoped>
.alarm-card {
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
