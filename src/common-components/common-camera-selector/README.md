## 相机选择组件

按照现有交互，对相机选择做通用处理

## 参数

- defaultParams: 获取相机树的默认参数
- defaultIds：默认选择中相机的id数组
- defaultSelectAll: 默认全选， 与defaultIds冲突,两者中只能选一个
- mode: 是否展示地图icon
- mapIconPosition: 地图icon的展示位置[top, right],默认为top
- clearable：是否展示清除按钮
- disabled: 是否禁止选择
- cameraDataFunc: 修改内部获取相机树的函数

  ```html
  <camera-select map-icon-position="right"></camera-select>
  ```

- clearable：是否展示清除按钮
- disabled: 是否禁止选择

## 事件

- change: 返回选中的相机id
- cameras-updated: 返回所有的相机数据
- update-ready: 相机树渲染完成

## 方法

- reset: 重置
- getCheckedNodes: 获取选中的相机节点
## 只使用相机过滤标签

```html
<template>
 <camera-selector>
   <template v-slot:filter={filterCondition}>
     <filter-form :filterCondition></filter-form>
   </template>
 </camera-selector>
</template>
```
