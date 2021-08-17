<template>
  <meg-dialog
    append-to-body
    width="800px"
    :visible="visible"
    :show-footer="false"
    class="play-dialog-wrap"
    :close-on-press-escape="false"
    @close="onPlayClose">
    <template v-slot:title>
      <div
        class="title-container">
        <span class="title">摄像区域设置</span>
        <span
          v-if="showRoi"
          class="info">
          提示：可以用鼠标在视频画面上框选出ROI区域，按T则是反向圈选，按ESC取消选取
        </span>
      </div>
    </template>
    <div
      class="main-container">
      <div
        class="task-player-wrap"
        ref="taskPlayer">
        <meg-base-player
          type="stream"
          ref="livePlayer"
          v-if="socketUrl"
          :socket-url="socketUrl"
          :show-bottom-bar="false">
          <template
            v-slot:topBarLeft>
            <span class="video-title">{{ taskData.cameraName }}</span>
          </template>
          <template v-slot:topBarRight>
            <span class="top-bar-right-item">
              <build-in-trans-rate>
              </build-in-trans-rate>
            </span>
            <span class="top-bar-right-item">
              <build-in-full-screen>
              </build-in-full-screen>
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
      </div>
      <megvii-roi
        v-model="roiValue"
        ref="roi">
      </megvii-roi>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
      v-if="showRoi">
      <meg-button
        type="primary"
        @click="roiConfirmClick">保存</meg-button>
      <meg-button @click="onPlayClose">取消</meg-button>
    </span>
    <div
      v-else
      class="footer-padding">
    </div>
  </meg-dialog>
</template>
<script>
import MegviiRoi from 'megvii-roi';
import realtimeAnalysisSrv from '@/modules/realtime-analysis/realtime-analysis.service';
import {
  BuildInFullScreen,
  BuildInPlaceholder,
  BuildInErrorPanel,
  BuildInLoading,
  BuildInTransRate
} from '@megvii-video-player/plugin-video-build-in';

export default {
  components: {
    MegviiRoi,
    BuildInFullScreen,
    BuildInPlaceholder,
    BuildInErrorPanel,
    BuildInLoading,
    BuildInTransRate
  },
  props: {
    showRoi: {
      type: Boolean,
      default: true
    },
    value: {
      type: Boolean,
      default: false
    },
    initRoiValue: {
      type: Object,
      default: () => ({})
    },
    taskData: {
      type: Object,
      default: () => ({})
    },
    from: {
      type: String,
      default: 'realtime'
    }
  },
  data() {
    return {
      socketUrl: '',
      roiValue: [],
      visible: this.value
    };
  },
  watch: {
    value: {
      immediate: true,
      async handler(v) {
        this.visible = v;
        if (v) {
          const { code, data } = await realtimeAnalysisSrv.searchOpenVideoInfo({
            deviceId: this.taskData.cameraId,
            protocol: 'iot'
          });
          if (code === 0) {
            let time = '';
            if (this.from === 'video') {
              const { startTime, endTime } = this.taskData;
              time = `&start=${Math.ceil(startTime / 1000)}&end=${Math.floor(endTime / 1000)}`;
            }
            const { code: code1, data: data1 } = await realtimeAnalysisSrv.getAddr({
              type: 'iot',
              url: `${data.url + time}`
            });
            if (code1 === 0) {
              this.socketUrl = data1.streamAddr;
            }
          }
        } else {
          this.socketUrl = '';
        }
      }
    },
    initRoiValue: {
      immediate: true,
      handler(value) {
        if (!this.showRoi) {
          return;
        }
        this.$nextTick(() => {
          const roiValue = [];
          if (value) {
            const { relativeViewports, relativeOcclusionAreas } = value || {};
            if (relativeViewports && relativeViewports.length) {
              relativeViewports.forEach((item) => {
                roiValue.push({
                  type: 'rect',
                  inner: true,
                  width: item.widthRatio,
                  height: item.heightRatio,
                  points: [{
                    x: item.leftRatio,
                    y: item.topRatio
                  }, {
                    x: Number(parseFloat(item.leftRatio + item.widthRatio).toFixed(2)),
                    y: Number(parseFloat(item.topRatio + item.heightRatio).toFixed(2))
                  }],
                  start: [item.leftRatio, item.topRatio]
                });
              });
            }
            if (relativeOcclusionAreas && relativeOcclusionAreas.length) {
              relativeOcclusionAreas.forEach((item) => {
                roiValue.push({
                  type: 'rect',
                  inner: false,
                  width: item.widthRatio,
                  height: item.heightRatio,
                  points: [{
                    x: item.leftRatio,
                    y: item.topRatio
                  }, {
                    x: Number(parseFloat(item.leftRatio + item.widthRatio).toFixed(2)),
                    y: Number(parseFloat(item.topRatio + item.heightRatio).toFixed(2))
                  }]
                });
              });
            }
          }
          console.log(this.$refs.roi, roiValue);
          this.roiValue = roiValue;
        });
      }
    }
  },
  mounted() {
    // this.$nextTick(() => {
    //   const { roi } = this.$refs;
    //   if (roi) {
    //     console.log('roiValue', JSON.stringify(this.roiValue));
    //     roi.setValue(this.roiValue);
    //   }
    // });
  },
  methods: {
    onPlayClose() {
      this.visible = false;
      this.$emit('input', false);
    },
    roiConfirmClick() {
      const { roiValue } = this;
      console.log('roiValue', roiValue);
      const data = {
        relativeOcclusionAreas: [],
        relativeViewports: []
      };
      if (roiValue && roiValue.length) {
        roiValue.forEach(({
          points,
          inner,
          width,
          height
        }) => {
          const { x, y } = points[0];
          data[inner ? 'relativeViewports' : 'relativeOcclusionAreas'].push({
            heightRatio: height,
            leftRatio: x,
            topRatio: y,
            widthRatio: width
          });
        });
      }
      this.$emit('roi-data', data);
      this.onPlayClose();
    },
    roiCancelClick() {
      //
    },
  }
};
</script>
<style lang="scss">
  .play-dialog-wrap{
    .main-container {
      position: relative;
    }
    .title-container{
      line-height: 55px;
      font-size: 16px;
      .info{
        font-size: 12px;
        color: #c1c1c1;
        margin-left: 10px;
      }
    }
    .task-player-wrap{
      height: 400px;
      position: relative;
      box-sizing: border-box;
      background-color: #000;
    }
    .task-player-wrap.roi{
      margin: 0;
    }
    v::deep .meg-dialog__footer{
      .dialog-camera-name{
        float: left;
        font-weight: 700;
        color: #42506a;
        font-size: 14px;
      }
    }
    .footer-padding{
      padding: 15px;
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
