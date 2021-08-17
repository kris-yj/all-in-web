<template>
  <div
    ref="brandSelecter"
    class="common-brand-selecter">
    <meg-dropdown
      placement="bottom-start"
      trigger="click"
      @visible-change="visibleChange($event)">
      <meg-input
        :placeholder="'全部'"
        v-model="brand"
        clearable
        class="selecter__input"
        :readonly="true">
        <span
          slot="suffix">
          <meg-icon
            v-if="brand"
            name="clear"
            class="icon-clear"
            @click.stop="brand=''"></meg-icon>
          <meg-icon
            name="caret_down"
            class="icon-caret_down"></meg-icon>
        </span>
      </meg-input>

      <!-- 浮层 -->
      <meg-dropdown-menu
        slot="dropdown"
        class="common-brand-selecter__dropdown">
        <!-- 字母部分 -->
        <div class="selecter__alphabet">
          <span
            v-for="(item,index) in CAR_SEARCH_CAR_MSG.alphabet"
            :key="index"
            :class="['hover-item', {'is-active': alphabetIndex===index}]"
            @click="clickAlphabet(item,index)">{{ item }}</span>
        </div>

        <!-- 品牌 -->
        <div
          class="selecter__brand"
          ref="vehicleBrand">
          <li
            v-for="(item,index) in CAR_SEARCH_CAR_MSG.carBrandTypeAges"
            :key="index">
            <span
              class="selecter__brand-alphabet"
              ref="alphabet">
              {{ item.initials }}
            </span>
            <div
              class="selecter__brand-name">
              <span
                v-for="(innerItem,i) in item.list"
                v-tooltip="true"
                :key="i"
                ref="brandName"
                :id="innerItem.id"
                :class="['brand-name-item hover-item', {'is-active': selectedBrandItem.id === innerItem.id}]"
                @click="getBrand(innerItem,innerItem.id)">
                {{ innerItem.brand }}
              </span>
            </div>
          </li>
        </div>

        <!-- 子品牌 -->
        <div
          v-if="brandList.length>0"
          class="selecter__vehicle-model">
          <!-- i18n: 全部 -->
          <div
            class="vehicle-type-name hover-item"
            @click="getModel({typeName:selectedBrandItem.brand})">
            <meg-dropdown-item>
              全部
            </meg-dropdown-item>
          </div>
          <div
            v-for="(item,index) in brandList"
            ref="vehicleModel"
            :key="index"
            :class="['vehicle-type-name hover-item',{'is-active': selectedTypeName===index}]"
            @click="getModel(item,index)">
            <meg-dropdown-item
              v-tooltip="true">
              {{ item.typeName }}
            </meg-dropdown-item>
          </div>
        </div>
      </meg-dropdown-menu>
    </meg-dropdown>
  </div>
</template>

<script>
import vehicle from './common-brand-selecter-vehicle.js';

export default {
  model: {
    prop: 'defaultChecked',
    event: 'change'
  },
  props: {
    // 默认选中的值
    defaultChecked: {
      type: null,
      default: '',
    },
  },
  data() {
    return {
      alphabetIndex: null,
      // 型号列表
      brandList: [],
      // 选取的车辆型号
      brand: '',
      options: [],
      value: '',
      isClear: false,
      clearIconChange: false,
      // 被选中的车辆品牌
      selectedBrandItem: {},
      // 被选中的车辆型号
      selectedTypeName: null,
      CAR_SEARCH_CAR_MSG: {
        alphabet: vehicle.modules.alphabet,
        carBrandTypeAges: vehicle.modules.carBrandTypeAges,
      }
    };
  },
  watch: {
    brand(newVal) {
      this.$emit('change', newVal);
    },
    defaultChecked: {
      immediate: true,
      handler(newVal) {
        this.brand = newVal;
      }
    }
  },
  methods: {
    // 点击字母列表
    clickAlphabet(item, index) {
      this.alphabetIndex = index;
      const top = this.$refs.alphabet[index].offsetTop;
      this.$refs.vehicleBrand.scrollTop = top;
    },
    // 点击品牌
    getBrand(item) {
      this.brandList = item.type;
      this.selectedBrandItem = item;
      this.selectedTypeName = '';
    },
    // 点击型号
    getModel(item, index) {
      console.log(item, index);
      this.brand = item.typeName;
      this.selectedTypeName = index;
    },
    // menu显示隐藏
    visibleChange(visible) {
      if (visible) {
        this.brandList = [];
        this.alphabetIndex = null;
        this.selectedBrandItem = {};
      }
    },

    // 晴空按钮Mouseover
    clearMouseover() {
      this.clearIconChange = true;
    },
    // 晴空按钮Mouseout
    clearMouseout() {
      this.clearIconChange = false;
    },
    // 重置 清空
    reset() {
      this.brand = '';
      this.selectedBrandItem = {};
      this.selectedTypeName = null;
    }
  }
};
</script>

<style lang="scss">
  .common-brand-selecter{
    .meg-dropdown{
      width: 100%;
    }
    .selecter__input{
      outline: none;
    }
    .meg-input__suffix-inner{
      color: #21539b;
      line-height: 12px;
      .meg-icon{
        height: 12px;
        width: 12px;
      }
    }
    .icon-clear{
      display: none;
      background: #fff;
      position: absolute;
      left: 0;
      top: 0;
      cursor: pointer;
    }
    .selecter__input:hover{
      .icon-clear{
        display: initial;
      }
    }
  }

  .common-brand-selecter__dropdown{
    display: flex;
    width: 320px;
    min-width: 270px;
    max-height: 570px;
    line-height: 34px;
    overflow: hidden;
    padding: 0;
    margin: 0;
    .selecter__alphabet{
      width: 36px;
      background: #f0f0f0;
      font-size: 12px;
      overflow: auto;
      span{
        display: block;
        text-align: center;
      }
    }
    .selecter__brand{
      width: 140px;
      overflow: auto;
    }
    .selecter__brand-alphabet{
      background: #f0f0f0;
      font-size: 12px;
      padding: 0 5px 0 16px;
      display: block;
    }
    .selecter__brand-name{
      span{
        display: block;
        padding: 0 5px 0 16px;
      }
    }
    .selecter__vehicle-model{
      width: 140px;
      overflow: auto;
      flex: 1;
    }
    .hover-item{
      cursor: pointer;
      &:hover, &.is-active{
        color: #21539b;
        background: #e6f2ff;
      }
      &.is-active{
        font-weight: bold;
      }
    }
    .meg-dropdown-menu__item{
      padding: 0 5px 0 16px;
    }
  }
</style>
