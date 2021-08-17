<template>
  <div
    :draggable="draggable"
    @dragstart="onDragStart">
    <meg-card
      class="database-card"
      :img-src="cardData.photoUrl"
      :animation="true"
      img-margin="10px"
      right-width="40%"
      @enter="cardHover($event, 'enter')"
      @leave="cardHover($event, 'leave')"
      @click="clickCard">
      <!-- 右侧内容区 -->
      <div
        slot="right"
        class="right-wrapper">
        <div
          class="album-card-score"
          v-tooltip="true">
          <span
            v-if="cardData.score">
            {{ fixedScore(cardData.score) }}
          </span>
        </div>
        <div
          class="album-card-prop"
          v-tooltip="true">
          <meg-icon
            name="card_face"
            color="#d1d5dd"></meg-icon>
          <span>
            {{ cardData.name }}
          </span>
        </div>
        <div
          class="album-card-prop"
          v-tooltip="true">
          <meg-icon
            name="database"
            color="#d1d5dd"></meg-icon>
          <span>
            {{ cardData.albumName }}
          </span>
        </div>
      </div>
      <!-- 底部内容区 -->
      <div
        slot="bottom"
        class="card-bottom">
        <meg-icon
          name="ID"
          color="#d1d5dd"></meg-icon>
        <span>
          {{ cardData.idCard || cardData.identityId }}
        </span>
      </div>
      <!-- 携图跳转区 -->
      <div
        slot="custom"
        class="jump-buttons"
        @click.stop>
        <common-jump-with-img
          v-show="active&&showJumpButton"
          style="top: 0;right: 24px;"
          icon-width="14"
          icon-height="14"
          trigger-icon="search_1"
          :params="jumpOpt"
          :append-album="appendAlbum"
          :do-deploy="doDeploy"></common-jump-with-img>
        <div
          v-if="(cardData.temporaryFlag||active)&&showTemporaryButton"
          :class="['custom-icon',cardData.temporaryFlag?'active':'']"
          @click="temporaryClick">
          <meg-icon
            width="14px"
            height="14px"
            name="temporary-store"
            color="#FFFFFF"></meg-icon>
        </div>
        <div
          v-if="active&&showDeleteButton"
          class="custom-icon"
          @click="temporaryClick">
          <meg-icon
            width="14px"
            height="14px"
            name="mission_del"
            color="#FFFFFF"></meg-icon>
        </div>
      </div>
    </meg-card>
  </div>
</template>
<script>
import { captureTransToAlarm } from '@/common-components/utils/utils';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import DatabaseCardSrv from './database-card.service';

export default {
  components: {
    CommonJumpWithImg,
  },
  props: {
    // 卡片数据
    cardData: {
      type: Object,
      default: null
    },
    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: true
    },
    // 显示携图跳转
    showJumpButton: {
      type: Boolean,
      default: true
    },
    // 显示暂存架标识
    showTemporaryButton: {
      type: Boolean,
      default: true
    },
    // 显示删除标识
    showDeleteButton: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      active: false,
      jumpListVisible: false,
    };
  },
  computed: {
    jumpOpt() {
      return {
        photo: this.cardData.photoUrl,
        type: [0],
        genre: 1,
        source: 1,
        id: this.cardData.photoCoreId,
      };
    },
    appendAlbum() {
      return {
        imageData: {
          originType: 'album',
          photoUrl: this.jumpOpt.photo,
          albumId: this.cardData.albumId,
          photoId: this.cardData.photoId,
          type: this.jumpOpt.type[0],
        }
      };
    },
    doDeploy() {
      return {
        photoUrl: this.jumpOpt.photo,
        photoType: captureTransToAlarm(this.jumpOpt.type[0]),
      };
    }
  },
  methods: {
    /**
     * @description 鼠标移入移出卡片的事件
     */
    cardHover(e, type) {
      if (e === 'img') return;
      this.active = type === 'enter';
      this.jumpListVisible = false;
      this.$emit(`${type}-card`, e);
    },
    /*
    * 点击卡片
    * @param {}
    * @return
    * */
    clickCard(e) {
      if (e === 'img') return;
      this.$emit('card-click', { e, data: this.cardData });
    },
    /*
    * 开始拖拽
    * @param {e}
    * @return
    * */
    onDragStart(e) {
      if (!this.draggable) return;
      e.dataTransfer.setData('draggingData', JSON.stringify({ type: 'database', data: this.cardData }));
    },
    /**
     * @description: 分数转换
     * @param {Number}
     * @return
     */
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
    /**
     * @description: 加入或移出暂存架
     * @param {Object}
     * @return
     */
    temporaryClick() {
      this.eventTracking('FaceIdentityZCJ');
      if (this.showDeleteButton) {
        this.$emit('delete', this.cardData);
        return;
      }
      if (this.cardData.temporaryFlag) {
        const params = {
          temIds: [this.cardData.photoId],
          temType: 3
        };
        DatabaseCardSrv.delTemporaries(params).then((res) => {
          if (res.code === 0) {
            this.cardData.temporaryFlag = false;
            this.$store.dispatch('shelf/manageShelf', {
              type: 'database',
              action: 'delete',
              id: this.cardData.photoId,
            });
            this.$message({
              type: 'success',
              message: this.$t('移出暂存架成功')
            });
          }
        });
      } else {
        const snapshot = { ...this.cardData };
        if (snapshot.score) {
          delete snapshot.score;
          delete snapshot.uploadImageUrl;
        }
        snapshot.temporaryFlag = true;
        const params = {
          temId: this.cardData.photoId,
          temType: 3,
          temOrigin: 3,
          albumId: this.cardData.albumId,
          snapshot
        };
        DatabaseCardSrv.addTemporaries(params).then((res) => {
          if (res.code === 0) {
            this.cardData.temporaryFlag = true;
            this.$store.dispatch('shelf/manageShelf', {
              type: 'database',
              action: 'add',
              id: this.cardData.photoId,
            });
            this.$message({
              type: 'success',
              message: this.$t('加入暂存架成功')
            });
          }
        });
      }
    },
    // 携图跳转列表显示
    handleJumpVisible(boo) {
      this.jumpListVisible = boo;
    },
  }
};
</script>
<style lang="scss" scoped>
.database-card {
  height: 100%;
  box-sizing: border-box;
  color: #435068;
  ::v-deep .meg-card__right-wrapper {
    display: flex;
    justify-content: center;
    flex-direction: column;
  }
  .card-bottom {
    height: 29px;
    line-height: 29px;
    padding-left: 11px;
  }
  .album-card-score {
    margin-top: 15px;
    height: 40px;
    line-height: 40px;
    font-family: HEMIHEAD;
    font-size: 24px;
    color: #21539B;
    letter-spacing: 0;
    text-align: left;
  }
  .album-card-prop {
    line-height: 18px;
    margin: 2px 0;
  }
  .jump-buttons {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    .custom-icon {
      width: 20px;
      height: 20px;
      background: rgba(134,154,187,0.8);
      border-radius: 1px;
      margin-left: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover, &.active {
        background: #21539B;
      }
    }
  }
}
</style>
