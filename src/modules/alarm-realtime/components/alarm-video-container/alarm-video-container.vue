<template>
  <div
    class="alarm-video-container"
    @dragover="e=>e.preventDefault()"
    @drop="onDrop"
    @dblclick="onDoubleClick">
    <video-player
      ref="videoPlayer"
      v-if="mode==='video'"
      :device-info="deviceInfo"
      :active="active"
      @active-change="onActiveChange"
      @close="onClose">
    </video-player>
    <capture-player
      v-else-if="mode==='capture'"
      :device-info="deviceInfo"
      :video-index="videoIndex"
      :active="active"
      @active-change="onActiveChange"
      @close="onClose">
    </capture-player>
    <div
      v-else
      class="empty-bg">
      <div class="camera-icon">
        <img
          :src="cameraIcon"
          alt="empty-bg" />
      </div>
      <p>暂无视频</p>
    </div>
  </div>
</template>

<script>
import cameraIcon from '@/assets/images/alarm-realtime/camera.svg';
import VideoPlayer from './video-player';
import CapturePlayer from './capture-player';
import { setCustomSetting, getCustomSetting } from '../device-data';
import alarmRealTimeSrv from '../../alarm-realtime.service';

const isUseCapturePlayer = (deviceInfo) => {
  const type = (deviceInfo.type && deviceInfo.type.toString()) || '1';
  return type === '15' // kafka 相机
   || type === '3' // 视图库相机
   || type === '5' // 人证机
   || type === '6' // 眼镜集群
   || type === '7'; // 便携集群
};

export default {
  name: 'AlarmVideoContainer',
  components: {
    VideoPlayer,
    CapturePlayer
  },
  props: {
    videoIndex: {
      required: true,
      type: [Number, String]
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      mode: 'none',
      deviceInfo: {
        url: '',
        name: ''
      },
      cameraIcon
    };
  },
  created() {
    getCustomSetting('videos').then((settings) => {
      const setting = settings[this.videoIndex] || {};
      if (setting.id) {
        this.updateDeviceInfo(setting);
      }
    });
  },
  methods: {
    onDrop(evt) {
      const deviceStr = evt.dataTransfer.getData('draggingData');
      this.eventTracking('AlarmVideoDragCamera');
      try {
        const info = JSON.parse(deviceStr);
        if (info.flag === 'camera') this.updateDeviceInfo(info);
      } catch (err) {
        console.warn('drop info parse error:', err.message);
      }
    },
    async updateDeviceInfo(deviceInfo) {
      this.$emit('device-change', this.videoIndex, deviceInfo);
      if (isUseCapturePlayer(deviceInfo)) {
        this.deviceInfo = deviceInfo;
        this.mode = 'capture';
        setCustomSetting('videos', this.videoIndex, deviceInfo);
      } else {
        const res = await alarmRealTimeSrv.getDeviceVideoAddress({
          deviceId: deviceInfo.id,
          protocol: 'iot'
        });
        if (res.code !== 0) {
          return;
        }
        const { url } = res.data;
        const videoSrcInfo = await alarmRealTimeSrv.getVideoStreamAddress({
          type: 'iot',
          url
        });
        this.deviceInfo = {
          url: videoSrcInfo.data.streamAddr,
          ...deviceInfo
        };
        setCustomSetting('videos', this.videoIndex, deviceInfo);
        if (this.mode !== 'video') this.mode = 'video';
      }
    },
    onActiveChange(active) {
      this.$emit('active-change', this.videoIndex, active);
    },
    onClose() {
      this.deviceInfo = {
        url: '',
        name: ''
      };
      setCustomSetting('videos', this.videoIndex);
      this.$emit('device-change', this.videoIndex, {});
      if (this.mode !== 'video') this.mode = 'none';
    },
    onDoubleClick() {
      if (this.mode === 'none') return;
      if (this.mode === 'video') {
        if (this.active) {
          //* 暂时统一交互，防止歧义
          // if (this.$refs.videoPlayer) this.$refs.videoPlayer.toggleFullscreen();
          this.$emit('active-change', this.videoIndex, false);
        } else {
          this.$emit('active-change', this.videoIndex, true);
        }
      }
      if (this.mode === 'capture') {
        if (this.active) {
          this.$emit('active-change', this.videoIndex, false);
        } else {
          this.$emit('active-change', this.videoIndex, true);
        }
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.alarm-video-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.empty-bg {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  .camera-icon {
    opacity: 0.3;
    img {
      width: 78px;
      height: 61px;
    }
  }
  flex-direction: column;
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.25);
  z-index: 2;
}
</style>
