<template>
  <div class="full-img-container">
    <div> <span class="photo-title">{{ $t("全景图") }}</span></div>
    <div class="full-img">
      <meg-card
        :img-src="imageSrc"
        img-margin="0"
        img-border="none"
        :show-angle="true"
        mark-shape="rect"
        mark-border="2px solid #4688f1"
        :enlarge="false"
        :mark-coordinate="item.rect||{}"
        @enter="cardEnter"
        @leave="cardLeave"
        @click="fullImgScreenDialogShow($event)">
        <div slot="img-custom">
          <!-- 携图跳转 -->
          <common-jump-with-img
            v-if="item.showJumpList&&!item.disable&&!imgLoading"
            v-show="jumpFlag==='img'"
            :params="jumpOpt"
            :append-album="appendAlbum"></common-jump-with-img>
        </div>
      </meg-card>
    </div>
    <div
      class="bottom-box scroll-area">
      <p v-if="item.placeName">
        <span class="info-title">{{ $t("区域") }}</span>
        <span class="info-content">{{ item.placeName }}</span>
      </p>
      <p v-if="item.unitName">
        <span class="info-title">{{ $t("单位") }}</span>
        <span class="info-content">{{ item.unitName }}</span>
      </p>
    </div>
  </div>
</template>

<script>
import CommonJumpWithImg from '@/common-components/common-jump-with-img';
import loadingFullImg from './images/full-image-loading.gif';

export default {
  components: {
    CommonJumpWithImg
  },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    shouldRemoteFullImage: {
      type: Function,
      default: () => {}
    },
    fetchRemoteFullImage: {
      type: Function,
      default: () => {}
    },
  },
  data() {
    return {
      jumpFlag: '',
      imageSrc: loadingFullImg,
      imgLoading: false
    };
  },
  computed: {
    jumpOpt() {
      return {
        genre: 3,
        source: 1,
        photo: this.imageSrc,
        capturedTime: this.item.time,
        address: this.item.address,
        cameraId: this.item.cameraId,
        originType: 'upload'
      };
    },
    appendAlbum() {
      return {
        imageData: {
          originType: this.jumpOpt.originType,
          photoUrl: this.jumpOpt.photo,
        }
      };
    }
  },
  watch: {
    'item.imgUrl': {
      handler(val) {
        this.imageSrc = loadingFullImg;
        this.imgLoading = true;
        if (this.shouldRemoteFullImage(val) || this.item.cascadeNodeRegId) {
        // this.$set(this.imageSrc, loadingFullImg);
          const params = {
            id: this.item.id,
            fullUri: val
          };
          if (this.item.cascadeNodeRegId) {
            params.cascadeNodeRegId = this.item.cascadeNodeRegId;
            params.searchId = this.item.searchId;
          }
          this.fetchRemoteFullImage(params).then((url) => {
            this.imageSrc = url;
            this.imgLoading = false;
          // this.$set(this.imageSrc, url);
          });
        } else {
          this.imageSrc = val;
          this.imgLoading = false;
        // this.$set(this.imageSrc, val);
        }
      },
      immediate: true
    }
  },
  methods: {
    fullImgScreenDialogShow(e) {
      if (this.item.disable || e !== 'img' || !this.imageSrc) { return; }
      const data = {
        src: [this.imageSrc],
      };
      this.$emit('show-img-scaled', data);
    },
    cardEnter(event) {
      if (event !== 'img') return;
      this.jumpFlag = 'img';
    },
    cardLeave() {
      this.jumpFlag = '';
    }
  },
};
</script>

<style lang='scss' scoped>
.full-img-container {
  width: 332px;
  margin-right: 18px;
  vertical-align: top;
  .full-img {
    width: 248px;
    .meg-card {
      margin: 0;
      box-shadow: none;
    }
    ::v-deep .meg-card__img-wrapper {
      width: 134%;
    }
    ::v-deep .meg-card__img{
      overflow: hidden;
    }
    ::v-deep .meg-img-container__mark{
      transform: translateX(-2px) translateY(-2px);
    }
  }
  .bottom-box {
    height: 133px;
    margin: 22px 0;
  }
  .info-title {
    padding-right: 10px;
    font-size: 14px;
    color: #869abb;
  }
  .info-content {
    font-size: 14px;
    color: #435068;
  }
  .photo-title {
    display: inline-block;
    margin-bottom: 10px;
    width: 49%;
    font-size: 14px;
    color: #869abb;
  }
}
</style>
