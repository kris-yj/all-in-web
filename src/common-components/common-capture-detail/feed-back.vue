<template>
  <meg-tooltip
    placement="left"
    effect="light">
    <div slot="content">
      {{ $t('点击发送错误反馈') }}<br />{{ $t('让您的系统更智能') }}
    </div>
    <div
      class="feed-back"
      @click="feedBack">
      <meg-icon
        width="12px"
        height="12px"
        name="tap"></meg-icon>
      {{ $t('信息有误') }}
    </div>
  </meg-tooltip>
</template>

<script>
import CaptureDetailSrv from './capture-detail.service';

export default {
  components: {

  },
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {

    };
  },
  methods: {
    feedBack() {
      console.log(this.info);
      const {
        cropUri = '', relatedCropUri = '', searchPhotoUri = '', fullUri = '', properties, capturedTime, score = ''
      } = this.info;
      const params = {
        module: this.$route.meta.moduleResource.alias,
        cropUri,
        fullUri,
        searchPhotoUri,
        relatedCropUri,
        properties,
        capturedTime,
        showScore: score
      };
      if (this.info.sourceType === 'OFFLINE') {
        params.fileName = this.info.fileName;
      } else {
        params.cameraId = this.info.cameraId;
        params.cameraName = this.info.cameraName;
        params.placeName = this.info.placeName;
        params.cameraType = this.info.cameraTypeName;
      }
      CaptureDetailSrv.feedBack(params).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('反馈成功，感谢您的使用')
          });
        }
      });
    }
  },
};
</script>

<style lang='scss' scoped>
.feed-back {
  padding: 7px;
  width: 12px;
  right: -30px;
  bottom: 136px;
  position: absolute;
  background: #E6F2FF;
  box-shadow: 3px 3px 6px 0 rgba(0,0,0,0.10);
  border-radius: 2px;
  font-size: 12px;
  color: #21539B;
  cursor: pointer;
  .meg-icon {
    margin-bottom: 2px;
  }
}
</style>
