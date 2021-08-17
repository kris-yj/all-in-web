<template>
  <div
    class="content__main__video__left"
    slot="dialog-body">
    <div class="detail-main">
      <div class="detail-photo-box-main">
        <div class="detail-content-box">
          <div class="capture-photo-box">
            <div
              v-if="activeItem.clusterType==='VIDEO'"
              @click="fullImgScreenDialogShow"
              class="full-view-box">
              <div> <span class="photo-title">{{ $t('全景图') }}</span></div>
              <div
                class="full__img">
                <meg-card
                  :img-src="activeItem.fullUrl"
                  img-margin="0"
                  img-border="none"
                  :show-angle="true">
                </meg-card>
              </div>
            </div>
            <div
              class="full-view-box-card"
              @click="fullScreen(activeItem.faceUrl)">
              <div>
                <span class="photo-title">{{ clusterType ? $t('上传图') : $t('抓拍图') }}</span>
              </div>
              <meg-card
                @enter="cardEnter"
                @leave="cardLeave"
                :img-src="activeItem.faceUrl"
                img-margin="0"
                img-border="none"
                :show-angle="true">
                <div slot="img-custom">
                  <common-jump-with-img
                    v-show="jumpOptionVisible"
                    icon-width="14"
                    icon-height="14"
                    :do-deploy="doDeploy"
                    :append-album="appendAlbum"
                    trigger-icon="search_1"
                    :params="jumpOpt"></common-jump-with-img>
                </div>
              </meg-card>
              <div
                class="pic-name"
                v-if="activeItem.clusterType==='PACKAGE'"
                v-tooltip="true">
                <span>{{ $t('图片名称') }}: </span>
                <span>{{ activeItem.faceName }}</span>
              </div>
              <div v-else>
                <div
                  class="pic-name"
                  v-tooltip="true">
                  <span>{{ $t('视频名称') }}: </span>
                  <span>{{ activeItem.videoName }}</span>
                </div>
                <div
                  class="pic-name"
                  v-tooltip="true">
                  <span>{{ $t('抓拍时间') }}: </span>
                  <span>{{ activeItem.captureTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <common-img-scaled
      v-model="fullImgScreen1"
      :imgs-src="imgsSrc"
      :is-all-scaled-show="false"
      :is-single-scaled-show="false"></common-img-scaled>
    <common-img-scaled
      v-model="fullImgScreen"
      :is-all-scaled-show="false"
      :is-single-scaled-show="false"
      :imgs-src="[activeItem.fullUrl]"></common-img-scaled>
  </div>
</template>
<script>
import withImgToOtherModule from '@/mixins/with-img-to-other-module';
import CommonImgScaled from '@/common-components/common-img-scaled';
import CommonJumpWithImg from '@/common-components/common-jump-with-img';

export default {
  name: 'CaptureSubdatail',
  components: {
    CommonImgScaled,
    CommonJumpWithImg,
  },
  mixins: [withImgToOtherModule],
  props: {
    detailList: {
      type: Array,
      default() {
        return [];
      }
    },
    index: {
      type: Number,
      default: 0
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      faceMore: false,
      imageSrc: '',
      jumpOptionVisible: false,
      // 人脸检测请求参数
      faceAnalyzeParams: {
        'photoData:': '',
        // 图像使用场景， 枚举类型，CAPTURE（抓拍）, MONITOR （布控入库）, STATIC （静态入库）
        'scenario': 'CAPTURE'
      },
      fullImgScreen1: false,
      fullImgScreen: false,
      activeIndex: this.index,
      imgsSrc: [],
    };
  },
  computed: {
    clusterType() {
      // true  === 上传图
      // false === 抓拍图
      return this.activeItem.clusterType === 'PACKAGE';
    },
    imgClass() {
      return this.activeItem.uploadImageUrl === '' ? 'showImgSingle' : 'showImg';
    },
    doDeploy() {
      return {
        photoUrl: this.activeItem.faceUrl,
        photoType: 1 // 人脸
      };
    },
    appendAlbum() {
      let albumParams = {};
      if (this.clusterType) {
        albumParams = {
          imageData: {
            originType: 'upload',
            photoUrl: this.activeItem.faceUrl,
            type: 0
          }
        };
      } else {
        albumParams = {
          imageData: {
            originType: 'capture',
            photoUrl: this.activeItem.faceUrl,
            type: 0,
            capturePhotoId: this.activeItem.faceId
          }
        };
      }
      return albumParams;
    },
    dataMap() {
      return this.$store.state.dataMap;
    },
    cardType() {
      let value = '';
      this.dataMap.album_card.forEach((ele) => {
        if (this.activeItem.cardType === ele.code) {
          value = ele.value;   //eslint-disable-line
        }
      });
      return value;
    },
    activeItem() {
      return this.detailList[this.activeIndex];
    },
    jumpOpt() {
      const { faceUrl } = this.activeItem;
      return {
        // 0 === 抓拍图 | 4 === 上传图
        genre: this.clusterType ? 4 : 0,
        source: 1,
        locator: {},
        photo: faceUrl,
      };
    }
  },
  watch: {
    index: {
      handler() {
        this.activeIndex = this.index;
      },
      deep: true
    },
  },

  created() {
    this.activeIndex = this.index;
  },
  methods: {
    fullImgScreenDialogShow() {
      this.fullImgScreen = true;
    },
    /**
       * 全屏显示
       * @augments
       */
    fullScreen(url) {
      this.imgsSrc[0] = url;
      this.fullImgScreen1 = true;
    },
    closeImg() {
      this.fullImgScreen1 = false;
    },
    close() {
      this.$emit('close');
    },
    /**
     * 携图跳转部分
     * 鼠标进入单人卡片
     */
    cardEnter(event) {
      if (event === 'img') {
        this.jumpOptionVisible = true;
      }
    },
    cardLeave(event) {
      if (event) {
        this.jumpOptionVisible = false;
      }
    },
  }
};
</script>
<style scoped lang="scss">
::v-deep .buttonList{
  text-align: left;
}

.pic-name {
  height: 24px;
  line-height: 24px;
  color: #869abb;
  span {
    &:last-child {
      color: #435068;
      margin-left: 8px;
    }
  }
}
.video__card {
  .cardDetail {
    .content__main__video__left {
      .detail-main {
        height: 312px;
        width: 100%;
        margin-bottom: 96px;
        .detail__img {
          float: left;
          width: 920px;
          height: 312px;
          padding: 20px 50px;
          box-sizing: border-box;
          .full__img {
            width: 323px;
            float: left;
            p {
              margin-bottom: 10px;
              color: #989898;
              font-size: 14px;
            }
            .full__img__main {
              width: 323px;
              height: 241px;
              cursor: pointer;
            }
          }
          .double__img {
            width: 480px;
            float: right;
            .img__left {
              float: left;
              width: 240px;
              height: 240px;
              cursor: pointer;
              p {
                margin-bottom: 10px;
                color: #989898;
                font-size: 14px;
              }
            }
            .img__right {
              float: right;
              width: 240px;
              height: 240px;
              cursor: pointer;
              p {
                margin-bottom: 10px;
                color: #989898;
                font-size: 14px;
              }
            }
          }
        }
        .showInfo {
          float: right;
          width: 290px;
          // padding: 58px 0;
          .title {
            line-height: 58px;
            margin: 0 25px;
            color: #989898;
            font-size: 14px;
          }
        }
        .double-card {
          margin: 0;
        }
        .info {
          padding-left: 25px;
          width: 250px;
          float: left;
          .infoDetail {
            margin-bottom: 15px;
            font-size: 12px;
            color: #435068;
            .label {
              display: inline-block;
              width: 76px;
              vertical-align: top;
              color: #999999;
            }
            .label2 {
              display: inline-block;
              width: 48px;
              vertical-align: top;
              color: #999999;
            }
            .value {
              width: 168px;
              display: inline-block;
            }
          }
        }
      }
    }
    .footer {
      height: 136px;
    }
  }
}
.detail-photo-box-main {
  display: -ms-flexbox;
  display: flex;
  width: 100%;
  padding-top: 20px;
  box-sizing: border-box;
  margin: 0 auto;
}
.detail-content-box {
  display: inline-block;
  margin: 0 auto;
}
.capture-photo-box {
  display: inline-block;
  vertical-align: top;
  margin-top: 2px;
  .meg-card {
    width: 272px;
    margin: 0;
    box-shadow: none;
  }
}
.photo-title {
  display: inline-block;
  margin-bottom: 10px;
  width: 50%;
  font-size: 14px;
  color: #869abb;
}
.meg-double-card {
  box-shadow: none;
  margin: 0;
  width: 545px;
  .bottom-box {
    width: 50%;
  }
}
.full-view-box {
  display: inline-block;
  width: 430px;
  margin-left: -100px;
  vertical-align: top;

  .meg-card {
    width: 75%;
    box-shadow: none;
  }
  .meg-card__img_box {
    overflow: visible;
  }
  .meg-card__img_wrapper {
    width: 133%;
  }
}
.full-view-box-card {
  display: inline-block;
  width: 431px;
  margin-left: 10px;
  vertical-align: top;

  .meg-card {
    width: 75%;
    box-shadow: none;
  }
}

.jump-box {
  position: absolute;
  right: 13px;
  top: 13px;
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
</style>

<style>
.selectOperatingArea {
  width: 100%;
  height: 400px;
}
.selectOperatingArea .sourceImgs {
  width: 66%;
  padding: 10px 25px 0px 25px;
  box-sizing: border-box;
  height: 316px;
  float: left;
}
.selectOperatingArea .confirm-photo {
  width: 34%;
  padding: 10px 25px 0px 9px;
  box-sizing: border-box;
  height: 405px;
  float: right;
}

.selectOperatingArea .faceImgCon.selected {
  border: 4px solid #4688f1;
}

.selectOperatingArea .faceImgCon {
  width: 112px;
  height: 112px;
  display: inline-block;
  cursor: pointer;
  box-sizing: border-box;
  border: 4px solid #ffffff;
  position: relative;
}
.selectOperatingArea .faceImgCon:nth-child(odd) {
  margin: 0 5px 5px 0;
}
.selectOperatingArea .bottomTag {
  position: absolute;
  bottom: 0;
  z-index: 1;
  height: 16px;
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  color: #ffffff;
  font-size: 12px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.selectOperatingArea .sourceImgList {
  height: 86px;
  align-items: flex-start;
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
}
.meg-dialog-footer .footer-btns {
  padding-right: 20px;
  text-align: right;
}
.content__main__video__left .footer .allScaled {
  display: none;
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
<style lang="scss">
.buttonList {
  text-align: left;
}
</style>
