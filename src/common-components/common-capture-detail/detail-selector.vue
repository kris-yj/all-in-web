<template>
  <div
    class="detail-selector"
    v-show="activeIndex==='1'||activeIndex==='3'">
    <div v-show="activeIndex==='1'">
      <common-swiper
        ref="detailSwiper"
        v-if="!hideSwiper"
        v-model="captureSelectIndex"
        switch-mode="item"
        :data-list="resultList"
        @change="itemChange"
        @switch="itemChange">
        <template v-slot="{data,index,active}">
          <div
            class="swiper-card"
            :class="active?'active':''">
            <meg-card
              img-margin="0"
              :img-src="data.cropUrl||data.url"
              @enter="cardEnter($event,index)"
              @leave="cardLeave($event)">
              <template
                v-slot:img-custom
                v-if="showTemporary">
                <div
                  class="temporary-bar"
                  v-if="active"
                  @click.stop="temporaryClick(data,index)">
                  <span
                    class="temporary">
                    <meg-icon
                      width="12px"
                      height="12px"
                      name="temporary-store"
                      color="#FFFFFF"
                      v-if="!data.temporaryFlag"></meg-icon>
                    {{ showWord(data.temporaryFlag) }}
                  </span>
                </div>
                <div
                  class="temporary-icon"
                  :class="data.temporaryFlag?'icon-active':''"
                  v-else
                  v-show="hoverIndex===index||data.temporaryFlag"
                  @click.stop="temporaryClick(data,index)">
                  <meg-icon
                    width="12px"
                    height="12px"
                    name="temporary-store"
                    color="#FFFFFF"></meg-icon>
                </div>
              </template>
            </meg-card>
            <div
              class="card-score"
              v-if="data.showScore">
              {{ fixedScore(data.showScore) }}
            </div>
          </div>
        </template>
      </common-swiper>
      <div
        class="bottom-bar"
        v-else>
        <meg-button
          type="primary"
          @click.stop="temporaryClick(info)">
          {{ showWord(info.temporaryFlag) }}
        </meg-button>
      </div>
    </div>
    <div
      class="peer-swiper"
      v-if="activeIndex==='3'">
      <div
        class="peer-card">
        <meg-card
          img-margin="0"
          :img-src="info.cropUrl">
          <div
            slot="right">
            <p class="peer-time">
              {{ $t( '10秒同行' ) }}
            </p>
            <p class="peer-time">
              <span class="peer-num">{{ peerList.length }}</span>
              {{ $t( '张抓拍' ) }}
            </p>
          </div>
        </meg-card>
        <div class="capture-time">
          {{ info.capturedTime | formatTime }}
        </div>
      </div>
      <div
        class="peer-swiper-content">
        <common-swiper
          v-model="peerSelectIndex"
          switch-mode="item"
          :per-view-num="8"
          :data-list="peerList"
          @change="peerChange"
          @switch="peerChange">
          <template v-slot="{data,active}">
            <div class="peer-swiper-card">
              <meg-card
                img-margin="0"
                :img-src="data.cropUrl||data.url"></meg-card>
              <div
                class="peer-time"
                :style="{color:active?'#fff':'#435068'}">
                {{ getIntervalText(data.peerInterval) }}
              </div>
            </div>
          </template>
        </common-swiper>
      </div>
    </div>
  </div>
</template>

<script>
import CommonSwiper from '@/common-components/common-swiper';
import CaptureDetailSrv from './capture-detail.service';

