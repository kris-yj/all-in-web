<template>
  <div
    v-loading="cameraLoading"
    class="camera-card__wrapper">
    <div class="camera-card__container">
      <!-- 标题 -->
      <div class="camera-card__header">
        <div
          class="title"
          @click="cameraPlay">
          <h3 v-tooltip="true">
            {{ cameraInfo.name }}
          </h3>
          <meg-icon
            class="player-icon no-pointer-events"
            name="full_play"
            width="16"
            height="16"
            color="#21539b"></meg-icon>
        </div>
        <p>{{ typeOptions[cameraInfo.monitoringType] }}</p>
        <div
          class="actions"
          @click="$emit('close')">
          <meg-icon
            class="close-icon"
            name="close"
            width="16"
            height="16"></meg-icon>
        </div>
      </div>
      <!-- 解析类型 -->
      <div
        class="main"
        @mouseenter.stop="handleMouseEnter"
        @mouseleave.stop="handleMouseLeave">
        <transition
          name="fade"
          mode="out-in">
          <div
            class="camera-card__body"
            key="body"
            v-if="!isShowTag">
            <div class="aside">
              <h3>今日目标数</h3>
              <p v-tooltip="true">
                {{ cameraInfo.captureCount }}
              </p>
            </div>
            <div class="content">
              <div
                class="realtime-analysis"
                v-show="cameraInfo.realTimeTask">
                <p>实时解析</p>
                <meg-icon
                  v-for="item in realTimeIconList"
                  :class="['analysis-icon', 'no-pointer-events', {'is-working':item.isWorking } ]"
                  :key="item.icon"
                  :name="item.icon"
                  width="20"
                  height="20"></meg-icon>
              </div>
              <div
                class="history-analysis"
                v-show="cameraInfo.historyTask">
                <p>录像解析</p>
                <meg-icon
                  v-for="item in historyIconList"
                  :class="['analysis-icon', 'no-pointer-events', {'is-working':item.isWorking } ]"
                  :key="item.icon"
                  :name="item.icon"
                  width="20"
                  height="20"></meg-icon>
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
                  {{ labelsFormat(cameraInfo.labels) }}
                </template>
                <template v-else-if="tag.key === 'placeName'">
                  {{ cameraInfo.placeName }}
                </template>
                <template v-else>
                  {{ cameraInfo.unitName }}
                  <template>
                  </template>
                </template>
              </div>
            </div>
          </div>
        </transition>
      </div>
      <!-- 底部 -->
      <div class="camera-card__footer">
        <nav>
          <li
            v-for="nav in navList"
            :key="nav.label"
            :class="{'is-disabled':nav.disable}"
            @click="!nav.disable && jumpToTarget(nav)">
            {{ nav.label }}
          </li>
        </nav>
      </div>
    </div>
  </div>
