<template>
  <div
    class="vsr-dialog-wrap"
    v-if="isDetailShow">
    <meg-dialog
      :visible="isDetailShow"
      :width="detailData.scheduleType ? '1000px' : '640px'"
      :title="$t('任务详情')"
      @close="closeClick">
      <div
        v-loading="loading && type === 2"
        megvii-loading-background="#fff"
        class="show-detail">
        <div
          :class="{'video-detail': type === 2}"
          class="plan-left">
          <div class="vsr-dialog-content">
            <div
              class="wrap"
              v-if="type === 1">
              <span class="label">{{ $t('相机名称') }}</span>
              <div
                v-tooltip="true"
                class="con">
                {{ detailData.cameraName }}
              </div>
            </div>
            <template
              v-if="type === 2">
              <!-- 录像 -->
              <div
                class="wrap">
                <span class="label">{{ $t('任务名称') }}</span>
                <div class="con">
                  {{ detailData.taskName }}
                </div>
              </div>
              <div
                class="wrap">
                <span class="label">{{ $t('解析状态') }}</span>
                <div class="con">
                  {{ (statusObj[detailData.status] || '') + ' ' + detailData.progress }}%
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('解析类型') }}</span>
                <div class="con">
                  {{ analysisTypeArr[analysisType] && analysisTypeArr[analysisType].label }}&nbsp;&nbsp;&nbsp;
                  <type-icons :init-property-data="detailData"></type-icons>
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('解析时间') }}</span>
                <div class="con">
                  {{ detailData.startTime | formatTime('YYYY-MM-DD HH:mm') }} {{ $t('至') }} {{ detailData.endTime | formatTime('YYYY-MM-DD HH:mm') }}
                </div>
              </div>
              <div
                class="wrap">
                <span class="label">{{ $t('总时长') }}</span>
                <div class="con">
                  {{ detailData.duration >= 0 ? detailData.duration : '-' }}分钟
                </div>
              </div>
              <div
                class="wrap">
                <span class="label">{{ $t('优先级') }}</span>
                <div class="con">
                  {{ ['紧急', '一般'][detailData.priority] }}任务
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('创建时间') }}</span>
                <div class="con">
                  {{ detailData.createTime | formatTime }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('创建用户') }}</span>
                <div class="con">
                  {{ detailData.creatorName }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('已处理') }}</span>
                <div class="con">
                  {{ (detailData.finishNum || 0) }}/{{ detailData.totalNum || 0 }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('已失败') }}</span>
                <div class="con">
                  {{ detailData.failedNum || 0 }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('所选相机') }}</span>
                <div class="con">
                  <template
                    v-for="item in cameras">
                    <div
                      :key="item.cameraId"
                      class="camera-item">
                      <span>
                        {{ item.cameraName }}
                      </span>
                      <!-- <meg-icon
                        @click="playon(item)"
                        name="video_begin"></meg-icon> -->
                    </div>
                  </template>
                </div>
              </div>
            </template>
            <template
              v-if="type === 1">
              <div class="wrap">
                <span class="label">{{ $t('卡口类型') }}</span>
                <div class="con">
                  {{ monitoringTypeName }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('解析类型') }}</span>
                <div class="con">
                  {{ analysisTypeArr[analysisType] && analysisTypeArr[analysisType].label }}&nbsp;&nbsp;&nbsp;
                  <type-icons :init-property-data="detailData"></type-icons>
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('创建用户') }}</span>
                <div class="con">
                  {{ detailData.creatorName }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('创建时间') }}</span>
                <div class="con">
                  {{ detailData.createTime | formatTime }}
                </div>
              </div>
              <div
                v-if="type === 1"
                class="wrap">
                <!-- 实时 -->
                <span class="label">{{ $t('解析状态') }}</span>
                <div class="con">
                  {{ statusObj[detailData.status] }}
                </div>
              </div>
              <div class="wrap">
                <span class="label">{{ $t('解析时间') }}</span>
                <div
                  class="con"
                  v-if="detailData.scheduleType">
                  {{ detailData.startTime | formatTime('YYYY-MM-DD') }} {{ $t('至') }} {{ detailData.endTime | formatTime('YYYY-MM-DD') }}
                </div>
                <div
                  class="con"
                  v-else>
                  {{ $t('长期有效') }}
                </div>
              </div>
              <div
                class="wrap"
                v-if="detailData.scheduleType">
                <span class="label">{{ $t('重复规则') }}</span>
                <div class="con">
                  <span>{{ detailData.startHour + ':00' }} {{ $t('至') }} {{ detailData.endHour + ':00' }}</span><br />
                  <span>{{ dates }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
        <div
          class="plan-right"
          v-if="detailData.scheduleType">
          <realtime-task-calendar
            :camera-id="detailData.cameraId"
            ref="realtimeCalendar"></realtime-task-calendar>
        </div>
        <analysis-player
          :from="type === 2 ? 'video' : 'realtime'"
          :task-data="currItem"
          :show-roi="false"
          v-model="showPlayer"></analysis-player>
      </div>
    </meg-dialog>
  </div>
</template>

<script>
import commonMapList from '@/utils/data-map.utils';
import AnalysisPlayer from '@/components/analysis/analysis-player';
import TypeIcons from './analysis-type-icons.vue';
import realtimeTaskCalendar from './analysis-task-calendar';

export default {
  components: {
    AnalysisPlayer,
    TypeIcons,
    realtimeTaskCalendar
  },
  props: {
    // 显示详情的弹框
    isDetailShow: {
      type: Boolean,
      default: true
    },
    detailData: {
      type: Object,
      default: () => {}
    },
    type: {
      type: Number,
      default: null
    }
  },
  data() {
    const notSupportMotorOrNonmotor = window.config.globalConfig.clientAppId === 'bigdata-web';
    const { analysisTypeArr } = commonMapList;
    if (notSupportMotorOrNonmotor && this.type === 1) { // 实时解析
      const supportBody = this.$store.getters.systemByType('body_enable').value === '1';
      const regex = /\u{975e}?\u{673a}\u{52a8}\u{8f66}/gu; // 机动车非机动车
      Object.entries(analysisTypeArr).forEach(([key, value]) => {
        const filterValue = value.filter((item) => {
          regex.lastIndex = 0;
          return !regex.test(item.label);
        });
        if (filterValue.length > 0) {
          analysisTypeArr[key] = filterValue;
        } else {
          delete analysisTypeArr[key];
        }
      });
      if (!supportBody) {
        Object.entries(analysisTypeArr).forEach(([key, value]) => {
          const filterValue = value.filter((item) => {
            regex.lastIndex = 0;
            return !/人体/.test(item.label);
          });
          if (filterValue.length > 0) {
            analysisTypeArr[key] = filterValue;
          } else {
            delete analysisTypeArr[key];
          }
        });
      }
    }
    return {
      analysisTypes: analysisTypeArr,
      statusObj: commonMapList[this.type === 2 ? 'videoTaskStatusObj' : 'realtimeTaskStatusObj'],
      weekArr: ['日', '一', '二', '三', '四', '五', '六'],
      showPlayer: false,
      currItem: {},
      loading: true
    };
  },
  computed: {
    monitoringTypeName() {
      let val = '';
      const monitors = this.$store.getters.dataMapByType('kunlun_analysis_bayonet_type') || [];
      monitors.forEach((item) => {
        if (item.code === this.detailData.monitoringType.toString()) {
          val = item.value;
        }
      });
      return val;
    },
    dates() {
      const { includeDays = [] } = this.detailData;
      return includeDays.sort().map((item) => `周${this.weekArr[Number(item) - 1]}`).join(',');
    },
    analysisTypeArr() {
      let ins = 2;
      if (this.type === 1 && this.detailData) {
        ins = this.detailData.monitoringType;
      }
      return this.analysisTypes[ins];
    },
    cameras() {
      const { cameras = [] } = this.detailData;
      return cameras;
    },
    analysisType() {
      let tempIndex = 0;
      this.analysisTypeArr.forEach((item, index) => {
        const curItem = item.val;
        const arr = Object.keys(curItem).every((key) => curItem[key] === this.detailData[key]);
        console.log(arr, index, item, this.detailData);
        if (arr) {
          tempIndex = index;
        }
      });
      return tempIndex;
    }
  },
  watch: {
    detailData() {
      this.loading = false;
    }
  },
  methods: {
    playon(item) {
      this.showPlayer = true;
      const currItem = JSON.parse(JSON.stringify(this.detailData));
      currItem.cameraId = item.cameraId;
      currItem.cameraName = item.cameraName;
      this.currItem = currItem;
    },
    initTask(id) {
      this.$nextTick(() => {
        this.$refs.realtimeCalendar.initTask(id);
      });
    },
    /**
     * 取消新建
     */
    closeClick() {
      this.$emit('close-click');
      this.checkedCameraArr = [];
    }
  },
};
</script>
<style lang='scss' scoped>
  v::deep .meg-dialog__body{
    padding-bottom: 20px;
  }
  .show-detail{
    display: flex;
    .plan-left {
      flex: 1;
      max-width: 400px;
      &.video-detail {
        max-width: none;
      }
    }
    .plan-right{
      flex: 1;
      height: 560px;
      v::deep .task-calendar {
        .switch-mode .active{
          background-color: #2B5496;
          color: white;
        }
      }
    }
  }
  .vsr-dialog-content {
    max-height: 430px;
    overflow: auto;
    margin-bottom: 50px;
    .wrap {
      display: flex;
      line-height: 36px;

      .label {
        width: 112px;
        text-align: right;
        color: #869ABB;
        margin-right: 12px;
      }

      .con {
        flex: 1;
        color: #435068;
      }
    }
  }
  .camera-item {
    display: inline-block;
    min-width: 55px;
    margin-right: 30px;
    .meg-icon {
      margin-left: 5px;
    }
  }
</style>
