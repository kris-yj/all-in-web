# LicensePlate 车牌组件

## 全局通用的车牌展示组件

### 基础用法

通过`plateNumber`控制号码，通过`plateType`控制车牌类型,size 可以传`string` 目前仅支持 `small`，或者可以传入`object`,仅支持一下5个参数
`{
  font-size: 12px, // 控制车牌字体大小
  height: 12px, // 控制车牌高度
  width: 12px, // 控制车牌宽度
  left: 12px, // 控制复制按钮左侧距离
  line-height: 12px, // 控制复制按钮行高
}`

```html
<div>
    <license-plate
      plate-number="粤BF12345"
      row="one_row"
      plate-type="small-new-energy"/>
</div>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| plate-number | 车牌号码 | string | — | - |
| plate-type | 车牌类型 | string | — | - |
| can-copy | 是否可以复制 | boolean | true/false | false |
| size | 车牌类型 | string/object | — | - |
| row | 车牌号行数 | string | one_row/two_rows | one_row |
