# CommonPropertyForm 可以收起的属性归类表单

一般用于属性检索的检索条件


### 基础用法
默认 tab 在左侧纵向排列，通过 `tab-horizontal`设置 tab 在顶部横向排列 ，通过默认 `slot` 传入 类型切换 tab 和 属性之间的内容

```html
<div>
    <common-property-form :tab-horizontal="true" :default-type="'ALL'">
      <p>中间额外内容</p>
    </common-property-form>
</div>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| tab-horizontal | 设置 tab 在顶部横向排列 |  Boolean | — | false |
| default-type | 设置 tab 当前项，值对应目标类型，全部为'ALL' |  Boolean | — | 0 |
| getProperties | 获取当前tab下的所有选项，可以通过对应 value 获取值 | - |
| setProperties | 设置选中的项，用于编辑的时候，不传参数则表示清空设置项 | (properties)设置的具体选中项，{attrKey_父级code:value, 'face_gender_0': '0'} 形式的键值对（因为attrKey可能一样，比如车牌号，所以带上父级code） |