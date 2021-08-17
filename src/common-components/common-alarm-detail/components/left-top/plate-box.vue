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
    <template
      v-slot:left-custom>
      <jump-with-img
        class="plate-box-1111111"
        v-show="jumpControl.left"
        :do-deploy="captureDeployParams"
        :append-album="captureAppendParams"
        :params="info.plateParams"></jump-with-img>
      <img-scaled
        v-model="bigImageVisible"
        :is-all-scaled-show="false"
        :is-single-scaled-show="false"
        :imgs-src="img"></img-scaled>
    </template>
    <template
      v-if="info.rightCustom"
      v-slot:right-custom>
      <right-custom :info="info.rightCustom"></right-custom>
    </template>
  </meg-double-card>
</template>

<script>
import RightCustom from './right-custom';
import JumpWithImg from '../../../common-jump-with-img';
import ImgScaled from '../../../common-img-scaled';

export default {
  name: 'PlateBox',
  components: {
    RightCustom,
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
      jumpControl: {
        'left': false,
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
        photoType: this.info.strategyTypeId === '5' ? 3 : 4,
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
        };
      } else {
        this.jumpControl = {
          'left': true,
        };
      }
    },
    onCardLeave() {
      this.jumpControl = {
        'left': false,
      };
    },
    viewBigImage(type) {
      if (type === 'left') {
        this.img = [this.info.leftImgSrc];
        this.bigImageVisible = true;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.card-box {
  flex: 1;
  cursor: auto;
}
</style>
