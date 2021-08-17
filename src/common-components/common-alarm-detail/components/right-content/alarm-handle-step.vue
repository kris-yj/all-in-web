<template>
  <div
    class="alarmHandleStep">
    <meg-steps
      :direction="direction"
      space="19%"
      :active="5">
      <meg-step v-if="info.alarmTime">
        <div slot="title">
          {{ info.alarmTime }}
        </div>
        <div slot="description">
          <p>{{ $t('报警') }}</p>
        </div>
      </meg-step>
      <meg-step v-if="info.designateTime">
        <div slot="title">
          {{ info.formatDesignateTime }}
        </div>
        <div slot="description">
          <p>{{ $t('派警') }}</p>
        </div>
      </meg-step>
      <meg-step v-if="info.receiveTime">
        <div slot="title">
          {{ info.formatReceiveTime }}
        </div>
        <div slot="description">
          <p>{{ $t('接收') }}</p>
          <p>{{ $t('接收人') }}：{{ info.receiveUser }}</p>
        </div>
      </meg-step>
      <meg-step v-if="info.policeTime">
        <div slot="title">
          {{ info.formatPoliceTime }}
        </div>
        <div slot="description">
          <p>{{ $t('出警') }}</p>
          <p>{{ $t('出警人') }}：{{ info.policeUser }}</p>
        </div>
      </meg-step>
      <!-- 以下为有填报 -->
      <meg-step v-if="info.reportTime">
        <div slot="title">
          {{ info.formatReportTime }}
        </div>
        <div
          slot="description"
          class="description">
          <p>{{ info.status }}/{{ info.realText }}/{{ info.alarmResult }}<span v-if="[2,3,4].includes(info.resultStatus)">{{ info.grabCount }}{{ info.countName }}</span></p>
          <p>{{ $t('办结人') }}：{{ info.reportUser }}</p>
          <p
            class="content">
            {{ $t('报告内容') }}：{{ info.reportContent }}
          </p>
        </div>
      </meg-step>
      <template v-if="!info.reportTime">
        <!-- 以下为没有填报   撤销-->
        <meg-step v-if="info.right === 1 ">
          <p slot="title">
            {{ info.completedTime }}
          </p>
          <div slot="description">
            <p>
              {{ $t('已办结/无效警/虚警') }}
            </p>
            <p>{{ $t('办结人') }}：{{ info.completedUser }}</p>
          </div>
        </meg-step>
        <!-- 以下为没有填报   存档-->
        <meg-step v-if="info.right === 0">
          <p slot="title">
            {{ info.completedTime }}
          </p>
          <div slot="description">
            <p>
              {{ $t('已办结/有效警/确认') }}
            </p>
            <p>{{ $t('办结人') }}：{{ info.completedUser }}</p>
          </div>
        </meg-step>
      </template>
    </meg-steps>
  </div>
</template>
<script>
export default {
  name: 'AlarmHandleStep',
  props: {
    info: {
      type: Object,
      required: true,
      default: () => {}
    },
    direction: {
      type: String,
      default: 'horizontal'
    }
  }
};
</script>
<style scoped lang="scss">
.alarmHandleStep {
  max-height: 100%;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding-left: 18px;
  box-sizing: border-box;
  .description {
    .content {
      width: 250px;
      word-break: break-all;
    }
  }
}
</style>
<style>
.alarmHandleStep .meg-step__title {
  color: #869abb;
  font-size: 14px;
  font-weight: normal;
}
.alarmHandleStep .meg-step__description {
  color: #435068;
  font-size: 14px;
}
</style>
