<template>
  <div
    class="guide-wrapper"
    @click.stop="()=>{}">
    <img
      class="card-img"
      ref="animateIcon"
      src="~@/assets/images/shelf/card.svg" />
    <div
      v-show="showGuideContent"
      class="guide-content">
      <p>
        线索中转站：可以对暂存的线索进一步归档和研判
      </p>
      <div
        class="confirm-button"
        @click="guideConfirm">
        知道了
        <img
          src="~@/assets/images/shelf/close.svg" />
      </div>
      <img
        class="arrow-svg"
        src="~@/assets/images/shelf/arrow.svg" />
    </div>
  </div>
</template>
<script>
const root = document.documentElement;
export default {
  props: {
    showGuideContent: {
      type: Boolean,
      default: () => false
    },
    shelfIconPos: {
      type: Object,
      default: () => ({
        left: 0,
        top: 0
      })
    },
    addEventPos: {
      type: Object,
      default: () => ({
        clientX: 0,
        clientY: 0
      })
    }
  },
  watch: {
    addEventPos() {
      const { clientY = 0, clientX = 0 } = this.addEventPos;
      const { left, top } = this.shelfIconPos;
      const { width, height } = this.$refs.animateIcon.getBoundingClientRect();
      // 点击加入暂存架的坐标
      root.style.setProperty('--clientX', `${clientX - width / 2}px`);
      root.style.setProperty('--clientY', `${clientY - height}px`);
      root.style.setProperty('--moveClientY', `${clientY - height - 50}px`);
      // 右上角暂存架icon坐标 要把缩小后的偏移考虑进来 0.9*0.5
      root.style.setProperty('--destX', `${left - width * 0.45}px`);
      root.style.setProperty('--destY', `${top - height * 0.45}px`);
    }
  },
  mounted() {

  },
  methods: {
    guideConfirm() {
      const { userName } = this.$store.getters.user;
      localStorage.setItem(`${userName}-guided`, 1);
      this.$emit('close-guide');
    }
  }
};
</script>
<style lang="scss" scoped>
.guide-wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(12, 20, 44, 0.7);
  z-index: 9999;
}
.guide-content {
  position: absolute;
  right: 50px;
  top: 140px;
  display: flex;
  .confirm-button {
    border: 1px solid #ffffff;
    border-radius: 2px;
    width: 120px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    margin-left: 30px;
    img {
      margin-left: 5px;
    }
  }
  p {
    width: 188px;
    height: 100px;
    border: 1px dashed #fff;
    padding: 20px 30px;
    box-sizing: border-box;
    font-size: 14px;
    color: #ffffff;
    line-height: 20px;
  }
}
</style>

<style scoped>
.arrow-svg {
  position: absolute;
  right: 13px;
  top: -105px;
}
.card-img {
  position: absolute;
  z-index: 10000;
  top: var(--clientY);
  left: var(--clientX);
  transform-origin: center;
  animation: fly 2s ease-in-out;
  visibility: hidden;
}
@keyframes fly {
  0% {
    visibility: visible;
    top: var(--clientY);
    left: var(--clientX);
    transform: scale(1);
  }
  10% {
    top: var(--moveClientY);
    left: var(--clientX);
    transform: scale(1);
  }
  40% {
    top: var(--moveClientY);
    left: var(--clientX);
    transform: scale(1);
  }
  50% {
    top: var(--moveClientY);
    left: var(--clientX);
    transform: scale(0.1);
  }
  100% {
    left: var(--destX);
    top: var(--destY);
    transform: scale(0.1);
  }
}
</style>
