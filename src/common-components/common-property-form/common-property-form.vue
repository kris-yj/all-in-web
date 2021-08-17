<template>
  <div
    :class="['property-form__wrap', {'is-tab-horizontal': tabHorizontal}]">
    <!-- 切换 tab -->
    <property-tab
      v-model="nowType"
      :horizontal="tabHorizontal"
      :items="allProperties"></property-tab>
    <slot></slot>
    <div class="property-form__content">
      <!-- 普通的属性 classifySort === 0 的部分 -->
      <template
        v-for="(item) in subProperties">
        <property-item-wrap
          class="property-form__item"
          :label="item.name"
          :key="item.name"
          v-if="!item.classifySort">
          <property-item :item="item"></property-item>
        </property-item-wrap>
      </template>
      <!-- 归类的属性 -->
      <template
        v-for="(items, index) in subCollapseProperties">
        <collapse-property
          :items="items"
          :key="index"></collapse-property>
      </template>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { initProperties } from '../utils/utils.js';
import { getPropertyDic } from '../utils/property-setter.utils';
import PropertyItem from './property-form-item';
import PropertyTab from './basic/property-tab';
import PropertyItemWrap from './basic/property-item-wrap';
import CollapseProperty from './collapse-property';

export default {
  name: 'CommonPropertyForm',
  components: {
    PropertyItem,
    PropertyTab,
    PropertyItemWrap,
    CollapseProperty,
  },
  model: {
    prop: 'defaultType',
    event: 'change'
  },
  props: {
    // tab 方向 是否横向
    tabHorizontal: {
      type: Boolean,
      default: false,
    },
    // 默认显示那个 tab
    defaultType: {
      type: [Number, String],
      default: 0
    },
    // 是否显示展开收起按钮
    collapseBtnVisible: {
      type: Boolean,
      default: undefined,
    },
    // 默认展开
    defaultExpand: {
      type: Boolean,
      default: true,
    },
    defaultGetConfig: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 全量属性
      allProperties: [],
      // 所有属性的 map
      propertiesMap: {},
    };
  },
  computed: {
    nowType: {
      get() {
        return this.defaultType;
      },
      set(val) {
        this.$emit('change', val);
      }
    },
    nowProperty() {
      let property = {};
      this.allProperties.forEach((item) => {
        if (item.code === this.nowType) property = item;
      });
      return property;
    },
    subProperties() {
      return this.nowProperty.data || [];
    },
    subCollapseProperties() {
      return this.nowProperty.collapseProperties || [];
    },
  },
  watch: {
    defaultType(val) {
      this.nowType = val;
    }
  },
  mounted() {
    if (this.defaultGetConfig) this.getPropertyConfig();
  },
  methods: {
    /**
     * 重置
     * @param { Number } type, 对应数据字典类型 code
     */
    reset(type) {
      console.log('reset', type);
      this.nowType = (type !== undefined) ? type : this.defaultType;
      // this.initProperties(this.allProperties);
    },
    /**
     * 请求所有属性字典
     */
    getPropertyConfig() {
      return getPropertyDic().then((dic) => {
        this.initProperties(dic);
      });
    },

    /**
     * 初始化属性
     */
    initProperties(properties) {
      const { allProperties, propertiesMap } = initProperties(properties);
      console.log('initproperties start', allProperties, propertiesMap);
      // 进行归类
      allProperties.forEach((propertiesInner) => {
        propertiesInner.data.sort((a, b) => a.classifySort - b.classifySort);
        const collapseProperties = {};
        const { data } = propertiesInner;
        for (let i = 0; i < data.length; i += 1) {
          const item = data[i];
          const sort = item.classifySort;
          // 如果是零则不归类
          if (sort > 0) {
            if (!collapseProperties[sort]) collapseProperties[sort] = [];
            collapseProperties[sort].push(item);
          }
        }
        propertiesInner.collapseProperties = collapseProperties;
      });
      this.allProperties = allProperties;
      this.propertiesMap = propertiesMap;
      console.log('initproperties end', this.allProperties);
    },

    /**
     * 对外暴露的方法，设置数据
     * @param { Object } params 如下格式，attrKey_父级code:value 的形式，值传空串''表示使用默认值，Tips: 不传则表示重置
     * {
     * 'face_gender_0': '0'
     * 'attrKey_父级code': 'value'  //  ps：对于单选的情况，值也能传成数组[值]
     * }
     * @param { Number } type, 对应数据字典类型 code
     */
    setProperties(params, type) {
      // 如果没传参数，就是重置
      this.reset(type);
      console.log('set Properties 设置的数据', params, type);
      if (params && typeof params === 'object') {
        Object.keys(params).forEach((key) => {
          const propertyItem = this.propertiesMap[key];
          let value = params[key];
          console.log('set Properties 找到的item', propertyItem, this.propertiesMap);
          if (propertyItem) {
            // 对于非多选的情况，如果传成了数组，则会取数组的第一个值为值
            if ([3, 4, 5].indexOf(propertyItem.type) === -1 && Array.isArray(value) && value.length) {
              [value] = value;
            }
            // 对于多选的情况，如果传成了非数组，则会忽略掉
            if ([3, 4, 5].indexOf(propertyItem.type) > -1 && !Array.isArray(value)) {
              value = '';
            }
            if (value || value === 0) this.$set(propertyItem, 'value', value);
          }
        });
      }
    },

    /**
     * 对外暴露的方法，用于获取当前的属性
     */
    getProperties() {
      return cloneDeep(this.subProperties);
    }
  }
};
</script>

<style lang="scss" scoped>
.property-form__wrap {
  display: flex;
  border: 1px solid #efefef;
  &.is-tab-horizontal {
    flex-direction: column;
    border: none 0;
    .property-form__content {
      flex: unset;
      border: none 0;
      ::v-deep .property-item__wrap,
      ::v-deep .collapse-property__display {
        padding-left: 25px;
        padding-right: 25px;
      }
    }
  }
}
.property-form__content {
  flex: 1;
  border-left: 1px solid #efefef;
  overflow: auto;
}
.property-form__item {
  &:first-child {
    padding-top: 16px;
  }
}
</style>
