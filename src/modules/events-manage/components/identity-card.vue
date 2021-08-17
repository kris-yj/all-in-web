<template>
  <div class="card-item__wrapper">
    <meg-card
      v-show="card"
      class="card-item__content"
      :img-src="card.photoUrl">
      <div slot="right">
        <div
          class="card-item__score"
          v-show="card.score">
          <p>
            {{ card.score | fixedScore }}
          </p>
        </div>
        <div class="card-item__time">
          <meg-icon
            name="card_face"
            class="time-icon"></meg-icon>
          <div class="time-block">
            <p v-tooltip="true">
              {{ card.name }}
            </p>
          </div>
        </div>
        <div class="card-item__status">
          <meg-icon
            name="database"
            class="status-icon">
          </meg-icon>
          <em v-tooltip="true">{{ card.albumName }}</em>
        </div>
      </div>
      <div slot="bottom">
        <div class="card-item__address">
          <meg-icon
            class="address-icon"
            name="identity_card"></meg-icon>
          <em v-tooltip="true">{{ card.idCard || card.identityId }}</em>
        </div>
      </div>
    </meg-card>
  </div>
</template>
<script>

export default {
  name: 'CardItem',
  filters: {
    // 比分处理，保留两位小数
    fixedScore(param) {
      return typeof param === 'number' ? param.toFixed(2) : parseFloat(param).toFixed(2);
    },
  },
  props: {
    card: {
      type: Object,
      default: () => null
    },
    outShowClueType: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    isShowClueType() {
      return this.card && Object.prototype.hasOwnProperty.call(this.card, 'clueType');
    },
    clueType() {
      return this.card.clueType;
    },
  },
};
</script>
<style lang="scss" scoped>
em, i{
  font-style: normal;
  display: block;
}
.card-item__wrapper {
  .card-item__content{
    padding: 10px;
    box-sizing: border-box;
    ::v-deep .meg-card__img-layer {
      width: 124px;
      margin: 0 !important;
      flex: none;
     ::v-deep.meg-card__img{
        width: 124px;
        height: 124px;
      }
    }
    ::v-deep.meg-card__right-wrapper {
      width: auto !important;
      margin-left: 10px;
    }
  }
  .card-item__content {
    .card-item__score {
      >p {
        font-family: HEMIHEAD;
        font-size: 24px;
        line-height: 16px;
        color: #21539B;
        padding-top: 13px;
      }
    }
    .card-item__time {
      display: flex;
      margin-top: 20px;
      .time-icon {
        width: 12px;
        height: 12px;
        color: #D1D5DD;
        position: relative;
        top: 3px;
      }
      .time-block {
        max-width: 130px;
        margin-left: 6px;
        text-align: left;
        >p {
          font-size: 12px;
          line-height: 1.5;
          color: #435068;
        }
      }
    }
    .card-item__status {
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
      margin-top: 20px;
      .status-icon {
        width: 12px;
        height: 12px;
        color: #D1D5DD;
      }
      >em {
        max-width: 130px;
        display: inline-block;
        font-size: 12px;
        color: #435068;
        padding-left: 6px;
        line-height: 12px;
      }
    }
    .card-item__address {
      display: flex;
      justify-content: flex-start;
      align-content: center;
      align-items: center;
      margin-top: 6px;
      height: 12px;
      .address-icon {
        width: 12px;
        height: 12px;
        color: #D1D5DD;
      }
      >em {
        font-size: 12px;
        color: #435068;
        padding-left: 6px;
        display: block;
        margin-top: 1px;
      }
    }
  }
}
</style>
