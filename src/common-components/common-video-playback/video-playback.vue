<template>
  <meg-dialog
    class="video-playback"
    width="1250px"
    append-to-body
    :visible="visible">
    <div class="body">
      <div class="video-list">
        <div
          class="title"
          v-tooltip="true">
          {{ cameraName }}
        </div>
        <div class="data-picker">
          <div class="picker-wrapper">
            <meg-date-picker
              v-model="innerStartTime"
              type="datetime"
              placeholder="开始时间"
              :clearable="false"
              :prefix-icon-visible="false"
              :picker-options="pickerOptions1">
            </meg-date-picker>
            <meg-date-picker
              v-model="innerEndTime"
              type="datetime"
              placeholder="结束时间"
              :clearable="false"
              :prefix-icon-visible="false"
              :picker-options="pickerOptions2">
            </meg-date-picker>
          </div>
          <div class="picker-icon">
            <meg-icon
              name="calendar"
              color="rgb(199,205,215)"></meg-icon>
          </div>
        </div>
        <div class="video-length">
          {{ $t('共{count}段录像',{count: (videoList&&videoList.length)||0}) }}
        </div>
        <ul
          class="video-item-list">
          <li
            v-for="(item,index) in videoList"
            :key="index"
            :class="['video-item',active === index? 'active':'']"
            @click="videoPlay(index)">
            <div class="time-line">
              {{ item.startTime | formatTime }}
            </div>
            <div class="time-line">
              {{ item.endTime | formatTime }}
            </div>
          </li>
        </ul>
      </div>
      <div class="video-wrapper">
        <meg-base-player
          ref="player"
          type="file"
          :socket-url="playSrc"
          @close="closeDialog">
          <template v-slot:placeholder>
            <build-in-placeholder></build-in-placeholder>
          </template>
          <template v-slot:viewport="{size}">
            <build-in-loading>
            </build-in-loading>
            <build-in-error-panel>
            </build-in-error-panel>
            <!-- 截图分析 -->
            <snapshot-analyse
              style="z-index:10"
              :width="size.width"
              :height="size.height"
              :snapshot-img="snapshotImg"
              v-if="snapshotImg"
              @exit-snapshot="onExitSnapshot">
            </snapshot-analyse>
          </template>
          <template v-slot:bottomBarLeft>
            <build-in-play-btn></build-in-play-btn>
            <build-in-rate-control class="space"></build-in-rate-control>
          </template>
          <template v-slot:bottomBarFit>
            <build-in-progress class="space"></build-in-progress>
          </template>
          <template v-slot:topBarRight>
            <build-in-trans-rate class="space"></build-in-trans-rate>
            <build-in-snapshot
              class="space"
              @snapshot="onSnapshot"></build-in-snapshot>
            <build-in-full-screen class="space"></build-in-full-screen>
            <build-in-close-btn class="space"></build-in-close-btn>
          </template>
        </meg-base-player>
      </div>
      <div
        class="close-button"
        v-if="!playSrc"
        @click.stop="closeDialog">
        <meg-icon
          name="close_player"
          width="16px"
          height="16px"
          color="#fff"></meg-icon>
      </div>
    </div>
  </meg-dialog>
</template>

<script>
import {
  BuildInCloseBtn,
  BuildInPlaceholder,
  BuildInPlayBtn,
  BuildInProgress,
  BuildInRateControl,
  BuildInSnapshot,
  BuildInFullScreen,
  BuildInErrorPanel,
  BuildInLoading,
  BuildInTransRate
} from '@megvii-video-player/plugin-video-build-in';
import SnapshotAnalyse from '@/common-components/common-video-snapshot-analyse';
import VideoPlaybackSrv from './video-playback.service';

