<template>
  <div class="album-region-detail-container">
    <div class="detail-info-box">
      <div class="detail-photo-box">
        <div class="detail-content-box">
          <div
            @click="fullImgScreenDialogShow"
            class="full-view-box">
            <div> <span class="photo-title">{{ $t('全景图') }}</span></div>
            <meg-card
              :img-src="info.captureFullUrl"
              img-margin="0"
              img-border="none"
              :show-angle="true"
              mark-shape="rect"
              mark-border="2px solid #4688f1"
              :mark-coordinate="info.fullRect || {}">
            </meg-card>
          </div>
          <div class="capture-photo-box">
            <meg-double-card
              width="50%"
              @click="doubleImgFullScreenDialogShow"
              :left-img-src="info.captureFaceUrl"
              :right-img-src="info.albumPhotoUrl"
              :score="info.score && parseFloat(info.score)"
              score-size="large"
              @enter="doubleCardEnter"
              @leave="doubleCardLeave">
              <div slot="header">
                <span class="photo-title">{{ $t('抓拍图') }}</span>
                <span class="photo-title">{{ $t('底库图') }}</span>
              </div>
              <div slot="bottom">
                <div class="bottom-box">
                  <p>
                    <span class="info-title">{{ $t('抓拍时间') }}</span>
                    <span class="info-content">{{ timeFormat(info.captureTime) }}</span>
                  </p>
                  <p>
                    <span class="info-title">{{ $t('相机类型') }}</span>
                    <span class="info-content">{{ cameraType }}</span>
                  </p>
                  <p
                    style="display:flex">
                    <span class="info-title">{{ $t('相机名称') }}</span>
                    <span
                      class="info-content"
                      v-tooltip="true"
                      style="flex:1">{{ info.cameraName }}
                    </span>
                  </p>
                </div>
              </div>
              <div
                slot="left-custom">
                <common-jump-with-img
                  v-show="jumpFlag === 'left'"
                  icon-width="14"
                  icon-height="14"
                  trigger-icon="search_1"
                  :do-deploy="leftDoDeploy"
                  :append-album="leftAppendAlbum"
                  :params="leftJumpOpt"></common-jump-with-img>
              </div>
              <div slot="right-custom">
                <common-jump-with-img
                  v-show="jumpFlag === 'right'"
                  icon-width="14"
                  icon-height="14"
                  trigger-icon="search_1"
                  :do-deploy="rightDoDeploy"
                  :append-album="rightAppendAlbum"
                  :params="rightJumpOpt"></common-jump-with-img>
              </div>
            </meg-double-card>
          </div>
        </div>
      </div>
    </div>
    <!-- 以下弹出框为 有上传图模式 双击 抓拍图和上传图 出现的弹出框 （双人脸缩放）-->
    <common-img-scaled
      v-model="doubleImgScreenVisible"
      :check-orientation="false"
      :imgs-src="[info.captureFaceUrl ,info.albumPhotoUrl]"
      :compare-score="parseFloat(info.score)"></common-img-scaled>
    <common-img-scaled
      v-model="isFullImage"
      :is-all-scaled-show="false"
      :is-single-scaled-show="false"
      :imgs-src="[info.captureFullUrl]">
    </common-img-scaled>
  </div>
</template>
<script>
import moment from 'moment';
import CommonImgScaled from '@/common-components/common-img-scaled';
import withImgToOtherModule from '@/mixins/with-img-to-other-module.js';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';

