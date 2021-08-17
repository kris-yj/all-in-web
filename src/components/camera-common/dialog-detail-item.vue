<template>
  <section class="detail-item">
    <div
      class="detail-item-label"
      :style="{'text-align': labelAlign,'width': labelWidth }">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div
      class="detail-item-value"
      v-tooltip="tooltip"
      :style="{'width': valueWidth}">
      <slot
        name="value">
        {{ value }}
      </slot>
    </div>
    <slot name="one"></slot>
  </section>
</template>
<script>
export default {
  props: {
    value: {
      type: [String, Number, Boolean],
      default: '',
      required: false
    },
    label: {
      type: String,
      default: ''
    },
    labelAlign: {
      type: String,
      default: 'right'
    },
    labelWidth: {
      type: String,
      default: '98px'
    },
    valueWidth: {
      type: String,
      default: '196px'
    },
    tooltip: {
      type: Boolean,
      default: true
    }
  }
};
</script>
<style lang="scss" scoped>
  .detail-item {
    font-size: 14px;
    display: flex;
    line-height: 34px;

    .detail-item-label {
      color: #869abb;
      text-align: right;
      flex-shrink: 0;
    }

    .detail-item-value {
      color: #435068;
      margin-left: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      // display: flex;
    }
  }
</style>
