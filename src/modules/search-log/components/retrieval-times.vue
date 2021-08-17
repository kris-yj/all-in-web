<template>
  <div
    class="retrievalTimes"
    @click="$emit('click')">
    <span>{{ showName }}{{ $t('检索次数') }}</span>
    <!-- <meg-icon
      name="arrow_hollow"
      width="10"
      height="7"
      :class="{actived: ishow}"
      color="#21539b"> -->
    <!-- </meg-icon> -->
    <div
      class="markData"
      v-if="ishow">
      <meg-icon
        name="arrow_solid"
        class="sanjiao"
        width="10"
        height="10"
        color="#fff">
      </meg-icon>
      <meg-scrollbar
        ref="scrollbar">
        <meg-table
          size="mini"
          :data="data"
          style="width:100%;">
          <meg-table-column
            :prop="name"
            :label="showName"
            align="left">
          </meg-table-column>
          <meg-table-column
            prop="countNum"
            :label="$t('检索次数')"
            align="center">
          </meg-table-column>
        </meg-table>
      </meg-scrollbar>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    ishow: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default: () => [],
    },
    name: {
      type: String,
      default: 'userName'
    },
  },
  data() {
    return {
    };
  },
  computed: {
    showName() {
      return this.name === 'userName' ? this.$t('用户') : this.$t('部门');
    },
  },
};
</script>
<style lang="scss" scoped>
.retrievalTimes{
  width: 120px;
  line-height: 35px;
  position: relative;
  border: 1px solid #d3ddeb;
  background: #fff;
  text-align: center;
  cursor: pointer;
  margin-right: 9px;
  span{
    font-size: 14px;
    color: #21539b;
    // margin-right: 9px;
  }
  .actived{
    transform: rotate(180deg);
  }
  .markData{
    width: 265px;
    height: 221px;
    background: #fff;
    position: absolute;
    top: 50px;
    right: 16px;
    // overflow: hidden;
    box-shadow: 0 0 10px rgba(0,0,0,.4);
    z-index: 10;
    .sanjiao{
      transform: rotate(-90deg);
      position: absolute;
      z-index: 11;
      right: 30px;
      top: -8px;
    }
  }
}
</style>
<style lang="scss" scoped>
.i18n-en-US {
  .retrievalTimes{
    width: auto;
    padding: 0 8px;
  }
}
</style>
