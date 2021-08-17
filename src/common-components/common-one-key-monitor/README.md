# CommonOneKeyMonitor 一键布控

## 全局通用的一键布控

### 基础用法

外部传入一键布控所需信息`photo-url`, `photo-type`

```html
<div>
    <one-key-monitor
      @close="show = false"
      v-if="show"
      photo-url="http://img4.imgtn.bdimg.com/it/u=1758721750,412811934&fm=26&gp=0.jpg"
      photo-type="1"></one-key-monitor>
</div>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| photo-url | 布控图片路径 | string | — | - |
| photo-type | 布控图片类型 | [number,string] | 脸人机非（1-人脸 2-人体 3-机动车 4-非机动车 5-机动车车牌 6-非机动车车牌） | - |
| append-to-body | 是否插入body(遮罩层同步操作) | Boolean | — | true |

---

### Events

| 事件名           | 说明           | 参数  |
| ------------- |:-------------:| -----|
| close | 弹窗被关闭时触发 |  |

---
