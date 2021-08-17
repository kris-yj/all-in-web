<template>
  <div class="camera-card__wrapper">
    <div class="camera-card__container">
      <!-- 头部 -->
      <camera-header
        :camera-info="cameraInfo"
        :scenes-type-map="scenesTypeMap"
        @close="$emit('close')"
        @play="cameraPlay"></camera-header>
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
                  {{ resolveLables(cameraInfo.labels) }}
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
import CameraHeader from './camera-header';

export default {
  name: 'CameraCard',
  components: {
    CameraHeader,
  },
  props: {
    cameraInfo: {
      type: Object,
      default: () => ({})
    },
    scenesTypeMap: {
      type: Object,
      default: () => ({})
    },
    labelsMap: {
      type: Object,
      default: () => ({})
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
    cameraInfo() {
      console.log('数据更新', this.cameraInfo);
      this.toDetail();
    }
  },
  methods: {
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
      this.$emit('play');
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