export default {
  components: {
    CommonSwiper
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    resultList: {
      type: Array,
      default: () => []
    },
    propsIndex: {
      type: Number,
      default: -1
    },
    activeIndex: {
      type: String,
      default: ''
    },
    peerList: {
      type: Array,
      default: () => []
    },
    peerIndex: {
      type: Number,
      default: -1
    },
    hideSwiper: {
      type: Boolean,
      default: false
    },
    showTemporary: {
      type: Boolean,
      default: true
    },
    isPhotoSearch: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      captureSelectIndex: -1,
      hoverIndex: -1,
      peerSelectIndex: -1,
    };
  },
  watch: {
    propsIndex: {
      handler(val) {
        this.captureSelectIndex = val;
      },
      immediate: true
    },
    peerIndex: {
      handler(val) {
        if (this.peerSelectIndex !== val) {
          this.peerSelectIndex = val;
        }
      },
      immediate: true
    },
  },
  methods: {
    showWord(isInTemporary) {
      return isInTemporary ? this.$t('移出暂存架') : this.$t('加入暂存架');
    },
    itemChange(...arg) {
      this.$emit('item-change', ...arg);
    },
    peerChange(index) {
      this.$emit('update:peerIndex', index);
    },
    /**
     * @description: 加入或移出暂存架
     * @param {Object}
     * @return
     */
    temporaryClick(item, index = 0) {
      // 埋点
      switch (this.$route.name) {
        case 'capture-search': {
          this.eventTracking('CaptureSearchDetailZCJ');
          break;
        }
        case 'attribute-search': {
          this.eventTracking('NatureSearchDetailZCJ');
          break;
        }
        default: break;
      }
      if (item.temporaryFlag) {
        const params = {
          temIds: [item.id],
          temType: 1
        };
        CaptureDetailSrv.delTemporaries(params).then((res) => {
          if (res.code === 0) {
            if (this.resultList.length) {
              this.$set(this.resultList[this.hoverIndex], 'temporaryFlag', false);
            } else {
              this.$set(this.info, 'temporaryFlag', false);
            }
            this.$store.dispatch('shelf/manageShelf', {
              type: 'capture',
              action: 'delete',
              id: item.id,
            });
            this.$message({
              type: 'success',
              message: this.$t('移出暂存架成功')
            });
            this.$emit('remove-temporary', index);
          }
        });
      } else {
        const params = {
          temId: item.id,
          temType: 1,
          temOrigin: this.isPhotoSearch ? 1 : 2,
          captureType: this.getSourceType(item),
        };
        params.snapshot = this.resultList.length ? { ...this.resultList[this.hoverIndex], temporaryFlag: true } : { ...item, temporaryFlag: true };
        CaptureDetailSrv.addTemporaries(params).then((res) => {
          if (res.code === 0) {
            if (this.resultList.length) {
              this.$set(this.resultList[this.hoverIndex], 'temporaryFlag', true);
            } else {
              this.$set(this.info, 'temporaryFlag', true);
            }
            this.$store.dispatch('shelf/manageShelf', {
              type: 'capture',
              action: 'add',
              id: item.id,
            });
            this.$message({
              type: 'success',
              message: this.$t('加入暂存架成功')
            });
          }
        });
      }
    },
    cardEnter(e, index) {
      if (e === 'img') {
        this.hoverIndex = index;
      }
    },
    cardLeave(e) {
      if (e === 'img') {
        this.hoverIndex = -1;
      }
    },
    // 比分处理，保留两位小数
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
    // 获取来源
    getSourceType(item) {
      switch (item.sourceType) {
        case 'CAMERA': return 1;
        case 'HISTORY': return 2;
        case 'OFFLINE': return 3;
        default: return null;
      }
    },
    // 同行文案
    getIntervalText(seconds) {
      let intervalText = '';
      if (Math.abs(seconds) > 0) {
        intervalText = seconds > 0 ? this.$t('后') : this.$t('前');
      }
      seconds = Math.abs(seconds);
      return `${intervalText + seconds + this.$t('秒')}`;
    },
    // 重置swiper到当前选中项
    resetSwiper() {
      this.$refs.detailSwiper.initSwiper();
    }
  },
};
</script>

<style lang='scss' scoped>
.detail-selector {
  height: 136px;
  .bottom-bar {
    position: relative;
    background: #000000;
    height: 136px;
    display: flex;
    justify-content: center;
    .meg-button {
      position: absolute;
      width: 208px;
      height: 56px;
      font-size: 18px;
      line-height: 38px;
      top: calc(50%-28px);
    }
  }
  .peer-swiper {
    display: flex;
  }
  .meg-card {
    overflow: hidden;
  }
  .swiper-card {
    margin: 0 auto;
    width: 90px;
    padding-top: 8px;
  }
  .temporary-bar {
    position: absolute;
    bottom: 0;
    width: 90px;
    height: 26px;
    background: rgba(33,83,155,0.90);
    .temporary {
      font-size: 12px;
      color: #FFFFFF;
      text-align: center;
      line-height: 26px;
      .meg-icon {
        margin-top: -2px;
      }
    }
  }
  .temporary-icon {
    position: absolute;
    bottom: 0;
    width: 20px;
    height: 20px;
    margin: 2px;
    background: rgba(134,154,187,0.80);
    border-radius: 1px;
    line-height: 20px;
    &:hover {
      background: #21539B;
    }
    .meg-icon {
      margin-top: -2px;
    }
  }
  .icon-active {
    background: #21539B;
  }
  .card-score {
    font-family: "HEMIHEAD";
    font-size: 18px;
    color: #FFFFFF;
    text-align: center;
    margin-top: 9px;
  }
  .peer-card {
    width: 220px;
    background: #F3F3F3;
    .meg-card {
      height: 90px;
      padding-top: 12px;
      margin-left: 31px;
      box-shadow: none;
      background: #F3F3F3;
    }
    .meg-card__right-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .peer-time {
      font-size: 12px;
    }
    .peer-num {
      font-family: "HEMIHEAD";
      font-size: 18px;
    }
  }
  .peer-swiper-content {
    flex: 1;
    min-width: 0;
    .prev-next-wrapper {
      background: #fff;
    }
    ::v-deep .common-swiper__item {
      &:hover {
        background: #fff;
      }
      &.active {
        background: #5b98e7;
      }
    }
    ::v-deep path {
      fill: #000 !important;
    }
    .peer-swiper-card {
      width: 90px;
      margin: 0 auto;
      padding-top: 10px;
      .peer-time {
        margin-top: 6px;
      }
    }
  }
  .capture-time {
    margin-left: 19px;
    margin-top: 10px;
    font-size: 12px;
  }
}
</style>
