<template>
  <div class="playbar">
    <div class="playbar-container">
      <div class="playbar-content">
        <div
          class="playbar-actions"
          @click="handleMapPlayOrPause">
          <meg-icon
            class="video-pause"
            width="23px"
            height="23px"
            :name="playing ? 'video_pause' : 'video_play'"></meg-icon>
        </div>
        <div class="playbar-steps">
          <meg-slider
            v-model="progress"
            :disabled="disabled"
            :show-tooltip="false"></meg-slider>
        </div>
        <div
          class="playbar-replay"
          @click="handleMapReplay">
          <meg-icon
            class="video-replay"
            width="23px"
            height="23px"
            name="video_replay"></meg-icon>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'PlayProgressBar',
  props: {
    playing: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: true,
    }
  },
  methods: {
    handleMapPlayOrPause() {
      this.$emit('action');
    },
    handleMapReplay() {
      this.$emit('replay');
    }
  }
};
</script>
<style lang="scss" scoped>
.playbar {
    width: 672px;
    position: absolute;
    left: 50%;
    bottom: 8px;
    transform: translateX(-50%);
    .playbar-container{
      width: 100%;
      opacity: 0.56;
      background: #4D5676;
      border-radius: 2px;
      .playbar-content {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        padding: 8px 20px 8px 20px;
        box-sizing: border-box;
        .playbar-actions {
          width: 23px;
          height: 23px;
          cursor: pointer;
          opacity: 1;
          transition: all .3 ease-in-out;
          &:active {
            transform: scale(.8);
            opacity: .8;
          }
          .video-pause {
            color: #fff;
          }
        }
        .playbar-steps {
          width: 545px;
          margin-left: 24px;
          ::v-deep .meg-slider__bar {
            background-color: #fff;
          }
        }
        .playbar-replay {
          width: 23px;
          height: 23px;
          margin-left: 24px;
          cursor: pointer;
          opacity: 1;
          transition: all .3 ease-in-out;
          &:active {
            transform: scale(.8);
            opacity: .8;
          }
          .video-replay {
            color: #fff;
          }
        }
      }
    }
  }
</style>
