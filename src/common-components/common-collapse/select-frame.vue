<template>
  <div
    class="common-select__wrap">
    <meg-card-frame
      tag="div"
      class="common-select__frame"
      :gap="gap"
      :card-min-width="cardMinWidth">
      <div
        :class="['common-select__item', {'in-select-module': checkList.length || forceSelectModel}]"
        v-for="(item,index) in list"
        :key="index">
        <meg-checkbox
          v-model="item.$selectValue"
          :label="item[itemKey]"
          class="common-select__checkbox"
          :style="{'transition': showCheckboxAnimation ? 'opacity 0.3s ease;':';'}"
          @change="checkChange($event, item)"
          v-if="showCheckbox">
          <span
            class="common-select__mask"></span>
        </meg-checkbox>
        <slot
          :item="item"
          :index="index"></slot>
      </div>
    </meg-card-frame>
  </div>
</template>

<script>
export default {
  name: 'SelectFrame',
  props: {
    // 列表数据
    list: {
      type: Array,
      default: () => [],
    },
    // 是否可选，默认是可以选择的
    showCheckbox: {
      type: Boolean,
      default: true,
    },
    // 选择模式下绑定值对应的每个项的 key， 默认 id。
    itemKey: {
      type: String,
      default: 'id',
    },
    // 卡片的最小宽度（像素值）
    cardMinWidth: {
      type: Number,
      default: 244
    },
    // 卡片间距
    gap: {
      type: Number,
      default: 6
    },
    // checkbox 延迟动画效果
    showCheckboxAnimation: {
      type: Boolean,
      default: true,
    },
    // 是否强制进入选择模式
    forceSelectModel: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      checkList: [],
      emit: true,
      itemMap: {}
    };
  },
  computed: {
    checkedItems() {
      return this.checkList.map((key) => this.itemMap[key]);
    },
  },
  watch: {
    list: {
      immediate: true,
      handler() {
        this.list.forEach((item) => {
          Object.defineProperty(item, '$selectValue', {
            value: false,
            configurable: true,
            writable: true,
            enumerable: false
          });
          this.itemMap[item[this.itemKey]] = item;
        });
      },
    },
  },
  created() {
    // this.itemMap = {};
  },
  methods: {
    /**
     * 设置选择
     */
    setCheckedKeys(keys = []) {
      this.setAllCheckedStatus(keys === 'ALL');
      if (!keys || !keys.length || keys === 'ALL') {
        return;
      }
      keys.forEach((key) => {
        const item = this.itemMap[key];
        if (item) {
          item.$selectValue = true;
          this.checkList.push(key);
        }
      });
    },
    /**
     *  设置全部的选中状态
     */
    setAllCheckedStatus(checked = false) {
      const checkList = [];
      this.list.forEach((item) => {
        item.$selectValue = checked;
        if (checked) checkList.push(item[this.itemKey]);
      });
      this.checkList = checkList;
    },
    /**
     * 某个选择发生改变
     * @param { Boolean } checked
     * @param { Object } item 当前项
     */
    checkChange(checked, item) {
      const key = item[this.itemKey];
      if (checked) {
        this.checkList.push(key);
      } else {
        this.checkList.splice(this.checkList.indexOf(key), 1);
      }
      this.emitCheckListChange();
    },
    /**
     * 内部选择发生改变
     */
    emitCheckListChange() {
      this.$emit('check-list-change', this.checkList, this.checkedItems);
    },
    /**
     * 获取选中的items
     * @returns
     */
    getCheckedItems() {
      return this.checkedItems;
    },
    /**
     * 获取选中的key
     * @returns
     */
    getCheckedKeys() {
      return this.checkList;
    },
  }

};
</script>

<style lang="scss" scoped>
  .common-select__item{
    position: relative;
    font-size: 14px;
    &:hover .common-select__checkbox{
      opacity: 1;
    }
    &:hover {
      z-index: 12;
    }
    &.in-select-module{
      .common-select__checkbox{
        opacity: 1;
      }
      .common-select__mask{
        display: block;
      }
    }
  }
  .common-select__checkbox{
    // 由于这里如果设置了 position，就会影响 common-select__mask 的定位，所以使用了 float 来实现位置
    position: unset;
    height: 0;
    width: 0;
    float: left;
    padding-left: 10px;
    opacity: 0;
  }
  .common-select__mask{
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    display: none;
  }
</style>
