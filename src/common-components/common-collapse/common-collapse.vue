<template>
  <meg-collapse
    class="common-collapse__wrapper"
    v-model="activeIndex"
    v-show="categories.length > 0"
    :sticky="sticky"
    :disabled="isLoading"
    @change="handleChange"
    accordion>
    <meg-collapse-item
      class="common-collapse__item"
      v-for="(category, outerIndex) in categories"
      :key="outerIndex"
      :name="outerIndex">
      <!-- 自定义标题栏 -->
      <template v-slot:title>
        <slot
          name="title"
          :data="category">
          <div class="common-collapse__title">
            <meg-checkbox
              v-model="checkAll"
              v-show="activeIndex === outerIndex && (checkListLength || forceSelectModel)"
              class="common-collapse__checkbox"
              :indeterminate="isIndeterminate"
              @click.native.stop
              @change="handleCheckAllChange">
            </meg-checkbox>
            <div class="common-collapse__category-name">
              {{ category.displayName }}
            </div>
            <div class="common-collapse__category-count">
              ({{ category.count }}条)
            </div>
          </div>
        </slot>
      </template>
      <!-- 折叠内容 -->
      <transition-fade>
        <div
          class="common-collapse__container"
          v-if="activeIndex === outerIndex">
          <slot
            name="list"
            :list="listData">
            <select-frame
              ref="selectFrame"
              :list="listData"
              :show-checkbox="showCheckbox"
              :gap="gap"
              :card-min-width="cardMinWidth"
              :item-key="itemKey"
              :force-select-model="forceSelectModel"
              @check-list-change="checkListChange">
              <template v-slot="{item, index}">
                <slot
                  :item="item"
                  :index="index"
                  :list="listData"></slot>
              </template>
            </select-frame>
          </slot>
        </div>
      </transition-fade>
      <!-- 查看更多 -->
      <transition name="meg-fade-in">
        <div
          v-show="isMore"
          class="common-collapse__more">
          <meg-button
            class="common-collapse__more-btn"
            @click="handleMore"
            :loading="isLoading">
            {{ isLoading?'加载中':'加载更多' }}
          </meg-button>
        </div>
      </transition>
    </meg-collapse-item>
  </meg-collapse>
</template>
<script>
import TransitionFade from './transition-fade';
import SelectFrame from './select-frame';

