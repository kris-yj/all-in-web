<template>
  <meg-double-card
    class="card-box"
    width="50%"
    :left-img-src="info.leftImgSrc"
    :right-img-src="info.rightImgSrc"
    :score="info.score"
    @enter="onCardEnter"
    @leave="onCardLeave"
    @click="viewBigImage"
    @img-error="onImgError"
    :single="info.single">
    <template v-slot:left-custom>
      <jump-with-img
        v-show="jumpControl.left"
        :do-deploy="captureDeployParams"
        :append-album="captureAppendParams"
        :params="info.carParams"></jump-with-img>
    </template>
    <template v-slot:right-custom>
      <jump-with-img
        v-show="jumpControl.right"
        :do-deploy="albumDeployParams"
        :append-album="albumAppendParams"
        :params="info.albumParams"></jump-with-img>
      <img-scaled
        v-model="bigImageVisible"
        :compare-score="info.score"
        :imgs-src="img"></img-scaled>
    </template>
  </meg-double-card>
</template>

<script>
import JumpWithImg from '../../../common-jump-with-img';
import ImgScaled from '../../../common-img-scaled';

export default {
  name: 'CarBox',
  components: {
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
      jumpControl: {
        'left': false,
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
        photoUrl: this.info.leftImgSrc,
        photoType: this.info.strategyTypeId
      };
    },
    captureAppendParams() {
      return {
        appendToBody: this.appendToBody,
        imageData: {
          originType: 'capture',
          photoUrl: this.info.leftImgSrc,
          cameraName: this.info.cameraName,
          captureTime: this.info.alarmTime,
          capturePhotoId: this.info.captureId,
          type: this.info.detectType
        }

      };
    },
    albumDeployParams() {
      return {
        photoUrl: this.info.rightImgSrc,
        photoType: this.info.strategyTypeId
      };
    },
    albumAppendParams() {
      return {
        appendToBody: true,
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
  watch: {},
  created() {},
  mounted() {},
  methods: {
    onImgError(type) {
      this.jumpControl[type] = false;
    },
    onCardEnter(type) {
      if (type === 'right') {
        this.jumpControl = {
          'left': false,
          'right': true,
        };
      } else {
        this.jumpControl = {
          'left': true,
          'right': false,
        };
      }
    },
    onCardLeave() {
      this.jumpControl = {
        'left': false,
        'right': false,
      };
    },
    viewBigImage() {
      this.img = [this.info.leftImgSrc, this.info.rightImgSrc];
      this.bigImageVisible = true;
    },
  },
};
</script>
<style lang="scss" scoped>
.card-box {
  flex: 1;
}
</style>
