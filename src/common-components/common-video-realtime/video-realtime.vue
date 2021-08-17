<template>
  <meg-dialog
    class="video-realtime"
    width="1250px"
    append-to-body
    :visible="visible">
    <div class="body">
      <div class="video-wrapper">
        <meg-base-player
          ref="player"
          type="stream"
          :socket-url="videoInfo.url"
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
          <template v-slot:topBarRight>
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
  BuildInSnapshot,
  BuildInFullScreen,
  BuildInErrorPanel,
  BuildInLoading,
} from '@megvii-video-player/plugin-video-build-in';
import SnapshotAnalyse from '@/common-components/common-video-snapshot-analyse';
import VideoRealtimeSrv from './video-realtime.service';

export default {
  name: 'CommonVideoPlayback',
  components: {
    BuildInCloseBtn,
    BuildInPlaceholder,
    BuildInSnapshot,
    BuildInFullScreen,
    BuildInErrorPanel,
    BuildInLoading,
    SnapshotAnalyse
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
  },
  data() {
    return {
      playSrc: '', // 当前播放地址
      snapshotImg: null,
      videoInfo: {}
    };
  },
  created() {
    this.getVideoInfo();
  },
  methods: {
    async getVideoInfo() {
      const res = await VideoRealtimeSrv.getCameraVideo({
        deviceId: this.cameraId,
        protocol: 'iot'
      });
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      const { url } = res.data;
      const urlRes = await VideoRealtimeSrv.getIotUrl({
        type: 'iot',
        url,
      });
      if (urlRes.code !== 0) {
        this.$message.error(urlRes.msg);
        return;
      }
      // ws://10.199.0.144:8601/gmp/stream/eyJyZXNvbHV0aW9uIjoiZGVmYXVsdCIsInR5cGUiOiJpb3QiLCJ1cmwiOiJ3czovLzEwLjEyMi4xMDAuMTE5Ojg1NDQvaW90L3N0cmVhbT91cmw9MTEwMDAwMjAwNTAwMDAwMDAzIn0K
      this.videoInfo = {
        type: 'iot',
        url: urlRes.data.streamAddr
      };
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
.video-realtime {
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
        text-align: center;
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
