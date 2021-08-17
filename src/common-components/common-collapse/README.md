# CommonCollapse 公用风琴褶组件，内部带分页及选择逻辑

支持外部/后端分页，以及内部自分页。



### 默认开启选择逻辑
可以通过 `show-checkbox` 配置为 `false` 来去掉选择逻辑



### 基础用法(外部分页)
通过`v-model`绑定当前展开的风琴褶,

通过`categories`传入聚合数据,  **内部数据必须是 `{displayName: '名称', count: 总数}`的格式**，

通过`list`传入列表,

通过`page-size`传入每页显示的条数,

通过`total-records`传入列表总数,

通过`loading`传入 加载更多按钮的 loading 状态,

通过`change`事件监听风琴褶变化,

通过`load-list`事件监听 加载更多 按钮的事件,

通过`check-list-change`事件监听 选择变化, **参数为已选中的 id 和 item**，可用通过`item-key`配置id别名

通过 `cancelSelect` 方法来取消选择/退出选择模式


```html
<div>
  <!-- 页面顶部 选择模式 相关显示逻辑示例 -->
  <div class="header">
    <div>
      <span v-if="!checkList.length">检索结果：共 {{ totalRecords }} 条</span>
      <span v-else>已选择： {{ checkList.length }} 条</span>
    </div>
    <div v-show="!checkList.length">
      中间tab按钮
    </div>
    <div>
      右边操作按钮
      <meg-button
        v-show="checkList.length"
        @click="()=>{$refs.collapse.cancelSelect()}">
        取消选择
      </meg-button>
    </div>
  </div>
  <!-- 风琴褶列表 -->
  <div class="content">
    <common-collapse
      ref="collapse"
      v-model="nowIndex"
      :categories="categories"
      :list="list"
      :page-size="pageSize"
      :total-records="totalRecords"
      :loading="loading"
      @change="categoryChange"
      @load-list="fetchData"
      @check-list-change="($event)=>{checkList=$event}">
      <template v-slot="{item}">
        <div class="card-item">
          {{ item.name }}
        </div>
      </template>
    </common-collapse>
  </div>
</div>

<script>
  export default {
    data() {
      return {
        // 聚合数据
        categories: [
          {
            count: 1000,
            condition: {},
            displayName: '人脸',
          },
          {
            count: 1,
            condition: {},
            displayName: '人体',
          },
          {
            count: 30,
            condition: {},
            displayName: '车辆',
          },
        ],
        // 列表数据
        list: [],
        // 每页60条
        pageSize: 60,
        // 列表总数
        totalRecords: 0,
        // 当前展开的风琴褶
        nowIndex: 0,
        // 选中的列表
        checkList: [],
        // 加载更多 按钮的 loading 状态
        loading: false,
      };
    },
    methods: {
      categoryChange(nowIndex) {
        if (nowIndex || nowIndex === 0) {
          this.list = []; //置空列表
          this.totalRecords = this.categories[this.nowIndex].count;
          this.fetchData(1, this.pageSize); // 请求第一页数据
        }
      },
      fetchData(pageNo, pageSize) { // 请求数据
        this.loading = true;
        //
        // 请求数据，并更新列表
        //
        this.loading = false;
      }
    }
  }
</script>

```


### 内部分页
此种模式需要传入全量的数据，通过 `:list-fetch="'innerPage'"` 来设置内分页，可以通过 `list-key` 配置列表字段的别名，默认 `listResults`

```html
<div>
  <!-- 风琴褶列表 -->
  <div class="content">
    <common-collapse
      ref="collapse"
      :categories="categories"
      :list-fetch="'innerPage'">
      <template v-slot="{item}">
        <div class="card-item">
          {{ item.name }}
        </div>
      </template>
    </common-collapse>
  </div>
</div>

<script>
  export default {
    data() {
      return {
        // 聚合数据
        categories: [
          {
            count: 1000,
            condition: {},
            displayName: '人脸',
            listResults: [{
              id: '1-1',
              name: '1-1',
            }],
          },
          {
            count: 1,
            condition: {},
            displayName: '人体',
            listResults: [{
              id: '2-1',
              name: '2-1',
            }],
          },
          {
            count: 1,
            condition: {},
            displayName: '车辆',
            listResults: [{
              id: '3-1',
              name: '3-1',
            }],
          },
        ],
      };
    },
  }
</script>

```


