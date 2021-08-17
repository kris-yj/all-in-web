<template>
  <meg-base-player
    type="stream"
    :socket-url="socketUrl"
    :show-bottom-bar="false"
    @close="onPlayerClose">
    <template v-slot:topBarLeft>
      <span class="video-title">{{ title }}</span>
    </template>
    <template v-slot:topBarRight>
      <span class="top-bar-right-item">
        <build-in-trans-rate>
        </build-in-trans-rate>
      </span>
      <span
        class="top-bar-right-item split-btn"
        title="四分屏"
        @click="$emit('active-change',false)"
        v-if="active&&!isFullscreen">
        <meg-icon
          name="four_screen"
          width="19"
          height="19"
          color="#fff">
        </meg-icon>
      </span>
      <span
        class="top-bar-right-item split-btn"
        title="一分屏"
        @click="$emit('active-change',true)"
        v-if="!active&&!isFullscreen">
        <meg-icon
          name="one_screen"
          width="19"
          height="19"
          color="#fff">
        </meg-icon>
      </span>

      <span class="top-bar-right-item">
        <build-in-full-screen
          @full-screen-change="onFullScreenChange">
        </build-in-full-screen>
      </span>
      <span
        class="top-bar-right-item"
        v-show="!isFullscreen">
        <build-in-close-btn>
        </build-in-close-btn>
      </span>
    </template>
    <template v-slot:viewport>
      <build-in-loading>
      </build-in-loading>
    </template>
    <template v-slot:container>
      <build-in-error-panel>
      </build-in-error-panel>
    </template>
    <template v-slot:placeholder>
      <build-in-placeholder>
      </build-in-placeholder>
    </template>
  </meg-base-player>
</template>
<script>
import {
  BuildInCloseBtn,
  BuildInFullScreen,
  BuildInPlaceholder,
  BuildInErrorPanel,
  BuildInLoading,
  BuildInTransRate
} from '@megvii-video-player/plugin-video-build-in';

export default {
  name: 'VideoPlayer',
  components: {
    BuildInCloseBtn,
    BuildInFullScreen,
    BuildInPlaceholder,
    BuildInErrorPanel,
    BuildInLoading,
    BuildInTransRate
  },
  props: {
    deviceInfo: {
      type: Object,
      default: () => ({
        url: '',
        name: ''
      })
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isFullscreen: false
    };
  },
  computed: {
    socketUrl() {
      return this.deviceInfo.url || '';
    },
    title() {
      return this.deviceInfo.name || 'unknown';
    }
  },
  methods: {
    onFullScreenChange(isFullScreen) {
      this.isFullscreen = isFullScreen;
    },
    onPlayerClose() {
      this.$emit('close');
    }
  }
};
</script>
<style lang="scss" scoped>
.top-bar-right-item,
.bottom-bar-right-item {
  margin-left: 10px;
}
.top-bar-left-item,
.bottom-bar-left-item {
  margin-right: 10px;
}
.split-btn {
  cursor: pointer;
}
</style>
