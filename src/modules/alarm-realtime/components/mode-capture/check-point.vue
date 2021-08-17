<template>
  <div
    class="check-point"
    :class="isCheckPointActive?'active':''"
    @drop="onDrop"
    @dragover.prevent>
    <div
      class="check-point-header">
      <div
        v-tooltip="true"
        class="header-info">
        <span>{{ checkPointName }}</span>
        <!-- <span
          v-show="isCheckPointActive">{{ placeName }}</span> -->
        <span
          v-show="isCheckPointActive">{{ deviceName }}</span>
      </div>
      <div
        class="header-function"
        v-show="isCheckPointActive">
        <meg-button
          @click="playVideo"
          v-show="isShowVideo"
          type="text">
          {{ $t('视频') }}
        </meg-button>
        <meg-button
          type="text"
          @click="onClickRemove">
          {{ $t('移除') }}
        </meg-button>
        <meg-button
          @click="onClickSearchCapture"
          type="text">
          {{ $t('查看更多') }}
          <meg-icon
            name="arrow_ hollow"
            width="10px"
            height="10px"
            dir="left"
            color="#435068"></meg-icon>
        </meg-button>
      </div>
    </div>
    <div
      class="check-point-content"
      v-show="isCheckPointActive">
      <animate-card-frame
        ref="cardFrame"
        :max-display-num="14">
        <template v-slot:default="{data}">
          <check-point-card
            :on-click-card="onClickCard"
            :card-info="data">
          </check-point-card>
        </template>
      </animate-card-frame>
    </div>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import AnimateCardFrame from '../animate-card-frame';
import CheckPointCard from './check-point-card';
import RequestLooper from '../request-looper';
import { setCustomSetting, getCustomSetting } from '../device-data';
import alarmRealTimeSrv from '../../alarm-realtime.service';

export default {
  name: 'CheckPoint',
  components: {
    AnimateCardFrame,
    CheckPointCard
  },
  props: {
    // 卡口索引
    checkPointIndex: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      deviceInfo: {
        id: ''
      }
    };
  },
  computed: {
    checkPointName() {
      return `卡口${this.checkPointIndex}`;
    },
    deviceName() {
      return this.deviceInfo && this.deviceInfo.name;
    },
    placeName() {
      return this.deviceInfo && this.deviceInfo.parentId;
    },
    // 卡口是否激活
    isCheckPointActive() {
      return !!this.deviceName;
    },
    // 视频播放是否激活
    isShowVideo() {
      const data = this.deviceInfo;
      const type = data.flag === 'camera'
      && data.type !== '3'
      && data.type !== '5'
      && data.type !== '6'
      && data.type !== '7';

      return ['0', '1', '5'].includes(data.status) && type;
    }

  },
  created() {
    this.looper = new RequestLooper(
      () => {
        const params = {
          modeType: `capture-mode-${this.checkPointIndex}`,
          cameraId: this.deviceInfo.id
        };
        return alarmRealTimeSrv.getCaptureRealTimeList(params);
      },
      (response) => {
        if (response.code === 0) {
          this.$refs.cardFrame.addCard(response.data.records);
        }
      },
      2000
    );

    getCustomSetting('checkPoints').then((settings) => {
      const setting = settings[this.checkPointIndex - 1] || {};
      this.deviceInfo = setting;
      if (this.deviceInfo.id) this.looper.start();
    });
  },
  mounted() {

  },
  beforeDestroy() {
    this.looper.destroy();
  },
  methods: {
    playVideo() {
      this.$emit('video-play', this.deviceInfo);
    },
    // 点击卡片响应事件
    onClickCard(item) {
      this.$emit('card-click', item);
    },
    onDrop(evt) {
      const deviceStr = evt.dataTransfer.getData('draggingData');
      try {
        const info = JSON.parse(deviceStr);
        if (info.flag !== 'camera') {
          return;
        }
        this.looper.stop();
        this.$refs.cardFrame.clear();
        this.deviceInfo = info;
        this.looper.start();
        setCustomSetting('checkPoints', this.checkPointIndex - 1, info);
      } catch (err) {
        console.warn('drop info parse error:', err.message);
      }
    },
    /**
     * 移除设备
     */
    onClickRemove() {
      this.deviceInfo = {};
      this.looper.stop();
      this.$refs.cardFrame.clear();
      setCustomSetting('checkPoints', this.checkPointIndex - 1);
    },
    onClickSearchCapture() {
      switchToModule({
        isBlank: true,
        module: 'capture-search',
        query: {
          cameraIds: [this.deviceInfo.id],
          type: 'camera',
          sourceType: 'CAMERA'
        }
      });
    }
  }
};
</script>
<style  lang="scss" scoped>
.check-point {
  flex: 0 0 250px;
  min-height: 250px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  justify-content: flex-start;
  padding: 10px;
  border: 1px dashed #b0b5c0;
  background-color: #e2e4e6;
  margin-bottom: 10px;
  &.active {
    border: none;
    background-color: #ffffff;
  }
  .check-point-header {
    display: flex;
    box-sizing: border-box;
    align-items: center;
    flex: 0 0 50px;
    vertical-align: middle;
    .header-info {
      justify-self: flex-start;
      margin-left: 10px;
      font-size: 14px;
      max-width: 900px;
      span {
        margin-right: 20px;
      }
    }
    .header-function {
      margin-left: auto;
      margin-right: 10px;
      text-align: right;
      width: 200px;
    }
  }
  .check-point-content {
    flex: 1;
    background: #ffffff;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    padding: 10px;
    overflow: hidden;
  }
}
</style>
