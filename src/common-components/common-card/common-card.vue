<template>
  <div
    class="card-wrapper"
    :draggable="draggable"
    @dragstart="onDragStart">
    <meg-card
      class="common-card"
      :animation="true"
      :img-src="imgUrl"
      img-margin="10px 10px 0"
      right-width="40%"
      @enter="cardHover($event, 'enter')"
      @leave="cardHover($event, 'leave')"
      @click="cardClick">
      <div slot="right">
        <slot name="right-msg">
          <div class="right-img-wrapper">
            <div
              class="right-img-container"
              v-if="relatedUrl">
              <meg-img-container
                :img-src="relatedUrl">
              </meg-img-container>
            </div>
          </div>
          <div
            class="right-card-score"
            v-tooltip="true">
            <span
              v-if="currentScore">
              {{ formatScore(currentScore) }}
            </span>
          </div>
          <div class="right-card-time">
            <div class="icon-box">
              <meg-icon
                name="time_fill"
                color="#d1d5dd"></meg-icon>
            </div>
            <div class="time-chunk">
              <span class="time-text">
                {{ capturedTime | formatTime('YYYY-MM-DD HH:mm:ss') }}
              </span>
            </div>
          </div>
        </slot>
      </div>
      <div
        class="common-card-bottom"
        slot="bottom"
        v-tooltip="true">
        <slot name="bottom">
          <meg-icon
            :name="bottomMsg.iconName"
            color="#d1d5dd"></meg-icon>
          <span class="card-info-msg">
            {{ bottomMsg.content }}
          </span>
        </slot>
      </div>
      <div
        class="card-custom"
        slot="custom">
        <slot
          :isShowCustom="isShowCustom"
          name="btns">
        </slot>
        <div
          v-show="delButtonStatus"
          :class="['custom-icon', isShowSkipCard ? 'active': '']"
          @click.stop="cardDelete">
          <meg-icon
            name="mission_del"
            color="#fff"></meg-icon>
        </div>
        <common-jump-with-img
          v-show="jumpToStatus"
          icon-width="14"
          icon-height="14"
          trigger-icon="search_1"
          :params="jumpParams"
          :do-deploy="doDeploy"
          :append-album="appendAlbum"></common-jump-with-img>
        <meg-tooltip
          class="item"
          effect="meg"
          :content="temporaryFlag ? $t('移出暂存架'):$t('加入暂存架')"
          placement="top">
          <div
            v-show="temporaryStatus"
            :class="['custom-icon', temporaryFlag ? 'active': '']"
            @click.stop="handleTemporaryLibrary">
            <meg-icon
              name="all-store-stroke"
              color="#fff"></meg-icon>
          </div>
        </meg-tooltip>
      </div>
      <div
        v-if="isShowThreadButton && isShowCustom"
        class="thread-custom"
        slot="custom">
        <div
          class="add-thread-button"
          @click.stop="joinLibrary">
          加入线索
        </div>
      </div>
      <slot
        :isShowCustom="isShowCustom"
        slot="custom"
        name="checkbox">
      </slot>
    </meg-card>
  </div>
</template>

<script>

import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import commonCardSrv from './common-card.service';

