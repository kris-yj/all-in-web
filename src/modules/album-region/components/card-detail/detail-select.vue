<template>
  <div class="double-card-detail-selector">
    <div
      class="pre-btn-box"
      @click="prevPage">
      <meg-icon
        name="arrow_hollow"
        width="18px"
        height="22px"
        dir="right"
        color="#d1d5dd"
        v-show="true">
      </meg-icon>
    </div>
    <div class="swiper-wrapper">
      <meg-swiper
        ref="swiper"
        :data-list="detailList"
        :slides-per-view="5"
        :slides-per-group="5"
        :space-between="10"
        :default-index="defaultSelectedIndex">
        <div
          class="fast-swiper-box"
          slot-scope="{ data }">
          <!-- <alarm-image-card
            :alarm-info="data"
            :selected="data.selected"
            :show-collect="showCollect"
            @collectClick="onCardCollect"
            @cardClick="onCardClick">
          </alarm-image-card> -->
          <div
            class="swiper-inner-box"
            :class="data.index ===activeIndex ?'active':''">
            <meg-double-card
              :left-img-src="data.faceOnlyUrl"
              :right-img-src="data.albumPhotoUrl"
              width="50%"
              :score="data.score && parseFloat(data.score)"
              @click="onItemClick(data.index,data)">
            </meg-double-card>
          </div>
        </div>
      </meg-swiper>
    </div>
    <div
      class="next-btn-box"
      @click="nextPage">
      <meg-icon
        name="arrow_hollow"
        width="18px"
        height="22px"
        dir="left"
        color="#d1d5dd"
        v-show="true">
      </meg-icon>
    </div>
  </div>
</template>
<script>
export default {
  name: 'DetailSelector',
  props: {
    detailList: {
      type: Array,
      default: () => []
    },
    defaultSelectedIndex: {
      type: Number,
      default: 0
    },
  },
  data() {
    return {
      swiper: null, // swiper对象
      lastDetail: null, // 上一个详情列表
      hoverIndex: -1,
      pageNo: 0,
      totalPage: 0,
      prevPageVisible: false,
      nextPageVisible: false,
      activeIndex: '',
      lastList: this.detailList, // detailList 的副本，用于保存状态，使得默认索引变更时不会触发双次更新
    };
  },
  watch: {
    detailList(val) {
      this.lastList = val;
      this.updateDetailList();
    },
    defaultSelectedIndex() {
      if (this.lastList === this.detailList) {
        this.updateDetailList();
      }
    }
  },
  mounted() {
    this.updateDetailList();
  },
  // 释放swiper组件
  destroyed() {
    if (this.swiper) this.swiper.destroy();
  },
  methods: {
    /**
     * 鼠标移入卡片 显示收藏按钮
     */
    enter(index) {
      this.hoverIndex = index;
    },
    /**
     * 鼠标移出卡片 隐藏收藏按钮
     */
    leave() {
      this.hoverIndex = '';
    },
    /**
     * 点击收藏按钮
     */
    collectItem(item) {
      // if (!item.favorite) {
      this.$emit('collect', item);
      // this.$set(item, 'favorite', true);
      // }
    },
    /**
     * 更新数据列表
     */
    updateDetailList() {
      this.detailList.forEach((element, key) => {
        element.index = key;
      });
      this.activeIndex = this.defaultSelectedIndex;
    },
    onItemClick(index, item) {
      if (item.index !== this.defaultSelectedIndex) {
        this.activeIndex = index;
        this.$emit('change', item.index, item);
      }
    },
    slideTo(index) {
      this.$refs.swiper.slideToIndex(index);
    },
    prevPage() {
      if (this.defaultSelectedIndex <= 0) return;
      this.$emit('change', this.defaultSelectedIndex - 1);// 两箭头行为修改为上一个下一个
      this.$refs.swiper.slideToView(Math.floor((this.defaultSelectedIndex - 1) / 5));
      // this.$refs.swiper.prev();
    },
    nextPage() {
      if (this.defaultSelectedIndex >= this.detailList.length - 1) return;
      this.$emit('change', this.defaultSelectedIndex + 1);// 两箭头行为修改为上一个下一个
      this.$refs.swiper.slideToView(Math.floor((this.defaultSelectedIndex + 1) / 5));
      // this.$refs.swiper.next();
    },
    onSwiperReady() {
      const vm = this;
      this.$nextTick(() => {
        vm.swiper = vm.$refs.vueSwiper.swiper;
      });
    },
    /**
     * 比分处理，保留两位小数
     */
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    }
  }
};
</script>
<style lang="scss">
.double-card-detail-selector{
  height: 136px;
  width: 1250px;
  background: #242935 ;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .pre-btn-box,
  .next-btn-box{
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 25px;
    height: 136px;
    cursor: pointer;
    font-size: 12px;
    color: #D1D5DD;
  }
  .swiper-wrapper{
    width:1190px;
    padding: 0 2px;
    .swiper-slide{
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .detail-list{
    flex: 1 1 auto;
    display: flex;
    justify-content: flex-start;
    overflow: hidden;
  }

  .card-box.selected{
    border: #388CF2 2px solid;
  }
  .collect-box{
    position: absolute;
    top: 5px;
    right: 5px;
    .meg-icon{
      width: 20px;
      height: 20px;
      // color: #21539b;
    }
  }
  .fast-swiper-box{
    height:118px;width:228px
  }
  .swiper-inner-box{
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    box-sizing: border-box;
    &.active{
      border:2px solid #388CF2
    }
    .meg-double-card{
      box-shadow: none;
      background-color: #fff;
    }
  }
}
</style>
