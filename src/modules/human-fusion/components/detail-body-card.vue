<template>
  <div class="detail-body-card">
    <div
      class="body-card-top">
      <div class="card-img-left">
        <img
          :src="bodyCardData.url" />
      </div>
      <div class="card-img-right">
        <img
          v-if="bodyCardData.face"
          :src="bodyCardData.face && bodyCardData.face.faceUrl" />
      </div>
      <slot name="delete"></slot>
    </div>
    <div
      class="body-card-bottom">
      <div
        class="body-info">
        <div class="body-info-item">
          <meg-icon
            name="time_fill"
            color="#D1D5DD"></meg-icon>
          <span>
            {{ captureTimeStr | formatTime('YYYY-MM-DD HH:mm:ss') }}
          </span>
        </div>
        <div
          class="body-info-item"
          v-tooltip="true">
          <meg-icon
            name="poi"
            color="#D1D5DD"></meg-icon>
          <span>
            {{ bodyCardData.cameraName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { formatDate } from '@/utils/utils';

export default {
  props: {
    bodyCardData: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    captureTimeStr() {
      return this.bodyCardData.captureTime;
    }
  },
};
</script>
<style lang='scss' scoped>
.detail-body-card {
  min-width: 244px;
  min-height: 184px;
  box-sizing: border-box;
  padding: 10px 8px 0 10px;
  background: #FFFFFF;
  .body-card-top{
    box-sizing: border-box;
    display: flex;
  }
  .card-img-left{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 124px;
    height: 124px;
    border: 1px solid #efefef;
    text-align: center;
    margin-right: 10px;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .card-img-right{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: 1px solid #efefef;
    text-align: center;
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
  }
  .body-info{
    flex: 1;
    .body-info-item{
      height: 22px;
      line-height: 22px;
      font-size: 12px;
      color: #435068;
    }
  }
}
.detail-body-card:hover{
  cursor: pointer;
  .delete-icon {
    display: block;
  }
}
</style>
