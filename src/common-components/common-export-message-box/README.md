# ExportMessageBox 导出弹框

按不同维度导出时，会根据不同类型弹出不同类型的弹窗。该组件统一抽象该逻辑，将其封装为一个方法，减少组件集成的复杂度。

## 基础用法

引入该方法后，直接调用`showExportMessageBox()`方法，传入指定的参数后，返回一个`Promise`对象，通过`resolve`回调获取确认选择后的参数，通过`reject`回调进行取消选择下操作

```js
import exportMessageBox from 'export-message-box';

// 时间类型选择
exportMessageBox.showExportMessageBox({
  type:'time',
  title:'按时间选择',
  tips:'（最多支持导出1000条）',
  selects:[Date.now(),Date.now()]
}).then(
  (select)=>{
    // 根据选择条件进行导出操作
  },
  ()=>{
    // 取消导出
  }
)

// 阈值选择
exportMessageBox.showExportMessageBox({
  type:'threshold',
  title:'按阈值选择',
  selects:60
}).then()

// 列表或者多阈值
exportMessageBox.showExportMessageBox({
  type:'multiThreshold',
  title:'按多阈值选择',
  selects:[
    { label: '人脸相似度', value: 60 },
    { label: '人体相似度', value: 60 }
  ]
}).then()
// 如果要隐藏某特项，可设置 hidden 属性，比如 { label: '人脸相似度', value: 60， hidden: true }

```

## 调用参数

方法名 **showExportMessageBox**  
方法调用参数包含如下参数：

type:

- 说明：目前支持四种维度类型的导出弹窗，通过`type`参数决定
- 类型：`'time' | 'threshold' | 'multiThreshold' | 'list'` 对应时间类型，阈值类型，多阈值类型，列表类型

title:

- 说明：弹窗顶部的标题,默认值根据type不同分别为`按时间导出`，`按阈值导出`，`按地点导出`，如果传入该值则覆盖默认值
- 类型：`string`

tips:

- 说明：弹窗顶部的提示说明
- 类型：`string`

selects:

- 说明：根据不同维度，传入的可选择项不同

当type为`time`时,传入selects的类型为起止时间(时间戳)范围`[number,number]`  
当type为`threshold`时,传入selects的类型为阈值的起始值`number`  
当type为`multiThreshold`时,传入selects的类型为`Array<{label:string,value:number}>`,其中label为阈值项的名称,value为该项默认阈值
当type为`list`时,传入selects的类型为数组`Array<{label:string,value:any}>`,其中label为列表项的展示名称,value为选择的实际值
