# CommonSwiper 业务样式轮播组件

## 基础用法

通过`v-model`绑定当前项`index`, 通过 `data-list` 传入列表，通过 slot 显示 item，slot 参数包括(data, index, active)

```html
<common-swiper
  :data-list="dataList"
  v-model="index">
  <template v-slot="{data, index, active}">
    <div
      class="item">
      {{ data.name }}
    </div>
  </template>
</common-swiper>
```

### Attributes

| 参数 | 说明               | 类型   | 可选值 | 默认值 |
| ---- | ------------------ | ------ | ------ | ------ |
| value / v-model  | 绑定值(当前项的 index) | number | —      | 0      |
| data-list  | 列表数据 |  array | —      | 0      |
| space-between  | item 之间间距 | number | —      | 10      |
| height  | 轮播高度 | number | —      | 136      |
| per-view-num  | 每屏多少个子项 | number | —      | 136      |
| item-style  |  子项外层标签的样式 | object | —      | 136      |
| item-key  |  节点 key(比如'id'),作为 item 更新的依据，不传，则以 index 为 key，如果出现切换之后稍 ui 视觉上 微抖动的情况，传入 item-key 即可解决 | object | —      | -      |

### Events

| 事件名      | 说明          | 参数      |
|---------- |------------- | ---------- |
| change | 发生切换 | (index,item) (当前index, 传入list中的当前项) |

### Methods

|  方法名      | 说明          | 参数      |
|---------- |------------- | ---------- |
| initSwiper | 特殊情况需要重置swiper 的，可以调用此方法 | - |