export default {
  components: {
    CommonJumpWithImg
  },
  props: {
    cascade: {
      type: Boolean,
      default: false
    },
    // 卡片的数据
    cardData: {
      type: Object,
      default: () => {}
    },
    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: true
    },
    // 是否拖拽整个卡片或者单独的图片 取值: 'img' 'card' ''
    dragType: {
      type: String,
      default: 'card'
    },
    // 显示加入线索库按钮
    isShowThreadButton: {
      type: Boolean,
      default: false
    },
    // 暂存架&携图跳转按钮
    isShowBaseButton: {
      type: Array,
      default: () => ['jump', 'temporary']
    },
    // 删除按钮
    isShowDelButton: {
      type: Boolean,
      default: false
    },
    // 暂存架传入参数
    temporaryRequestParams: {
      type: Object,
      default: () => ({
        temType: '', // 类型
        temOrigin: '' // 来源
      })
    },
    // 0: 人脸
    albumType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isShowCustom: false, // 移入移出卡片的时候是否显示右上按钮
      isShowSkipCard: false,
    };
  },
  computed: {
    currentDetectType() {
      const { detectType } = this.cardData;
      const { analyzeType } = this.temporaryRequestParams;
      let type = 0;
      if (detectType === 0 || detectType) {
        type = detectType;
      } else if (analyzeType === 0 || analyzeType) {
        type = analyzeType;
      }
      return type;
    },
    capturedTime() {
      return (this.cardData.capturedTime || this.cardData.captureTime);
    },
    cameraId() {
      return this.cardData.cameraId;
    },
    cardId() {
      return this.cardData.id || this.cardData.captureId;
    },
    jumpParams() {
      return {
        id: this.cascade ? null : this.cardId,
        genre: 0,
        source: 1,
        locator: {},
        photo: this.imgUrl,
        capturedTime: this.capturedTime,
        cameraId: this.cameraId,
        type: [this.currentDetectType]
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
    doDeploy() {
      return {
        photoUrl: this.imgUrl,
        photoType: this.typeMap[this.cardData.detectType] || 1
      };
    },
    appendAlbum() {
      return {
        imageData: {
          originType: 'capture',
          photoUrl: this.imgUrl,
          cameraName: this.cardData.cameraName,
          captureTime: this.capturedTime,
          capturePhotoId: this.cardId,
          type: this.cardData.detectType || this.albumType
        }
      };
    },
    bottomMsg() {
      const { sourceType, clueSourceType } = this.cardData;
      let msg = {
        iconName: 'poi',
        content: this.cardData.cameraName
      };
      if (sourceType === 'OFFLINE' || clueSourceType === 'OFFLINE') {
        msg = {
          iconName: 'folder',
          content: this.cardData.fileName
        };
      }
      return msg;
    },
    // 图片地址
    imgUrl() {
      return this.cardData.cropUrl || this.cardData.photoUrl || this.cardData.url;
    },
    // 暂存架本身状态 | 手动更改状态
    temporaryFlag() {
      return this.cardData.temporaryFlag;
    },
    // 当前比分
    currentScore() {
      return this.cardData.showScore || this.cardData.score;
    },
    //
    delButtonStatus() {
      return this.isShowCustom && this.isShowDelButton;
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
    relatedUrl() {
      const { relatedPhotoVo } = this.cardData;
      return relatedPhotoVo && (relatedPhotoVo.relatedCropUrl || relatedPhotoVo.relatedUrl);
    }
  },
  watch: {
    isShowCustom(val) {
      if (!val) {
        this.isShowSkipCard = false;
      }
    }
  },
  methods: {
    /**
     * @description 鼠标移入移出卡片的事件
     */
    cardHover(e, type) {
      if (e === 'img') return;
      this.isShowCustom = type === 'enter';
      this.$emit(`${type}-card`, e);
    },
    /**
     * @description 点击删除卡片
     */
    cardDelete() {
      this.$emit('delete-card');
    },
    /**
     * @description 卡片点击
     */
    cardClick(e) {
      if (e === 'img') return;
      this.$emit('card-click', e);
    },
    /**
     * @description 格式化分数
     */
    formatScore(score) {
      return parseFloat(score).toFixed(2);
    },
    /**
     * @description 加入or删除暂存架
     */
    async handleTemporaryLibrary() {
      if (!this.temporaryFlag) {
        await this.addTemporaries();
      } else {
        await this.deleteTemporaries();
      }
    },
    /**
     * @description 加入暂存架
     */
    addTemporaries() {
      const { tempType, tmpOrigin } = this.temporaryRequestParams;
      const params = {
        temId: this.cardId,
        temType: tempType || 1,
        temOrigin: tmpOrigin || 1,
        snapshot: { ...this.cardData, temporaryFlag: true }
      };
      commonCardSrv.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.cardData.temporaryFlag = true;
          this.$message.success('加入暂存架成功');
          this.$store.dispatch('shelf/manageShelf', {
            action: 'add',
            type: 'capture',
            id: this.cardData.id
          });
        }
      });
    },
    /**
     * @description 移出暂存架
     */
    deleteTemporaries() {
      const { tempType } = this.temporaryRequestParams;
      const params = {
        temIds: [this.cardId],
        temType: tempType || 1,
      };
      commonCardSrv.deleteTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.cardData.temporaryFlag = false;
          this.$message.success('移出暂存架成功');
          this.$store.dispatch('shelf/manageShelf', {
            action: 'delete',
            type: 'capture',
            id: this.cardData.id
          });
        }
      });
    },
    /**
     * @description 拖拽的方法
     */
    onDragStart(e) {
      if (!this.draggable) return;
      if (this.dragType === 'card') {
        e.dataTransfer.setData('draggingData', JSON.stringify({ data: this.cardData, type: 'capture' }));
      } else if (e.target.tagName.toLowerCase() === 'img') {
        // 为了兼容抓拍检索只准拖拽图片进行检索
        const src = e.target.getAttribute('src');
        const tempObj = {
          data: {
            url: e.target.getAttribute('src'),
            ...this.cardData
          },
          type: 'card'
        };
        const { id, detectType, relatedPhotoVo = {} } = this.cardData;
        if (src === this.cardData.cropUrl) {
          tempObj.data.id = id;
          tempObj.data.detectType = detectType;
        } else {
          tempObj.data.id = relatedPhotoVo.relatedId;
          tempObj.data.detectType = relatedPhotoVo.detectType;
        }
        e.dataTransfer.setData('draggingData', JSON.stringify(tempObj));
      }
    },
    /**
     * @description 加入线索库
     */
    joinLibrary() {
      this.$emit('join-library', this.cardData);
    },
  }
};
</script>
<style lang='scss' scoped>
.card-wrapper, .common-card{
  height: 100%;
}
// 这里会盖着 checkbox，所以去掉
// .common-card:hover{
//   z-index: 1;
// }
.common-card {
  ::v-deep .capture-hover-items {
    top: 0;
    right: 24px;
  }
  .custom-icon {
    width: 20px;
    height: 20px;
    background-color: rgba(134,154,187,0.8);
    border-radius: 1px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 28px;
    &:hover, &.active{
      background-color: #21539b;
      transition: background-color .2s;
    }
  }
  ::v-deep .meg-card__img-wrapper {
    background: #efefef;
  }
  .right-img-wrapper {
    margin-top: 12px;
    width: 50px;
    height: 46px;
    .right-img-container{
      height: 100%;
      width:100%;
      background: #efefef;
    }
  }
  .right-card-score {
    margin-top: 15px;
    height: 40px;
    line-height: 40px;
    font-family: HEMIHEAD;
    font-size: 24px;
    color: #21539B;
    letter-spacing: 0;
    text-align: left;
  }
  .right-card-time {
    display: flex;
    .time-chunk {
      flex: 1;
      padding: 0 6px;
    }
    .time-text {
      display: block;
      font-size: 12px;
      color: #435068;
      word-break: keep-all;
    }
  }
  .common-card-bottom {
    height: 29px;
    line-height: 29px;
    padding-left: 11px;
  }
  .card-custom{
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
  }
  .thread-custom {
    opacity: 0.9;
    background: #fff;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: calc(100% - 40px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .add-thread-button {
    background: #21539B;
    border-radius: 2px;
    width: 110px;
    height: 28px;
    line-height: 28px;
    font-size: 14px;
    color: #fff;
    text-align: center;
  }
}
</style>
