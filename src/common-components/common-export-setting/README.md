# ExportSetting 导出设置套件

导出设置套件包含三个可用组件：

- **ExportSettingButton** 导出设置按钮UI组件
- **exportSettingBox** 导出设置弹窗方法
- **ExportSettingManager** 导出设置管理器，用于直接集成在项目中管理导出设置

---

## 1.ExportSettingButton 使用方法

引入组件

```js
import { ExportSettingButton } from '@/common-components/common-export-setting';
```

```html
<div>
  <export-setting-button
    type="primary"
    disabled="false"
    button-text="导出"
    dropdown-text="导出设置"
    @click-export="onClickExport('export')"
    @click-setting="onClickExport('setting')">
  </export-setting-button>
</div>
```

### Attributes

| 参数          | 说明                       | 类型    | 可选值 | 默认值     |
| ------------- | -------------------------- | ------- | ------ | ---------- |
| type          | 按钮风格类型，同meg-button | string  | —      | 'default'  |
| disabled      | 是否禁用                   | boolean | —      | false      |
| button-text   | 主按钮文本                 | string  | —      | '导出'     |
| dropdown-text | 下拉按钮文本               | string  | —      | '导出设置' |

### Events

| 事件名        | 说明             | 参数 |
| ------------- | ---------------- | ---- |
| click-export  | 点击导出按钮     | -    |
| click-setting | 点击导出设置按钮 | -    |

---

## ExportSettingBox 使用方法

`exportSettingBox`提供的是一个命名空间，其中包含一个方法`showSettingMessageBox()`，调用该方法,传入指定的参数后，返回一个`Promise`对象，通过`resolve`回调获取确认选择后的参数，通过`reject`回调进行取消选择下操作

```js
import { exportSettingBox } from 'export-setting';

exportSettingBox.showSettingMessageBox({
  remained:[],
  chosen:[],
  category:false
}).then(
  ([chosenItems,remainedItems])=>{
    // 处理当前的选择项，和保留项
  },
  ()=>{
    // 取消导出
  }
)
```

### 调用参数

方法名 **showSettingMessageBox**
方法调用参数包含如下参数：

#### remained

- 说明：保留字段值列表
- 类型：`Array<RemainedItem>|Array<{value:string}>`

> `category`为`false`时，可以直接传入`Array<{value:string}>`
> `category`为`true`时,每一个`RemainedItem`至少包含两个字段：

- name: `string` 字段归属的类别名称
- list: `Array<{value:string}>` 类别所含的字段列表，其中每一项至少含有value字段作为名称

#### chosen

- 说明：选中字段值列表
- 类型：`Array<ChosenItem>|Array<{value:string}>`

> `category`为`false`时，可以直接传入`Array<{value:string}>`
> `category`为`true`时,每一个`ChosenItem`至少包含两个字段：

- name: `string` 字段归属的类别名称（category为false时，可以没有此字段）
- value: `{value:string}` 字段详情，其中至少含有value字段作为名称

category:

- 说明: 导出字段是否有分类(一般场景下均没有分类)
- 类型: `Boolean`
- 默认值: `false`

---

## ExportSettingManager 使用方法

`ExportSettingManager`是一个高度集成的类,整合了业务中对导出设置的一系列固定操作，可以开箱即用

```js
import { ExportSettingManager } from 'export-setting';

// 初始化实例
const exportSettingManger = new ExportSettingManager('alarm-realtime', 'alarm_export_column');
// 设置导出设置 (打开导出设置弹窗)
await exportSettingManger.setExportSetting()
// 获取导出设置项
exportSettingManger.getExportSetting()
// 获取导出设置code码
exportSettingManger.getExportFiledCode()
```

### 实例方法

#### 构造函数 constructor(storeInstance, storeName, presetName, fieldInCategory = false)

- storeInstance: `Vue Store` 当前store实例，一般传入当前上下文的store实例`this.$store`
- storeName: `string` 本地存储使用的key值，一般会使用该key经过构造后存储在localStorage中
- presetName: `string` 从字典表读取预设的key值，根据不同的业务获取不同的字典表字段，常见值如下
- fieldInCategory: `boolean` 字段是否区分类型(同上)

presetName 已有的值(不全，请根据实际业务场景选择)

| key值                                | 业务场景 |
| ------------------------------------ | -------- |
| alarm_export_column                  | 报警     |
| cascade_alarm_export_column          | 级联报警 |
| capture_export_column                | 抓拍     |
| search_export_column                 | 人脸检索 |
| body_search_export_columns           | 人身检索 |
| region_album_collision_export_column |          |
| collision_export_column              |          |
| profile_analyze_export_column        |          |
| galaxy_camera_export_column        |          |
| kunlun_camera_export_column        |          |

#### extentChosen(item) 扩展选择字段

- item: 同chosen类型

#### extentRemained(item) 扩展保留字段

- item: 同remained类型

#### setExportSetting() 设置导出字段，异步方法，等待完成需要await

#### getExportSetting() 获取导出字段信息

#### getExportFiledCode() 获取导出字段的code码
