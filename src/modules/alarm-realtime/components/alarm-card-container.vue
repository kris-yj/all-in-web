<template>
  <div
    class="alarm-realtime-container"
    v-loading="loading">
    <div
      ref="scrollContainer"
      v-background="isShowNoDataBackground"
      v-scroll-top="onReachTop"
      v-scroll-bottom="onReachBottom"
      @scroll="onScroll"
      class="alarm-list-wrap">
      <meg-card-frame
        tag="div"
        :gap="10"
        :card-min-width="300">
        <div
          v-for="(item,index) in alarmList"
          :key="item.id">
          <alarm-card
            @click="onAlarmCardClick(item,index)"
            :card-info="item">
          </alarm-card>
        </div>
      </meg-card-frame>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { directiveScrollTop, directiveScrollBottom, scrollToTop } from './directive-scroll';
import AlarmCard from '../../../common-components/common-alarm-card';

export default {
  name: 'AlarmRealtimeContainer',
  components: {
    AlarmCard
  },
  directives: {
    scrollTop: directiveScrollTop,
    scrollBottom: directiveScrollBottom
  },
  props: {
    // 报警列表
    alarmList: {
      type: Array,
      default: () => ([])
    },
    // 是否置于加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 顶部区域是否在可视区
      isTopInViewport: true
    };
  },
  computed: {
    isShowNoDataBackground() {
      if (this.loading) return false;
      if (this.alarmList.length === 0) return { image: '111', icon: 'icon_3', text: this.$t('暂无数据') };
      return false;
    }
  },
  watch: {
    isTopInViewport(value) {
      this.$emit('top-visible-change', value);
    }
  },
  methods: {
    scrollToTop() {
      scrollToTop(this.$refs.scrollContainer);
    },
    onAlarmCardClick(alarm, index) {
      this.$audio.stop();
      this.$emit('alarm-click', alarm, index);
    },
    onScroll: _.throttle(function onScroll() {
      // eslint-disable-next-line no-debugger
      const { scrollTop } = this.$refs.scrollContainer;
      this.isTopInViewport = scrollTop < 150;
    }, 500, { trailing: true }),
    onReachTop: _.debounce(function onScrollTop() {
      this.$emit('scroll-reach-top');
    }, 500, { trailing: true }),
    onReachBottom: _.debounce(function onScrollBottom() {
      this.$emit('scroll-reach-bottom');
    }, 500, { trailing: true })
  }
};
</script>
<style lang="scss" scoped>
.alarm-realtime-container {
  background: #c8d0d9;
  height: 100%;
  padding-top: 10px;
  box-sizing: border-box;
  .alarm-list-wrap {
    height: 100%;
    overflow: auto;
  }
  ::v-deep.meg-background {
    z-index: 1999;
  }
}
</style>
