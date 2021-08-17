# CommonAlarmDetail 报警详情

## 全局通用的报警详情

### 基础用法

外部传入报警详情所需信息`alarmId`,

```html
<div>
    <alarm-detail
      :alarm-id="true"
      :index="index"
      :total="list.length"
      @change="onChange"></alarm-detail>
</div>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| alarm-id | 报警id | string | — | - |
| total | 报警列表总数量 | Number | — | 0 |
| index | 当前报警下标 | Number | — | 0 |
| append-to-body | 是否插入body(遮罩层同步操作) | Boolean | — | true |

---

### Events

| 事件名           | 说明           | 参数  |
| ------------- |:-------------:| -----|
| close | 详情被关闭时触发 |  |
| change | 详情内点击上一个下一个时触发 | `(index, direction)` 共两个参数,依次为下一个需要展示的报警的下标 以及 上一页'prev'/下一页'next'|
| update | 报警详情处理状态更新时 | `({ id:alarmId,index:index } , processStatus)` 共两个参数 依次为 发生状态更新的报警的id以及下标 和 更新后状态  |
| temp-change | 暂存状态状态更新时 | `(index,status) number,number` 共两个参数 依次为 发生状态更新的报警的id以及下标 和 更新后状态(0代表移出，1代表加入)  |

---