</template>
<script>
import { switchToModule } from '@/utils/utils.js';
import moment from 'moment';
import MegMapSrv from './meg-map.service';
// 当天0点-当天24点
const defaultStartTime = moment().startOf('day').toDate().getTime();
const defaultEndTime = moment().endOf('day').toDate().getTime();
export default {
  name: 'CameraCard',
  components: {
  },
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      iconList: ['card_face', 'person', 'car', 'non_motor_vehicle'], // icon
      iconRealMap: {
        0: 'doFace',
        1: 'doBody',
        2: 'doMotor',
        3: 'doNoMotor',
      },
      iconHistoryMap: {
        0: 'historyDoFace',
        1: 'historyDoBody',
        2: 'historyDoMotor',
        3: 'historyDoNonMotor',
      },
      realTimeTaskInfo: {},
      historyTaskInfo: {},
      realTimeIconList: [],
      historyIconList: [],
      typeOptions: {},
      tagOption: {},
      cameraInfo: {},
      cameraLoading: false,
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
      isVideoShow: false
    };
  },
  computed: {
    navList() {
      const navList = [
        {
          label: '抓拍检索',
          name: 'capture-search',
          disable: false,
        },
        {
          label: '实时解析',
          name: 'realtime-analysis',
          disable: false,
        },
        {
          label: '录像解析',
          name: 'videotape-analysis',
          disable: true,
        }
      ];
      // 处理录像解析
      this.dealWithHistoryAnalysis(navList);
      // 处理实时解析
      this.dealWithRealAnalysis(navList);
      return navList;
    }

  },
  watch: {
    id() {
      this.getCameraDetail(this.id);
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
     * @description 点击地图相机图标，获取相机详情
     * @param {string} 相机id
     */
    async getVideoInfo(id) {
      const res = await MegMapSrv.getCameraVideo({
        deviceId: id,
        protocol: 'iot'
      });
      if (res.code !== 0) {
        this.$message.error(res.msg);
        return;
      }
      const { url } = res.data;
      const urlRes = await MegMapSrv.getIotUrl({
        type: 'iot',
        url,
      });
      if (urlRes.code !== 0) {
        this.$message.error(urlRes.msg);
        return;
      }
      this.videoInfo = {
        type: 'iot',
        name: this.cameraInfo.name,
        url: urlRes.data.streamAddr
      };
    },
    async getCameraDetail(id) {
      this.cameraLoading = true;

      const p1 = MegMapSrv.getCameraInfo({ id, needPlace: true, needUnit: true });
      const p2 = MegMapSrv.getCaptureCount({
        cameraIds: [id], sourceType: 'CAMERA', startTime: defaultStartTime, endTime: defaultEndTime
      });
      const p3 = MegMapSrv.getCameraDetail({ id });
      Promise.all([p1, p2, p3]).then((res) => {
        const temp = res[0].data ? res[0].data : {};
        temp.captureCount = res[1].data ? res[1].data.count : 0;
        if (res[2].data) {
          this.dealWithCameraStatus(temp, res[2].data);
        }
        this.cameraInfo = temp;
        this.cameraLoading = false;
        this.getVideoInfo(id);
        this.toDetail();
      });
    },
    /**
     * 处理相机的实时分析机历史分析状态
     */
    dealWithCameraStatus(target, obj) {
      const keys = Object.keys(obj);
      let isTag = false;
      if (keys.length) {
        isTag = keys.some((key) => obj[key] === true);
      }
      target.realTimeTask = {
        doBody: obj.doBody,
        doFace: obj.doFace,
        doMotor: obj.doMotor,
        doNoMotor: obj.doNonMotor
      };
      target.isRealTimeTask = isTag;
      target.historyTask = {
        historyDoBody: obj.historyDoBody,
        historyDoFace: obj.historyDoFace,
        historyDoMotor: obj.historyDoMotor,
        historyDoNonMotor: obj.historyDoNonMotor
      };
    },
    /**
     * @description 处理录像解析
     */
    dealWithHistoryAnalysis(navList) {
      if (this.cameraInfo && this.cameraInfo.type === 4) {
        navList[2].disable = false;
      }
    },
    /**
     * @description 处理实时解析
     */
    dealWithRealAnalysis(navList) {
      if (this.cameraInfo.isRealTimeTask) {
        // navList.splice(1, 1);
        navList[1].disable = true;
      }
    },
    cameraPlay() {
      this.$emit('play', this.videoInfo);
    },

    // 处理跳转逻辑 @TODO 抓拍检索和录像解析和实时解析跳转参数
    jumpToTarget(item) {
      const module = {
        module: item.name,
        query: {
          cameraIds: [this.cameraInfo.id],
          monitoringType: this.cameraInfo.monitoringType,
          sourceType: 'CAMERA',
          addTask: true,
        },
        isBlank: true,
      };
      if (item.name === 'capture-search') {
        module.pageType = 'single';
      }
      switchToModule(module);
    },
    /**
     * 设备标签转码
     */
    labelsFormat(labels = []) {
      return labels.map((item) => this.tagOption[item]).join();
    },
    /**
     * 实时解析
     */
    handleRealTime() {
      this.realTimeTaskInfo = {};
      // 实时分析
      if (this.cameraInfo.realTimeTask) {
        this.realTimeTaskInfo = {
          ...this.cameraInfo.realTimeTask
        };
      }
    },
    /**
     * 历史解析
     */
    handleHistory() {
      this.historyTaskInfo = {};
      // 历史解析
      if (this.cameraInfo.historyTask) {
        this.historyTaskInfo = {
          ...this.cameraInfo.historyTask
        };
      }
    },
    /**
     * icon处理
     */
    handleIcon() {
      this.realTimeIconList = this.iconList.map((icon, index) => {
        const taskType = this.iconRealMap[index];
        console.log(taskType, this.realTimeTaskInfo[taskType]);
        return {
          icon,
          isWorking: !!this.realTimeTaskInfo[taskType],
        };
      });
      this.historyIconList = this.iconList.map((icon, index) => {
        const taskType = this.iconHistoryMap[index];
        console.log(taskType, this.historyTaskInfo[taskType]);
        return {
          icon,
          isWorking: !!this.historyTaskInfo[taskType],
        };
      });
    },

    /**
     * 显示详情
     */
    toDetail() {
      this.handleRealTime();
      this.handleHistory();
      this.handleIcon();
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
    }
  }
};
</script>
<style lang="scss" scoped>
p {
  line-height: 1;
}

::v-deep .no-pointer-events{
  pointer-events: none;
}
.camera-card__wrapper {
  width: 378px;
  background-color: #fff;
  position: relative;
  &:after {
      content: '';
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #FFFFFF;
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
    }
  .camera-tags-wrapper{
    margin-bottom: 12px;
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
  .camera-card__header {
    position: relative;
    .title {
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
      cursor: pointer;
      >h3 {
        font-size: 16px;
        color: #21539B;
        letter-spacing: 0;
        font-weight: bold;
        max-width: 242px;
      }
      .player-icon {
        margin-left: 12px;
        margin-top: 0;
      }
    }
    .actions {
      width: 20px;
      height: 20px;
      position: absolute;
      top: -4px;
      right: 0;
      display: flex;
      justify-content: center;
      align-content: center;
      align-items: center;
      cursor: pointer;
      .close-icon {
        color: #9FAAC1;
      }
    }
    >p {
      font-size: 12px;
      color: #999;
      padding-top: 8px;
    }
  }
  .camera-card__container{
    padding: 16px 16px 0 16px;
    .camera-card__body {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      align-content: center;
      padding: 18px 0 18px 0;
      .aside{
        border-right: 1px solid  #DCE1E5;
        padding-right: 5px;
        max-width: 100px;
        box-sizing: border-box;
        >h3 {
          font-size: 14px;
          color: #435068;
        }
        >p {
          font-family: HEMIHEAD;
          font-size: 20px;
          color: #435068;
          padding-top: 20px;
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
    .camera-card__footer {
      border-top: 1px solid #F3F3F3;
      >nav {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        align-content: center;
        padding: 14px 0 16px 0;
        >li {
          list-style-type: none;
          flex: 1;
          height: 14px;
          font-size: 14px;
          display: flex;
          justify-content: center;
          align-items: center;
          align-content: center;
          border-right: 1px solid #DCE1E5;
          color: #21539B;
          cursor: pointer;
          &:last-child {
            border-right: 0;
          }
          &.is-disabled{
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
.main {
  height: 90px;
  cursor: pointer;
  .fade-enter-active, .fade-leave-active {
    transition: all .3s ease-in-out;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
    transform: translateX(10px);
  }
}
</style>