export default {
  components: {
    CommonImgScaled,
    CommonJumpWithImg,
  },
  mixins: [withImgToOtherModule],
  props: {
    info: {
      type: Object,
      default: () => {},
      required: true
    },
    isPhotoSearch: {
      type: Boolean,
      default: false,
    },
    deviceType: {
      type: String,
      default: 'camera'
    }
  },
  data() {
    return {
      activeIndex: 1,
      fullImgScreen: false,
      detailData: {},
      isFullImage: false,
      doubleImgScreenVisible: false,
      checkManyFace: false,
      switchPhotoDialogVisible: false,
      jumpVisible: true,
      jumpOptionVisible: false,
      imageSrc: '',
      jumpFlag: '',
      monitorObj: {
        url: '',
        type: ''
      },
      albumObj: {}
    };
  },
  computed: {
    /**
     * @description 抓拍图片
     */
    captureFaceUrl() {
      return this.info.captureFaceUrl;
    },
    cameraTypeCode() {
      return this.$store.getters.dataMapByType('camera_type');
    },
    cameraType() {
      const typeCode = this.info.cameraType;
      const cameraType = this.cameraTypeCode.filter((item) => parseFloat(item.code) === parseFloat(typeCode));
      return (cameraType[0] && cameraType[0].value) || '';
    },
    /**
     * @description 底库图片
     */
    albumPhotoUrl() {
      return this.info.albumPhotoUrl;
    },
    leftJumpOpt() {
      return {
        genre: 0, // 抓拍图
        source: 1,
        locator: {},
        photo: this.captureFaceUrl
      };
    },
    rightJumpOpt() {
      return {
        genre: 1, // 底库图
        source: 1,
        locator: {},
        photo: this.albumPhotoUrl
      };
    },
    leftDoDeploy() {
      return {
        photoUrl: this.captureFaceUrl,
        photoType: 1 // 人脸
      };
    },
    leftAppendAlbum() {
      return {
        imageData: {
          originType: 'capture',
          photoUrl: this.captureFaceUrl,
          cameraName: this.info.cameraName,
          captureTime: this.info.captureTime,
          capturePhotoId: this.info.faceId,
          type: 0 // 人脸
        }
      };
    },
    rightAppendAlbum() {
      return {
        imageData: {
          originType: 'album',
          photoUrl: this.albumPhotoUrl,
          type: 0, // 人脸
          albumId: this.info.albumId,
          photoId: this.info.photoId
        }
      };
    },
    rightDoDeploy() {
      return {
        photoUrl: this.albumPhotoUrl,
        photoType: 1
      };
    },
  },
  methods: {
    fullImgScreenDialogShow() {
      this.isFullImage = true;
    },

    doubleImgFullScreenDialogShow(event) {
      if (event === 'left' || event === 'right') {
        this.doubleImgScreenVisible = true;
      }
    },
    /**
     * 携图跳转部分
     * 鼠标进入双人卡片
     */
    doubleCardEnter(event) {
      if (event === 'left') {
        this.jumpFlag = 'left';
      } else if (event === 'right') {
        this.jumpFlag = 'right';
      }
    },
    doubleCardLeave(event) {
      if (event) {
        this.jumpFlag = '';
      }
    },
    /**
     * 携图跳转部分
     * 鼠标进入单人卡片
     */
    cardEnter(event) {
      if (event === 'img') {
        this.jumpFlag = 'img';
      }
    },
    cardLeave(event) {
      if (event) {
        this.jumpFlag = '';
      }
    },
    timeFormat(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },
  }
};
</script>
<style lang="scss">
.album-region-detail-container {
  width: 925px;
  height: 100%;
  .detail-info-box {
    width: 100%;
    height: 100%;
    display: flex;
  }
  .detail-photo-box {
    display: flex;
    width: 925px;
    padding-top: 22px;
  }
  .detail-content-box {
    display: inline-block;
    margin: 0 auto;
  }
  .photo-title {
    display: inline-block;
    margin-bottom: 10px;
    width: 49.5%;
    font-size: 14px;
    color: #869abb;
  }
  .archives-btn {
    position: absolute;
    right: 0;
    height: 14px;
    color: #21539b;
    cursor: pointer;
  }
  .card-header-wrapper {
    cursor: default;
  }
  .meg-double-card {
    box-shadow: none;
    margin: 0;
    width: 484px;
    .bottom-box {
      width: 50%;
    }
  }
  .capture-photo-box {
    display: inline-block;
    vertical-align: top;
    .meg-card {
      width: 248px;
      margin: 0;
      box-shadow: none;
    }
  }
  .jump-box {
    position: absolute;
    right: 13px;
    top: 13px;
    z-index: 10;
    cursor: pointer;
    .meg-icon {
      width: 18px;
      height: 18px;
      padding: 4px;
      margin-left: 66px;
      border-radius: 2px;
      background: #21539b;
      color: #fff;
    }
    .jump-option {
      width: 90px;
      line-height: 28px;
      margin-top: 4px;
      color: #444;
      background-color: #fff;
      text-align: center;
      border: 1px solid #ebe1de;
      li:hover {
        background-color: #dce1e5;
      }
    }
  }
  .full-view-box {
    display: inline-block;
    width: 323px;
    margin-right: 32px;
    margin-left: 10px;
    vertical-align: top;
    .meg-card {
      width: 75%;
      margin: 0;
      box-shadow: none;
    }
    .meg-card__img_box {
      overflow: visible;
    }
    .meg-card__img_wrapper {
      width: 133%;
    }
  }
  .bottom-box {
    margin-top: 25px;
    cursor: default;
    p {
      margin-bottom: 12px;
    }
  }
  .right {
    float: right;
  }
  .info-title {
    padding-right: 10px;
    font-size: 14px;
    color: #869abb;
  }
  .info-content {
    font-size: 14px;
    color: #435068;
    &.feature-button {
      font-size: 12px;
      color: #444;
      padding: 2px 16px;
      background: #f7f8f9;
    }
  }
}
.handle-detail {
  padding-top: 10px;
}
.header-content-container {
  background: #242935;
}
</style>
<style lang="scss" scoped>
.i18n-en-US {
  .jump-option {
    width: 140px;
    font-size: 12px;
  }
  .bottom-box {
    p {
      &:first-child {
        .info-content {
          line-height: 18px;
        }
      }
    }
  }

  .jump-box .meg-icon {
    margin-left: 115px;
  }
}
</style>
