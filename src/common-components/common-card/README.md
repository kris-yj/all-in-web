# CommonCard 检索卡片展示


```html
 <meg-card-frame
    :gap="6"
    :card-min-width="262">
    <common-card
      v-for="(item, ind) of captureData"
      :card-data="item"
      :key="ind">
    </common-card>
  </meg-card-frame>
```
### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| isShowThreadButton | 是否显示加入线索库按钮 | Boolean | false | |
| cardData | 卡片数据 | Object |  | |
| draggable | 是否允许拖拽 | Boolean |  | |
| isShowBaseButton | 暂存架&携图跳转按钮 | Boolean |  | |
| isShowDelButton | 删除跳转按钮 | Boolean |  | |
| draggingData | 拖拽时携带的额外数据，只需传入key值 | Array | —— | [] |
| temporariesParams | 根据需要可以控制 加入/移出暂存架时的参数 | Object | —— | {} |

### Slot

| 参数      | 说明               |
| --------- | ------------------ |
| right-msg | 卡片右边msg覆盖    |
| btns      | 按钮扩展           |
| checkbox  | 自定义checkbox扩展 |
| bottom    | 卡片下方msg覆盖    |



