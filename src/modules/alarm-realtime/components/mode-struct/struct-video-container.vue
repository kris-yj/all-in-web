<template>
  <div class="video-container">
    <meg-base-player
      type="stream"
      :socket-url="url"
      :show-top-bar="!snapshotImg"
      :show-bottom-bar="false"
      @close="onPlayerClose">
      <template v-slot:topBarLeft>
        <span class="video-title">{{ title }}</span>
      </template>
      <template v-slot:topBarRight>
        <span
          class="top-bar-right-item"
          v-show="!isFullscreen">
          <build-in-snapshot
            :disabled="isFullscreen"
            @snapshot="onSnapshot">
          </build-in-snapshot>
        </span>
        <span
          title="设置"
          class="setting-icon top-bar-right-item"
          @click.stop="showSetting=!showSetting">
          <meg-icon
            name="system_setting_menu"
            width="16px"
            height="16px"
            color="#fff">
          </meg-icon>
        </span>
        <span class="top-bar-right-item">
          <build-in-full-screen
            @full-screen-change="onFullscreenChange">
          </build-in-full-screen>
        </span>
        <span
          class="top-bar-right-item"
          v-show="!isFullscreen">
          <build-in-close-btn>
          </build-in-close-btn>
        </span>
      </template>
      <template v-slot:viewport="{size}">
        <build-in-loading>
        </build-in-loading>
        <!-- 结构化绘制 -->
        <structure-drawer
          :width="size.width"
          :height="size.height"
          :feature-map="featureMap">
        </structure-drawer>
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
      <template v-slot:container>
        <build-in-error-panel>
        </build-in-error-panel>
        <!-- 结构化属性设置 -->
        <div
          class="struct-setting"
          v-show="showSetting">
          <struct-setting @setting-change="changeMap">
          </struct-setting>
        </div>
      </template>
      <template v-slot:placeholder>
        <build-in-placeholder>
        </build-in-placeholder>
      </template>
    </meg-base-player>
  </div>
</template>
<script>
import {
  BuildInCloseBtn,
  BuildInFullScreen,
  BuildInPlaceholder,
  BuildInErrorPanel,
  BuildInLoading,
  BuildInSnapshot
} from '@megvii-video-player/plugin-video-build-in';
import {
  StructureDrawerVuePlugin as StructureDrawer
} from '@megvii-video-player/plugin-structure-drawer';
import SnapshotAnalyse from '@/common-components/common-video-snapshot-analyse';
import StructSetting from './struct-video-setting';
import { getCustomSetting, setCustomSetting } from '../device-data';
import alarmRealtimeSrv from '../../alarm-realtime.service';

export default {
  name: 'StructVideoContainer',
  components: {
    StructSetting,
    SnapshotAnalyse,
    BuildInCloseBtn,
    BuildInFullScreen,
    BuildInPlaceholder,
    BuildInErrorPanel,
    BuildInLoading,
    BuildInSnapshot,
    StructureDrawer
  },
  props: {
    deviceInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: '',
      title: '',
      snapshotImg: null,
      showSetting: false,
      isFullscreen: false,
      featureMap: {}
    };
  },
  watch: {
    deviceInfo(val) {
      this.updateDeviceInfo(val);
      setCustomSetting('struct', 0, val);
    }
  },
  created() {
    getCustomSetting('struct').then((settings) => {
      const [setting = {}] = settings;
      if (setting.id) {
        // this.deviceInfo = setting;
        this.updateDeviceInfo(setting);
      }
    });
  },
  methods: {
    changeMap(featureMap) {
      this.featureMap = featureMap;
    },
    async updateDeviceInfo(deviceInfo) {
      if (!deviceInfo.id) return;
      if (deviceInfo.status.toString() !== '0') {
        this.$message({
          type: 'error',
          message: '设备状态异常或掉线,无法打开视频',
          showClose: true
        });
        return;
      }
      this.title = deviceInfo.name || '';
      const params = {
        deviceId: deviceInfo.id,
        protocol: 'core'
      };
      const res = await alarmRealtimeSrv.getDeviceVideoAddressForStruct(params);
      if (res.code !== 0) {
        return;
      }

      const { url } = res.data;
      const videoSrcInfo = await alarmRealtimeSrv.getVideoStreamAddress({
        type: 'core',
        url
      });
      this.url = videoSrcInfo.data.streamAddr;
    },
    onPlayerClose() {
      this.url = '';
      setCustomSetting('struct', 0, {});
      this.$emit('close');
    },
    onSnapshot(snapshotImg) {
      this.snapshotImg = snapshotImg;
    },
    onExitSnapshot() {
      if (this.snapshotImg) URL.revokeObjectURL(this.snapshotImg);
      this.snapshotImg = null;
    },
    onFullscreenChange(isFullscreen) {
      this.isFullscreen = isFullscreen;
    }
  }
};
</script>
<style lang="scss" scoped>
.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: linear-gradient(0deg, #252f5b 0%, #1b2141 100%);

  .snapshot-label {
    color: #fff;
  }
  .snapshot-icon {
    margin-left: 13px;
    cursor: pointer;
  }
  .setting-icon {
    cursor: pointer;
  }

  .struct-setting {
    position: absolute;
    top: 40px;
    right: 10px;
    width: 320px;
    background-color: #fff;
    z-index: 100;
  }
  .top-bar-right-item,
  .bottom-bar-right-item {
    margin-left: 10px;
  }
  .top-bar-left-item,
  .bottom-bar-left-item {
    margin-right: 10px;
  }
}
</style>
