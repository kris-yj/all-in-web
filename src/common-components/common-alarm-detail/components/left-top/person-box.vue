<template>
  <meg-double-card
    class="card-box"
    width="50%"
    :left-img-src="imgType === 'face' ? info.leftImgSrc : info.leftImgSrcBody"
    :right-img-src="info.rightImgSrc"
    :score="info.score"
    @enter="onEnter"
    @leave="onLeave"
    @img-error="onImgError"
    @click="viewBigImage"
    :single="info.single">
    <template v-slot:left-custom>
      <div
        v-if="(jumpControl.face || jumpControl.body) && info.leftImgSrcBody && info.leftImgSrc"
        @click.stop="changeImgType"
        class="associate-btn">
        <meg-icon
          height="12px"
          class="icon-change"
          color="white"
          width="12px"
          name="two-way-arrow"></meg-icon>
        {{ imgType === 'face'? $t('关联人体'): $t('关联人脸') }}
      </div>
      <jump-with-img
        v-show="jumpControl[imgType]"
        :do-deploy="captureDeployParams"
        :append-album="captureAppendParams"
        :params="imgType === 'face' ? info.faceParams : info.bodyParams"
        @handle-compare="handleCompare"></jump-with-img>
      <one-key-compare
        :compare-data="compareData"
        @close="isShowCompare = false"
        v-if="isShowCompare"></one-key-compare>
    </template>
    <template v-slot:right-custom>
      <jump-with-img
        v-show="jumpControl.right"
        :params="info.albumParams"
        :do-deploy="albumDeployParams"
        :append-album="albumAppendParams"
        @handle-compare="handleCompare"></jump-with-img>
      <img-scaled
        v-model="bigImageVisible"
        :compare-score="info.score"
        :check-orientation="false"
        :imgs-src="img"></img-scaled>
    </template>
  </meg-double-card>
</template>

<script>
import OneKeyCompare from '../one-key-compare';
import JumpWithImg from '../../../common-jump-with-img';
import ImgScaled from '../../../common-img-scaled';

export default {
  name: 'PersonBox',
  components: {
    OneKeyCompare,
    JumpWithImg,
    ImgScaled,
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    appendToBody: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      imgType: 'face',
      jumpFlag: '',
      compareData: {},
      rightParams: {},
      isShowCompare: false,
      jumpControl: {
        'face': false,
        'body': false,
        'right': false,
      },
      bigImageVisible: false,
      img: [],
    };
  },
  computed: {
    captureDeployParams() {
      return {
        appendToBody: this.appendToBody,
        photoUrl: this.imgType === 'face' ? this.info.leftImgSrc : this.info.leftImgSrcBody,
        photoType: this.imgType === 'face' ? 1 : 2,
      };
    },
    albumDeployParams() {
      return {
        appendToBody: this.appendToBody,
        photoUrl: this.info.rightImgSrc,
        photoType: this.info.strategyTypeId
      };
    },
    captureAppendParams() {
      return {
        appendToBody: this.appendToBody,
        imageData: {
          originType: 'capture',
          photoUrl: this.imgType === 'face' ? this.info.leftImgSrc : this.info.leftImgSrcBody,
          cameraName: this.info.cameraName,
          captureTime: this.info.alarmTime,
          type: this.imgType === 'face' ? 0 : 1
        }

      };
    },
    albumAppendParams() {
      return {
        appendToBody: this.appendToBody,
        imageData: {
          photoUrl: this.info.rightImgSrc,
          type: this.info.detectType,
          originType: 'album',
          photoId: this.info.photoId,
          albumId: this.info.albumId
        }
      };
    },
  },
  watch: {
    info: {
      immediate: true,
      handler() {
        if (this.info.strategyTypeId) {
          if (this.info.strategyTypeId === '2') {
            this.imgType = 'body';
          } else {
            this.imgType = 'face';
          }
        }
      }
    }
  },
  mounted() {
    this.compareData = {
      faceOnlyUrl: this.info.leftImgSrc,
      compareAlbumPhotoUrl: this.info.rightImgSrc,
      albumPhotoName: this.info.albumPhotoName,
      cardNo: this.info.cardNo,
    };
  },
  methods: {
    handleCompare() {
      this.isShowCompare = true;
    },
    viewBigImage(t) {
      console.log('view', t);
      this.img = [this.imgType === 'face' ? this.info.leftImgSrc : this.info.leftImgSrcBody, this.info.rightImgSrc];
      this.bigImageVisible = true;
    },
    changeImgType() {
      if (this.imgType === 'face') {
        this.imgType = 'body';
      } else {
        this.imgType = 'face';
      }
      this.jumpControl.face = false;
      this.jumpControl.body = false;
      this.jumpControl[this.imgType] = true;
    },
    onEnter(event) {
      if (event === 'right') {
        this.jumpControl = {
          'face': false,
          'body': false,
          'right': true,
        };
      } else {
        const jumpControl = {
          'face': false,
          'body': false,
          'right': false,
        };
        jumpControl[this.imgType] = true;
        this.jumpControl = jumpControl;
      }
    },
    onLeave() {
      this.jumpControl = {
        'face': false,
        'body': false,
        'right': false,
      };
    },
    onImgError(type) {
      if (type === 'right') {
        this.jumpControl[type] = false;
      } else {
        this.jumpControl[this.imgType] = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.card-box {
  flex: 1;
  .associate-btn {
    position: absolute;
    left: 4px;
    top: 3px;
    background: #21539b;
    border-radius: 2px;
    height: 26px;
    width: 80px;
    display: flex;
    align-items: center;
    color: #FFFFFF;
    font-size: 12px;
    .icon-change{
      margin-left: 8px;
      margin-right: 4px;
    }
  }
}
</style>