export default {
  name: 'CommonCollapse',
  components: {
    TransitionFade,
    SelectFrame,
  },
  model: {
    prop: 'activeName',
    event: 'change',
  },
  props: {
    //  聚合数据
    categories: {
      type: Array,
      default: () => []
    },
    // 外部传入的列表
    list: {
      type: Array,
      default: () => []
    },
    // 获取列表数据的方式
    // outer/inner/innerPage  外部/内部全量/内部分页
    listFetch: {
      type: String,
      default: 'outer',
    },
    // 列表数据对应的字段的名称  当listFetch 为outer时无用。
    listKey: {
      type: String,
      default: 'listResults',
    },
    // 选择模式下绑定值对应的每个项的 key， 默认 id。
    itemKey: {
      type: String,
      default: 'id',
    },
    // 每页显示的条数
    pageSize: {
      type: Number,
      default: 60,
    },
    // 列表总数据量
    totalRecords: {
      type: Number,
      default: 0,
    },
    // 展开的风琴褶
    activeName: {
      type: [Number, String],
      default: 0,
    },
    // 默认展开的风琴褶，此优先级会高于 v-module 绑定的值
    defaultActiveName: {
      type: [Number, String],
      default: 0,
    },
    // 是否可选，默认是可以选择的
    showCheckbox: {
      type: Boolean,
      default: true,
    },
    // checkbox 延迟动画效果
    showCheckboxAnimation: {
      type: Boolean,
      default: true,
    },
    // 加载更多按钮的 loading 状态
    loading: {
      type: Boolean,
      default: false,
    },
    // 卡片的最小宽度（像素值）
    cardMinWidth: {
      type: Number,
      default: undefined
    },
    // 卡片间距
    gap: {
      type: Number,
      default: undefined
    },
    // 是否吸顶
    sticky: {
      type: Boolean,
      default: true
    },
    // 是否强制进入选择模式
    forceSelectModel: {
      type: Boolean,
      default: false
    },
    // 当聚合数据发生改变的时候，是否重置风琴褶的 index
    resetActiveIndexWhenCategoriesChange: {
      type: Boolean,
      default: true,
    },
    // 当聚合数据发生改变的时候，是否重置风琴褶的分页
    resetPageNumberWhenCategoriesChange: {
      type: Boolean,
      default: true,
    }
  },
  data() {
    return {
      // 当前页码
      pageNo: 1,
      // 内部自取数据时的列表
      innerList: [],
      // 内部自取数据时的列表总数量
      totalInner: 0,
      // 默认展开页
      activeIndex: this.activeName,
      checkAll: false,
      isIndeterminate: false,
      checkListLength: 0,
      innerLoading: false,
    };
  },
  computed: {
    // 是否展示加载更多
    isMore() {
      return this.total > this.listData.length && !this.checkListLength && !this.forceSelectModel;
    },
    // 具体的列表
    listData() {
      return this.listFetch === 'outer' ? this.list : this.innerList;
    },
    // 具体的列表总数量
    total() {
      return this.listFetch === 'outer' ? this.totalRecords : this.totalInner;
    },
    isLoading() {
      return this.loading || this.innerLoading;
    },
  },
  watch: {
    activeIndex: {
      handler(val) {
        if (val || val === 0) {
          this.fetchInnerData();
        }
      },
      immediate: true,
    },
    activeName: {
      handler() {
        this.activeIndex = this.activeName;
      },
      immediate: true,
    },
    categories: {
      handler(val) {
        console.log('监听到数据变化了123', val);
        if (!val || !val.length) return;
        // console.log('改变categories');
        if (this.checkListLength) this.cancelSelect();
        if (this.resetPageNumberWhenCategoriesChange) this.pageNo = 1;
        if (this.resetActiveIndexWhenCategoriesChange) this.activeIndex = this.defaultActiveName;
        // TODO: 这里没有$emit('change') 会造成 v-model 绑定的值并没有发生改变，可能带来问题，但是如果 emit 会造成外部两次请求，这里需要再看看
        this.fetchInnerData();
        // console.log('现在的activeName', this.activeName);
      },
      immediate: true,
    },
  },
  methods: {
    // 切换折叠面板
    handleChange(val) {
      // debugger;
      if (this.checkListLength) this.cancelSelect();
      this.pageNo = 1;
      this.$emit('change', val);
    },

    /**
     * 分页
     * @returns pageNo 页面
     * @returns pageSize 页面承载的数据
     */
    handleMore() {
      this.pageNo += 1;
      this.$emit('load-list', this.pageNo, this.pageSize, this.activeIndex);
      this.fetchInnerData();
    },
    setPageNo(pageNo) {
      this.pageNo = pageNo;
    },

    /**
     * 内部获取数据
     */
    fetchInnerData() {
      if (this.listFetch === 'outer') return;
      this.innerLoading = true;
      this.$nextTick(() => {
        this.innerLoading = false;
      });
      const categoryItem = this.categories && this.categories[this.activeIndex];
      const list = categoryItem ? categoryItem[this.listKey] : [];

      const size = this.pageSize * this.pageNo;
      this.totalInner = list.length;
      // 不分页 和 分页 不同情况
      this.innerList = (this.listFetch === 'inner') ? list : list.slice(0, size);
    },

    /**
     * 取消选择
     */
    cancelSelect() {
      this.setCheckedKeys([]);
    },

    /**
     * 全选发生改变
     */
    handleCheckAllChange(val) {
      // console.log('全选改变事件');
      const ids = val ? 'ALL' : [];
      this.setCheckedKeys(ids);
    },

    /**
     * 设置选择
     * 对内 对外 公用
     */
    setCheckedKeys(ids) {
      let checkList = [];
      let checkedItems = [];
      if (this.$refs.selectFrame && this.$refs.selectFrame.length) {
        this.$refs.selectFrame[0].setCheckedKeys(ids);
        checkList = this.$refs.selectFrame[0].getCheckedKeys();
        checkedItems = this.$refs.selectFrame[0].getCheckedItems();
      }
      this.checkListChange(checkList, checkedItems);
    },

    /**
     * 已选中列表发生改变
     */
    checkListChange(checkList, checkedItems) {
      // console.log('check-list-change 事件', checkList, checkedItems);
      const checkedCount = checkList.length;
      this.checkAll = checkedCount === this.listData.length;
      this.isIndeterminate = !!checkedCount && checkedCount < this.listData.length;
      this.checkListLength = checkList.length;
      this.$emit('check-list-change', checkList, checkedItems, this.activeIndex);
    },
    /**
     * 获取选中的items
     * @returns
     */
    getCheckedItems() {
      let checkedItems = [];
      if (this.$refs.selectFrame && this.$refs.selectFrame.length) {
        checkedItems = this.$refs.selectFrame[0].getCheckedItems();
      }
      return checkedItems;
    },
    /**
     * 获取选中的key
     * @returns
     */
    getCheckedKeys() {
      let checkedKeys = [];
      if (this.$refs.selectFrame && this.$refs.selectFrame.length) {
        checkedKeys = this.$refs.selectFrame[0].getCheckedKeys();
      }
      return checkedKeys;
    },
  }
};
</script>
<style lang="scss" scoped>
.common-collapse__wrapper {
  // 这两个样式先覆盖，后续再从组件库修复
  ::v-deep .meg-collapse-item__tab{
    border-bottom: 1px solid #f3f3f3;
    z-index: 11;
    &.is-sticky{
      top: 0;
    }
  }
  // 这里的 z-index 是和select-frame 中的卡片配合的，内部12，这样保持  11 12 13的层级，才能保证浮层不被collapse-item挡住，又能让滚动条滚动的时候浮卡片被当前collapse-item盖着
  ::v-deep .common-collapse__item.is-active .meg-collapse-item__tab{
    z-index: 13;
  }
  ::v-deep .meg-collapse-item__wrap{
    overflow: unset;
  }
  ::v-deep .meg-collapse-item__content{
    padding-bottom: 0;
  }
}
.common-collapse__checkbox{
  margin: 0;
  margin-right: 5px;
}
.common-collapse__container{
  padding-top: 6px;
}
.common-collapse__item{
  margin-bottom: 6px;
  border: none 0;
}
.common-collapse__title {
  display: flex;
  justify-content: flex-start;
  align-content: center;
  align-items: center;
  box-sizing: border-box;
  .common-collapse__category-name, .common-collapse__category-count {
    font-size: 14px;
    color: #435068;
  }
  .common-collapse__category-count{
    color: rgba(67,80,104,0.5);
    margin-left: 4px;
  }
}
.common-collapse__more {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  padding-bottom: 10px;
}
.common-collapse__more-btn{
  width: 300px;
  height: 50px;
  font-size: 18px;
}
</style>
