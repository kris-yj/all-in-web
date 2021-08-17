## common-calendar
### 组件说明
`common-calendar`目前仅作为实时任务周期任务显示界面，已参考element-UI重构。

### 基本用法
```
// 使用
<common-calendar>
</common-calendar>
```

### 参数说明
| 参数 | 说明 | 类型 | 可选值 | 默认值 | 备注 |
| :-----------: | :-----------: | :------: | :---------: | :--------: | :---------------------: |
| currentTaskList | 任务列表 | Object | Object | {} | 见如下格式说明 |

格式说明:
```js
currentTaskList: {
  "YYYY-MM-DD": {
    up: Boolean, //上午是否有任务
    bottom: Boolean, //下午是否有任务
    status: 0/1, //任务状态
    hours: [0-23] //任务占用时段
  }
}
```