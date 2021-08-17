<template>
  <div
    v-loading="isLoading"
    class="camera-msg">
    <div class="msg-title">
      <div
        class="title-text"
        v-tooltip="true">
        {{ cameraData.name }}
      </div>
      <span
        v-show="isShowVideoPlay"
        @click="videoPlay"
        class="video-play">
        <meg-icon
          width="18"
          height="18"
          color="#21539b"
          name="full_play">
        </meg-icon>
      </span>

      <meg-icon
        class="close"
        @click.native="closeDetail"
        name="close"
        color="#D1D5DD">
      </meg-icon>
    </div>
    <div class="camera-type">
      {{ typeOptions[cameraData.monitoringType] }}
    </div>
    <div
      @mouseenter="isInfo=false"
      @mouseleave="isInfo=true"
      class="msg-body">
      <div
        v-if="isInfo"
        class="msg-info">
        <div class="msg-statistics">
          <span>今日告警</span>
          <span class="msg-number">{{ cameraData.alarmNum }}</span>
        </div>
        <div class="msg-statistics">
          <span>今日目标</span>
          <span class="msg-number">{{ cameraData.captureNum }}</span>
        </div>
        <div class="msg-feature">
          <div
            v-if="cameraData.realtimeAnalyze"
            class="feature-list">
            <span>实时解析</span>
            <div
              v-for="(item, ind) of icons"
              v-show="cameraData.realtimeAnalyze[item.code]"
              :key="ind"
              class="feature-icon">
              <meg-icon
                :name="item.name"
                :color="item.color">
              </meg-icon>
            </div>
          </div>
          <div
            v-if="cameraData.videoAnalyze"
            class="feature-list">
            录像解析
            <div
              v-for="(item, ind) of icons"
              :key="ind"
              v-show="cameraData.videoAnalyze[item.code]"
              class="feature-icon">
              <meg-icon
                :name="item.name"
                :color="item.color">
              </meg-icon>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div
          class="label-box">
          <span class="label">区域</span>
          <div
            v-tooltip="true"
            class="content">
            {{ cameraData.placeName }}
          </div>
        </div>
        <div
          class="label-box">
          <span class="label">单位</span>
          <div
            v-tooltip="true"
            class="content">
            {{ cameraData.unitName }}
          </div>
        </div>
        <div
          class="label-box">
          <span class="label">标签</span>
          <div
            v-tooltip="true"
            class="content">
            {{ labelsFormat(cameraData.labels) }}
          </div>
        </div>
      </div>
    </div>
    <div class="camera-button">
      <meg-button
        @click="targetCapture"
        type="text">
        抓拍检索
      </meg-button>
      <div class="button-icon"></div>
      <meg-button
        @click="targetAlarm"
        type="text">
        历史报警
      </meg-button>
    </div>
    <img
      v-show="!isLoading"
      class="device-icon"
      :src="deviceImg" />
  </div>
</template>

<script>
import normal from '@/common-components/common-maps/images/default-active.png';
import analysis from '@/common-components/common-maps/images/default-analysis-active.png';
import notAnalysis from '@/common-components/common-maps/images/default-noanalysis-active.png';
import off from '@/common-components/common-maps/images/default-off-active.png';
import { switchToModule } from '@/utils/utils';