export default {
  name: 'CommonVideoPlayback',
  components: {
    BuildInCloseBtn,
    BuildInPlaceholder,
    BuildInPlayBtn,
    BuildInProgress,
    BuildInRateControl,
    BuildInSnapshot,
    BuildInFullScreen,
    BuildInErrorPanel,
    BuildInLoading,
    SnapshotAnalyse,
    BuildInTransRate
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    cameraId: {
      type: String,
      default: ''
    },
    cameraName: {
      type: String,
      default: ''
    },
    startTime: {
      type: [Date, String],
      default: () => {}
    },
    endTime: {
      type: [Date, String],
      default: () => {}
    },
    baseUrl: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      innerStartTime: '', // 开始时间
      innerEndTime: '', // 结束时间
      pickerOptions2: {
        disabledDate: (date) => Boolean(new Date(date).getTime() <= new Date(this.innerStartTime).getTime())
      },
      pickerOptions1: {
        disabledDate: (date) => Boolean(new Date(date).getTime() >= new Date(this.innerEndTime).getTime())
      },
      videoList: [], // 视频时间列表
      active: -1, // 当前选中项
      playSrc: '', // 当前播放地址
      snapshotImg: null,
    };
  },
  watch: {
    // 时间选择改变 触发列表更新
    innerStartTime(val) {
      if (val && this.innerEndTime && this.cameraId) {
        this.getList();
      }
    },
    innerEndTime(val) {
      if (val && this.innerStartTime && this.cameraId) {
        this.getList();
      }
    },
    visible(val) {
      if (val && this.innerStartTime && this.innerEndTime && this.cameraId) {
        this.getList();
      }
      if (this.videoList.length && val) {
        this.videoPlay(0);
      }
    }
  },
  mounted() {
    this.innerStartTime = this.startTime;
    this.innerEndTime = this.endTime;
  },
  methods: {
    // 获取播放列表
    getList() {
      this.videoList = [];
      const start = new Date(this.innerStartTime).getTime();
      const end = new Date(this.innerEndTime).getTime();
      VideoPlaybackSrv.getList({ cameraId: this.cameraId, startTime: start, endTime: end }).then((res) => {
        if (res.code === 0) {
          this.videoList = res.data.result;
          if (this.videoList.length) {
            this.videoPlay(0);
          }
        }
      });
    },
    // 点击列表触发播放
    videoPlay(index) {
      this.active = index;
      const url = `${this.baseUrl}&start=${Math.ceil(this.videoList[index].startTime / 1000)}&end=${Math.floor(this.videoList[index].endTime / 1000)}`;
      VideoPlaybackSrv.getAddr({ type: 'iot', url, allowShare: false }).then((res) => {
        if (res.code === 0) {
          this.playSrc = res.data.streamAddr;
        }
      });
    },
    closeDialog() {
      this.playSrc = '';
      this.$emit('update:visible', false);
      this.$emit('close');
    },
    onSnapshot(snapshotImg) {
      this.snapshotImg = snapshotImg;
    },
    onExitSnapshot() {
      if (this.snapshotImg) URL.revokeObjectURL(this.snapshotImg);
      this.snapshotImg = null;
    },
  },
};
</script>

<style lang='scss' scoped>
.video-playback {
  ::v-deep .meg-dialog__body {
    padding: 0;
  }
  .space {
    margin-left: 10px;
  }
  .body {
    height: 638px;
    background: rgb(54,55,56);
    position: relative;
    display: flex;
    .close-button {
      position: absolute;
      top: 12px;
      right: 20px;
      z-index: 10;
      cursor: pointer;
    }
    .video-list {
      width: 240px;
      color: rgb(199,205,215);
      .video-length {
        padding-left: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgb(47,47,49);
      }
      .video-item-list {
        height: 475px;
        overflow-y: auto;
      }
      .video-item {
        width: 220px;
        height: 68px;
        margin: 10px;
        border-radius: 4px;
        position: relative;
        cursor: pointer;
        &:hover,&.active {
          background: rgb(42,42,42);
          color: rgb(90,151,231);
        }
        .time-line {
          height: 34px;
          margin-left: 10px;
          line-height: 34px;
          font-size: 16px;
        }
        .play-icon {
          position: absolute;
          right: 25px;
          top: 24px;
        }
      }
      .data-picker {
        display: flex;
        margin: 10px;
        width: 220px;
        background: rgb(32,33,34);
      }
      .picker-wrapper {
        width: 175px;
      }
      .picker-icon {
        width: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 20px 0;
        border-left: 1px solid rgb(47,47,49);
      }
      .meg-date-editor {
        width: inherit;
      }
      .title {
        line-height: 50px;
        height: 50px;
        font-size: 18px;
        font-weight: bold;
        background: rgb(45,45,45);
        color: #fff;
        padding-left: 20px;
      }
      ::v-deep .meg-input__inner {
        background: rgb(32,33,34);
        border: none;
        color: rgb(199,205,215);
        width: 175px;
        font-size: 16px;
      }
      ::-webkit-input-placeholder {
        color: rgb(199,205,215);
        font-size: 16px;
      }
    }
    .video-wrapper {
      flex: 1;
    }
  }
}
</style>
