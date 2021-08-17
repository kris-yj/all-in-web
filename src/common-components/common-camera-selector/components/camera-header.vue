<template>
  <!-- 标题 -->
  <div class="camera-card__header">
    <div
      class="title"
      @click="$emit('play')">
      <h3 v-tooltip="true">
        {{ cameraInfo.name }}
      </h3>
      <meg-icon
        class="player-icon no-pointer-events"
        name="full_play"
        width="16"
        height="16"
        color="#21539b"></meg-icon>
    </div>
    <p>{{ scenesTypeMap[cameraInfo.monitoringType] }}</p>
    <div
      class="actions"
      @click="$emit('close')">
      <meg-icon
        class="close-icon"
        name="close"
        width="16"
        height="16"></meg-icon>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CameraHeader',
  props: {
    cameraInfo: {
      type: Object,
      default: () => ({})
    },
    scenesTypeMap: {
      type: Object,
      default: () => ({})
    }
  }
};
</script>
<style lang="scss" scoped>
    .camera-card__header {
      position: relative;
      .title {
        display: flex;
        justify-content: flex-start;
        align-content: center;
        align-items: center;
        cursor: pointer;
        >h3 {
          font-size: 16px;
          color: #21539B;
          letter-spacing: 0;
          font-weight: bold;
          max-width: 242px;
        }
        .player-icon {
          margin-left: 12px;
          margin-top: 0;
        }
      }
      .actions {
        width: 20px;
        height: 20px;
        position: absolute;
        top: -4px;
        right: 0;
        display: flex;
        justify-content: center;
        align-content: center;
        align-items: center;
        cursor: pointer;
        .close-icon {
          color: #9FAAC1;
        }
      }
      >p {
        font-size: 12px;
        color: #999;
        padding-top: 8px;
      }
    }
</style>