export default {
  props: {
    cameraData: {
      type: Object,
      default: () => {}
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    open: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isInfo: true,
      icons: [
        {
          name: 'card_face',
          color: '#435068',
          code: 'face'
        },
        {
          name: 'person',
          color: '#435068',
          code: 'pedestrian'
        },
        {
          name: 'car',
          color: '#435068',
          code: 'motor'
        },
        {
          name: 'non_motor_vehicle',
          color: '#435068',
          code: 'nonMotor'
        },
      ],
      buttonStatus: true, // true-暂停状态
      typeOptions: {},
      tagOption: {}
    };
  },
  computed: {
    /** 是否显示视频播放按钮 */
    isShowVideoPlay() {
      return this.cameraData.url && ![15, 3, 5, 6, 7].includes(this.cameraData.type);
    },
    deviceImg() {
      const status = this.cameraData.status ? this.cameraData.status.toString() : '0';
      console.log(status);
      switch (status) {
        case '2':
          return off;
        case '0':
        case '5':
          if (!this.open) {
            return normal;
          }
          return analysis;
        case '1':
        case '3':
          if (!this.open) {
            return normal;
          }
          return notAnalysis;
        default:
          return normal;
      }
    }
  },
  created() {
    this.$store.getters.dataMapByType('bayonet_type').forEach((item) => {
      this.typeOptions[item.code] = item.value;
    });
    this.$store.getters.dataMapByType('device_tag').forEach((item) => {
      this.tagOption[item.code] = item.value;
    });
  },
  methods: {
    /**
     * 设备标签转码
     */
    labelsFormat(labels = []) {
      return labels.map((item) => this.tagOption[item]).join();
    },
    /**
     * 关闭详情
     */
    closeDetail() {
      this.$emit('close-detail');
    },
    /**
     * 鼠标移上详情
     */
    hoverDetail() {},
    /**
     * 查看设备抓拍
     */
    targetCapture() {
      const moduleAuth = this.$store.getters.modulesByAlias('capture-search');
      if (moduleAuth) {
        switchToModule({
          module: 'capture-search',
          pageType: 'single',
          query: {
            cameraIds: [this.cameraData.id],
            type: 'camera',
            sourceType: 'CAMERA'
          }
        });
      } else {
        this.$message.info('当前用户无抓拍检索查看权限');
      }
    },
    /**
     * 查看历史报警
     */
    targetAlarm() {
      const moduleAuth = this.$store.getters.modulesByAlias('alarm-history');
      if (moduleAuth) {
        switchToModule({
          module: 'alarm-history',
          query: {
            cameraIds: JSON.stringify([this.cameraData.id]),
            type: 'camera'
          }
        });
      } else {
        this.$message.info('当前用户无历史报警查看权限');
      }
    },
    /**
     * 点击相机播放视频
     */
    videoPlay() {
      this.$emit('video-play', this.cameraData);
    }
  }
};
</script>
<style lang='scss' scoped>
.camera-msg {
  position: relative;
  .device-icon {
    position: absolute;
    bottom: -35px;
    left: 50%;
    margin-left: -12px;
    width: 26px;
    height: 28px;
  }
  div {
    box-sizing: border-box;
  }
  width: 350px;
  padding: 20px 20px 0 20px;
  background: #ffffff;
  box-shadow: 4px 4px 6px 0 rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  .msg-title {
    width: 100%;
    height: 20px;
    font-size: 16px;
    color: #435068;
    display: flex;
    align-items: center;
    .title-text {
      max-width: 280px;
      padding-right: 18px;
    }
  }
  .camera-type {
    font-size: 12px;
    color: rgba(67, 80, 104, 0.5);
    letter-spacing: 0;
    height: 28px;
    line-height: 28px;
    margin-bottom: 12px;
  }

  .close {
    cursor: pointer;
    position: absolute;
    top: 20px;
    right: 20px;
  }
  .msg-body {
    width: 100%;
    height: 80px;
    .msg-info {
      display: flex;
    }
    .msg-statistics {
      width: 80px;
      margin-right: 20px;
      height: 44px;
      border-right: 1px solid #f3f3f3;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .msg-number {
        font-family: "HEMIHEAD";
        font-size: 18px;
      }
    }
    .msg-feature {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 44px;
      .feature-list {
        display: flex;
      }
    }

    .label-box {
      display: flex;
      font-size: 14px;
      overflow: hidden;
      line-height: 24px;
      .label {
        flex-shrink: 0;
        color: #869abb;
        margin-right: 12px;
      }
      .content {
        flex: 1;
      }
    }
  }
  .feature-icon {
    border: 1px solid #dce1e5;
    border-radius: 1px;
    width: 16px;
    height: 16px;
    margin-left: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .video-play {
    cursor: pointer;
  }

  .camera-button {
    width: 100%;
    height: 45px;
    border-top: 1px solid #f3f3f3;
    padding: 13px 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .button-icon {
      width: 1px;
      height: 100%;
      background: #d2d6de;
    }
  }
}
.camera-msg::after {
  content: "";
  position: absolute;
  left: 50%;
  margin-left: -8px;
  border-right: 8px solid rgba(0, 0, 0, 0);
  border-left: 8px solid rgba(0, 0, 0, 0);
  border-top: 8px solid #ffffff;
  border-bottom: 8px solid rgba(0, 0, 0, 0);
}
</style>
