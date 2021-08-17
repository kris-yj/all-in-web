<template>
  <div class="collapse-property__wrap">
    <meg-popover
      v-model="popoverVisible"
      placement="right"
      width="300"
      popper-class="collapse-property-popover">
      <property-item-wrap
        v-for="(item, index) in items"
        :class="item.formItemClass"
        :label="item.name"
        :key="index">
        <slot
          v-if="item.slot"
          :name="item.slot"
          :item="item"></slot>
        <property-item
          v-else
          :item="item">
        </property-item>
      </property-item-wrap>
      <div
        slot="reference"
        class="collapse-property__display">
        <div class="collapse-property__label-wrap">
          <label-display
            v-for="(item, index) in items"
            :key="index"
            :item="item"></label-display>
        </div>
        <select-display
          v-for="(item, index) in items"
          :key="index"
          :item="item"></select-display>
        <meg-icon
          v-show="!popoverVisible"
          class="collapse-property__arrow"
          name="arrow_right"
          width="16"
          height="16"
          color="#21539B"></meg-icon>
        <meg-icon
          v-show="popoverVisible"
          class="collapse-property__arrow check-icon"
          name="check"
          width="20"
          height="20"
          color="#21539B"></meg-icon>
      </div>
    </meg-popover>
  </div>
</template>

<script>

import PropertyItem from './property-form-item';
import PropertyItemWrap from './basic/property-item-wrap';

export default {
  components: {
    PropertyItem,
    PropertyItemWrap,
    // label 展示组件  如果有选中，需要加粗显示
    labelDisplay: {
      props: {
        item: {
          required: true,
        }
      },
      computed: {
        selected() {
          const { item } = this;
          if (item.value instanceof Array) return item.value.length > 0;
          if (item.type === 2) return item.value || item.value === '';
          return item.value || item.value === 0;
        }
      },
      render() {
        const { selected, item } = this;
        return (
            <span class={ `collapse-property__lebel ${selected ? 'selected' : ''}` }>
              { item.classifyText || item.name }
            </span>
        );
      }
    },
    // 选中的值的展示组件，为了使用 computed 属性减少计算性能，所以采用了组件内置组件的形式
    selectDisplay: {
      props: {
        item: {
          required: true,
        }
      },
      computed: {
        value() {
          const { item } = this;
          if ([3, 4, 5].indexOf(item.type) > -1) {
            const arr = [];
            item.value.forEach((val) => {
              const valItem = item.dataMap[val];
              if (valItem) arr.push(valItem.name);
            });
            return arr.join(',');
          } else if ([1, 2].indexOf(item.type) > -1) { // eslint-disable-line
            return item.dataMap[item.value] && item.dataMap[item.value].name;
          }
          return item.value;
        }
      },
      render() {
        const { value, item } = this;
        return (
            <div
              class="property__item-display"
              style={ `display: ${!value ? 'none' : ''}` }>{ item.name }: { value }</div>
        );
      }
    }
  },
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      popoverVisible: false,
    };
  },
  mounted() {
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>
  .collapse-property__display{
    position: relative;
    padding: 5px 17px;
    margin-left: 1px;
    &:hover{
      background: #F7F8F9;
    }
  }
  .collapse-property__lebel{
    margin-left: 7px;
    line-height: 34px;
    &:first-child{
      margin-left: 0;
    }
    &.selected{
      font-weight: 500;
    }
  }
  .property__item-display{
    font-size: 12px;
    line-height: 14px;
    color: #435068;
    opacity: 0.6;
    margin-bottom: 4px;
    word-break: break-all;
  }
  .collapse-property__arrow{
    position: absolute;
    right: 26px;
    top: 14px;
    z-index: 1;
    &.check-icon{
      top: 12px;
    }
  }
</style>

<style>
  .collapse-property-popover{
    padding: 0;
    padding-bottom: 10px;
  }
</style>
