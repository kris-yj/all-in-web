import { Table } from 'megvii-ui';

/**
 * 通过ref转发table上的methods
 */
function proxyTableMethods() {
  const methods = Object.keys(Table.methods);
  const tableMethods = methods.reduce((methodsObj, method) => {
    methodsObj[method] = function (...agrs) {
      const { multipleTable } = this.$refs;
      if (multipleTable) {
        multipleTable[method](...agrs);
      }
    };
    return methodsObj;
  }, {});
  return tableMethods;
}

export default {
  name: 'MegCommonTable',
  props: {
    columns: {
      type: Array,
      default: () => []
    },
    paginationProps: {
      type: [Object, Boolean],
      default: false
    },
    paginationEvents: {
      type: Object,
      default: () => ({})
    },
    background: {
      type: [Object, Boolean],
      default: false
    },
    innerBackground: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingProps: {
      type: Object,
      default: () => ({})
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectionWidth: {
      type: Number,
      default: 40
    },
    selectionFixable: {
      type: [Boolean, String],
      default: false
    },
    scrollToTop: {
      type: Boolean,
      default: true
    },
    setEmptyCell: {
      type: [String, Function],
      default: ''
    },
    rowSelectable: {
      type: Function,
      default: () => () => true
    },
    ...Table.props
  },
  data() {
    const { paginationProps, columns } = this;
    let { selectionWidth } = this;
    let pageSize = 10;
    if (paginationProps) {
      const pageSizes = paginationProps.pageSizes || paginationProps['page-sizes'] || [];
      if (pageSizes.length) {
        const [size] = pageSizes;
        pageSize = size;
      }
    }
    const selectionItem = columns.find((item) => item.type === 'selection');
    if (!selectionItem) {
      columns.unshift({
        type: 'selection',
        width: 17,
        align: 'center',
        fixed: this.selectionFixable,
        selectable: (row, index) => {
          const selectable = this.rowSelectable(row, index); // computed
          console.log('selectable', selectable);
          return selectable;
        },
        renderHeader: this.createRenderHeader()
      });
    } else if (selectionItem.width) {
      selectionWidth = selectionItem.width;
    }
    return {
      columnsProps: columns,
      placeholder: this.background,
      checkboxWidth: selectionWidth,
      pageNo: 1,
      pageSize
    };
  },
  methods: {
    ...proxyTableMethods(),
    createRenderHeader() {
      const $this = this;
      return function (h, { store }) {
        const disable = $this.data.every((item, index) => !$this.rowSelectable(item, index));
        const handle = function (e) {
          if (disable) {
            return;
          }
          this.toggleAllSelection(e);
        };
        return <meg-checkbox
          disabled={ (store.states.data && store.states.data.length === 0) || disable }
          indeterminate={ store.states.selection.length > 0 && !this.isAllSelected }
          nativeOn-click={ handle.bind(this) }
          value={ this.isAllSelected } />;
      };
    },
    /**
     * 填充没有值的单元格
     * @param {string | function} v
     */
    setEmptyCellValue(v) {
      const { setEmptyCell } = this;
      let setCell = setEmptyCell;
      if (typeof setEmptyCell === 'string') {
        setCell = () => setEmptyCell;
      }
      if (!v && v !== 0) {
        return setCell.call(this, v);
      }
      return v;
    },
    getColumnSlotName(column) {
      const slotsAlias = column.slots || {};
      /**
       * 关联column的prop的slot，通过slots.default重命名
       */
      const defaultSlotName = slotsAlias.default || column.prop;
      /**
       * header的slot，通过slots.header重命名，或者使用header#{prop}的具名slot
       */
      const headerSlotName = slotsAlias.header || `header#${column.prop}`;
      return {
        defaultSlotName,
        headerSlotName
      };
    },
    getColumnScopedSlots(columnProp) {
      const { defaultSlotName, headerSlotName } = this.getColumnSlotName(columnProp);
      const scopedSlots = {
        default: (scope) => {
          const {
            row,
            column,
            store,
            $index
          } = scope;
          const scopedSlot = this.$scopedSlots[defaultSlotName];
          const defaultVal = row[defaultSlotName];

          /**
           * 处理column的formatter
           */
          const fmtVal = typeof columnProp.formatter === 'function'
            ? columnProp.formatter(row, column, row[columnProp.prop], $index)
            : defaultVal;

          /**
           * 处理checkbox的slot
           */
          const ifSelection = columnProp.type === 'selection'
            ? <meg-checkbox
                class="head-checkbox"
                nativeOn-click={ (event) => event.stopPropagation() }
                value={ store.isSelected(row) }
                disabled={ columnProp.selectable ? !columnProp.selectable.call(null, row, $index) : false }
                on-input={ () => { store.commit('rowSelectedChanged', row); } } />
            : this.setEmptyCellValue(fmtVal);
          scope.value = row[columnProp.prop];
          return scopedSlot
            ? scopedSlot(scope)
            : ifSelection;
        }
      };
      if (columnProp.type !== 'selection') {
        scopedSlots.header = (scope) => {
          const scopedSlot = this.$scopedSlots[headerSlotName];
          return scopedSlot
            ? scopedSlot(scope)
            : columnProp.label;
        };
      }
      return scopedSlots;
    },
    renderPagination() {
      const { paginationProps, paginationEvents } = this;
      if (typeof paginationProps === 'boolean' && !paginationProps) {
        return null;
      }
      /**
       * jsx对.sync的支持比较不足，需要新增sync:currentPage事件同步更新的值
       */
      let updateEvent = paginationEvents['sync:currentPage'];
      if (typeof updateEvent !== 'function') {
        updateEvent = () => {};
      }
      const props = {
        props: {
          ...paginationProps
        },
        on: {
          ...paginationEvents,
          ...{
            'current-change': this.handleCurrentChange,
            'size-change': this.handleSizeChange
          },
          'update:currentPage': (v) => updateEvent(v) // 处理.sync
        }
      };
      return <meg-pagination {...props}></meg-pagination>;
    },
    getLoadingAttrs() {
      /**
       * 传值时省略megvii-loading前缀
       * eg:
       * {
       *  text: 'loading',
       *  background: '#fff'
       * }
       */
      const attrs = Object.keys(this.loadingProps).reduce((obj, item) => {
        obj[`megvii-loading-${item}`] = this.loadingProps[item];
        return obj;
      }, {});

      return {
        attrs
      };
    },
    getTableProps() {
      const scopedSlots = {
        append: () => this.$slots.append
      };
      if (this.innerBackground) {
        scopedSlots.empty = () => <div v-background={this.background}></div>;
      } else {
        scopedSlots.empty = () => this.$slots.empty;
      }
      const tableProps = {
        ref: 'multipleTable',
        on: this.$listeners,
        attrs: this.$attrs,
        props: {
          rowKey: 'id',
          ...this.$props
        },
        scopedSlots
      };
      return tableProps;
    },
    getWrapperProps() {
      const wrapperProps = {
        attrs: {
          ...this.$attrs
        }
      };
      if (!this.innerBackground) {
        wrapperProps.directives = [
          {
            name: 'background',
            value: this.placeholder
          }
        ];
      }
      return wrapperProps;
    },
    scrollBodyWrapper() {
      const bodyWrapper = this.$el.querySelector('.meg-table__body-wrapper');
      if (bodyWrapper && this.scrollToTop) {
        bodyWrapper.scrollTo(0, 0);
      }
    },
    /**
     * 合并current-change和size-change为change
     */
    handleCurrentChange(pageNo) {
      this.pageNo = pageNo;
      const { paginationEvents } = this;
      if (typeof paginationEvents.change === 'function') {
        if (this.pageChangeTimer) {
          clearTimeout(this.pageChangeTimer);
        }
        paginationEvents.change({
          pageNo,
          pageSize: this.pageSize
        });
      }
      /**
       * 滚动时机不太准，不过不影响效果
       */
      this.scrollBodyWrapper();
    },
    handleSizeChange(pageSize) {
      this.pageNo = 1;
      this.pageSize = pageSize;
      const { paginationEvents } = this;
      if (typeof paginationEvents.change === 'function') {
        if (this.pageChangeTimer) {
          clearTimeout(this.pageChangeTimer);
        }
        this.pageChangeTimer = setTimeout(() => {
          paginationEvents.change({
            pageNo: 1,
            pageSize
          });
        }, 50);
      }
    }
  },
  watch: {
    rowSelectable: {
      immediate: true,
      handler(f) {
        this.columnsProps.forEach((item) => {
          if (item.type === 'selection') {
            item.selectable = f;
            item.renderHeader = this.createRenderHeader();
          }
        });
      }
    },
    selectable: {
      handler(selectable) {
        const { columnsProps } = this;
        columnsProps.forEach((item) => {
          if (item.type === 'selection') {
            item.width = selectable ? this.checkboxWidth : 17;
          }
        });
        this.columnsProps = [...columnsProps];
      },
      immediate: true
    },
    data: {
      /**
       * 内部处理data的变动时background的显示
       */
      handler(v) {
        if (v && v.length) {
          this.placeholder = false;
        } else {
          this.placeholder = this.background;
        }
      },
      immediate: true
    }
  },
  render() {
    const wrapperProps = this.getWrapperProps();
    const tableProps = this.getTableProps();
    const loadingAttrs = this.getLoadingAttrs();
    return <div
      class={{
        'meg-common-table-wrapper': true,
        'meg-common-table-show-selection': this.selectable,
        'meg-common-table-hide-selection': !this.selectable,
        'meg-common-table-innerbg': this.innerBackground
      }}
      {...wrapperProps}>
        <div
          {...loadingAttrs}
          v-loading={ this.loading }
          class="meg-common-table-loading">
          <meg-table
            {...tableProps}>
            {
              this.columnsProps.map((column) => {
                const scopedSlots = this.getColumnScopedSlots(column);
                const columnProps = {
                  props: column,
                  scopedSlots
                };
                return <meg-table-column {...columnProps}></meg-table-column>;
              })
            }
          </meg-table>
          {
            this.renderPagination()
          }
        </div>
      </div>;
  }
};