### 自定义渲染列表

通过 `list` slot 来对列表进行全量渲染，此方式将失去选择选择功能，及覆盖defaultSlot
```html
<div>
  <!-- 风琴褶列表 -->
  <div class="content">
    <common-collapse
      ref="collapse"
      :categories="categories"
      :list-fetch="'innerPage'">
      <template v-slot:list="{list}">
        <div
          class="card-item"
          v-for="item in list"
          :key="item.id">
          {{ item.name }}
        </div>
      </template>
    </common-collapse>
  </div>
</div>

```


### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| value / v-model  | 绑定值(当前项的 index) | number | —      | 0      |
| categories | 聚合数据 | array | — | - |
| list | 列表数据 | array | — | - |
| page-size | 每页显示的条数 |  number | — | 60 |
| total-records | 列表总数据量 |  number | — | 0 |
| loading | 加载更多按钮的 loading 状态 |  boolean | — | false |
| list-fetch | 获取列表数据的方式 |  String | outer/inner/innerPage  外部/内部全量/内部分页 | outer |
| list-key | 列表数据对应的字段的名称  当listFetch 为outer时无用。 |  string | - | listResults |
| item-key | 选择模式下绑定值对应的每个项的 key， 默认 id。 |  string | - | id |
| show-checkbox | 是否可选 |  boolean | - | true |
| card-min-width | 卡片的最小宽度（像素值） |  number | - | 244 |
| gap | 卡片间距 |  number | - | 6 |
| sticky | 是否吸顶 |  boolean | - | true |
| show-checkbox-animation | 是否显示checkbox的动画效果 |  boolean | - | true |
| default-active-name |  默认展开的风琴褶，此优先级会高于 v-model 绑定的值，**不传的话 默认永远展开第一个** , 注意: 这个数据并不会同步到 v-model 绑定的值上 | Number, String | - | 0 |
| force-select-model | 强制进入选择模式,传入 true 可强制让组件进入选择模式，如果要取消 选择模式，需要调用`cancelSelect`方法同时 手动设置此参数为false | Boolean | - | false |

### Events
| 事件名      | 说明          | 参数      |
|---------- |------------- | ---------- |
| change | 风琴褶发生切换 | (index) (当前index) |
| load-list | 加载更多 | (pageNo, pageSize, activeIndex) (第几页， 页个数, 当前展开的风琴褶index) |
| check-list-change | 选择发生改变 | (checkedKeys, checkedItems, activeIndex) (选中的ids, 选中的项, 当前展开的风琴褶index) 可以以这个长度来判断是否处于选择模式 |


### 方法
| 名称      | 说明          | 参数      |
|---------- |------------- | ---------- |
| cancelSelect | 取消选择 | - |
| setCheckedKeys | 设置选中的项的 ids， 可以传"ALL"表示全选，注意：内部使用 item-key 作为快速查找依据，如果内部有重复的id，如果传的是 id 的数组，则会只选中重复 id 中最后一个 | (ids) |
| setPageNo | 可强制设置内部分页页码，当请求出错时可能会用来退回原来的 pageNo | (pageNo) |
| getCheckedItems | 获取选中的 items | - |
| getCheckedKeys | 获取选中的 keys | - |


### Slots
| 名称      | 说明          | 参数      |
|---------- |------------- | ---------- |
| 默认 | 单个item中间内容 | item |
| list | 整个列表内容，此 slot 存在情况下，默认 slot将无效 | list |
| title | 风琴褶头部内容 | data 当前category的数据 |
