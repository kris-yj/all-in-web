<template>
  <div
    v-if="opening"
    class="common-img-scaled"
    @keydown.esc.stop.prevent="closeAction">
    <header class="header">
      <span
        @click.stop="closeAction"
        class="close-dialog">
        <meg-icon
          class="narrow"
          width="15"
          height="15"
          color="#ffffff"
          name="narrow">
        </meg-icon></span>
    </header>
    <section class="img-container">
      <section
        class="view-img">
        <div
          @mousewheel="allScaledAction($event, 0)"
          class="img-one">
          <meg-cropper
            ref="cropper1"
            class="cropper-scaled"
            :check-orientation="checkOrientation"
            :img-style="imgStyle"
            :auto-crop="booleanFalse"
            :background="booleanFalse"
            :toggle-drag-mode-on-dblclick="booleanFalse"
            :drag-mode="'move'"
            :src="imgsSrc[0]"
            :zoom-on-wheel="booleanFalse"
            @init-img="initLeftImg"></meg-cropper>
        </div>
        <div
          v-if="imgsSrc.length === 2"
          @mousewheel="allScaledAction($event, 1)"
          class="img-two">
          <meg-cropper
            ref="cropper2"
            class="cropper-scaled"
            :check-orientation="checkOrientation"
            :toggle-drag-mode-on-dblclick="booleanFalse"
            :img-style="imgStyle"
            :auto-crop="booleanFalse"
            :background="booleanFalse"
            :drag-mode="'move'"
            :src="imgsSrc[1]"
            :zoom-on-wheel="booleanFalse"
            @init-img="initRightImg"></meg-cropper>
        </div>
      </section>
      <div
        :class="fontColor"
        v-if="imgsSrc.length === 2 && score"
        class="compare-score">
        <div class="score">
          {{ score }}
        </div>
        <div class="info">
          <slot name="comparePrompt">
            {{ comparePrompt }}
          </slot>
        </div>
      </div>
    </section>
    <footer class="footer">
      <span
        v-if="isAllScaledShow"
        :class="{
          hover: hover === 0,
          active: active === 0
        }"
        @mouseover="hover = 0"
        @mouseout="hover = -1"
        @click="allScaled"
        class="all-scaled">
        <meg-icon
          width="15"
          height="15"
          :color="active === 0 ? '#fff' : hover === 0 ? '#64c4ff' : '#8a97a0'"
          name="simultaneously_zoom"></meg-icon>
        <span>同时缩放</span>
      </span>
      <span
        v-if="isSingleScaledShow"
        :class="{
          hover: hover === 1,
          active: active ===1
        }"
        @mouseover="hover = 1"
        @mouseout="hover = -1"
        @click="singleScaled"
        class="single-scaled">
        <meg-icon
          width="15"
          height="15"
          :color="active === 1 ? '#fff' : hover === 1 ? '#64c4ff' : '#8a97a0'"
          name="single_zoom"></meg-icon>
        <span>单独缩放</span>
      </span>
      <span
        :class="{
          hover: hover === 2,
          active: active === 2
        }"
        @mouseover="hover = 2"
        @mouseout="hover = -1"
        @click="reduction"
        class="reduction">
        <meg-icon
          width="15"
          height="15"
          :color="active === 2 ? '#fff' : hover === 2 ? '#64c4ff' : '#8a97a0'"
          name="restore"></meg-icon>
        <span>1:1还原</span>
      </span>
    </footer>
  </div>
</template>
<script>
import privateUtils from 'megvii-ui/lib/utils/img-handler/point-data';

