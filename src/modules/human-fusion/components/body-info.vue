<template>
  <div class="body-info">
    <div class="contrast-info">
      <meg-double-card
        width="50%"
        class="double-card-item"
        :left-img-src="updatePhoto"
        :right-img-src="bodyInfoData.bodyUrl"
        @click="viewImg"
        :score="bodyInfoData.bodyScore">
        <div
          class="card-header"
          slot="header">
          <span class="info-tip">{{ $t("上传图") }}</span>
          <span class="info-tip">{{ $t("抓拍图") }}</span>
        </div>
      </meg-double-card>
      <div class="info-box">
        <div class="info-line">
          <span class="info-title">{{ $t("抓拍时间") }}</span>
          <span class="info-content">{{ parseFloat(bodyInfoData.bodyCapturedTime) | formatTime('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t("相机类型") }}</span>
          <span class="info-content">{{ cameraType }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t("相机") }}</span>
          <span class="info-content">{{ bodyInfoData.bodyCameraName }}</span>
        </div>
      </div>
    </div>
    <div class="capture-info">
      <meg-double-card
        class="card-item"
        width="100%"
        :single="true"
        :left-img-src="bodyInfoData.profileCoverPageImgUri"
        @click="jumpToRecord">
        <div
          class="card-header"
          slot="header">
          <span class="info-tip">{{ $t("抓拍图比对信息") }}</span>
        </div>
      </meg-double-card>
      <div class="info-box">
        <div class="info-line">
          <span class="info-title">{{ $t("姓名") }}</span>
          <span class="info-content">{{ bodyInfoData.profileName }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t("身份证号") }}</span>
          <span class="info-content">{{ bodyInfoData.profileCardNo }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t("底库") }}</span>
          <span class="info-content">{{ bodyInfoData.profileAlbum }}</span>
        </div>
      </div>
    </div>
    <common-img-scaled
      v-model="fullImgScreen"
      :imgs-src="[updatePhoto, bodyInfoData.bodyUrl]"
      @close="close"
      :compare-score="bodyInfoData.bodyScore"></common-img-scaled>
  </div>
</template>

<script>
import { switchToModule } from '@/utils/utils';
import CommonImgScaled from '@/common-components/common-img-scaled';

export default {
  components: {
    CommonImgScaled
  },
  props: {
    bodyInfoData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      fullImgScreen: false,
    };
  },
  computed: {
    cameraType() {
      const typeCode = this.bodyInfoData.bodyCameraType;
      const cameraType = this.cameraTypeCode.filter((item) => parseFloat(item.code) === parseFloat(typeCode));
      return (cameraType[0] && cameraType[0].value) || '';
    },
    updatePhoto() {
      return sessionStorage.getItem('humanPhoto');
    },
  },
  created() {
    this.cameraTypeCode = this.$store.getters.dataMapByType('camera_type');
  },
  methods: {
    viewImg() {
      this.fullImgScreen = true;
    },
    jumpToRecord() {
      const query = {
        id: this.bodyInfoData.profileId,
      };
      switchToModule({
        module: 'document',
        child: 'document-detail',
        query,
        isBlank: true
      });
    },
    close() {
      this.fullImgScreen = false;
    }
  }
};
</script>
<style lang='scss' scoped>
.body-info {
  min-width: 800px;
  display: flex;
  height: 100%;
  box-sizing: border-box;
  ::v-deep .meg-double-card{
    box-shadow: none;
  }
  ::v-deep .imgScaled{
    z-index: 9999;
  }
  .contrast-info{
    display: flex;
    margin-right: 64px;
  }
  .capture-info{
    display: flex;
  }
  .double-card-item {
    width: 200px;
    height: 100px;
  }
  .card-item{
    width: 100px;
    height: 100px;
  }
  .card-header{
    display: flex;
    padding-bottom: 6px;
    .info-tip {
      font-family: SourceHanSansCN-Regular;
      color: #869ABB;
      font-size: 12px;
      flex: 1;
    }
  }
  .info-box {
    padding-top: 18px;
    padding-left: 15px;
  }
  .info-line{
    height: 26px;
    line-height: 26px;
    .info-title {
      display: inline-block;
      width: 56px;
      text-align: right;
      font-family: SourceHanSansCN-Regular;
      color: #869ABB;
      font-size: 14px;
      margin-right: 12px;
    }
    .info-content {
      font-size: 14px;
      color: #435068;
      text-align: left;
    }
  }
}
</style>
