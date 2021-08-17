<template>
  <div class="capture-loading">
    <div class="loading-icon">
      <span class="loading-wrapper">
        <img :src="iconLoading" />
      </span>
    </div>
    <p>
      加载中...
    </p>
  </div>
</template>
<script>
import iconLoading from '@/assets/images/alarm-realtime/icon-loading.svg';

export default {
  name: 'CaptureLoading',
  data() {
    return {
      iconLoading
    };
  }
};
</script>

<style lang="scss" scoped>
.capture-loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.25);
  z-index: 2;
  .icon-img {
    opacity: 0.3;
  }
  &.connect-loading {
    background-image: linear-gradient(0deg, #252f5b 0%, #1b2141 100%);
  }
  .loading-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 7px;
    height: 50px;
    width: 50px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.05);
    img {
      height: 19px;
      animation: loadingRotate 1s linear infinite;
    }
  }
  .loading-wrapper {
    height: 19px;
    color: #fff;
  }
}

@keyframes loadingRotate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  50% {
    -webkit-transform: rotate(180deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}
</style>
