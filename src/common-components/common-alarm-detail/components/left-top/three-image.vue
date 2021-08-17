<template>
  <div class="three-image">
    <div class="full-image">
      <span class="title">{{ $t('全景图') }}</span>
      <full-image
        :info="info"></full-image>
    </div>
    <div class="double-image">
      <div class="title">
        <span> {{ $t('抓拍图') }}</span>
        <span> {{ $t('底库图') }}</span>
      </div>
      <component
        :info="info"
        :append-to-body="appendToBody"
        :is="info.leftTopRight"></component>
    </div>
  </div>
</template>

<script>
import FullImage from './full-image';

export default {
  name: 'ThreeImage', // 这个给三个图得组件用，包括车牌得,还有比分问题
  components: {
    PlateBox: () => import('./plate-box'),
    CarBox: () => import('./car-box'),
    PersonBox: () => import('./person-box'),
    FullImage
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
};
</script>
<style lang="scss" scoped>
.three-image {
  display: flex;

  .full-image {
    display: flex;
    flex-direction: column;
    width: 332px;
    height: 280px;
    .title {
      line-height: 32px;
      font-size: 14px;
      color: #869abb;
      flex-shrink: 0;
    }
  }
  .double-image {
    margin-left: 18px;
    width: 496px;
    height: 280px;
    display: flex;
    flex-direction: column;
    .title {
      display: flex;
      flex-shrink: 0;
      span {
        line-height: 32px;
        font-size: 14px;
        color: #869abb;
        flex: 1;
        flex-shrink: 0;
        width: 50%;
        text-align: left;
      }
    }

  }
}
</style>
