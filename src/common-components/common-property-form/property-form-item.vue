<template>
  <div
    class="item__input-wrap"
    v-if="item.type === 0">
    <meg-input
      v-model="item.value"
      clearable></meg-input>
    <span
      class="tips"
      v-if="showPlateText && item.attrKey === 'license_plate_text'">
      <meg-popover
        placement="right"
        trigger="hover"
        content="模糊检索可用'*'替代任意位数，'?'替代一位(如京*45, 京A?34?5)">
        <meg-icon
          slot="reference"
          :name="'infomation'"
          color="#B4B9C3"></meg-icon>
      </meg-popover>
    </span>
  </div>

  <meg-select
    v-else-if="item.type === 2 || item.type === 3"
    v-model="item.value"
    placeholder="全部"
    clearable
    background
    collapse-tags
    :multiple="item.type === 3">
    <meg-option
      v-for="optionItem in item.data"
      :key="optionItem.code"
      :label="optionItem.name"
      :value="optionItem.code">
      <!-- 颜色类型格式化 -->
      <div
        class="item__color-wrap"
        v-if="isColor">
        <span
          class="color-block"
          :style="{background: (optionItem.extension && optionItem.extension.color) || colorValue[optionItem.code]}">
        </span>
        <span class="color-text"> {{ optionItem.name }} </span>
      </div>
      <span v-else>{{ optionItem.name }}</span>
    </meg-option>
  </meg-select>
  <div
    class="item__radio-wrap"
    v-else-if="item.type === 1">
    <meg-radio
      v-for="optionItem in item.data"
      v-model="item.value"
      :label="optionItem.code"
      :key="optionItem.code">
      {{ optionItem.name }}
    </meg-radio>
  </div>
  <brand-selecter
    v-else-if="item.type === 6"
    v-model="item.value"></brand-selecter>
  <div v-else>
    还未定义此输入控件
  </div>
</template>

<script>
import BrandSelecter from '../common-brand-selecter/index.js';
import { colorValue } from '../utils/utils.js';

export default {
  components: {
    BrandSelecter
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    // 是否显示车牌提示
    showPlateText: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      colorValue
    };
  },
  computed: {
    isColor() {
      let color = false;
      if (this.item.extension && this.item.extension.color) {
        color = true;
      }
      return color;
    }
  }

};
</script>

<style lang="scss" scoped>
.item__input-wrap {
  position: relative;
  .tips {
    position: absolute;
    line-height: 14px;
    right: 3px;
    top: -18px;
  }
}
.item__color-wrap {
  display: flex;
  align-items: center;
  .color-block {
    width: 14px;
    height: 14px;
    border: 1px solid rgb(238, 238, 238);
    margin-right: 3px;
  }
}
.item__radio-wrap {
  display: flex;
  align-items: center;
  height: 100%;
}
.meg-select {
  width: 100%;
}
</style>
