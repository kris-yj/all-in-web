<template>
  <div
    class="body-card">
    <meg-card
      class="card-item"
      :img-src="cardData.body.url"
      :right-width="'124px'"
      img-margin="10px 10px">
      <div slot="right">
        <div class="card-number newFont">
          {{ parseFloat(cardData.body.score).toFixed(2) }}
        </div>
      </div>
      <div
        slot="bottom"
        class="body-card-bottom">
        <img
          class="card-img-bottom"
          :src="cardData.profile.coverPageImgUri" />
        <div
          class="body-info">
          <div v-if="cardData.profile.name">
            <div class="body-info-item">
              <meg-icon
                name="card_face"
                color="#D2D6DE"></meg-icon>
              <span>
                {{ cardData.profile.name[0] }}
              </span>
            </div>
            <div class="body-info-item">
              <meg-icon
                name="folder"
                color="#D2D6DE"></meg-icon>
              <span>
                {{ cardData.profile.albumList[0] }}
              </span>
            </div>
            <div class="body-info-item">
              <meg-icon
                name="ID"
                color="#D2D6DE"></meg-icon>
              <span>
                {{ cardData.profile.cardNo }}
              </span>
            </div>
          </div>
          <div v-else>
            <div class="body-info-item">
              <meg-icon
                name="gender_female"
                color="#D2D6DE"></meg-icon>
              <span>
                {{ gender }}
              </span>
            </div>
            <div class="body-info-item">
              <meg-icon
                name="card_face"
                color="#D2D6DE"></meg-icon>
              <span>
                {{ cardData.profile.age }}{{ $t('岁') }}
              </span>
            </div>
            <div class="body-info-item">
              <meg-icon
                name="nation"
                color="#D2D6DE"></meg-icon>
              <span>
                {{ $t('未实名') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div slot="custom">
        <slot name="custom"></slot>
      </div>
    </meg-card>
  </div>
</template>

<script>
export default {
  props: {
    cardData: {
      type: Object,
      default: () => {},
    }
  },
  data() {
    return {
    };
  },
  computed: {
    gender() {
      return (this.cardData.profile.gender && this.cardData.profile.gender === '1') ? this.$t('男性') : this.$t('女性');
    }
  },
  methods: {
  }
};
</script>
<style lang='scss' scoped>
.body-card {
  background: #FFFFFF;
  position: relative;
  &-bottom{
    box-sizing: border-box;
    height: 76px;
    padding: 8px 0 10px 8px;
    display: flex;
    background: #F5F5F5;
  }
  .card-img-top{
    display: inline-box;
    width: 124px;
    height: 124px;
    border: 1px solid #efefef;
    text-align: center;
    img {
      width: auto;
      height: 100%;
    }
  }
  .card-number{
    height: 124px;
    line-height: 124px;
    text-align: center;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    letter-spacing: 0;
    color: #21539B;
    font-family: HEMIHEAD;
  }
  .card-img-bottom{
    display: inline-block;
    width: 60px;
    height: 60px;
  }
  .body-info{
    flex: 1;
    height: 60px;
    padding-left: 9px;
    .body-info-item{
      height: 20px;
      line-height: 20px;
      font-size: 12px;
      color: #435068;
    }
  }
}
.body-card:hover{
  cursor: pointer;
}
</style>
