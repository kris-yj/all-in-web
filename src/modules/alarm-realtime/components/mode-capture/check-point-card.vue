<template functional>
  <div
    class="card"
    @click="props.onClickCard(props.cardInfo)">
    <div
      class="card-content"
      :style="props.toBackgroundStyle(props.cardInfo)">
    </div>
    <div class="card-footer">
      <p>{{ props.formatDate(props.cardInfo.capturedTime) }}</p>
    </div>
  </div>
</template>
<script>
import moment from 'moment';

export default {
  name: 'CheckPointCard',
  functional: true,
  props: {
    cardInfo: {
      type: Object,
      default: () => ({
        cropUrl: '',
        captureTime: Date.now()
      })
    },
    toBackgroundStyle: {
      type: Function,
      default: (info) => ({
        backgroundImage: `url(${info.cropUrl})`
      })
    },
    onClickCard: {
      type: Function,
      default: () => {}
    },
    formatDate: {
      type: Function,
      default: (capturedTime) => moment(capturedTime).format('YYYY-MM-DD \n HH:mm:ss')

    }
  },

};
</script>
<style lang="scss" scoped>
.card {
  width: 100px;
  height: 150px;
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  margin: 2px;
  cursor: pointer;
  .card-content {
    flex: 1;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .card-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 55px;
    color: #8a97a0;
    text-align: center;
  }
}
</style>
