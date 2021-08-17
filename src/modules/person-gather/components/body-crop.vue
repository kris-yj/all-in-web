<template>
  <meg-dialog
    class="bodyCrop"
    width="800px"
    :visible="visible"
    append-to-body
    @close="$emit('update:visible', false)"
    @confirm="confirm">
    <span slot="title">
      {{ $t('请框选图片中要分析的人身') }}
    </span>
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
  methods: {
    // 裁脸框移动时获取裁剪的有效数据
    selectFaceAction(data) {
      this.base64 = data.detail.data;
    },
    // 点击确认按钮
    confirm() {
      if (this.base64 === '') {
        this.$message.warning(this.$t('请校准要比对的图片'));
      } else {
        this.$emit('getBase64', this.base64);
        this.$emit('update:visible', false);
      }
    }
  }

};
</script>
<style lang="scss">
.bodyCrop{
    .footer-btns{
        float: none;
    }
    .meg-dialog-footer{
        text-align: center;
    }
}
</style>
