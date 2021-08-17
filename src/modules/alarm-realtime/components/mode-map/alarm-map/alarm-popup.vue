<template>
  <div
    class="alarm-popup-container">
    <div
      class="alarm-popup-head"
      v-tooltip="true">
      {{ params.name }}
    </div>
    <div class="alarm-popup-body">
      <meg-card
        :img-src="params.cropUri">
      </meg-card>
    </div>
    <div class="alarm-popup-bottom">
      <span class="score">{{ params.bizScore ? params.bizScore.toFixed(2): '' }}</span>
      <span
        class="name"
        v-tooltip="true">{{ params.camera && params.camera.name }}</span>
    </div>
  </div>
</template>

<script>
// import device from '@/assets/images/alarm-realtime/device.svg';

export default {
  props: {
    params: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // device
    };
  }
};
</script>

<style lang='scss' scoped>
.alarm-popup-container {
  width: 184px;
  height: 227px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  background-color: #ad4646;
  padding: 10px 20px;
  cursor: pointer;
  position: absolute;
  left: -112px;
  bottom: 35px;

  .alarm-popup-head {
    flex: 0 0 14px;
    width: 184px;
    cursor: pointer !important;
    font-size: 14px;
    line-height: 14px;
    color: #ffffff;
    cursor: pointer !important;
  }

  .alarm-popup-body {
    flex: 1 1 195px;
    padding: 5px 0;
    overflow: hidden;
  }

  .alarm-popup-bottom {
    display: flex;
    flex: 0 0 24px;
    line-height: 36px;
    color: #ffffff;
    font-size: 14px;
    justify-content: space-between;
    .score {
      font-size: 24px;
      font-family: 'HEMIHEAD';
    }
    .name {
      width: 110px;
    }
  }
  .device-icon {
    position: absolute;
    bottom: -35px;
    left: 50%;
    margin-left: -14px;
    width: 28px;
    height: 28px;
  }
}
</style>
