<template>
  <div class="detail-album-info">
    <div class="detail-album-info-header">
      <span class="photo-title">{{ $t('底库详情') }}</span>
    </div>
    <div class="detail-album-info-body">
      <div class="info-line">
        <span class="info-title">{{ $t('姓名') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.name }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('在逃编号') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.criminalNumber }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('证件类型') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.idCardType }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('证件号码') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.idCardNo }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('底库') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.albumName }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('民族') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.nation }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('性别') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.gender }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('出生日期') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.birthDay }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('籍贯') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.origin }}</span>
      </div>
      <div class="info-line">
        <span class="info-title">{{ $t('备注') }}</span>
        <span
          class="info-content"
          v-tooltip="true">{{ list.cmnt }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'AlbumInfo',
  props: {
    list: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      genderDic: {},
      nationDic: {}
    };
  },
  created() {
    const { dataMap } = this.$store.getters;
    this.genderDic = dataMap.common_gender;
    this.nationDic = dataMap.common_people;
  },
  methods: {
    /**
     * 字典表映射
     */
    dicMap(arr, code) {
      if (code) {
        let target = '';
        arr.forEach((obj) => {
          if (obj.code === code.toString()) {
            target = obj.value;
          }
        });
        return target;
      }
      return '';
    },
    /**
     * 比分处理，保留两位小数
     */
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
    copySuccess() {
      this.$message.success(this.$t('复制成功'));
    },
    copyError() {
      this.$message.error(this.$t('复制失败'));
    }
  }
};
</script>

<style lang="scss" scoped>
.detail-album-info{
  position: relative;
  width:100%;
  height: 100%;
  background-color: #f2f2f2;
  box-sizing: border-box;
  .detail-album-info-header{
    padding: 12px 8px 0px 30px;
    border-bottom: 1px solid #ddd;
  }
  .detail-album-info-body{
    padding: 0 8px 0 30px;
  }
  .photo-title{
    display: inline-block;
    margin-bottom: 10px;
    font-size: 14px;
    color: #869abb;
  }
  .info-line{
    height: 30px;
    line-height: 30px;
    .info-title{
      width: 58px;
      text-align: right;
      color: #869abb;
      margin-right: 5px;
      display: inline-block;
      vertical-align: top;
    }
    .info-content{
      display: inline-block;
      max-width: 180px;
    }
  }
}
</style>
<style lang="scss" scoped>
.i18n-en-US {
  .detail-album-info .info-line .info-title{
    width: 78px;
  }
}
</style>
