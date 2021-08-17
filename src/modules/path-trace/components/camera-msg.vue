<template>
  <div
    class="camera-msg">
    <div class="msg-title">
      <div
        class="title-text"
        v-tooltip="true">
        {{ cameraData.name }}
      </div>
      <meg-icon
        @click.native="closeDetail"
        name="close"
        color="#D1D5DD">
      </meg-icon>
    </div>
    <div class="camera-type">
      {{ cameraType }}
    </div>
    <div v-if="mode === 'out'">
      <div
        class="relatime-task"
        v-if="realtimeTasks.totalRecords > 0 && isShowRealTime">
        <span class="task-title">实时解析任务</span>
        <div
          v-if="buttonStatus"
          class="task-pause"
          @click="pauseRealtime">
          <meg-icon
            name="mission_stop"
            color="#21539B">
          </meg-icon>
          <span class="relatime-contorl">暂停</span>
        </div>
        <div
          v-else
          class="task-pause"
          @click="resumeRealtime">
          <meg-icon
            name="arrow_solid"
            color="#21539B">
          </meg-icon>
          <span class="relatime-contorl">继续</span>
        </div>
      </div>
      <div
        class="camera-captureTime"
        v-if="realtimeTasks.totalRecords > 0 && isShowRealTime">
        <meg-icon
          name="time_fill"
          color="#D1D5DD">
        </meg-icon>
        <span class="captureTime-text">
          {{ new Date() | formatTime('YYYY-MM-DD HH:mm:ss') }}
        </span>
        <div
          v-for="(item, ind) of icons"
          :key="ind"
          class="captureTime-icon">
          <meg-icon
            :name="item.name"
            :color="iconColor(item.type)">
          </meg-icon>
        </div>
      </div>
      <div
        class="history-task"
        v-if="historyTasks.totalRecords > 0">
        <span class="task-title">录像解析任务</span>
        <span class="task-number">{{ historyTasks.totalRecords }}</span>
        <span class="task-unit">个</span>
        <span
          class="task-jump"
          @click="viewTask">
          查看任务
          <meg-icon
            name="arrow_right"
            color="#21539B">
          </meg-icon>
        </span>
      </div>
    </div>
    <div
      v-else
      @mouseenter.stop="handleMouseEnter"
      @mouseleave.stop="handleMouseLeave">
      <div
        class="camera-card__body"
        key="body"
        v-if="!isShowTag">
        <div class="aside">
          <h3>今日目标</h3>
          <p v-tooltip="true">
            {{ cameraData.cameraCount }}
          </p>
        </div>
        <div class="content">
          <div
            class="realtime-analysis">
            <p>实时解析</p>
            <meg-icon
              class="analysis-icon"
              v-for="(item, key) of icons"
              :key="key"
              :name="item.name"
              :color="iconColor(item.type)">
            </meg-icon>
          </div>
          <div
            class="history-analysis">
            <p>录像解析</p>
            <meg-icon
              class="analysis-icon"
              v-for="(item, key) of icons"
              :key="key"
              :name="item.name"
              :color="historyIconColor(item.type)">
            </meg-icon>
          </div>
        </div>
      </div>
      <!-- 标签 -->
      <div
        class="camera-tags-wrapper"
        key="tag"
        v-else>
        <div
          class="camera-sub"
          v-for="tag in cameraTags"
          :key="tag.key">
          <div class="sub-label">
            {{ tag.label }}
          </div>
          <div
            class="sub-content"
            v-tooltip="true">
            <template v-if="tag.key === 'labels'">
              {{ resolveLables(cameraData.labels) }}
            </template>
            <template v-else-if="tag.key === 'placeName'">
              {{ cameraData.placeName }}
            </template>
            <template v-else>
              {{ cameraData.unitName }}
              <template>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="camera-play">
      <div
        :class="['play-button']"
        @click="streamPlayer">
        实时视频
      </div>
      <div class="play-icon"></div>
      <div
        class="play-button"
        @click="historyPlayer">
        录像回放
      </div>
    </div>
    <common-video-playback
      :visible.sync="isVisiblePlayer"
      :camera-id="cameraId"
      :camera-name="cameraData.name"
      :base-url="baseUrl"
      @close="closeBackPlayer">
    </common-video-playback>
    <video-realtime
      v-if="isVisibleRealtime"
      :visible.sync="isVisibleRealtime"
      :camera-id="cameraId">
    </video-realtime>
  </div>
</template>

<script>
import CommonVideoPlayback from '@/common-components/common-video-playback';
import videoRealtime from '@/common-components/common-video-realtime/video-realtime.vue';
import CameraSelectSrv from '@/common-components/common-camera-selector/camera-select.service';
import { switchToModule } from '@/utils/utils';
import pathTraceSrv from '../path-trace.service';

