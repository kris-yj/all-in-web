<template>
  <div class="tab-group">
    <div
      v-if="info.tabGroup"
      class="handle-title">
      <span
        @click="tabClick(1)"
        v-if="info.tabGroup.includes(1)"
        :class="{'active':activeIndex===1}">{{ $t('底库详情') }}</span>
      <span
        @click="tabClick(2)"
        v-if="info.tabGroup.includes(2)"
        :class="{'active':activeIndex===2}">{{ $t('属性信息') }}</span>
      <span
        @click="tabClick(3)"
        v-if="info.tabGroup.includes(3)"
        :class="{'active':activeIndex===3}">{{ $t('处理详情') }}</span>
      <span
        @click="tabClick(4)"
        v-if="info.tabGroup.includes(4)"
        :class="{'active':activeIndex===4}">{{ $t('本地比对') }}
        <em
          v-if="info.cardInfo && info.cardInfo.length && info.cardInfo.some(val => val.score > info.score)"
          class="red-point"></em>
      </span>
    </div>
    <div class="content-box">
      <component
        v-if="activeIndex===1"
        :is="info.alarmInfoComponent"
        @move-deploy="onMoveDeploy"
        :info="info"></component>
      <template v-if="activeIndex===2">
        <common-property-display
          v-if="info.strategyTypeId !== '9'"
          :properties="info.properties"
          :detect-type="info.detectType"></common-property-display>
        <crowd-property
          :info="info"
          v-if="info.strategyTypeId === '9'"></crowd-property>
      </template>
      <alarm-handle-step
        v-if="activeIndex===3"
        direction="vertical"
        :info="info"></alarm-handle-step>
      <alarm-local-compare
        v-if="activeIndex===4"
        :card-info="info.cardInfo"></alarm-local-compare>
    </div>
  </div>
</template>

<script>
import CommonPropertyDisplay from '@/common-components/common-property-display';
import CrowdProperty from './right-content/crowd-property';
import AlarmHandleStep from './right-content/alarm-handle-step';
import AlarmLocalCompare from './right-content/alarm-local-compare';

export default {
  name: 'TabGroup',
  components: {
    AlarmInfo: () => import('./right-content/album-info'),
    AlarmInfoSimple: () => import('./right-content/album-info-simple'),
    AlarmHandleStep,
    AlarmLocalCompare,
    CommonPropertyDisplay,
    CrowdProperty,
  },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      activeIndex: 1,
    };
  },
  computed: {},
  watch: {
    info: {
      immediate: true,
      handler() {
        if (this.info.tabGroup) {
          [this.activeIndex] = this.info.tabGroup;
        }
      }
    }
  },
  mounted() {
    console.log(123);
  },
  methods: {
    tabClick(num) {
      this.activeIndex = num;
    },
    onMoveDeploy() {
      this.$emit('move-deploy');
    }
  },
};
</script>
<style lang="scss" scoped>
.tab-group {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  .handle-title {
    flex-shrink: 0;;
    padding-top: 5px;
    padding-left: 30px;
    margin-bottom: 20px;
    border-bottom:1px solid  #DCE1E5;;
    span {
      display: inline-block;
      height: 36px;
      line-height: 36px;
      box-sizing: border-box;
      cursor: pointer;
      color: #435068;
      text-align: center;
      margin-right: 20px;
      font-weight: bold;
      position: relative;
      &:hover {
        color: #21539b;
      }
      &.active {
        border-bottom: 4px solid #21539b;
        color: #21539b;
      }
      em.red-point {
        border: 5px solid #f05353;
        border-radius: 5px;
        position: absolute;
        top: 6px;
      }
    }
  }
  .content-box {
    flex: 1;
  }
}
</style>
