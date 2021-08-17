<template>
  <div
    class="record-card"
    @click.stop="$emit('selected-card', cardData)">
    <meg-card
      :animation="true"
      :img-src="cardData.coverPageImgUri"
      right-width="40%"
      left-width="138px"
      @enter="enterCard"
      @leave="leaveCard"
      class="card-item">
      <div
        class="card-info-right"
        slot="right">
        <div
          class="match-rate">
          {{ cardTypeTitle }}
        </div>
        <div
          class="card-score newFont">
          {{ score }}
        </div>
        <div
          v-if="cardData.realName"
          class="record-msg-one">
          <div class="body-info-face record-msg-item">
            <meg-icon
              name="card_face"
              color="#D2D6DE"></meg-icon>
            <span
              class="content-text"
              v-tooltip="true">
              {{ cardData.name && cardData.name[0] }}
            </span>
          </div>
          <div class="record-msg-item">
            <meg-icon
              name="folder"
              color="#D2D6DE"></meg-icon>
            <span
              class="content-text"
              v-tooltip="true">
              {{ cardData.albumList && cardData.albumList[0] }}
            </span>
          </div>
        </div>
        <div
          v-else
          class="record-msg-two">
          <div class="body-info-item record-msg-item">
            <meg-icon
              name="gender_female"
              color="#D2D6DE"></meg-icon>
            <span
              class="content-text"
              v-tooltip="true">
              {{ determineGender(cardData.gender) }}
            </span>
          </div>
          <div class="body-info-item record-msg-item">
            <meg-icon
              name="card_face"
              color="#D2D6DE"></meg-icon>
            <span
              v-tooltip="true"
              class="content-text">
              {{ cardData.age }}
            </span>
          </div>
          <div class="body-info-item record-msg-item">
            <meg-icon
              name="user"
              color="#D2D6DE"></meg-icon>
            <span
              v-tooltip="true"
              class="content-text">
              {{ cardData.minority && cardData.minority[0] }}
            </span>
          </div>
        </div>
      </div>
      <div
        slot="bottom"
        class="bottom-tip-box">
        <div class="card-tip">
          <meg-icon
            v-if="!!cardData.cardNo"
            color="#D1D5DD"
            name="ID"></meg-icon>
          {{ cardData.cardNo }}
        </div>
      </div>
      <slot
        :isShowCustom="isShowCustom"
        slot="custom"
        name="custom"></slot>
    </meg-card>
  </div>
</template>

<script>
export default {
  props: {
    cardData: {
      type: Object,
      required: true,
      default: () => {}
    },
    cardType: {
      type: String,
      default: 'record'
    }
  },
  data() {
    return {
      isShowCustom: false
    };
  },
  computed: {
    score() {
      let score = null;
      if (this.cardType === 'record') score = this.cardData.appearCount;
      else if (this.cardType === 'track') score = this.cardData.trackCount;
      else score = parseFloat(this.cardData.score).toFixed(2);
      return score;
    },
    cardTypeTitle() {
      let title = null;
      if (this.cardType === 'track') title = this.$t('匹配轨迹点');
      else if (this.cardType === 'record') title = this.$t('同行次数');
      else title = '';
      return title;
    }
  },
  methods: {
    determineGender(type) {
      return type === '1' ? this.$t('男') : this.$t('女');
    },
    enterCard(e) {
      if (e !== 'img') {
        this.isShowCustom = true;
      }
    },
    leaveCard(e) {
      if (e !== 'img') {
        this.isShowCustom = false;
      }
    },
  }
};
</script>
<style lang='scss' scoped>
.record-card{
  position: relative;
}
.card-item{
  box-sizing: border-box;
  padding: 9px 9px 0 9px;
  .card-info-right {
    padding-top: 13px;
  }
  .match-rate {
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    color: #CCCCCC;
    margin-bottom: 6px;
  }
  .card-score{
    font-size: 24px;
    color: #21539B;
    letter-spacing: 0;
    text-align: left;
    line-height: 24px;
    font-family: HEMIHEAD;
  }
  .record-msg-one{
    padding-top: 13px;
  }
  .body-info-face{
    margin-bottom: 21px;
  }
  .record-msg-two{
    padding-top: 20px;
  }
  .body-info-item{
    height: 20px;
    line-height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .card-tip{
    font-family: SourceHanSansCN-Regular;
    font-size: 12px;
    color: #435068;
  }
  .record-msg-item{
    font-family: MicrosoftYaHei;
    font-size: 12px;
    color: #435068;
    letter-spacing: 0;
    display: flex;
  }
  .content-text{
    display: inline-block;
    width: 80px;
    padding-left: 6px;
  }
}
.bottom-tip-box {
  box-sizing: border-box;
  height: 30px;
  padding-top: 7px;
}
</style>
