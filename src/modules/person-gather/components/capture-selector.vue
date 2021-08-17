<template>
  <div class="detail-selector">
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
        :slides-per-view="12"
        :slides-per-group="12"
        :space-between="10"
        :default-index="defaultSelectedIndex">
        <div
          class="card-box"
          slot-scope="{ data }">
          <meg-card
            class="card-item"
            @enter="enter(data.index)"
            @click.native="onItemClick(data.index,data)"
            @leave="leave"
            :img-src="data.faceUrl"
            :img-border="data.index ===activeIndex ?'2px solid #388CF2 ':'2px solid #333'"
            img-margin="0">
            <div
              v-if="data.score"
              class="detail-list-item-score"
              slot="bottom">
              {{ fixedScore(data.score) }}
            </div>
            <div slot="img-custom">
              <div
                v-show="isCollectMode && data.index===hoverIndex ||data.favorite"
                @click.stop="collectItem(data)"
                class="collect-box">
                <meg-icon
                  :color="data.favorite?'#22529a  #ffffff':'#d9d8d9 #ffffff'"
                  name="collection"></meg-icon>
              </div>
            </div>
          </meg-card>
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
const PAGESIZE = 10;
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
    maxDisplayNum: {
      type: Number,
      default: 11
    },
    isPhotoSearch: {
      type: Boolean,
      default: false
    },
    isCollectMode: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      swiper: null, // swiper对象
      currentList: [], // 当前详情列表
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
      if (!item.favorite) {
        item.favorite = true;
        this.$emit('collect', item);
      }
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
    /**
     * 更新pageNo
     */
    updatePageNo() {
      let index = '';
      if (this.pageNo > 0) {
        this.currentList = this.detailList.slice(this.pageNo * PAGESIZE, (this.pageNo + 1) * PAGESIZE);
        // this.currentList = this.detailList.slice((this.pageNo - 1) * PAGESIZE, (this.pageNo + 2) * PAGESIZE);
        index = this.defaultSelectedIndex - (this.pageNo + 1) * PAGESIZE;
        this.prevPageVisible = true;
      } else {
        this.currentList = this.detailList.slice(0, PAGESIZE);
        index = this.defaultSelectedIndex;
        this.prevPageVisible = false;
      }
      if (this.pageNo === this.totalPage - 1) {
        this.nextPageVisible = false;
      } else {
        this.nextPageVisible = true;
      }
      return index;
    },
    onItemClick(index, item) {
      console.log('index');
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
      this.$refs.swiper.slideToView(Math.floor((this.defaultSelectedIndex - 1) / 12));
      // this.$refs.swiper.prev();
    },
    nextPage() {
      if (this.defaultSelectedIndex >= this.detailList.length - 1) return;
      this.$emit('change', this.defaultSelectedIndex + 1);// 两箭头行为修改为上一个下一个
      this.$refs.swiper.slideToView(Math.floor((this.defaultSelectedIndex + 1) / 12));
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
<style lang="scss" scoped>
.detail-selector {
  height: 136px;
  width: 1250px;
  background: #242935;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  .pre-btn-box,
  .next-btn-box {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 25px;
    height: 136px;
    cursor: pointer;
    font-size: 12px;
    color: #d1d5dd;
  }
  .swiper-wrapper {
    width: 1190px;
    .swiper-slide {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .card-box {
    width: 88px;
    height: 88px;
    cursor: pointer;
    &::v-deep .meg-card {
      width: 88px;
      margin: 0;
      box-shadow: none;
      .detail-list-item-score {
        font-size: 19px;
        color: #d2d6de;
        text-align: center;
        background-color: #242a35;
        font-family: "meg-number";
        padding-top: 8px;
      }
      &::v-deep .meg-card__img {
        background-color: #242a35;
      }
    }
  }
  .card-box.selected {
    border: #388cf2 2px solid;
  }
  .collect-box {
    position: absolute;
    top: 5px;
    right: 5px;
    &::v-deep .meg-icon {
      width: 20px;
      height: 20px;
      // color: #21539b;
    }
  }
}
</style>
