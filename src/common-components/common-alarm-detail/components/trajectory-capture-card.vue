<template>
  <div class="capture-card-container">
    <div class="capture-title">
      <span
        v-if="close"
        class="close"
        @click.stop="onCloseClickOverlay">
        <meg-icon
          name="close"
          width="10px"
          height="10px"
          color="#D1D5DD">
        </meg-icon>
      </span>
    </div>
    <div
      @click="cardClick(info,0)"
      class="capture-photo">
      <meg-img-container
        mark-shape="rect"
        :mark-coordinate="info.rect"
        :img-src="info.faceUrl"></meg-img-container>
    </div>
    <div class="capture-detail">
      <p v-tooltip="true">
        <label class="icon-box">
          <meg-icon
            name="poi"
            width="10px"
            height="10px"
            color="#D1D5DD">
          </meg-icon>
        </label>
        <span>{{ info.cameraName }}</span>
      </p>
      <p v-tooltip="true">
        <label class="icon-box">
          <meg-icon
            name="time"
            width="10px"
            height="10px"
            color="#D1D5DD">
          </meg-icon>
        </label>
        <span>{{ info.captureTime }}</span>
      </p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CaptureCard',
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    close: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
    };
  },
  watch: {
  },
  methods: {
    onCloseClickOverlay() {
      this.$emit('on-close-click-overlay');
    },
    cardClick(info, index) {
      this.$emit('card-click', info, index);
    }
  }
};
</script>
<style scoped>
.capture-card-container {
  height: 100%;
}

.capture-card-container .capture-title {
  height: 24px;
  line-height: 24px;
  font-size: 14px;
  color: #435068;
  text-align: left;
}

.capture-card-container .close {
  width: 12px;
  height: 12px;
  display: inline-block;
  float: right;
  cursor: pointer;
}

.capture-card-container .capture-photo {
  height: 168px;
  height: 96px;
  cursor: pointer;
}

.capture-card-container .capture-detail {
  line-height: 24px;
  height: 48px;
  font-size: 12px;
  color: #435068;
  text-align: left;
}

.capture-card-container .capture-detail p {
  height: 24px;
  line-height: 18px;
}

.capture-card-container .capture-detail p label {
  vertical-align: middle;
}

.capture-card-container .capture-detail p span {
  vertical-align: middle;
}
</style>
