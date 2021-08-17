<template>
  <div
    class="property-item"
    v-show="!item.hidden">
    <div class="item-label">
      <slot name="label">
        {{ item.name }}
      </slot>
    </div>
    <div
      class="item-value">
      <!-- 颜色类型格式化 -->
      <div
        class="color-wrap"
        v-if="item.color">
        <span
          class="color-block"
          :style="{background: item.color}">
        </span>
        <span class="color-text"> {{ item.value }} </span>
      </div>
      <span
        v-tooltip="true"
        v-else>{{ item.value }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PropertyDisplayItem',
  components: {},
  props: {
    item: {
      type: Object,
      default: () => {},
    }
  }
};
</script>
<style lang="scss" scoped>
.property-item {
  font-size: 14px;
  display: flex;
  line-height: 1em;
  margin-bottom: 12px;
}
.item-label {
  min-width: 110px;
  box-sizing: border-box;
  padding-right: 12px;
  color: #869abb;
  text-align: right;
}
.item-value {
  flex: 1;
  display: flex;
  overflow: hidden;
  line-height: 14px;
}
.color-wrap {
  display: flex;
  align-items: center;
}
.color-block {
  width: 14px;
  height: 14px;
  border: 1px solid rgb(238, 238, 238);
  margin-right: 3px;
}
</style>
