<template>
  <div
    class="common-card-wrapper"
    @mouseenter="hoverCard = true"
    @mouseleave="hoverCard = false"
    :draggable="draggable"
    @dragstart="onDragStart">
    <meg-card-ue
      shadow="nerver">
      <div
        class="common-card-content"
        ref="cardRef">
        <meg-img-container
          class="content-left capture-image"
          :img-src="imgUrl">
        </meg-img-container>
        <div class="content-right">
          <span class="img-content">
            <meg-img-container
              v-if="relatedUrl"
              class="related-image"
              :img-src="relatedUrl">
            </meg-img-container>
          </span>
          <span
            v-if="currentScore"
            class="score"
            v-tooltip="true">
            {{ formatScore(currentScore) }}
          </span>
          <!-- :plate-number="licensePlateText" -->
          <common-license-plate
            v-if="cardData.detectType === 5 && cardData.detectType === 6"
            plate-type="car"
            size="mini"></common-license-plate>
          <span class="time">
            <span class="time-icon">
              <meg-icon
                class="time-chunk"
                height="11"
                width="11"
                name="time_fill"
                color="#d1d5dd"></meg-icon>
                &nbsp;
            </span>
            <span class="time-text">
              {{ capturedTime | formatTime('YYYY-MM-DD HH:mm:ss') }}
            </span>
          </span>
        </div>
      </div>
      <div
        slot="bottom"
        class="common-card-bottom">
        <div
          class="location"
          v-tooltip="true">
          <meg-icon
            :name="bottomMsg.iconName"
            height="12"
            width="12"
            color="#d1d5dd"></meg-icon>
          <span class="text">{{ bottomMsg.content }}</span>
        </div>
        <div class="btns">
          <span
            v-if="showCaptureBtn"
            class="btn-normal btn-text"
            :class="captureSearchExist ? '' : 'btn-disabled'"
            @click.stop="jumpToSearch('capture-search')">抓拍检索</span>
          <span
            v-if="currentDetectType === 0 && showJudgeBtn"
            class="btn-normal btn-text"
            :class="faceIdentityExist ? '' : 'btn-disabled'"
            @click.stop="jumpToSearch('face-identity')">人脸身份</span>
          <span
            v-else-if="currentDetectType !== 0 && showJudgeBtn"
            class="btn-normal btn-text"
            :class="trackExist ? '' : 'btn-disabled'"
            @click.stop="jumpToSearch('track')">轨迹回放</span>
          <span
            v-show="delButtonStatus"
            class="btn-normal btn-icon"
            @click.stop="cardDelete">
            <meg-icon
              name="mission_del"
              :color="hoverCard ? '#21539b;': '#869ABB'"></meg-icon>
          </span>
          <meg-tooltip
            class="item"
            effect="meg"
            :content="temporaryFlag ? $t('移出暂存架'):$t('加入暂存架')"
            placement="top">
            <span
              class="btn-normal btn-icon"
              :class="[temporaryFlag ? 'active': '']"
              @click.stop="handleTemporaryLibrary">
              <meg-icon
                width="12"
                name="all-store-stroke"
                :color="temporaryFlag ? '#fff': hoverCard ? '#21539b;': '#869ABB'"></meg-icon>
            </span>
          </meg-tooltip>
          <common-jump-with-img
            ref="commonJump"
            :exclude-common-use="true"
            :rotate="90"
            icon-width="12"
            icon-height="12"
            trigger-icon="more"
            :params="jumpParams"
            :do-deploy="doDeploy"
            :append-album="appendAlbum"></common-jump-with-img>
        </div>
      </div>
    </meg-card-ue>
  </div>
</template>

<script>
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import MegCardUe from './meg-card-ue';
import CommonLicensePlate from '../common-license-plate';
import commonCardSrv from './common-card-ue.service';

