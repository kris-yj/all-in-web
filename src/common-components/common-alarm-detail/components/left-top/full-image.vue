<template>
  <div class="position-box">
    <div
      @click="viewBigImage"
      @mouseleave="onLeave"
      @mouseenter="onEnter"
      class="inner-container">
      <meg-img-container
        v-if="info.isShowFaceReact"
        :img-src="info.fullUrl"
        mark-shape="rect"
        :mark-coordinate="info.rectValueToNumber"
        :enlarge="false"></meg-img-container>
      <img
        v-else
        class="empty-image"
        :src="info.fullUrl" />
      <div>
        <span class="img-border left-top"></span>
        <span class="img-border left-bottom"></span>
        <span class="img-border right-top"></span>
        <span class="img-border right-bottom"></span>
      </div>
      <jump-with-img
        v-show="info.isShowFaceReact && showJump"
        :params="info.fullParams"></jump-with-img>
    </div>
    <img-scaled
      v-model="bigImageVisible"
      :is-all-scaled-show="false"
      :is-single-scaled-show="false"
      :imgs-src="img"></img-scaled>
  </div>
</template>

<script>
import JumpWithImg from '../../../common-jump-with-img';
import ImgScaled from '../../../common-img-scaled';

export default {
  name: 'FullImage',
  components: {
    JumpWithImg,
    ImgScaled
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      bigImageVisible: false,
      img: [],
      showJump: false,
    };
  },
  methods: {
    viewBigImage() {
      if (this.info.isShowFaceReact) {
        this.img = [this.info.fullUrl];
        this.bigImageVisible = true;
      }
    },
    onEnter() {
      this.showJump = true;
    },
    onLeave() {
      this.showJump = false;
    },
  }
};
</script>
<style lang="scss" scoped>
.position-box {
  position: relative;
  flex: 1;
  .inner-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #eee;
    cursor: pointer;
    .empty-image {
      height: 100%;
      cursor:auto;
    }
    .img-border {
      position: absolute;
      width: 4px;
      height: 4px;
    }
    .left-top {
      left: -1px;
      top: -1px;
      border-top: 1px solid #869abb;
      border-left: 1px solid #869abb;
    }
    .left-bottom {
      left: -1px;
      bottom: -1px;
      border-bottom: 1px solid #869abb;
      border-left: 1px solid #869abb;
    }
    .right-top {
      right: -1px;
      top: -1px;
      border-top: 1px solid #869abb;
      border-right: 1px solid #869abb;
    }
    .right-bottom {
      right: -1px;
      bottom: -1px;
      border-right: 1px solid #869abb;
      border-bottom: 1px solid #869abb;
    }
  }
  .empty {
    height: 0px;
    width: 0px;
    overflow: hidden;
  }
}
</style>
