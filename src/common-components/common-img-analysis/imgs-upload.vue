<template>
  <div
    class="img-upload"
    ref="upload"
    @mousemove="textUp = true"
    @mouseout="textUp = false">
    <meg-img-select
      file-type="base64"
      :limit="1"
      :multiple="false"
      :max-size="maxSize"
      :accept-img-type="acceptImgType"
      @file-changed="onFileChanged"
      @invalidate="onInvalidate">
      <template>
        <slot :showIcon="textUp"></slot>
        <div
          class="upload-prompt-text"
          :style="bottomStyle">
          {{ uploadPromptText || $t('拖拽或点击上传图像') }}
        </div>
      </template>
    </meg-img-select>
    <div
      v-if="shieldUpload"
      @click.stop="$emit('upload-click')"
      class="draw-cover"></div>
    <div
      v-if="fromHistory"
      :style="uploadStyle"
      class="select-record"
      @click.stop="bottomPromptClick">
      {{ bottomPromptText || $t('从上传记录选择') }}
    </div>
  </div>
</template>

<script>
// import emptyBg from './images/body-bg.png';

export default {
  name: 'MegImgsUpload',
  components: {

  },
  props: {
    multipleList: {
      type: Boolean,
      default: false
    },
    fromHistory: {
      type: Boolean,
      default: true
    },
    bottomHeight: {
      type: String,
      default: '45px'
    },
    fontSize: {
      type: String,
      default: '16px'
    },
    bottomPromptText: {
      type: String,
      default: '从上传记录选择'
    },
    uploadPromptText: {
      type: String,
      default: '拖拽或点击上传图像'
    },
    acceptImgType: {
      type: Array,
      default() {
        return ['image/png', 'image/bmp', 'image/jpg', 'image/jpeg'];
      }
    },
    shieldUpload: { // 屏蔽上传
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      textUp: false
    };
  },
  computed: {
    maxSize() {
      return Number(this.$store.getters.systemByType('albumImportMaxSize').value);
    },
    uploadStyle() {
      return `lineHeight:${this.bottomHeight};height:${this.textUp ? this.bottomHeight : '0px'};font-size:${this.fontSize}`;
    },
    bottomStyle() {
      return `lineHeight:${this.bottomHeight};height:${this.bottomHeight};font-size:${this.fontSize}`;
    },
  },
  watch: {
  },
  mounted() {

  },
  destroyed() {

  },
  methods: {
    // 文件上传
    onFileChanged(files) {
      if (files.length) {
        this.$emit('get-file', {
          'photo': files[0],
          'goAnalyze': true,
        });
      }
    },
    // meg-select自带验证图片钩子函数
    onInvalidate(reason) {
      if (reason === 'size') {
        this.$message.error(`${this.$t('上传图片大小不能超过')} ${this.maxSize}MB!`);
      } else if (reason === 'type') {
        this.$message.error(this.$t('请上传符合格式要求的图片!'));
      }
    },
    bottomPromptClick() {
      this.$emit('bottom-click');
    },
  },
};
</script>

<style lang='scss' scoped>
.img-upload {
  height: 100%;
  border-radius: 0;
  flex: 1;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  position: relative;
  box-sizing: border-box;
  .draw-cover {
    width:100%;
    height: 100%;
    position: absolute;
    top: 0;
    z-index: 7;
  }
  .meg-img-select {
    width: 100%;
    height: 100%;
    border: none;
  }
  .upload-prompt-text {
    position: absolute;
    bottom: 0;
    width: 100%;
    color: #869abb;
    text-align: center;
    z-index: 1;
  }
  .select-record {
    background-color: #21539b;
    text-align: center;
    height: 0px;
    line-height: 45px;
    overflow: hidden;
    cursor: pointer;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 100%;
    transition: height 0.5s;
    z-index: 9;
    font-size: 14px;
    color: #ffffff;
    font-weight: bold;
  }
}
.img-upload:hover {
  border-color: #21539b;
}
</style>
