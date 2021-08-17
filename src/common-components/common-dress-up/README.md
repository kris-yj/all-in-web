# CommonDressUp 画像工具

直接从灵探2.0迁移的画像工具，代码设计比较早，暂时先直接迁移，后续有时间了再重构


### 基础用法


```html
<div>
    <common-dress-up ></common-dress-up>
</div>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| add-templates | 在默认模板中添加的可供选择的模板 | Array | — | [] |


### Events
| 事件名      | 说明          | 参数      |
|---------- |------------- | ---------- |
| delete-one-template | 删除模板事件 | (item) ( 模板 item) |

### 方法
| 名称      | 说明          | 参数      |
|---------- |------------- | ---------- |
| getDownloadImageData | 获取base64图片 | - |
| getTemplateImageData | 获取保存模板的图层数据 | - |
| saveHistoryInStorage | 保存本地草稿 | - |

### Slots
| 名称      | 说明          | 参数      |
|---------- |------------- | ---------- |
| btns | 可以添加操作按钮， 位置在 下载 后面 | - |