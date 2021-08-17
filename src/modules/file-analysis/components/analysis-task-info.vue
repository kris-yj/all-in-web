<template>
  <div
    class="search-content"
    v-loading="infoLoading">
    <div class="content-form">
      <div
        class="item"
        v-if="isHistory">
        <span class="label">{{ $t('相机名称') }}</span>
        <span class="con">{{ currentInfo.cameraName }}</span>
      </div>
      <div
        class="item"
        v-if="!isHistory">
        <span class="label">{{ $t('任务名称') }}</span>
        <span class="con">{{ currentInfo.taskName }}</span>
      </div>
      <div class="item">
        <span class="label">{{ $t('解析类型') }}</span>
        <span class="con">
          {{ analysisTypeArr[analysisType] && analysisTypeArr[analysisType].label }} &nbsp;&nbsp;&nbsp;
          <analysis-type-icons :init-property-data="currentInfo"></analysis-type-icons>
        </span>
      </div>
      <div class="item">
        <span class="label">{{ $t('总时长') }}</span>
        <span class="con">{{ currentInfo.totalMinute >= 0 ? currentInfo.totalMinute : '-' }}分钟</span>
      </div>
      <div
        class="item"
        v-if="judgeCondition(currentInfo, 'compareFaceSets')">
        <span class="label">{{ $t('人脸库') }}</span>
        <span class="con">{{ currentInfo.compareFaceSets.name.join(',') }}</span>
      </div>
      <div
        class="item"
        v-if="judgeCondition(currentInfo, 'compareBodySets')">
        <span class="label">{{ $t('人体库') }}</span>
        <span class="con">{{ currentInfo.compareBodySets.name.join(',') }}</span>
      </div>
      <div
        class="item"
        v-if="judgeCondition(currentInfo, 'compareMotorSets')">
        <span class="label">{{ $t('机动车库') }}</span>
        <span class="con">{{ currentInfo.compareMotorSets.name.join(',') }}</span>
      </div>
      <div
        class="item"
        v-if="judgeCondition(currentInfo, 'compareNonMotorSets')">
        <span class="label">{{ $t('非机动车库') }}</span>
        <span class="con">{{ currentInfo.compareNonMotorSets.name.join(',') }}</span>
      </div>
      <div
        class="item"
        v-if="judgeCondition(currentInfo, 'compareMotorLicenseSets')">
        <span class="label">{{ $t('机动车车牌库') }}</span>
        <span class="con">{{ currentInfo.compareMotorLicenseSets.name.join(',') }}</span>
      </div>
      <div
        class="item"
        v-if="judgeCondition(currentInfo, 'compareNonMotorLicenseSets')">
        <span class="label">{{ $t('非机动车车牌库') }}</span>
        <span class="con">{{ currentInfo.compareNonMotorLicenseSets.name.join(',') }}</span>
      </div>
      <div class="item">
        <span class="label">{{ $t('创建用户') }}</span>
        <span class="con">{{ currentInfo.creatorName }}</span>
      </div>
      <div class="item">
        <span class="label">{{ $t('优先级') }}</span>
        <span class="con">{{ ['紧急', '一般'][currentInfo.priority] }}任务</span>
      </div>
      <div class="item">
        <span class="label">{{ $t('创建时间') }}</span>
        <span class="con">{{ currentInfo.createTime | formatTime }}</span>
      </div>
      <div class="item">
        <span class="label">{{ $t('解析状态') }}</span>
        <span class="con">{{ currentStatusObj[currentInfo.status] }} {{ currentInfo.progress }}%</span>
      </div>
      <div
        class="item"
        v-if="isHistory">
        <span class="label">{{ $t('总时长') }}</span>
        <!-- <span class="con">{{ currentInfo.startTime | formatTime }} 至 {{ currentInfo.endTime | formatTime }}</span> -->
      </div>
      <div
        class="item"
        v-if="!isHistory">
        <span class="label">{{ $t('解析倍速') }}</span>
        <span class="con">{{ currentInfo.speed }}</span>
      </div>
      <div
        class="item"
        v-if="!isHistory">
        <span class="label">{{ $t('完成数') }}</span>
        <span class="con">{{ `${currentInfo.finishedNum}/${currentInfo.totalTaskItemNum}` }}</span>
      </div>
      <div
        class="item"
        v-if="!isHistory">
        <span class="label">{{ $t('失败数') }}</span>
        <span class="con">{{ currentInfo.failedNum }}</span>
      </div>
    </div>
  </div>
</template>
<script>
import AnalysisCommonMapList from '@/utils/data-map.utils';
import AnalysisTypeIcons from '@/components/analysis/analysis-type-icons.vue';
import _ from 'lodash';

export default {
  components: {
    AnalysisTypeIcons,
  },
  props: {
    taskInfo: {
      type: Object,
      default: () => {}
    },
    infoLoading: {
      type: Boolean,
      default: false
    },
    // 解析类型 录像或者文件
    type: {
      type: String,
      default: 'history'
    }
  },
  data() {
    return {
      totalStatusObj: {
        history: {
          0: this.$t('正在进行'),
          1: this.$t('已完成')
        },
        file: {
          0: this.$t('等待中'),
          1: this.$t('正在进行'),
          2: this.$t('已完成'),
          3: this.$t('已暂停')
        }
      },
      analysisTypeArr: AnalysisCommonMapList.analysisTypeArr[0],
      showAlbumObj: {},
      currentInfo: {},
      setsKeyArr: ['compareFaceSets', 'compareBodySets', 'compareMotorSets', 'compareNonMotorSets', 'compareMotorLicenseSets', 'compareNonMotorLicenseSets']
    };
  },
  computed: {
    analysisType() {
      let tempIndex = 0;
      this.analysisTypeArr.forEach((item, index) => {
        const curItem = item.val;
        const arr = Object.keys(curItem).filter((key) => curItem[key] === this.currentInfo[key]);
        if (arr.length === 4) {
          tempIndex = index;
        }
      });
      return tempIndex;
    },
    isHistory() {
      return this.type === 'history';
    },
    currentStatusObj() {
      return this.totalStatusObj[this.type];
    }
  },
  watch: {
    taskInfo(val) {
      this.currentInfo = _.cloneDeep(val);
      this.setsKeyArr.forEach((key) => {
        if (this.currentInfo[key] && this.currentInfo[key].sets) {
          this.currentInfo[key].name = [];
          this.currentInfo[key].sets.forEach((item) => {
            this.currentInfo[key].name.push(item.albumName);
          });
        } else if (this.currentInfo[key] instanceof Array) {
          const obj = {
            sets: this.currentInfo[key],
            name: []
          };
          this.currentInfo[key].forEach((item) => {
            obj.name.push(item.albumName);
          });
          this.currentInfo[key] = obj;
        }
      });
    }
  },
  methods: {
    judgeCondition(currentInfo, key) {
      return currentInfo[key] && currentInfo[key].sets && currentInfo[key].sets.length;
    },
  }
};
</script>
<style lang="scss">
  .content-form{
    box-sizing: border-box;
    flex: 1;
    flex-shrink: 0;
    overflow: auto;
    margin-top: 10px;
    .item {
      display: flex;
      color:#435068;
      margin-bottom: 10px;
      .label{
        text-align: right;
        line-height: 24px;
        width: 70px;
        margin-right: 10px;
        opacity: 0.5;
      }
      .con{
        margin-top: 2px;
        line-height: 22px;
        flex: 1;
        word-break: break-all;
      }
    }
  }
</style>
