<template>
  <div class="two-image">
    <div class="full-image">
      <span class="title">{{ $t('全景图') }}</span>
      <full-image
        :info="info"></full-image>
    </div>
    <div class="image">
      <div class="title">
        <span> {{ $t('抓拍图') }}</span>
      </div>
      <div class="image-container">
        <meg-card
          ::show-angle="true"
          @click="viewBigImage"
          @enter="onCardEnter"
          @leave="onCardLeave"
          :img-src="info.leftImgSrc">
          <template v-slot:img-custom>
            <jump-with-img
              v-show="showJump"
              :do-deploy="captureDeployParams"
              :append-album="captureAppendParams"
              :params="info.captureParams"></jump-with-img>
          </template>
        </meg-card>
        <div>
          <span class="img-border left-top"></span>
          <span class="img-border left-bottom"></span>
          <span class="img-border right-top"></span>
          <span class="img-border right-bottom"></span>
        </div>
      </div>
    </div>
    <img-scaled
      v-model="bigImageVisible"
      :is-all-scaled-show="false"
      :is-single-scaled-show="false"
      :imgs-src="img"></img-scaled>
  </div>
</template>

<script>
import FullImage from './full-image';
import JumpWithImg from '../../../common-jump-with-img';
import ImgScaled from '../../../common-img-scaled';

export default {
  name: 'TwoImage',
  components: {
    FullImage,
    JumpWithImg,
    ImgScaled
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
      showJump: false,
      detectTypeMap: {
        '0': '1',
        '1': '2',
        '5': '3',
        '6': '4',
      },
      bigImageVisible: false,
      img: [],
    };
  },
  computed: {
    captureDeployParams() {
      return {
        photoUrl: this.info.leftImgSrc,
        photoType: this.detectTypeMap[this.info.detectType]
      };
    },
    captureAppendParams() {
      return {
        appendToBody: true,
        imageData: {
          originType: 'capture',
          alarmType: this.info.alarmType,
          photoUrl: this.info.leftImgSrc,
          photoId: this.info.photoId,
          albumId: this.info.albumId,
          cameraName: this.info.cameraName,
          captureTime: this.info.alarmTime,
          capturePhotoId: this.info.captureId,
          type: this.info.detectType
        }
      };
    },
  },
  methods: {
    onCardEnter() {
      this.showJump = true;
    },
    onCardLeave() {
      this.showJump = false;
    },
    viewBigImage() {
      this.img = [this.info.leftImgSrc];
      this.bigImageVisible = true;
    },
  }
};
</script>
<style lang="scss" scoped>
.two-image {
  display: flex;

  .full-image {
    display: flex;
    flex-direction: column;
    width: 332px;
    height: 280px;
    margin-left: 121px;
    .title {
      line-height: 32px;
      font-size: 14px;
      color: #869abb;
      flex-shrink: 0;
    }
  }
  .image {
    margin-left: 18px;
    width: 248px;
    height: 280px;
    display: flex;
    flex-direction: column;
    .title {
      display: flex;
      flex-shrink: 0;
      span {
        line-height: 32px;
        font-size: 14px;
        color: #869abb;
        flex: 1;
        flex-shrink: 0;
        width: 50%;
        text-align: left;
      }
    }
    .image-container {
      position: relative;
    }
    .img-border {
      position: absolute;
      width: 4px;
      height: 4px;
    }
    .left-top {
      left: -1px;
      top: -1px;
      border-top: 1px solid #869abb;
      border-left: 1px solid #869abb;
    }
    .left-bottom {
      left: -1px;
      bottom: -1px;
      border-bottom: 1px solid #869abb;
      border-left: 1px solid #869abb;
    }
    .right-top {
      right: -1px;
      top: -1px;
      border-top: 1px solid #869abb;
      border-right: 1px solid #869abb;
    }
    .right-bottom {
      right: -1px;
      bottom: -1px;
      border-right: 1px solid #869abb;
      border-bottom: 1px solid #869abb;
    }
  }
}
</style>
