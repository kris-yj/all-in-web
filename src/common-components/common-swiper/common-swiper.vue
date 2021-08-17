<template>
  <common-next-prev
    v-model="nextPrevIndex"
    :height="height"
    :total="nextPrevTotal"
    :disabled="disableNextPrev"
    @change="showCurrentItem">
    <meg-swiper
      ref="swiper"
      :data-list="dataList"
      :slides-per-view="perViewNum"
      :item-key="itemKey"
      :speed="speed"
      :space-between="spaceBetween">
      <template v-slot="{data}">
        <div
          :style="swiperItemStyle"
          :class="['common-swiper__item', {'active': nowIndex===data.$swiperIndex}]"
          @click="itemClick(data)">
          <slot
            :data="data"
            :index="data.$swiperIndex"
            :active="nowIndex===data.$swiperIndex"></slot>
        </div>
      </template>
    </meg-swiper>
  </common-next-prev>
</template>

<script>
import CommonNextPrev from '../common-next-prev/index.js';

export default {
  name: 'CommonSwiper',
  components: {
    CommonNextPrev,
  },
  model: {
    prop: 'nowIndex',
    event: 'change',
  },
  props: {
    // 当前项
    nowIndex: {
      type: Number,
      default: 0,
    },
    // item 之间间距
    spaceBetween: {
      type: Number,
      default: 10,
    },
    // 整体高度，默认136px
    height: {
      type: Number,
      default: 136,
    },
    // 每屏多少个子项
    perViewNum: {
      type: Number,
      default: 10,
    },
    // 列表数据
    dataList: {
      type: Array,
      default: () => [],
    },
    // item 的样式
    itemStyle: {
      type: Object,
      default: () => {},
    },
    // 节点 key,作为 item 更新的依据，不传，则以 index 为 key，如果出现切换之后稍 ui 视觉上 微抖动的情况，传入 item-key 即可解决
    itemKey: {
      type: String,
      default: undefined,
    },
    switchMode: {
      type: String,
      default: 'page'
    }
  },
  data() {
    return {
      currentView: 0, // 当前第几屏
      totalView: 0, // 共多少屏
      propNowIndex: 0, // 记录nowIndex
      nextPrevTotal: 0, // 传给next-prev的total，根据按页切换和上一个下一个有不同的传值
      nowItem: {},
      speed: 300,
      disableNextPrev: false,
    };
  },
  computed: {
    swiperItemStyle() {
      const defaultStyle = {
        height: `${this.height}px`,
      };
      return Object.assign(defaultStyle, this.itemStyle);
    },
    nextPrevIndex: { // 传给next-prev的index，根据按页切换和上一个下一个有不同的传值
      get() {
        return this.switchMode === 'page' ? this.currentView : this.propNowIndex;
      },
      set(val) {
        if (this.switchMode === 'page') {
          this.currentView = val;
        } else {
          this.propNowIndex = val;
        }
      }
    }
  },
  watch: {
    nowIndex: {
      handler(val) {
        this.initSwiper();
        this.propNowIndex = val;
      },
      immediate: true
    },
    dataList: {
      immediate: true,
      handler() {
        this.dataList.forEach((item, index) => {
          Object.defineProperty(item, '$swiperIndex', {
            value: index,
            enumerable: false,
            configurable: true,
            writable: true,
          });
        });
        console.log(this.dataList[0]);
        this.initSwiper();
      },
    },
  },
  created() {},
  methods: {
    initSwiper() {
      console.log('common-swiper初始化中');
      console.log(this.dataList);
      if (this.nowIndex || this.nowIndex === 0) {
        this.totalView = Math.ceil(this.dataList.length / this.perViewNum);
        this.nextPrevTotal = this.switchMode === 'page' ? this.totalView : this.dataList.length;
        if (!this.initFlag) {
          this.initFlag = true;
          this.$nextTick(() => {
            this.currentView = Math.floor(this.nowIndex / this.perViewNum);
            this.showCurrentItem();
            this.initFlag = false;
            console.log('common-swiper初始化执行后');
          });
        }
      }
    },
    /**
     * 切换轮播
     */
    showCurrentItem(...arg) {
      if (this.$refs.swiper) {
        this.$refs.swiper.slideToView(this.currentView);
        // 由于 swiper 内部，在运动中的情况，调用slideToView会被无效调，所以，这里添加 disable 逻辑，时间较短，所以没必要在 distroy 中清除
        if (this.disableTimer) clearInterval(this.disableTimer);
        this.disableNextPrev = true;
        this.disableTimer = setTimeout(() => {
          this.disableNextPrev = false;
        }, this.speed);
        if (this.switchMode === 'item' && arg && arg[1] === 'prev') {
          this.$emit('switch', this.nowIndex - 1);
        } else if (this.switchMode === 'item' && arg && arg[1] === 'next') {
          this.$emit('switch', this.nowIndex + 1);
        }
      }
    },
    /**
     * 点击时 改变当前项
     */
    itemClick(item) {
      this.$emit('change', item && item.$swiperIndex, item);
    },
  },
};
</script>

<style lang="scss" scoped>
.common-swiper__item {
  box-sizing: border-box;
  color: #5b98e7;
  cursor: pointer;
  &:hover {
    background: #292f3c;
  }
  &.active {
    background: #5b98e7;
    color: #fff;
  }
}

</style>
