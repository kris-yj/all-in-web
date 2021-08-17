<template>
  <div class="property__wrap">
    <div class="property__left-content">
      <!-- 类型切换 -->
      <property-tab
        v-model="nowType"
        :items="allProperties"></property-tab>
      <div class="property__tab-content">
        <meg-checkbox-group
          v-model="selectedPropertyKeys"
          @change="propertyChange">
          <meg-checkbox
            v-for="(item, index) in subProperties"
            :key="index"
            :label="`${item.attrKey}_${item.parentInfo.code}`"
            @change="propertyItemChange($event, item)">
            {{ item.name }}
          </meg-checkbox>
        </meg-checkbox-group>
      </div>
    </div>
    <div class="property__right-content">
      <template
        v-for="(item, index) in selectedProperties">
        <div
          class="property__item-title"
          v-if="item.showTitle"
          :key="item.attrKey+index">
          <span>{{ item.parentInfo.name }}属性</span>
        </div>
        <!-- 这里会出现 attrKey 重名的情况 ，所以对 key 作了额外加处理 -->
        <div
          class="property__item-wrap"
          :key="item.attrKey+index+item.name">
          <span class="property__item-lebel">{{ item.name }}</span>
          <div class="property__item-content">
            <property-item
              :item="item"
              :show-plate-text="showPlateText"></property-item>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { PropertyTab, PropertyFormItem as PropertyItem } from '../common-property-form';
import { initProperties } from '../utils/utils.js';
import { getPropertyDic } from '../utils/property-setter.utils';

export default {
  name: 'CommonPropertySetter',
  components: {
    PropertyItem,
    PropertyTab
  },
  props: {
    // 是否显示车牌提示
    showPlateText: {
      type: Boolean,
      default: undefined
    }
  },
  data() {
    return {
      // 选中的属性的key
      selectedPropertyKeys: [],
      // 当前类型 人脸/人体 ...
      nowType: 0,
      // 全量属性
      allProperties: [],
      // 所有属性的 map
      propertiesMap: {},
      // 选中的属性 全量数据
      selectedProperties: [],
    };
  },
  computed: {
    nowProperty() {
      let property = {};
      this.allProperties.forEach((item) => {
        if (item.code === this.nowType) property = item;
      });
      return property;
    },
    // 当前类型下的属性
    subProperties() {
      return this.nowProperty.data || [];
    },
  },
  watch: {
    // 计算显示标题
    selectedProperties() {
      const parentCodeObj = {};
      this.selectedProperties.forEach((propertyItem) => {
        const { parentInfo } = propertyItem;
        if (parentInfo && !parentCodeObj[parentInfo.code]) {
          propertyItem.showTitle = true;
          parentCodeObj[parentInfo.code] = 1;
        } else {
          propertyItem.showTitle = false;
        }
      });
    }
  },
  created() {
    this.getPropertyConfig();
  },
  methods: {

    /**
     * 请求所有属性字典
     */
    getPropertyConfig() {
      getPropertyDic().then((dic) => {
        this.initProperties(dic);
      });
    },

    /**
     * 选中的属性发生改变 未使用到
     */
    propertyChange(val) {
      console.log(val, this.propertiesMap);
    },

    /**
     * 单个属性是否选择
     */
    propertyItemChange(val, item) {
      console.log(val, item, this.propertiesMap);
      if (val) {
        this.selectedProperties.push(item);
        console.log(this.selectedProperties);
      } else {
        this.selectedProperties.splice(this.selectedProperties.indexOf(item), 1);
      }
      this.selectedProperties.sort((a, b) => a.sort - b.sort);
    },

    /**
     * 初始化属性
     */
    initProperties(properties) {
      const { allProperties, propertiesMap } = initProperties(properties);
      this.allProperties = allProperties;
      this.propertiesMap = propertiesMap;

      this.nowType = this.allProperties[0].code;
    },

    /**
     * 对外暴露的方法，设置数据
     * @param { Object } params 如下格式，attrKey_父级code:value 的形式，值传空串''表示使用默认值，Tips: 不传则表示重置
     * {
     * 'face_gender_0': '0'
     * 'attrKey_父级code': 'value'
     * }
     */
    setProperties(params) {
      // 如果没传参数，就是重置
      this.selectedProperties = [];
      this.selectedPropertyKeys = [];
      this.initProperties(this.allProperties);
      if (params && typeof params === 'object') {
        Object.keys(params).forEach((key) => {
          if (params[key] !== '' && this.propertiesMap[key]) this.$set(this.propertiesMap[key], 'value', params[key]);
          this.selectedProperties.push(this.propertiesMap[key]);
          this.selectedPropertyKeys.push(key);
        });
      }
    },

    /**
     * 对外暴露的方法，用于获取当前的属性
     */
    getProperties() {
      return cloneDeep(this.selectedProperties);
    }
  }
};
</script>

<style lang="scss" scoped>
  .property__wrap{
    display: flex;
    overflow: auto;
    border: 1px solid #EFEFEF;
    .property__left-content{
      border-right: 1px solid #EFEFEF;
      min-width: 457px;
      width: 457px;
      display: flex;
      // height: 100%;
    }
    .property__right-content{
      overflow-y: auto;
      max-width: 830px;
      padding-top: 10px;
      .property__item-wrap{
        display: flex;
        float: left;
        margin-bottom: 20px;
        min-height: 34px;
        .property__item-content{
          width: 270px;
        }
      }
      .property__item-lebel{
        display: flex;
        align-items: center;
        width: 90px;
        padding: 0 20px;
        justify-content: flex-end;
      }
      .property__item-title{
        display: flex;
        align-items: center;
        min-height: 34px;
        clear: both;
        border-bottom: 1px solid #EFEFEF;
        margin: 0 20px 20px 20px;
        box-sizing: border-box;
        font-weight: 500;
        color: #a1a8b4;
        span{
          display: block;
          width: 90px;
          text-align: right;
        }

      }
    }
    .property__tab-content{
      padding: 20px 10px 0 10px;
      box-sizing: border-box;
      overflow: auto;
      height: 100%;
      flex: 1;
      .meg-checkbox{
        margin: 0 0 40px 0;
        padding-right: 15px;
        padding-left: 15px;
        width: 50%;
        box-sizing: border-box;
      }
    }
    // 覆盖 tab 的样式，因为检索条件中的 tab 比较小，这里需要放大一些
    ::v-deep .property__tab-item{
      width: 80px;
      height: 70px;
      padding: 10px 15px;
    }
  }
</style>
