<template>
  <div
    :class="['thread-card', actived ? 'activeStyle' : '']"
    @mouseenter="cardHover('enter')"
    @mouseleave="cardHover('leave')">
    <div class="card-top">
      <div class="top-left">
        <div
          class="card-number"
          v-if="ind">
          {{ ind }}
        </div>
      </div>
      <div class="top-right">
        <div class="img-wrapper">
          <meg-img-container
            :img-src="cardURL">
          </meg-img-container>
        </div>
        <div class="contrast-msg">
          <div class="contrast-score">
            <span
              v-if="!!cardData.score">
              {{ fixedScore }}
            </span>
          </div>
          <div
            v-if="cardData.relatedPhotoVo && cardData.relatedPhotoVo.relatedUrl"
            class="contrast-img-wrapper">
            <div
              class="img-containe">
              <meg-img-container
                :img-src="cardData.relatedPhotoVo.relatedUrl">
              </meg-img-container>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="card-bottom">
      <div class="card-info">
        <meg-icon
          name="time_fill"
          color="#D1D5DD"></meg-icon>
        <span class="card-info-msg">
          {{ capturedTime | formatTime('YYYY-MM-DD HH:mm:ss') }}
        </span>
      </div>
      <div v-tooltip="true">
        <meg-icon
          name="poi"
          color="#D1D5DD"></meg-icon>
        <span class="card-info-msg">
          {{ cardData.cameraName }}
        </span>
      </div>
    </div>
    <div class="card-custom">
      <div
        v-show="isShowDelButton && isShowCustom"
        class="custom-icon"
        @click.stop="deleteCard">
        <meg-icon
          name="mission_del"
          color="#FFFFFF"></meg-icon>
      </div>
      <common-jump-with-img
        v-show="jumpToStatus"
        icon-width="14"
        icon-height="14"
        trigger-icon="search_1"
        :append-album="appendAlbum"
        :do-deploy="doDeploy"
        :params="jumpOpt">
      </common-jump-with-img>
      <meg-tooltip
        class="item"
        effect="meg"
        :content="temporaryFlag ? $t('移出暂存架'):$t('加入暂存架')"
        placement="top">
        <div
          v-show="temporaryStatus"
          :style="focusedStyle"
          class="custom-icon serachHover">
          <meg-icon
            name="all-store-stroke"
            color="#FFFFFF"
            @click.stop="temporaryHandle"></meg-icon>
        </div>
      </meg-tooltip>
    </div>
    <div
      v-show="isShowDelButton && isShowCustom"
      class="card-detail"
      @click="$emit('show-detail')">
      查看详情
    </div>
    <slot
      :isShowCustom="isShowCustom"
      name="checkbox">
    </slot>
  </div>
</template>

<script>
import commonCardSrv from '@/common-components/common-card/common-card.service';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';

