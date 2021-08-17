# CommonPropertySetter 属性自定义设置组件

通过数据字典中的属性，完成表单的自定义，及表单的动态显示

:::warning
当前属性来自于 mook 数据，等正式联调的时候，再换成联调地址。
:::

### 基础用法
属性请求已内置，只需要直接使用即可，

提供两个方法，getProperties获取选中的项，setProperties设置当前选中的项

```html
<div>
    <common-property-setter></common-property-setter>
</div>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| show-plate-text | 是否显示车牌号输入组件的提示文字 | boolean | — | true |


### Methods
| 方法名      | 说明          | 参数      |
|---------- |------------- | ---------- |
| getProperties | 获取选中的项 | - |
| setProperties | 设置选中的项，用于编辑的时候，不传参数则表示清空设置项 | (properties)设置的具体选中项，{attrKey_父级code:value, 'face_gender_0': '0'} 形式的键值对（因为attrKey可能一样，比如车牌号，所以带上父级code） |