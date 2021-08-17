<template>
  <div class="face-info">
    <div class="capture-info">
      <meg-double-card
        class="card-item"
        width="100%"
        :single="true"
        :left-img-src="faceInfoData.coverPageImgUri">
      </meg-double-card>
      <div class="info-box">
        <div class="info-line">
          <span class="info-title">{{ $t('姓名') }}</span>
          <span class="info-content">{{ name }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t('身份证号') }}</span>
          <span class="info-content">{{ faceInfoData.cardNo }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t('底库') }}</span>
          <span class="info-content">{{ albumList }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t('抓拍数量') }}</span>
          <span class="info-content">{{ faceInfoData.faceCount }}</span>
        </div>
      </div>
      <div class="info-box">
        <div class="info-line">
          <span class="info-title">{{ $t('性别') }}</span>
          <span class="info-content">{{ isGender }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t('民族') }}</span>
          <span class="info-content">{{ minority }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t('年龄') }}</span>
          <span class="info-content">{{ faceInfoData && faceInfoData.age }}</span>
        </div>
        <div class="info-line">
          <span class="info-title">{{ $t('籍贯') }}</span>
          <span class="info-content"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    faceInfoData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
    };
  },
  computed: {
    albumList() {
      return (this.faceInfoData.albumList && Array.isArray(this.faceInfoData.albumList) && this.faceInfoData.albumList.length > 0) ? this.faceInfoData.albumList.reduce((arc, item) => `${arc}，${item}`) : '';
    },
    minority() {
      return Array.isArray(this.faceInfoData.minority) ? this.faceInfoData.minority[0] : '';
    },
    name() {
      return Array.isArray(this.faceInfoData.name) ? this.faceInfoData.name[0] : '';
    },
    isGender() {
      return this.faceInfoData && this.faceInfoData.gender === '1' ? this.$t('男性') : this.$t('女性');
    }
  },
};
</script>
<style lang='scss' scoped>
.face-info {
  min-width: 800px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  box-sizing: border-box;
  ::v-deep .meg-double-card{
    box-shadow: none;
  }
  .capture-info{
    display: flex;
  }
  .card-item{
    width: 100px;
    height: 100px;
  }
  .info-box{
    padding-left: 36px;
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
      font-family: SourceHanSansCN-Medium;
      font-size: 14px;
      color: #435068;
      text-align: left;
    }
  }
}
</style>
