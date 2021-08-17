<template>
  <div class="information">
    <div
      :class="['alarm-info',info.infoNarrow?'narrow':'']">
      <span class="title">{{ $t('报警信息') }}:</span>
      <label-box
        :title="$t('时间')"
        :content="info.alarmTime"></label-box>
      <label-box
        :title="$t('编号')"
        :content="info.alarmNo"></label-box>
      <label-box
        :title="$t('级别')">
        <span class="level">{{ info.alarmLevel }}</span>
        <meg-icon
          height="20px"
          width="20px"
          :color="info.alarmColor"
          name="alarm-preview_menu"></meg-icon>
      </label-box>
      <label-box
        :title="$t('类型')"
        :content="`${info.strategyTypeName}${$t('报警')}`"></label-box>
    </div>
    <div class="position-info">
      <span class="title">{{ $t('位置信息') }}:</span>
      <label-box
        :is-copy="true"
        :title="info.cameraLabel"
        :content="info.cameraName"></label-box>
      <label-box
        :title="$t('区域')"
        :content="info.placeName"></label-box>
      <label-box
        :title="$t('单位')"
        :content="info.unitName"></label-box>
      <label-box
        :title="$t('级联')"
        v-if="info.cascadeId"
        :content="info.cascadeName"></label-box>
    </div>
    <div class="work-info">
      <span class="title">{{ $t('业务信息') }}:</span>
      <label-box
        :content-tooltip="false"
        :title="$t('布控任务')">
        <div
          class="deploy-task-box">
          <span
            v-tooltip="true"
            class="deploy-task-box-content">{{ info.strategyName }}</span>
          <meg-tooltip
            effect="meg"
            v-if="info.strategies&&info.strategies.length>1"
            placement="top">
            <div
              v-if="info.strategies&&info.strategies.length>1"
              slot="content">
              <p
                :key="item.createTime"
                v-for="item in info.strategies">
                {{ item.strategyName }}<br />{{ formatTime(item.createTime) }}
              </p>
            </div>
            <span class="number">{{ info.strategies.length }}</span>
          </meg-tooltip>
        </div>
      </label-box>
      <label-box
        :title="$t('布控时间')"
        :content="info.deployTime"></label-box>
      <label-box
        :title="$t('处理状态')"
        :content="info.status"></label-box>
      <template v-if="info.processStatus === 4">
        <label-box
          :title="$t('警情真假')"
          :content="info.realText"></label-box>
        <label-box
          :title="$t('处理结果')"
          v-if="[2,3,4].includes(info.resultStatus)"
          :content="`${info.alarmResult}${info.grabCount ? ','+info.grabCount+info.countName:''}`">
        </label-box>
      </template>
    </div>
  </div>
</template>

<script>
import LabelBox from './label-box';
import { formatTime } from '../utils';

export default {
  name: 'Information',
  components: {
    LabelBox
  },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      formatTime
    };
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.information {
  display: flex;
  align-items: flex-start;
  margin-top: 16px;
  line-height: 26px;
  .title {
    font-size: 14px;
    color: #869abb;
  }
  ::v-deep.level {
    margin-right: 6px;
  }
  .alarm-info {
    margin-right: 18px;
    width: 332px;
  }
  .narrow {
    width: 250px;
    margin-left: 82px;
  }
  .position-info {
    width: 248px;
  }
  .work-info {
    width: 248px;
    .deploy-task-box {
      display: flex;
      justify-content: space-between;
      width: 100%;
      .deploy-task-box-content {
        width:168px;
      }
      .number {
        line-height: 16px;
        background: #869abb;
        font-size: 12px;
        padding: 0 6px;
        color: #fff;
        height: 16px;
        &:hover {
          background: #21539b;
        }
      }
    }
  }
}
</style>
