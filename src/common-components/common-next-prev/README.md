# CommonNextPrev 上一个下一个切换组件

支持 按钮及文字格式，中部内容为 slot


### 基础用法

通过`v-model`绑定当前项`index`, 通过 `total` 设置总数，通过`height`设置组件高度

```html
<div>
  <common-next-prev
    v-model="nowIndex"
    :total="5">
    <div style="color:#fff">中间内容</div>
  </common-next-prev>
</div>
```

### 左右按钮配置

通过`show-text`显示左右按钮为带文字按钮，也可以通过 slot 配置切换按钮

```html
<div>
  <common-next-prev
    v-model="nowIndex"
    :total="5"
    :show-text="true">
    <div style="color:#fff">中间内容</div>
  </common-next-prev>
</div>
```

### Attributes

| 参数 | 说明               | 类型   | 可选值 | 默认值 |
| ---- | ------------------ | ------ | ------ | ------ |
| value / v-model  | 绑定值(当前项的 index) | number | —      | 0      |
| total  | 总数(用于计算是否禁用切换按钮) | number | —      | 0      |
| show-text  | 显示左右按钮为带文字按钮 | boolean | —      | false      |
| height  | 整体高度 |  number | —      | 80      |


### Events
| 事件名      | 说明          | 参数      |
|---------- |------------- | ---------- |
| change | 发生切换 | (index,direction) (当前index,  上一页'prev'/下一页'next') |


### Slots
| 名称      | 说明          | 参数      |
|---------- |------------- | ---------- |
| 默认 | 中间内容 | - |
| prev | 上一个按钮区域 | - |
| next | 下一个按钮区域 | - |