<template>
  <div
    class="free__wrapper"
    @click="handleCaptureDetail">
    <div class="free__container">
      <div class="free__header">
        <h3>抓拍详情</h3>
        <div
          class="close"
          @click.stop="handleCloseFreeInfoOverflay">
          <meg-icon
            class="close-icon"
            width="13px"
            height="13px"
            name="close"></meg-icon>
        </div>
      </div>
      <div class="free__content">
        <meg-img-container :img-src="data.url || data.cropUrl"></meg-img-container>
      </div>
      <div class="free__footer">
        <div class="free__address">
          <meg-icon
            v-if="data.resourceType === 3 || data.photoSource === 4"
            class="address-icon"
            name="upload_image"></meg-icon>
          <meg-icon
            v-else-if="data.resourceType === 1"
            class="address-icon"
            name="video-preview_menu"></meg-icon>
          <meg-icon
            v-else
            class="address-icon"
            name="poi"></meg-icon>
          <em v-tooltip="true">{{ data.cameraName|| data.addressName || data.fileName }}</em>
        </div>
        <div class="free__time">
          <meg-icon
            name="time"
            class="time-icon"></meg-icon>
          <div class="time-block">
            <p>
              {{ data.capturedTime || data.createTime | formatTime }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'TraceFreeOverlay',
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    handleCloseFreeInfoOverflay() {
      this.$emit('close');
    },
    handleCaptureDetail() {
      this.$emit('detail', this.data);
    },
  }
};
</script>
<style lang="scss" scoped>
 .free__wrapper {
    width: 176px;
    background: #FFFFFF;
    box-shadow: 4px 4px 6px 0 rgba(0,0,0,0.20);
    box-sizing: border-box;
    position: relative;
    cursor: pointer;
    z-index: 9999;
    &:after {
      content: '';
      width: 0;
      height: 0;
      border-left: 16px solid transparent;
      border-right: 16px solid transparent;
      border-top: 8px solid #FFFFFF;
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
    }
    .free__container {
      padding: 12px 15px 12px 15px;
      .free__header {
        position: relative;
        >h3 {
          font-size: 14px;
          color: #435068;
        }
        .close {
          width: 13px;
          height: 13px;
          cursor: pointer;
          background-color: #fff;
          position: absolute;
          top: 0;
          right: 0;
          .close-icon {
            display: flex;
            color: #9FAAC1;
          }
        }
      }
      .free__content {
        width: 144px;
        height: 144px;
        margin-top: 10px;
      }
    }
    .free__footer {
      margin-top: 10px;
      .free__time {
        display: flex;
        margin-top: 8px;
       .time-icon {
          width: 12px;
          height: 12px;
          color: #D1D5DD;
          position: relative;
          top: 3px;
       }
       .time-block {
          min-width: 100px;
          margin-left: 6px;
          text-align: left;
          >p {
            font-size: 12px;
            line-height: 1.5;
            color: #435068;
          }
        }
      }
      .free__address {
        display: flex;
        .address-icon {
          width: 13px;
          height: 13px;
          color: #D1D5DD;
        }
        >em {
          font-style: normal;
          font-size: 12px;
          color: #435068;
          padding-left: 6px;
        }
      }
    }
  }
</style>