export default {
  components: {
    CommonLicensePlate,
    MegCardUe,
    CommonJumpWithImg
  },
  props: {
    // 卡片的数据
    cardData: {
      type: Object,
      default: () => {},
    },
    // 删除按钮
    isShowDelButton: {
      type: Boolean,
      default: false
    },
    // 暂存架&携图跳转按钮
    isShowBaseButton: {
      type: Array,
      default: () => ['jump', 'temporary']
    },
    // 暂存架传入参数
    temporaryRequestParams: {
      type: Object,
      default: () => ({
        temType: '', // 类型
        temOrigin: '' // 来源
      })
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
    // 是否显示研判按钮
    showJudgeBtn: {
      type: Boolean,
      default: true
    },
    // 是否显示抓拍按钮
    showCaptureBtn: {
      type: Boolean,
      default: true
    },
    jumpModule: {
      type: String,
      default: 'common'
    },
    dateTime: {
      type: Array,
      default: () => []
    },
    // 0: 人脸
    albumType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      // licensePlateText: '苏A3S6X2',
      hoverCard: false,
    };
  },
  computed: {
    trackExist() {
      return this.$store.getters.moduleIsExistByAlias('track');
    },
    faceIdentityExist() {
      return this.$store.getters.moduleIsExistByAlias('face-identity');
    },
    captureSearchExist() {
      return this.$store.getters.moduleIsExistByAlias('capture-search');
    },
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
    delButtonStatus() {
      return this.isShowDelButton;
    },
    typeMap() {
      return {
        '0': '1',
        '1': '2',
        '5': '3',
        '6': '4'
      };
    },
    jumpParams() {
      let startTime;
      let endTime;
      if (this.jumpModule === 'common') {
        startTime = this.capturedTime - 3 * 24 * 60 * 60 * 1000;
        endTime = this.capturedTime;
      } else if (this.dateTime.length) {
        [startTime, endTime] = this.dateTime || [this.capturedTime - 3 * 24 * 60 * 60 * 1000, this.capturedTime];
      }
      return {
        id: this.cascade ? null : this.cardId,
        genre: 0,
        source: 1,
        locator: {},
        photo: this.imgUrl,
        capturedTime: this.capturedTime,
        cameraId: this.cameraId,
        type: [this.currentDetectType],
        startTime,
        endTime
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
    // 暂存架本身状态 | 手动更改状态
    temporaryFlag() {
      return this.cardData.temporaryFlag;
    },
    capturedTime() {
      return this.cardData.capturedTime || this.cardData.captureTime;
    },
    // 图片地址
    imgUrl() {
      return (
        this.cardData.cropUrl || this.cardData.photoUrl || this.cardData.url
      );
    },
    relatedUrl() {
      const { relatedPhotoVo } = this.cardData;
      return (
        relatedPhotoVo
        && (relatedPhotoVo.relatedCropUrl || relatedPhotoVo.relatedUrl)
      );
    },
    cardId() {
      return this.cardData.id || this.cardData.captureId;
    },
    // 当前比分
    currentScore() {
      const score = this.cardData.showScore || this.cardData.score;
      return score;
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
  },
  methods: {
    /**
     * @description 拖拽的方法
     */
    onDragStart(e) {
      console.log(e);
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
    jumpToSearch(module) {
      this.$refs.commonJump.handleItemClick(module, true, this.jumpParams);
    },
    /**
     * @description 点击删除卡片
     */
    cardDelete() {
      this.$emit('delete-card');
    },
    /**
     * @description 格式化分数
     */
    formatScore(score) {
      return parseFloat(score).toFixed(2);
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
      const cardRefPos = this.$refs.cardRef.getBoundingClientRect();
      const {
        width, height, x, y
      } = cardRefPos;
      commonCardSrv.addTemporaries(params).then((res) => {
        if (res.code === 0) {
          this.cardData.temporaryFlag = true;
          this.$message.success('加入暂存架成功');
          this.$store.dispatch('shelf/manageShelf', {
            action: 'add',
            type: 'capture',
            id: this.cardData.id,
            x: x + width / 2,
            y: y + height
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
     * @description 加入or删除暂存架
     */
    async handleTemporaryLibrary() {
      if (!this.temporaryFlag) {
        await this.addTemporaries();
      } else {
        await this.deleteTemporaries();
      }
    },
  },
};
</script>
<style lang="scss">
.common-card-wrapper {
  border: 2px solid #fff;
}
.common-card-wrapper:hover {
  .common-card-bottom {
    .btn-normal {
      color: #21539b;
      border-color: #d1d5dd;
    }
  }
}
.common-card-wrapper:focus,
.common-card-wrapper:hover {
  border: 2px solid #5b98e7;
}
.common-card-content {
  display: flex;
  width: 100%;
  overflow: hidden;
  .content-left {
    width: 124px;
    height: 124px;
    background-color: #efefef;
  }
  .content-right {
    flex: 1;
    min-height: 124px;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    .common-license-plate {
      width: 80px;
      flex: 0.7;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .img-content {
      width: 50px;
      height: 50px;
      margin-bottom: 3px;
    }
    .related-image {
      height: 100%;
      width: 100%;
      background-color: #efefef;
    }
    .score {
      display: block;
      margin: 3px 0 0;
      line-height: 25px;
      font-family: HEMIHEAD;
      font-size: 24px;
      color: #21539b;
      letter-spacing: 0;
      text-align: left;
      flex: 0.8;
    }
    .time {
      flex: 1;
      line-height: 15px;
      display: flex;
      align-items: center;
      margin-top: 2px;
    }
    .time-icon {
      display: block;
      width: 11px;
      margin-right: 6px;
    }
    .time-text {
      flex: 1;
      display: block;
      font-size: 12px;
      color: #435068;
      word-break: keep-all;
      height: 30px;
    }
  }
}
.common-card-bottom {
  // max-width: 230px;
  .location {
    font-size: 12px;
    .text {
      margin-left: 5px;
    }
  }
  .btns {
    display: flex;
    justify-content: space-between;
    .btn-normal:nth-child(1) {
      margin-left: 0;
    }
    .btn-normal {
      margin-left: 6px;
      font-size: 12px;
      line-height: 18px;
      border-radius: 2px;
      color: #869abb;
      border: 1px solid #c7ced8;
      box-sizing: border-box;
    }
    .btn-normal.btn-text {
      flex: 1;
      text-align: center;
    }
    .btn-disabled {
      cursor: not-allowed;
      pointer-events: none;
      color: #bdc2ca !important;
      border: 1px solid #bdc2ca !important;
      position: relative;
    }
    .btn-normal.btn-icon {
      width: 22px;
      line-height: 16px;
      padding: 0px 4px;
    }
    .btn-normal.btn-icon.active {
      border-color: #21539b;
      background-color: #21539b;
    }
    .btn-normal:hover {
      border-color: #21539b;
    }
    .custom-icon {
      width: 20px;
      height: 20px;
      background-color: rgba(134, 154, 187, 0.8);
      border-radius: 1px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .capture-hover-items {
      position: relative;
      left: 0;
      top: 0;
      margin-left: 6px;
      border-radius: 2px;
      color: #869abb;
      border: 1px solid #c7ced8;
      box-sizing: border-box;
      line-height: 16px;
      height: auto;
    }
    .capture-hover-items:hover {
      border-color: #21539b;
    }
  }
}
</style>
