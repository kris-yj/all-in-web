<template>
  <div class="property-wrap">
    <div
      class="plate"
      v-if="(detectType===5||detectType===6)&&properties.license_plate_text">
      <p class="item-label">
        {{ $t('车牌号') }}
      </p>
      <common-license-plate
        can-copy
        :plate-number="properties.license_plate_text&&properties.license_plate_text.showValue"
        :plate-type="properties.license_plate_color&&properties.license_plate_color.showValue"
        :row="properties.license_plate_style&&properties.license_plate_style.showValue"
        size="small"></common-license-plate>
    </div>
    <property-display-item
      v-for="(item, index) in nowProperties"
      :item="item"
      :key="index"></property-display-item>
  </div>
</template>

<script>
import CommonLicensePlate from '@/common-components/common-license-plate';
import PropertyDisplayItem from './property-display-item';
import { getPropertyDic } from '../utils/property-setter.utils';
import { initProperties, colorValue } from '../utils/utils';

export default {
  name: 'CommonPropertyDisplay',
  components: {
    CommonLicensePlate,
    PropertyDisplayItem
  },
  props: {
    // 检测类型 0 人脸，1 人体 ，5 机动车，6 非机动车
    detectType: {
      type: Number,
      default: 0
    },
    // 需要显示的属性
    properties: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      allProperties: [],
      detectTypeMap: {},
      colorValue,
    };
  },
  computed: {
    nowProperties() {
      let items = [];
      if (this.allProperties && this.allProperties.length && this.properties) {
        items = this.detectTypeMap[this.detectType] ? this.detectTypeMap[this.detectType].data : [];
        items.forEach((item) => {
          const propertyValue = this.properties[item.attrKey];
          // 车辆品牌
          if (item.type === 6) {
            item.value = propertyValue && propertyValue.showValue;

          // 普通情况
          } else if (propertyValue && propertyValue.showValue !== undefined) {
            const subValue = item.dataMap[propertyValue.showValue];
            item.value = (subValue && subValue.name) || '未知';
            item.color = undefined;
            if (subValue !== undefined && item.extension && item.extension.color) {
              // 如果没有设置在字典中设置颜色，就用默认的
              item.color = (subValue.extension && subValue.extension.color) || colorValue[subValue.code];
            }

          // 后端未给值，显示成未知
          } else {
            item.value = '未知';
            item.color = undefined;
          }

          // 车牌号 以及需要隐藏的字段 （item.type === 0代表车牌号）
          item.hidden = (item.extension && item.extension.hidden) || item.type === 0;
        });
      }
      return items;
    }
  },
  watch: {
  },
  created() {
    getPropertyDic().then((dic) => {
      const { allProperties, detectTypeMap } = initProperties(dic);
      this.allProperties = allProperties;
      this.detectTypeMap = detectTypeMap;
    });
  },
  methods: {
  }
};
</script>

<style lang='scss' scoped>
@mixin border-angle {
  content: '';
  width: 6px;
  height: 6px;
  position: absolute;
  border-color: #869ABB;
  border-style: solid;
}
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
