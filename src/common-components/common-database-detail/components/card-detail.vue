<template>
  <div class="identity-detail-card">
    <meg-double-card
      class="duo-card"
      v-if="activeItem.uploadImageUrl"
      width="50%"
      :left-img-src="activeItem.uploadImageUrl"
      :right-img-src="activeItem.photoUrl"
      :left-useful-frame="uploadRect"
      :score="activeItem.score"
      score-size="large"
      @enter="cardEnter"
      @leave="cardLeave"
      @click="imgFullScreenDialogShow">
      <div slot="header">
        <span class="photo-title">{{ $t("上传图") }}</span>
        <span class="photo-title">{{ $t("底库图") }}</span>
      </div>
      <div
        v-show="jumpFlag==='left'"
        slot="left-custom">
        <common-jump-with-img
          :params="leftJumpOpt"
          :append-album="leftAppendAlbum"
          :do-deploy="leftDoDeploy"></common-jump-with-img>
      </div>
      <div
        v-show="jumpFlag==='right'"
        slot="right-custom">
        <common-jump-with-img
          :params="rightJumpOpt"
          :append-album="rightAppendAlbum"
          :do-deploy="rightDoDeploy"></common-jump-with-img>
      </div>
    </meg-double-card>
    <meg-card
      class="single-card"
      show-angle
      v-else
      :img-src="activeItem.photoUrl"
      @enter="cardEnter"
      @leave="cardLeave"
      @click="imgFullScreenDialogShow">
      <div slot="header">
        <span class="photo-title">{{ $t("底库图") }}</span>
      </div>
      <div
        v-show="jumpFlag==='img'"
        slot="img-custom">
        <common-jump-with-img
          :params="rightJumpOpt"
          :append-album="rightAppendAlbum"></common-jump-with-img>
      </div>
    </meg-card>
    <common-img-scaled
      v-model="fullImgScreen"
      :check-orientation="false"
      :imgs-src="fullImgScreenSrc"
      :compare-score="activeItem.score"
      :is-all-scaled-show="isPhotoSearch"
      :is-single-scaled-show="isPhotoSearch"
      :left-img-rect="uploadRect"></common-img-scaled>
  </div>
</template>

<script>
import { captureTransToAlarm } from '@/common-components/utils/utils';
import CommonImgScaled from '@/common-components/common-img-scaled';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';

export default {
  components: {
    CommonImgScaled,
    CommonJumpWithImg,
  },
  props: {
    activeItem: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      fullImgScreen: false,
      fullImgScreenSrc: [],
      jumpFlag: '',
      isPhotoSearch: false
    };
  },
  computed: {
    uploadRect() {
      return this.activeItem.uploadImageUrl ? this.activeItem.uploadImageRect : {};
    },
    leftJumpOpt() {
      if (this.activeItem.uploadImageUrl) {
        return {
          photo: this.activeItem.uploadImageUrl,
          type: [0],
          genre: 4,
          source: 1,
          originType: 'upload'
        };
      }
      return {};
    },
    leftAppendAlbum() {
      return this.leftJumpOpt.photo ? {
        imageData: {
          originType: this.leftJumpOpt.originType,
          photoUrl: this.leftJumpOpt.photo,
          type: this.leftJumpOpt.type[0],
        }
      } : {};
    },
    leftDoDeploy() {
      return {
        photoUrl: this.leftJumpOpt.photo,
        photoType: captureTransToAlarm(this.leftJumpOpt.type[0]),
      };
    },
    rightJumpOpt() {
      return {
        photo: this.activeItem.photoUrl,
        id: this.activeItem.photoCoreId,
        photoId: this.activeItem.photoId,
        type: [0],
        genre: 1,
        source: 1,
        originType: 'album'
      };
    },
    rightAppendAlbum() {
      return {
        imageData: {
          originType: this.rightJumpOpt.originType,
          photoUrl: this.rightJumpOpt.photo,
          type: this.rightJumpOpt.type[0],
          photoId: this.activeItem.photoId,
          albumId: this.activeItem.albumId
        }
      };
    },
    rightDoDeploy() {
      return {
        photoUrl: this.rightJumpOpt.photo,
        photoType: captureTransToAlarm(this.rightJumpOpt.type[0]),
      };
    },
  },
  methods: {
    cardEnter(event) {
      switch (event) {
        case 'left': {
          this.jumpFlag = 'left';
          break;
        }
        case 'right': {
          this.jumpFlag = 'right';
          break;
        }
        case 'img': {
          this.jumpFlag = 'img';
          break;
        }
        default: this.jumpFlag = '';
          break;
      }
    },
    cardLeave(event) {
      if (event) {
        this.jumpFlag = '';
      }
    },
    // 点击查看大图 duo=true时为双图
    imgFullScreenDialogShow(event) {
      if (event === 'img') {
        this.fullImgScreenSrc = [this.activeItem.photoUrl];
        this.isPhotoSearch = false;
        this.fullImgScreen = true;
      } else if (event === 'left' || event === 'right') {
        this.fullImgScreenSrc = [this.activeItem.uploadImageUrl, this.activeItem.photoUrl];
        this.isPhotoSearch = true;
        this.fullImgScreen = true;
      }
    },
  },
};
</script>

<style lang='scss' scoped>
.identity-detail-card {
  flex: 1;
  display: flex;
  justify-content: center;
  margin: auto;
  .photo-title {
    display: inline-block;
    margin-bottom: 10px;
    width: 49%;
    font-size: 14px;
    color: #869abb;
  }
  .single-card {
    width: 350px;
    box-shadow: none;
  }
  .duo-card {
    width: 700px;
  }
  .meg-double-card {
    margin: 0;
    box-shadow: none;
  }
  ::v-deep .meg-double-card__img {
    overflow: hidden;
  }
}
</style>