export default {
  name: 'CommonImgScaled',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    compareScore: {
      type: [Number, String],
      default: 0
    },
    imgsSrc: {
      type: Array,
      default() {
        return [];
      }
    },
    leftImgRect: {
      type: Object,
      default() {
        return {};
      }
    },
    rightImgRect: {
      type: Object,
      default() {
        return {};
      }
    },
    isAllScaledShow: {
      type: Boolean,
      default: true,
    },
    isSingleScaledShow: {
      type: Boolean,
      default: true,
    },
    checkOrientation: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      opening: this.value,
      checkManyFace: false,
      imgStyle: {
        width: '100%',
        height: '100%',
      },
      booleanFalse: false,
      hover: -1,
      active: 1,
      usefulData: []
    };
  },
  computed: {
    score() {
      return (Number(this.compareScore) || 0).toFixed(2);
    },
    comparePrompt() {
      if (this.score >= 0 && this.score < 60) {
        return '极可能不是一个目标';
      } if (this.score >= 60 && this.score < 80) {
        return '可能不是一个目标';
      } if (this.score >= 80 && this.score < 90) {
        return '可能是一个目标';
      }
      return '极可能是一个目标';
    },
    fontColor() {
      if (this.score >= 0 && this.score < 60) {
        return 'green-font';
      } if (this.score >= 60 && this.score < 80) {
        return 'yellow-font';
      } if (this.score >= 80 && this.score < 90) {
        return 'orange-font';
      }
      return 'red-font';
    },
  },
  watch: {
    value(value) {
      this.opening = value;
    }
  },
  mounted() {
  },
  methods: {
    initLeftImg() {
      if (this.leftImgRect !== null && Object.keys(this.leftImgRect).length) {
        privateUtils.getExactImg(this.imgsSrc[0], this.leftImgRect).then((usefulImg) => {
          this.$refs.cropper1.replace(usefulImg);
        });
      }
    },
    initRightImg() {
      if ((this.imgsSrc.length === 2) && this.rightImgRect !== null && Object.keys(this.rightImgRect).length) {
        privateUtils.getExactImg(this.imgsSrc[1], this.rightImgRect).then((usefulImg) => {
          this.$refs.cropper2.replace(usefulImg);
        });
      }
    },
    allScaledAction(event, index) {
      const { cropper1, cropper2 } = this.$refs;
      if (this.active) {
        if (index) {
          if (event.deltaY < 0) {
            cropper2.relativeZoom(0.1);
          } else {
            cropper2.relativeZoom(-0.1);
          }
        } else if (event.deltaY < 0) {
          cropper1.relativeZoom(0.1);
        } else {
          cropper1.relativeZoom(-0.1);
        }
      } else if (event.deltaY < 0) {
        cropper1.relativeZoom(0.1);
        cropper2.relativeZoom(0.1);
      } else {
        cropper1.relativeZoom(-0.1);
        cropper2.relativeZoom(-0.1);
      }
    },
    allScaled() {
      this.active = 0;
    },
    singleScaled() {
      this.active = 1;
    },
    reduction() {
      const { cropper1, cropper2 } = this.$refs;
      if (this.imgsSrc.length === 2) {
        cropper1.reset();
        cropper2.reset();
      } else {
        cropper1.reset();
      }
    },
    closeAction() {
      this.opening = false;
      this.$emit('input', false);
      this.$emit('close');
    }
  }
};
</script>
<style lang="scss" scoped>
.common-img-scaled {
  position: fixed;
  height: 100%;
  width: 100%;
  background: #2A2E38;
  z-index: 100;
  left: 0;
  top: 0;
  .header {
    height: 36px;
    line-height: 36px;
    .close-dialog {
      float: right;
      height: 20px;
      width: 20px;
      background: #3C4354;
      margin: 10px;
      padding: 5px;
      position: absolute;
      right: 0;
      top: 0;
      display: flex;
      justify-content: center;
      vertical-align: middle;
      cursor: pointer;
      z-index: 1;
      .narrow {
        vertical-align: 10px;
        margin-top: 2px;
      }
    }
  }
  .footer {
    height: 48px;
    line-height: 24px;
    background-color: #232d68;
    width: 100%;
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: center;
    .hover {
      color: #64c4ff !important;
    }
    .active {
      color: #fff !important;
      background-color: rgba(255,255,255,.2)
    }
    .all-scaled,.single-scaled,.reduction {
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #8a97a0;
      cursor: pointer;
      padding: 0 20px;
    }
  }
  .img-container {
    height: calc(100% - 84px);
    position: relative;
    .compare-score {
        height: 66px;
        position: absolute;
        bottom: 0;
        width: 100%;
        margin-top: 20px;
        margin-bottom: 14px;
        .score {
            text-align: center;
            font-family: 'HEMIHEAD';
            font-size: 50px;
            height: 36px;
        }
        .info {
            text-align: center;
            margin-top: 14px;
            height: 18px;
        }
    }
    .view-img {
      width: calc(100% - 200px);
      height: calc(100% - 100px);
      margin: 0 auto;
      display: flex;
      .img-one {
        flex: 1;
        height: 100%;
        border: 1px solid #bfc3c9;
        box-sizing: border-box;
      }
      .img-two {
        width: 50%;
        height: 100%;
        border: 1px solid #bfc3c9;
        border-left: none;
        box-sizing: border-box;
      }
      .cropper-scaled {
        width: 100%;
        height: 100%;
        position: relative;
      }
    }
    .green-font {
      color: #4baf78;
    }
    .yellow-font {
      color: #dbac58;
    }
    .orange-font {
      color: #ed673e;
    }
    .red-font {
      color: #ce3636;
    }
  }
}
</style>