export default {
  components: {
    CommonVideoPlayback,
    videoRealtime
  },
  props: {
    cameraData: {
      type: Object,
      default: () => {}
    },
    mode: {
      type: String,
      default: 'out'
    },
    realtimeTasks: {
      type: Object,
      default: () => {}
    },
    historyTasks: {
      type: Object,
      default: () => {}
    },
    labelsMap: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      icons: [
        {
          name: 'card_face',
          type: 'doFace'
        },
        {
          name: 'person',
          type: 'doBody'
        },
        {
          name: 'car',
          type: 'doMotor'
        },
        {
          name: 'non_motor_vehicle',
          type: 'doNonMotor'
        },
      ],
      cameraTags: [
        {
          label: '区域',
          key: 'placeName'
        },
        {
          label: '单位',
          key: 'deptName',
        },
        {
          label: '标签',
          key: 'labels',
        }
      ],
      isShowTag: false,
      isVisiblePlayer: false,
      buttonStatus: true, // true-暂停状态
      isVisibleRealtime: false,
      baseUrl: ''
    };
  },
  computed: {
    realtimeTasksParams() {
      return {
        taskIds: this.realtimeTasks.records.map((item) => item.id),
        cameraIds: this.realtimeTasks.records.map((item) => item.cameraId),
      };
    },
    monitoringType() {
      return (this.realtimeTasks.records && this.realtimeTasks.records.length > 0) ? this.realtimeTasks.records[0].monitoringType : '';
    },
    isShowRealTime() {
      return [4, 5, 12].includes(this.monitoringType);
    },
    cameraId() {
      return this.cameraData.id;
    },
    cameraTypeCode() {
      return this.$store.getters.dataMapByType('camera_type');
    },
    cameraType() {
      const typeCode = this.cameraData.type;
      const cameraType = this.cameraTypeCode.filter((item) => parseFloat(item.code) === parseFloat(typeCode));
      return (cameraType[0] && cameraType[0].value) || '';
    },
  },
  watch: {
    realtimeTasks(val) {
      if (val && val.records && val.records.length > 0) {
        const { status } = val.records[0];
        if (status === 3) this.buttonStatus = false;
        else this.buttonStatus = true;
      }
    }
  },
  methods: {
    iconColor(type) {
      if (this.realtimeTasks.totalRecords > 0) {
        const msg = this.realtimeTasks.records[0];
        return (msg[type] !== undefined) && (msg[type] === 0) ? '#DCE1E5' : '#435068';
      }
      return '#DCE1E5';
    },
    historyIconColor(type) {
      if (this.historyTasks.totalRecords > 0) {
        const msg = this.historyTasks.records[0];
        return (msg[type] !== undefined) && (msg[type] === 0) ? '#DCE1E5' : '#435068';
      }
      return '#DCE1E5';
    },
    async getVideoInfo() {
      return CameraSelectSrv.getCameraVideo({
        deviceId: this.cameraId,
        protocol: 'iot'
      }).then(({ code, data }) => {
        if (code === 0) {
          this.baseUrl = data.url;
        }
      });
    },
    /**
     * 鼠标移入展示相机各种标签
     */
    handleMouseEnter() {
      this.isShowTag = true;
    },
    /**
     * 鼠标移出隐藏相机各种标签
     */
    handleMouseLeave() {
      this.isShowTag = false;
    },
    closeDetail() {
      this.$emit('close-detail');
    },
    /**
     * @description 处理相机标签路径
     * @param {Array} 相机标签id数组
     * @returns string 标签路径字符串
     */
    resolveLables(labels) {
      let labelStr = '';
      if (Array.isArray(labels)) {
        labelStr = labels.map((labelId) => {
          if (this.labelsMap[labelId]) {
            return this.labelsMap[labelId].join('/');
          }
          return '';
        }).filter((item) => item).join(',');
      }
      return labelStr;
    },
    pauseRealtime() {
      const params = {
        status: 2,
        ...this.realtimeTasksParams,
        sourceType: 1,
        monitoringType: 1
      };
      pathTraceSrv.pauseRealtime(params).then((res) => {
        if (res.code === 0) {
          this.buttonStatus = false;
        }
      });
    },
    async historyPlayer() {
      await this.getVideoInfo();
      this.isVisiblePlayer = true;
    },
    streamPlayer() {
      this.isVisibleRealtime = true;
    },
    viewTask() {
      switchToModule({
        module: 'videotape-analysis',
        query: {
          id: this.cameraId
        },
        pageType: 'single',
        isBlank: true,
      });
    },
    resumeRealtime() {
      const params = {
        status: 4,
        ...this.realtimeTasksParams,
        sourceType: 1,
        monitoringType: 1
      };
      pathTraceSrv.resumeRealtime(params).then((res) => {
        if (res.code === 0) {
          this.buttonStatus = true;
        }
      });
    },
    closeBackPlayer() {
    }
  }
};
</script>
<style lang='scss' scoped>
.camera-msg {
  position: relative;
  .stream-player {
    position: fixed;
    left: 0;
    top: 0;
    width: 150%;
    height: 150%;
    z-index: 2;
  }
  .disabled {
    opacity: .6;
    cursor: not-allowed;
  }
  div {
    box-sizing: border-box;
  }
  width: 320px;
  padding: 16px 16px 0 16px;
  background: #FFFFFF;
  box-shadow: 4px 4px 6px 0 rgba(0,0,0,0.20);
  border-radius: 2px;
  .msg-title {
    width: 100%;
    height: 20px;
    line-height: 20px;
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    color: #435068;
    letter-spacing: 0;
    display: flex;
    justify-content: space-between;
    .title-text{
      width: 240px;
    }
  }
  .camera-type {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    color: rgba(67,80,104,0.50);
    letter-spacing: 0;
    height: 28px;
    line-height: 28px;
    margin-bottom: 12px;
  }
  .analysis-icon {
    margin-left: 8px;
    color:#DCE1E5;
    border: 1px solid #DCE1E5;
    border-radius: 2px;
    &.is-working{
      color: #435068;
    }
  }
  .camera-card__body {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    align-content: center;
    .aside{
      border-right: 1px solid  #DCE1E5;
      padding-right: 5px;
      max-width: 100px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      height: 44px;
      h3 {
        font-size: 14px;
        color: #435068;
        flex: 1
      }
      p {
        font-family: HEMIHEAD;
        font-size: 20px;
        color: #435068;
        padding-top: 15px;
        line-height: 1;
        flex: 1
      }
    }
    .content {
      padding-left: 24px;
      flex: 1;
      box-sizing: border-box;
      .realtime-analysis, .history-analysis {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        .analysis-icon {
          margin-left: 8px;
          color:#DCE1E5;
          border: 1px solid #DCE1E5;
          border-radius: 2px;
          &.is-working{
            color: #435068;
          }
        }
      }
      .history-analysis {
        padding-top: 10px;
      }
    }
    .more {
      margin-left: 24px;
      cursor: pointer;
      .next-icon {
        transform: rotate(-90deg);
        color: #D8D8D8;
      }
    }
  }
  .camera-tags-wrapper{
    .camera-sub{
      display: flex;
      padding-top: 12px;
      .sub-label{
        margin-right: 12px;
        font-size: 14px;
        color: #869ABB;
      }
      .sub-content{
        flex: 1;
        font-size: 14px;
        color: #435068;
      }
    }
  }
  .task-title {
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    color: #435068;
    letter-spacing: 0;
    margin-right: 15px;
  }
  .relatime-task {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .relatime-contorl {
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #21539B;
      letter-spacing: 0;
      margin-left: 2px;
    }
  }
  .camera-captureTime {
    height: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
    .captureTime-text {
      margin-left: 4px;
      margin-right: 12px;
      font-family: SourceHanSansCN-Regular;
      font-size: 12px;
      color: rgba(67,80,104,0.50);
      letter-spacing: 0;
    }
    .captureTime-icon {
      border: 1px solid #DCE1E5;
      border-radius: 1px;
      width: 20px;
      height: 20px;
      margin-left: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .history-task {
    display: flex;
    align-items: center;
    .task-number{
      font-size: 20px;
      color: #435068;
      letter-spacing: 0;
      font-family: HEMIHEAD;
      padding-right: 3px;
    }
    .task-unit {
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #435068;
      letter-spacing: 0;
      margin-right: 12px;
    }
    .task-jump {
      display: flex;
      align-items: center;
      font-family: SourceHanSansCN-Medium;
      font-size: 12px;
      color: #21539B;
      letter-spacing: 0;
      cursor: pointer;
    }
  }
  .task-pause{
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .camera-play {
    width: 100%;
    height: 45px;
    border-top: 1px solid #F3F3F3;
    padding: 13px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
    .play-icon {
      width: 1px;
      height: 100%;
      background: #D2D6DE;
    }
    .play-button{
      flex: 1;
      text-align: center;
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #21539B;
      cursor: pointer;
    }
  }
}
.camera-msg::after{
  content: '';
  position: absolute;
  left: 152px;
  bottom: -16px;
  border-right: 8px solid rgba(0,0,0,0);
  border-left: 8px solid rgba(0,0,0,0);
  border-top: 8px solid #FFFFFF;
  border-bottom: 8px solid rgba(0,0,0,0);
}
</style>
