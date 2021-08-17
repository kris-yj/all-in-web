<template>
  <div class="identity-detail-album-info">
    <div class="block-title">
      {{ $t("底库详情") }}
    </div>
    <div class="info-container">
      <p>
        <label> {{ $t("姓名") }}</label>
        <span v-tooltip="true">{{ albumInfo.name }}</span>
      </p>
      <p>
        <label> {{ $t("在逃编号") }}</label>
        <span v-tooltip="true">{{ albumInfo.criminalNumber }}</span>
      </p>
      <p>
        <label>{{ $t("证件类型") }}</label>
        <span>{{ identityTypes[albumInfo.cardType] || identityTypes[albumInfo.identityType] }}</span>
      </p>
      <p>
        <label>{{ $t("证件号码") }}</label>
        <span
          class="span-before-btn"
          v-tooltip="true">{{ albumInfo.idCard || albumInfo.identityId || albumInfo.cardNo }}</span>
        <span
          v-if="albumInfo.idCard"
          class="icon-tip-cancel-right-blue"
          @click="onClickCopy(albumInfo.idCard)">{{ $t("复制") }}</span>
      </p>
      <p class="icon-tip-cancel-box">
        <label>{{ $t("底库") }}</label>
        <span
          class="span-before-btn"
          v-tooltip="true">{{ albumInfo.albumName }}</span>
      </p>
      <p>
        <label>{{ $t("民族") }}</label>
        <span>{{ nationTypes[albumInfo.nation] }}</span>
      </p>
      <p>
        <label>{{ $t("性别") }}</label>
        <span>{{ genderTypes[albumInfo.gender] }}</span>
      </p>
      <p>
        <label>{{ $t("出生日期") }}</label>
        <span>{{ albumInfo.birthday }}</span>
      </p>
      <p>
        <label>  {{ $t("籍贯") }}</label>
        <span>{{ addrTypes[albumInfo.address] }}</span>
      </p>
      <p>
        <label> {{ $t("备注") }}</label>
        <span
          v-tooltip="true"
          class="inline-block">{{ albumInfo.remark }}</span>
      </p>
    </div>
  </div>
</template>
<script>

export default {
  name: 'CaptureAlbumInfo',
  props: {
    albumInfo: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      // 证件类型
      identityTypes: {},
      // 民族
      nationTypes: {},
      // 性别
      genderTypes: {},
      // 籍贯
      addrTypes: {},
    };
  },
  created() {
    this.initDataMap();
  },
  methods: {
    onClickCopy(val) {
      this.$clipboard(val).then(() => {
        this.$message({
          type: 'success',
          message: this.$t('复制成功')
        });
      }, () => {
        this.$message({
          type: 'error',
          message: this.$t('复制失败')
        });
      });
    },
    /**
     * @description: 加载字典
     * @param {type}
     * @return
     */
    initDataMap() {
      // 从字典表获取民族
      const commonPeople = this.$store.getters.dataMapByType('common_people');
      commonPeople.forEach((item) => {
        this.nationTypes[item.code] = item.value;
      });
      // 从字典表获取证件类型
      const albumCard = this.$store.getters.dataMapByType('album_card');
      albumCard.forEach((item) => {
        this.identityTypes[item.code] = item.value;
      });
      // 从字典表获取性别类型
      const commonGender = this.$store.getters.dataMapByType('common_gender');
      commonGender.forEach((item) => {
        this.genderTypes[item.code] = item.value;
      });
      // 从字典表获取籍贯列表
      const commonOrigin = this.$store.getters.dataMapByType('common_origin');
      commonOrigin.forEach((item) => {
        this.addrTypes[item.code] = item.value;
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.identity-detail-album-info {
  height: 100%;
  width: 300px;
  margin-right: 36px;
  background: #F9F9F9;
  .block-title{
    padding-left: 30px;
    display: inline-block;
    margin: 20px 0 8px;
    font-size: 14px;
    color: #869abb;
  }
  .info-container {
    border-top: 1px solid #DCE1E5;
  }
  .icon-tip-cancel-box{
    display: flex;
    align-items: center;
  }
  .icon-tip-cancel-right-blue{
    width: 30px;
    margin: 0 30px 0 10px;
    flex:none !important;
    color:#21539b;
    cursor: pointer;
  }
  span {
    flex: 1;
  }
  p {
    line-height: 30px;
    font-size: 14px;
    display: flex;
    label {
      width: 86px;
      text-align: right;
      color: #869abb;
      margin-right: 12px;
      display: inline-block;
    }
    span {
      color: #435068;
      display: inline-block;
      vertical-align: middle;
    }
    .span-before-btn {
      display: inline-block;
      width: 162px;
    }
    .span-before-btn-tip {
      margin-right: 0px;
    }
  }
  .inline-block {
    display: inline-block;
  }
}

</style>
