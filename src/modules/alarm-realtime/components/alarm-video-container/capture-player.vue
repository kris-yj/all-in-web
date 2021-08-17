<template>
  <div
    class="container">
    <div
      class="operate-header">
      <span class="title">{{ title }}</span>
      <div class="header-right">
        <span
          class="split-btn"
          title="四分屏"
          @click="$emit('active-change',false)"
          v-if="active">
          <meg-icon
            name="four_screen"
            width="19"
            height="19"
            color="#DCE1E5">
          </meg-icon>
        </span>
        <span
          class="split-btn"
          title="一分屏"
          @click="$emit('active-change',true)"
          v-if="!active">
          <meg-icon
            name="one_screen"
            width="19"
            height="19"
            color="#DCE1E5">
          </meg-icon>
        </span>
        <span
          class="close-btn"
          @click="onClickClose">
          <meg-icon
            name="close_player"
            width="15"
            height="15"
            color="#f9f9f9">
          </meg-icon>
        </span>
      </div>
    </div>
    <div class="player-container">
      <capture-loading
        v-show="!url">
      </capture-loading>
      <meg-img-container
        v-show="url"
        :img-src="url">
      </meg-img-container>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import CaptureLoading from './capture-loading';
import RequestLooper from '../request-looper';
import alarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'CapturePlayer',
  components: {
    CaptureLoading
  },
  props: {
    deviceInfo: {
      type: Object,
      default: () => ({})
    },
    videoIndex: {
      type: [Number, String],
      required: true
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      url: '',
      updateTimer: null,
      updateInterval: 1000,
      cacheMaxNum: 500,
      imageCache: []
    };
  },
  computed: {
    title() {
      return this.deviceInfo.name || 'unknown';
    },
    hasCache() {
      return this.imageCache.length > 0;
    }
  },
  watch: {
    hasCache(val) {
      if (val) {
        this.startUpdate();
      } else {
        if (this.updateTimer) clearTimeout(this.updateTimer);
        this.updateTimer = null;
      }
    }
  },
  created() {
    try {
      this.updateInterval = parseInt(this.$store.getters.systemByType('fullShowTime').value, 10) * 1000;
    } catch (err) {
      this.updateInterval = 2000;
    }
    this.looper = new RequestLooper(
      () => {
        const params = {
          modeType: `video-mode-${this.videoIndex}`,
          cameraId: this.deviceInfo.id
        };
        return alarmRealTimeSrv.getCaptureRealTimeList(params);
      },
      (response) => {
        if (response.code === 0) {
          this.addImages(response.data.records || []);
        }
      },
      2000
    );
  },
  mounted() {
    this.looper.start();
  },
  beforeDestroy() {
    this.looper.destroy();
  },
  methods: {
    startUpdate() {
      if (this.updateTimer) clearTimeout(this.updateTimer);
      this.updateTimer = setTimeout(() => {
        this.updateAnimateCard();
      }, this.updateInterval);
    },
    updateAnimateCard() {
      const nextItem = this.imageCache.shift();
      if (nextItem) this.url = nextItem.fullUrl;
      this.startUpdate();
    },
    addImages(data) {
      const newData = Array.isArray(data) ? data : [data];
      this.imageCache = this.imageCache.concat(newData);
      if (this.imageCache.length > this.cacheMaxNum) {
        this.imageCache = _.takeRight(this.imageCache, this.cacheMaxNum);
      }
    },
    clear() {
      this.imageCache = [];
    },
    onClickClose() {
      this.looper.stop();
      this.clear();
      this.$emit('close');
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
  .operate-header {
    display: none;
    height: 40px;
    background: rgba(42, 42, 42, 0.8);
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 10;
    padding: 0 20px;
    box-sizing: border-box;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
    .title {
      font-size: 14px;
      color: #f9f9f9;
      font-weight: 500;
      line-height: 40px;
      width: 195px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .header-right {
      display: flex;
      justify-content: center;
      align-items: center;
      .close-btn {
        display: flex;
        align-items: center;
        z-index: 10;
        margin-left: 10px;
        cursor: pointer;
      }
      .split-btn {
        cursor: pointer;
      }
    }
  }
  &:hover {
    .operate-header {
      display: flex;
    }
  }
  .player-container {
    height: 100%;
    width: 100%;
  }
}
</style>
