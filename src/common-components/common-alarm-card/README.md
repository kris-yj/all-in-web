# CommonAlarmCard 报警卡片

## 全局通用的报警卡片组件

### 基础用法

外部传入报警卡片所需信息`card-info`, `draggable`控制卡片是否可以拖拽,卡片宽高由外部控制

```html
<div>
    <alarm-card
      :draggable="true"
      :card-info="cardInfo"></alarm-card>
</div>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| card-info | 卡片信息 | object | — | - |
| draggable | 是否可以拖拽 | boolean | — | false |
| show-store-icon | 是否显示加入暂存架图标 | boolean | — | true |
| show-delete-icon | 是否显示删除图标 | boolean | — | false |
| left-img-draggable | 左侧图片是否支持拖拽(抓拍图和全景图都有的情况下) | boolean | true/false  | true |
| right-img-draggable | 右侧图片是否支持拖拽(抓拍图和全景图都有的情况下) | boolean | true/false  | true |
| show-process-status | 是否显示处理状态 | boolean | true/false  | true |
---

### Events

| 事件名           | 说明           | 参数  |
| ------------- |:-------------:| -----|
| click | 卡片被点击时触发 | 一个参数,卡片数据（就是传入的cardInfo） |
| delete | 卡片点击删除按钮时触发 | 一个参数,卡片数据（就是传入的cardInfo） |

---

drag的数据通过e.dataTransfer.getData('draggingData')可获取到拖拽的卡片的源数据(已转化为 String 类型) `{ type: 'alarm', data: this.cardInfo }`
