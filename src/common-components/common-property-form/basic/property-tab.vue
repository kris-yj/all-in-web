<template>
  <!-- 类型切换 -->
  <div
    :class="['property__tab', {'is-horizontal': horizontal}]">
    <div
      class="property__tab-item"
      v-for="item in tabs"
      :class="{'active': item.code===value}"
      @click="$emit('change', item.code)"
      :key="item.code">
      <img :src="icons[item.id+(item.code===value?'Active':'')]" />
    </div>
  </div>
</template>

<script>
import icons from '../images/icons.js';

export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 当前项
    value: {
      type: null,
      default: 0,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      icons
    };
  },
  computed: {
    tabs() {
      const empty = [{
        code: 'ALL',
        id: 'ALL',
        name: '全部',
      }];
      return this.horizontal && this.items.length ? empty.concat(this.items) : this.items;
    }
  }
};
</script>

<style lang="scss" scoped>
.property__tab{
  background: #F7F8F9;
  &.is-horizontal{
    height: 54px;
    display: flex;
    background: unset;
    border-bottom: 1px solid rgba(210,214,222,0.5);
    margin: 0 25px;
    .property__tab-item{
      height: 38px;
      width: 48px;
      padding: 0 5px;
      border-radius: 2px;
      border: 1px solid rgba(210,214,222,0.5);
      margin-left: 8px;
      &:first-child{
        margin-left: 0;
      }
      &.active::after{
        display: block;
      }
    }
  }
}
.property__tab-item{
  height: 54px;
  width: 54px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  box-sizing: border-box;
  transition: all .2s cubic-bezier(.645,.045,.355,1);
  img{
    max-width: 100%;
    max-height: 100%;
  }
  &:hover{
    color: #21539B;
    font-weight: bold;
    background: #E6F2FF;
  }
  &::after{
    content: '';
    border: 1px solid rgba(210,214,222,0.5);
    width: 10px;
    height: 10px;
    position: absolute;
    transform: rotate(45deg);
    top: 48px;
    left: 17px;
    background: #fff;
    border-width: 1px 0 0 1px;
    display: none;
  }

}
.property__tab-item.active{
  background: #E6F2FF;
  font-weight: bold;
  color: #21539B;
}

</style>