export default {
  components: {
    CommonJumpWithImg
  },
  props: {
    ind: {
      type: Number,
      default: undefined
    },
    actived: {
      type: Boolean,
      default: false
    },
    cardData: {
      type: Object,
      default: () => {}
    },
    isShowDetail: {
      type: Boolean,
      default: () => false
    },
    // 暂存架&携图跳转按钮
    isShowBaseButton: {
      type: Array,
      default: () => ['jump', 'temporary']
    },
    /**
     * @description 删除按钮
     */
    isShowDelButton: {
      type: Boolean,
      default: false
    },
    isCascade: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      isShowCustom: false,
    };
  },
  computed: {
    cardURL() {
      return this.cardData.cropUrl || this.cardData.photoUrl || this.cardData.url;
    },
    fixedScore() {
      return parseFloat(this.currentScore).toFixed(2);
    },
    // 当前比分
    currentScore() {
      return this.cardData.showScore || this.cardData.score;
    },
    captureId() {
      return this.cardData.captureId;
    },
    doDeploy() {
      return {
        photoUrl: this.cardURL,
        photoType: this.typeMap[this.cardData.detectType] || 1
      };
    },
    typeMap() {
      return {
        '0': '1',
        '1': '2',
        '5': '3',
        '6': '4'
      };
    },
    /**
     * @description 加入底库参数
     */
    appendAlbum() {
      const { detectType } = this.cardData;
      return {
        imageData: {
          originType: 'capture',
          photoUrl: this.cardURL,
          cameraName: this.cardData.cameraName,
          captureTime: this.cardData.capturedTime || this.cardData.captureTime,
          type: detectType || 0,
        }
      };
    },
    temporaryFlag() {
      return this.cardData.temporaryFlag;
    },
    /**
     * @description 携图跳转状态
     */
    jumpToStatus() {
      return this.isShowBaseButton.includes('jump') && this.isShowCustom;
    },
    /**
     * @description 暂存架状态
     */
    temporaryStatus() {
      return this.isShowBaseButton.includes('temporary') && (this.isShowCustom || this.temporaryFlag);
    },
    /**
     * @description 已经放入暂存架的状态的样式
     */
    focusedStyle() {
      return this.temporaryFlag ? { background: '#21539B' } : null;
    },
    capturedTime() {
      return (this.cardData.capturedTime || this.cardData.captureTime);
    },
    cameraId() {
      return this.cardData.cameraId;
    },
    jumpOpt() {
      return {
        genre: 0,
        id: this.isCascade ? null : this.captureId,
        source: 1,
        photo: this.cardURL,
        type: [this.cardData.detectType],
        capturedTime: this.capturedTime,
        cameraId: this.cameraId,
      };
    },
  },
  methods: {
    /**
     * @description 鼠标移入移出卡片的事件
     */
    cardHover(type) {
      this.isShowCustom = type === 'enter';
    },
    deleteCard() {
      this.$emit('delete-card', this.cardData);
    },
    /**
     * @description 加入or删除暂存架
     */
    async temporaryHandle() {
      if (!this.temporaryFlag) {
        await this.addTemporaries();
      } else {
        await this.deleteTemporaries();
      }
    },
    addTemporaries() {
      const params = {
        temId: this.captureId,
        temType: 1,
        temOrigin: 1,
        snapshot: { ...this.cardData, temporaryFlag: true }
      };
      return commonCardSrv.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('加入暂存架成功');
          this.cardData.temporaryFlag = true;
          this.$store.dispatch('shelf/manageShelf', {
            action: 'add',
            type: 'capture',
            id: this.captureId
          });
        }
      });
    },
    deleteTemporaries() {
      const params = {
        temIds: [this.captureId],
        temType: 1,
      };
      return commonCardSrv.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.$message.success('删除暂存架成功');
          this.cardData.temporaryFlag = false;
          this.$store.dispatch('shelf/manageShelf', {
            action: 'delete',
            type: 'capture',
            id: this.captureId
          });
        }
      });
    },
  }
};
</script>
<style lang='scss' scoped>
.activeStyle {
  border: 3px solid #5B98E7;
}
.thread-card:hover {
  z-index: 1;
}
.thread-card {
  .jump-style {
    margin-right: 4px;
  }
  cursor: pointer;
  div{
    box-sizing: border-box;
  }
  ::v-deep .capture-hover-items {
    position: static;
  }
  background: #FFFFFF;
  border-radius: 2px;
  position: relative;
  .card-top{
    width: 100%;
    height: 102px;
    display: flex;
  }
  .card-detail{
    position: absolute;
    width:  100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    background: #21539b;
    color: white;
    border-radius: 2px;
    bottom: 0;
  }
  .card-number {
    border: 2px solid #3C9AF2;
    border-radius: 50%;
    min-width: 25px;
    text-align: center;
    font-family: SourceHanSansCN-Bold;
    font-size: 10px;
    color: #3C9AF2;
  }
  .top-left {
    width: 54px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .top-right {
    flex: 1;
    padding-top: 12px;
    display: flex;
    .img-wrapper {
      width: 90px;
      height: 90px;
      background: #111111;
    }
    .contrast-msg {
      flex: 1;
      padding-left: 12px;
    }
    .contrast-img-wrapper {
      width: 42px;
      height: 42px;
      .img-containe {
        width: 100%;
        height: 100%;
        background: #efefef;
      }
    }
    .contrast-score {
      height: 48px;
      line-height: 48px;
      font-family: HEMIHEAD;
      font-size: 24px;
      color: #21539B;
      letter-spacing: 0;
      text-align: left;
    }
  }
  .serachHover:hover {
    background: #21539B;
  }
  .card-bottom {
    padding-left: 54px;
    padding-bottom: 11px;
  }
  .card-info {
    height: 25px;
    line-height: 25px;
  }
  .card-info-msg {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    color: #435068;
  }
  .card-custom{
    position: absolute;
    top: 10px;
    right: 7px;
    display: flex;
    ::v-deep .capture-hover-items{
      margin-right: 4px;
    }
  }
  .custom-icon {
    width: 20px;
    height: 20px;
    background: rgba(134,154,187,0.80);
    border-radius: 1px;
    line-height: 20px;
    text-align: center;
    margin-right: 4px;
  }
  .custom-icon:hover {
    background: #21539B;
  }
}
</style>
