# CommonTable 公共表格组件

* 基于meg-table的常用表格组件，支持用json配置配合slot的方式替换原来的meg-table-column；
* 内置pagination, loading, background等常用组件，并内置了一些处理逻辑，方便配置使用；

### 基本用法

用columns描述表格列信息，参数同meg-table-column

```html
<template>
  <common-table
    :columns="columns"
    :data="data">
  </common-table>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          prop: 'date',
          label: '日期'
        },
        {
          prop: 'name',
          label: '姓名'
        },
        {
          prop: 'address',
          label: '地址'
        }
      ],
      data: [{
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        date: '2016-05-01',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1519 弄'
      }],
    };
  }
}
</script>
```

### 跟column的prop关联的slot，自定义列

```html
<common-table
  :columns="columns"
  :data="data">
  <template v-slot:date="{ row, column, value, store, $index}">
    {{ value }}
  </template>
</common-table>
```

### 在自定义表头，slot名为header#{prop}

```html
<common-table
  :columns="columns"
  :data="data">
  <template v-slot:header#date="scope">
    header, {{ scope.column.prop }}
  </template>
</common-table>
```

### column和header的slot支持重命名

```html
<template>
  <common-table
    :columns="columns"
    :data="data">
    <template v-slot:headerDate="scope">
      header, {{ scope.column.prop }}
    </template>
  </common-table>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          prop: 'date',
          label: '日期',
          slots: {
            header: 'headerDate'
          }
        },
        {
          prop: 'name',
          label: '姓名'
        },
        {
          prop: 'address',
          label: '地址'
        }
      ]
    };
  }
}
</script>
```

### 内置分页器

* 如果使用了current-page.sync，则需要另外监听sync:currentPage
* current-change和size-change事件合并为change事件，回调 { pageNo, pageSize }

```html
<template>
  <common-table
    :columns="columns"
    :data="data"
    :paginationProps="pagination"
    :paginationEvents="paginationEvents"
  ></common-table>
</template>

<script>
export default {
  data() {
    return {
      pagination: {
        align: 'left',
        layout: 'prev, pager, next, sizes, total, jumper',
        currentPage: 15,
        pageSizes': [10, 30, 100],
        total: 500
      },
      paginationEvents: {
        change: this.handleChange,
        'sync:currentPage': this.syncCurrentPage
      }
    }
  },
  methods: {
    handleChange({ pageNo, pageSize }) {},
    syncCurrentPage(pageNo) {}
  }
}
</script>
```

### 内置v-background

表格内部会监听data的值，没有数据时自己显示background，通过innerBackground来将background区域放到表格内部

```html
<template>
  <meg-common-table
    :columns="columns01"
    :data="[]"
    :background="background"
  ></meg-common-table>
</template>

<script>
export default {
  data() {
    return {
      background: {
        icon:'icon_2',
        text:'检索无结果'
      }
    }
  }
}
</script>
```

### checkbox选项

操作方法全部继承自meg-table，可以通过$refs来调用，当selectProps为boolean时，默认为 { type: 'selection', width: 45, align: 'center' }

```html
<template>
  <meg-common-table
    ref="multipleTable"
    :columns="columns"
    :data="data"
    selectProps
    @selection-change="handleSelectionChange"
  ></meg-common-table>
</template>

<script>
export default {
  data() {
    return {
      selectProps: true
    }
  },
  methods: {
    handleSelectionChange(val) {}
  }
}
</script>
```

### 内置loading

通过loadingProps自定义loading，不需要带megvii-loading-前缀

```html
<template>
  <meg-common-table
    :columns="columns"
    :data="data"
    :loading="loading"
    :loadingProps="loadingProps"
  ></meg-common-table>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      loadingProps: {
        text: '数据加载中...',
        background: 'rgba(0,0,0,0.3)',
        // spinner: 'search',
        // 'custom-class': 'table-loading'
      }
    }
  }
}
</script>
```

### 默认填充值，set-empty-cell

单元格没有数据时的填充值

```html
<template>
  <meg-common-table
    :columns="columns"
    :data="data"
    set-empty-cell="—"
  ></meg-common-table>
</template>
```

### CommonTable Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| columns   | 列信息，参数参考meg-table-column | array | - | []      |
| paginationProps | 分页的props | object, boolean | -       | false   |
| paginationEvents | 分页的事件，current-change和size-change已被合并为change | object | -                | {}      |
| background | 没有数据时的占位图 | object, boolean | -      | fasle   |
| innerBackground | 是否在表格内部显示占位图 | boolean | -   | false   |
| loading | 加载中 | boolean | -                            | false   |
| loadingProps | 自定义loading样式和文案 | object | -        | {}      |
| selectProps | checkbox选项，传入对象时自定义设置，传入true即可快速开启checkbox | object, boolean | -          | false   |
| setEmptyCell | 填充没有值的单元格 | string, function | -    | ''     |

> 其他参数跟meg-table一致

### CommonTable Column Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| slots   | 重命名column和header的slot | object | -          | -      |

> 其他参数跟meg-table-column一致

### CommonTable Slots
| 参数      | 说明          |
|---------- |------------- |
| {prop}   | 自定义列，即跟column的prop关联的slot |
| header#{prop} | 自定义列的header |

> 其他slot跟meg-table一致；同时可以通过column的slots重命名column和header的slot