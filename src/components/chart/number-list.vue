<template>
  <div class="info-list">
    <div
      class="info"
      :key="index"
      v-for="(item, index) in options">
      <div class="info-label">
        <span>{{ item.label }}</span>
        <meg-icon
          color="#C7CED8"
          :name="item.icon"></meg-icon>
      </div>
      <div class="info-value">
        {{ formatNumber(data[item.key]) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

    };
  },
  methods: {
    formatNumber(number = 0) {
      return number.toString().replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,');
    },
  }
};
</script>

<style lang='scss' scoped>
  .info-list {
    display: flex;
    height: 72px;
    padding-bottom: 10px;
    .info {
      flex: 1;
      background: #fff;
      margin-left: 10px;
      &:first-child {
        margin-left: 0;
      }
      .info-label {
        padding : 15px 12px 8px 12px;
        color: #435068;
        display: flex;
        justify-content: space-between;
      }
      .info-value {
        font-size: 24px;
        font-family: 'HEMIHEAD';
        padding-left: 13px;
        color: #21539B;
      }
    }
  }
</style>
