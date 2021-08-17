<template>
  <div class="property-wrap">
    <common-property-display-item
      v-for="(item, index) in info.nowProperties"
      :item="item"
      :key="index"></common-property-display-item>
  </div>
</template>

<script>
import { CommonPropertyDisplayItem } from '@/common-components/common-property-display';

export default {
  name: 'CommonPropertyDisplay',
  components: {
    CommonPropertyDisplayItem
  },
  props: {
    info: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
  }
};
</script>

<style lang='scss' scoped>
.property-wrap {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
  .plate {
    display: flex;

  }
  .property-item{
    font-size: 14px;
    display: flex;
    line-height: 1em;
    margin-bottom: 12px;
  }
  .item-label{
    min-width: 110px;
    box-sizing: border-box;
    padding-right: 12px;
    color: #869ABB;
    text-align: right;
  }
  .item-value{
    flex: 1;
    display: flex;
    overflow: hidden;
    line-height: 14px;
  }
  .color-wrap{
    display: flex;
    align-items: center;
  }
  .color-block{
    width:14px;
    height:14px;
    border: 1px solid rgb(238, 238, 238);
    margin-right: 3px;
  }
}
</style>
