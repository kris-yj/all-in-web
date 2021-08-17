# common-file-selector

## 组件说明

`common-file-selector`作为全局文件选择组件。

## 基本用法

```javascript
// 使用
<common-file-selector>
</common-file-selector>
```

## 参数说明

| 参数 | 说明 | 类型 | 可选值 | 默认值 | 备注 |
| :-----------: | :-----------: | :------: | :---------: | :--------: | :---------------------: |
| fileListGetter | 获取文件列表的server | Function | Function | undefined | - |
| taskListGetter | 获取任务列表的server | Function | Function | undefined | - |
| defaultCheckedAll | 是否默认选中所有文件 | Boolean | true/false | true | - |

## 事件说明

| 事件名称 | 说明 | 参数 |
| :------: | :------------: | :------------------: |
| tree-update-ready | 树节点渲染完成触发 | 一个参数：全部的节点数据 |

## 方法说明

| 事件名称 | 说明 | 参数 |
| :------: | :------------: | :------------------: |
| getSelectedKeys | 获得选中的数据 | Array |
| setCheckedKeys | 设置选中的数据 | Array |
