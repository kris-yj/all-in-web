<template>
  <div class="detail-face-card">
    <div
      class="body-card-top">
      <div class="card-img-left">
        <img
          :src="faceCardData.faceUrl" />
      </div>
      <div class="body-info-item body-info-item_time">
        <meg-icon
          name="time_fill"
          color="#D1D5DD"></meg-icon>
        <span class="body-info-time">
          {{ faceCardData.captureTime | formatTime('YYYY-MM-DD HH:mm:ss') }}
        </span>
      </div>
      <slot name="delete"></slot>
    </div>
    <div
      class="body-card-bottom">
      <div
        class="body-info">
        <div
          class="body-info-item"
          v-tooltip="true">
          <meg-icon
            name="poi"
            color="#D1D5DD"></meg-icon>
          <span>
            {{ faceCardData.cameraName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    faceCardData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
    };
  },
};
</script>
<style lang='scss' scoped>
.detail-face-card {
  min-width: 260px;
  box-sizing: border-box;
  padding: 11px 8px 0 11px;
  background: #FFFFFF;
  .body-card-top{
    box-sizing: border-box;
    display: flex;
    position: relative;
    align-items: center;
  }
  .card-img-left{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 137px;
    height: 137px;
    border: 1px solid #efefef;
    text-align: center;
    margin-right: 10px;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .delete-icon{
    width: 20px;
    height: 20px;
    margin-left: 12px;
    background: rgba(134,154,187,0.60);
    line-height: 20px;
    text-align: center;
    display: none;
    position: absolute;
    right: 0;
    top: 0;
  }
  .body-info{
    flex: 1;
  }
  .body-info-item_time{
    display: flex;
  }
  .body-info-item{
    height: 33px;
    line-height: 33px;
    font-size: 12px;
    color: #435068;
    .body-info-time {
      display: inline-block;
      word-break: break-all;
      width: 78px;
      color: #5a6676;
      line-height: 16px;
      font-size: 12px;
      height: 32px;
      margin-left: 2px;
    }
  }
}
.detail-face-card:hover{
  cursor: pointer;
  .delete-icon {
    display: block;
  }
}
</style>
