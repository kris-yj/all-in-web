<template>
  <common-swiper
    ref="detailSwiper"
    v-model="useIndex"
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
          :img-src="data.photoUrl"
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
          v-if="data.score">
          {{ fixedScore(data.score) }}
        </div>
      </div>
    </template>
  </common-swiper>
</template>

<script>
import CommonSwiper from '@/common-components/common-swiper';
import DatabaseDetailSrv from '../database-detail.service.js';

export default {
  components: {
    CommonSwiper
  },
  model: {
    prop: 'activeIndex',
    event: 'change'
  },
  props: {
    activeIndex: {
      type: Number,
      default: -1
    },
    resultList: {
      type: Array,
      default: () => []
    },
    showTemporary: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      hoverIndex: -1,
      useIndex: -1,
    };
  },
  computed: {

  },
  watch: {
    activeIndex: {
      immediate: true,
      handler() {
        this.useIndex = this.activeIndex;
      }
    }
  },
  mounted() {

  },
  destroyed() {

  },
  methods: {
    showWord(isInTemporary) {
      return isInTemporary ? this.$t('移出暂存架') : this.$t('加入暂存架');
    },
    itemChange(index) {
      this.$emit('change', index);
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
    /**
     * @description: 加入或移出暂存架
     * @param {Object}
     * @return
     */
    temporaryClick(item, index) {
      this.eventTracking('FaceIdentityDetailZCJ');
      if (item.temporaryFlag) {
        const params = {
          temIds: [item.photoId],
          temType: 3
        };
        DatabaseDetailSrv.delTemporarys(params).then((res) => {
          if (res.code === 0) {
            this.$set(this.resultList[this.hoverIndex], 'temporaryFlag', false);
            this.$store.dispatch('shelf/manageShelf', {
              type: 'database',
              action: 'delete',
              id: item.photoId,
            });
            this.$message({
              type: 'success',
              message: this.$t('移出暂存架成功')
            });
            this.$emit('remove-temporary', index);
          }
        });
      } else {
        const snapshot = { ...item };
        if (snapshot.score) {
          delete snapshot.score;
          delete snapshot.uploadImageUrl;
        }
        snapshot.temporaryFlag = true;
        const params = {
          temId: item.photoId,
          temType: 3,
          temOrigin: 3,
          albumId: item.albumId,
          snapshot
        };
        DatabaseDetailSrv.addTemporarys(params).then((res) => {
          if (res.code === 0) {
            this.$set(this.resultList[this.hoverIndex], 'temporaryFlag', true);
            this.$store.dispatch('shelf/manageShelf', {
              type: 'database',
              action: 'add',
              id: item.photoId,
            });
            this.$message({
              type: 'success',
              message: this.$t('加入暂存架成功')
            });
          }
        });
      }
    },
    // 比分处理，保留两位小数
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
    // 重置swiper到当前选中项
    resetSwiper() {
      this.$refs.detailSwiper.initSwiper();
    }
  },
};
</script>

<style lang='scss' scoped>
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
  background: rgba(33, 83, 155, 0.9);
  .temporary {
    font-size: 12px;
    color: #ffffff;
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
  background: rgba(134, 154, 187, 0.8);
  border-radius: 1px;
  line-height: 20px;
  &:hover {
    background: #21539b;
  }
  .meg-icon {
    margin-top: -2px;
  }
}
.icon-active {
  background: #21539b;
}
.card-score {
  font-family: 'HEMIHEAD';
  font-size: 18px;
  color: #ffffff;
  text-align: center;
  margin-top: 9px;
}
</style>
