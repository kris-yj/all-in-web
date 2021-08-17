<template>
  <div
    class="animation-wrapper"
    v-if="showWrapper">
    <div class="animation-mask"></div>
    <div class="animation-draggable-box"></div>
    <div class="animation-recieve-box">
      <div class="animation-image-box"></div>
      <div class="animation-info-box">
        <span class="arrow-icon"></span>
        <span class="text">
          拖拽目标至此区域<br />
          可在结果中二次检索
        </span>
        <span
          class="btn"
          @click="closeAnimation">
          知道了
          <i class="close-icon"></i>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    showAnimation: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showWrapper: false
    };
  },
  watch: {
    showAnimation(val) {
      this.showWrapper = val;
    }
  },
  methods: {
    closeAnimation() {
      this.showWrapper = false;
    }
  }
};
</script>
<style lang="scss">
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes moveAndScale {
  15% {
    top: 124px;
    left: 551px;
  }
  30% {
    top: 124px;
    left: 551px;
  }
  60% {
    top: 204px;
    left: 324px;
    transform: scale(1);
  }
  70% {
    transform: scale(1.23);
    top: 204px;
    left: 324px;
    opacity: 1;
  }
  80% {
    transform: scale(1.23);
    top: 204px;
    left: 324px;
    opacity: 1;
  }
  88% {
    transform: scale(1.23);
    opacity: 0;
    top: 204px;
    left: 324px;
  }
  95% {
    opacity: 0;
    top: 164px;
    left: 551px;
  }
  100% {
    top: 164px;
    left: 551px;
    opacity: 1;
  }
}
.animation-wrapper {
  position: fixed;
  top: 0;
  left: -100px;
  right: 0;
  height: 100%;
  z-index: 1000000;
  animation: fadeIn 0.3s;
  .animation-mask {
    height: 100%;
    width: 100%;
    background-color: rgb(12, 20, 44, 0.7);
  }
  .animation-draggable-box {
    height: 124px;
    width: 124px;
    position: absolute;
    left: 551px;
    background: url("./images/face-arrow.png") center;
    background-size: cover;
    top: 164px;
    animation: moveAndScale 2.5s infinite;
    animation-delay: 0.3s;
    z-index: 1000002;
  }
  .animation-recieve-box {
    width: 212px;
    position: absolute;
    left: 252px;
    top: 187px;
    z-index: 1000001;
    .animation-image-box {
      height: 158px;
      width: 100%;
      background: url("./images/left-container.png") center;
      background-size: cover;
    }
    .animation-info-box {
      .arrow-icon {
        display: block;
        height: 36px;
        background: url("./images/arrow.svg") no-repeat center;
        background-size: contain;
      }
      .text,
      .btn {
        display: block;
        color: #fff;
        text-align: center;
        border-radius: 2px;
        line-height: 32px;
      }
      .text {
        padding-top: 8px;
        border: 1px dashed #fff;
        height: 84px;
        width: 175px;
        margin: 0 auto 10px;
        box-sizing: border-box;
      }
      .btn {
        width: 150px;
        border: 1px solid #fff;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        .close-icon {
          display: inline-block;
          background: url("./images/close.svg") no-repeat 50%;
          height: 16px;
          width: 16px;
          margin-left: 3px;
        }
      }
    }
  }
}
</style>
