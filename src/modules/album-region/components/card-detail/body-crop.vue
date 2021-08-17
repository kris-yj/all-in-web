<template>
  <meg-dialog
    class="bodyCrop"
    width="800px"
    :visible="visible"
    append-to-body
    :show-cancel="false"
    @close="$emit('update:visible', false)"
    @confirm="confirm"
    :confirm-text="confirmText"
    body-height="409px">
    <span slot="title">
      {{ $t('请框选图片中要分析的人身') }}
    </span>
    <div
      class="body-crop-body"
      slot="dialog-body">
      <meg-cropper
        ref="cropper"
        class="aaa"
        :view-mode="2"
        :img-style="imgStyle"
        :could-select-face="true"
        :selectface="selectFaceAction"
        :auto-crop="true"
        :drag-mode="'crop'"
        :toggle-drag-mode-on-dblclick="false"
        :zoomable="true"
        :center="false"
        :tolerance-scope="0"
        :highlight="false"
        :guides="false">
      </meg-cropper>
      <span class="body-crop-tip"> {{ $t('请截取带有人脸的人体框') }} </span>
    </div>
  </meg-dialog>
</template>
<script>
import { utils } from '@/utils/utils';

export default {
  props: {
    imgUrl: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    confirmText: {
      type: String,
      default: '抓拍检索'
    }
  },
  data() {
    return {
      img: '',
      imgStyle: {
        margin: 'auto',
        height: '409px'
      },
      base64: ''
    };
  },
  watch: {
    imgUrl() {
      utils.urlToBase64(this.imgUrl).then((res) => {
        this.img = res;
        if (this.$refs.cropper) {
          this.$refs.cropper.replace(res);
        }
      });
    }
  },
  mounted() {

  },
  methods: {
    // 裁脸框移动时获取裁剪的有效数据
    selectFaceAction(data) {
      this.base64 = data.detail.data;
    },
    // 点击确认按钮
    confirm() {
      if (this.base64 === '') {
        this.base64 = this.$refs.cropper.getCroppedCanvas().toDataURL('image/jpeg');
      }
      this.$emit('getBase64', this.base64);
      this.base64 = '';
      this.$emit('update:visible', false);
    }
  }

};
</script>
<style lang="scss">
.bodyCrop{
  .body-crop-body{
    height: 411px;
    text-align: center
  }
  .aaa{
    height: 411px;
  }
  .body-crop-tip{
    display: inline-block;
    margin-top: 26px;
    font-weight: bold;
    font-size: 16px;
    color: #435068;
  }
  .meg-dialog-footer{
      text-align: center;
  }
}
</style>
