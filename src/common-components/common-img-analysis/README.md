### ImgAnalysis图片上传裁切组件

------

全目标识别，目标选择，图片裁切等

#### 组件功能

1. 人脸，人体，机动车，非机动车 目标识别，选择
2. 画像识别
3. 历史上传中选取进行analyze
4. 展开一键布控dialog并携带上传框内图片信息
5. 各模块携图跳转

#### Attributes

| 参数                  | 说明                                                         | 类型    | 可选值        | 默认值                                                |
| :-------------------- | :----------------------------------------------------------- | :------ | :------------ | :---------------------------------------------------- |
| init-file             | 传入图片数据 | Array   | —             | []                                                    |
| drop-file             | 传入单个图片数据 | Object  | —             | {}                                                  |
| max-img-num           | 组件图片数量最大值                                           | Number  | 1/3           | 3                                                     |
| input-num             | 是否显示输入身份证号码框                                     | Boolean | true/false    | false                                                 |
| value                 | 身份证号码输入框的默认值                                     | String  | —             | ""                                                    |
| bottom-height         | 底部滑出条高度                                               | String  | —             | "45px"                                                |
| font-size             | 底部滑出条字体大小                                           | String  | —             | "12px"                                                |
| selector-mode         | 裁切选择组件模式，单选或多选      | String  | "multi"/"single" | "multi"                                           |
| analyze-type | 识别目标参数 0 人脸 1 人体 6 非机动车 5 机动车 | Array | [0, 1, 5, 6] | [0, 1, 5, 6] |
| shield-upload | 屏蔽原有的上传并触发upload-click事件 | Boolean | true/false | false |
| upload-prompt-text    | 组件底部提示话术                                             | String  | —             | "拖拽或点击上传人像"                                  |
| default-show-selector | 上传后默认打开裁切                                           | Boolean | true/false    | false                                                 |
| from-history          | 是否显示历史上传功能                                         | Boolean | true/false    | true                                                  |
| jump-visible          | 是否显示携图跳转按钮                                         | Boolean | true/false    | false                                                 |
| bottom-prompt-text    | 底部滑出条提示话术                                           | String  | —             | "从上传记录选择"                                      |
| accept-img-type       | 上传组件接受的图片文件类型                                   | Array   | —             | ['image/png', 'image/bmp', 'image/jpg', 'image/jpeg'] |
| scale           | 上传图展示时的扩大系数(0.46大约是原rect大小)仅展示用，不会改变裁切后图片大小 | Object | —             | { widthScale: 0.46, heightScale: 0.46 }              |
| background | 自定义展位图,face为人脸图，all为全目标图，同时可以传入图片使用自定义占位图 | String | "all"/"face" | "all" |
| slot-on | 单选模式下选中人体时启用slot | Boolean | true/false | false |
| low-quality-available | 低质量是否可以选中 | Boolean | true/false | true |
| enlarge | 扩大rect 大于1扩大，小于1缩小，不同于以上scale，该属性会改变裁切后图片大小 | Number | — | 1 |
| pass | 裁切弹窗点击确定后是否继续进行 | Boolean | true/false | true |
| showQuality | 是否显示低质量（默认只有人脸显示） | Boolean | true/false | false |
| showLicensePlate | 是否显示车牌号 | Boolean | true/false | true |

#### Events

| 事件名称     | 说明                                                         | 回调参数      |
| ------------ | ------------------------------------------------------------ | ------------- |
| upload-click | 当shield-upload为true时会屏蔽上传事件并在点击上传框时触发该事件 |               |
| output       | 选定数据变化时触发，重置组件和删除图片也会触发该事件         | 图片信息数组  |
| input        | 向外派发身份证号输入框的数据                                 | input框内数据 |
| confirm      | 裁切弹窗点击确定后触发 可以通过改变pass来控制是否进行进一步操作 |               |
| initDone      | 携图跳转后initFile或dropFile后初始化数据完成后触发 |               |

#### Function

| 方法名称    | 说明                                                         | 参数       |
| ----------- | ------------------------------------------------------------ | ---------- |
| reset       | 组件内提供reset方法，用于重置组件数据                        |            |
| getFileList | 组件内提供用于获取组件数据的方法，默认return全量数据，传入true时return已选择部分数据 | true/false |



#### 注意事项

##### 一、关于组件的数据输入

initFile与dropFile分别为数组和对象，对应多条数据和单条数据的输入，用于在不同情况下使用

```javascript
[{
    photo: String, // 必须 图片的数据信息，为base64格式或url
    couldEdit: Boolean, // 非必须 图片是否可打开裁切编辑 默认true
    goAnalyze: Boolean, // 非必须 图片是否需要经过接口识别目标
    images: [ // 非必须 图片内数据 数组
        {
            detectType: Number, // 必须 数据类型 0 人脸 1 人体 5 非机动车 6 机动车 4 画像
            feature: Object, // 非必须 数据feature
            locator: {
                hint: Object, // 非必须 数据hint
                landmark: Object, // 非必须 数据landmark
                rect: Object // 必须 数据rect
            }
        }
    ],
    extra: Any // 自定义属性 可以根据需要传入自定义字段 在后续取值时使用
}]
```

手动传入需要经过接口识别的图片时只需要传入photo即可例如：

```javascript
{
    photo: String // 图片base64信息
}
```

可以添加自定义属性字段

```javascript
[{
    photo: String, // 必须 图片的数据信息，为base64格式或url
    couldEdit: Boolean, // 非必须 图片是否可打开裁切编辑 默认true
    goAnalyze: Boolean,
    extra: Any, // 自定义字段
    images: [...]
}]
```



##### 二、关于组件的数据输出

输出数据格式与上述类似，关键信息如下所示

```javascript
[{
    photo: String, // 图片的数据信息，为base64格式
    black: Boolean, // 是否黑白图
    images: [ // 图片内数据 数组
        {
            base64: String // rect框对应图片的base64
            detectType: Number, // 数据类型 0 人脸 1 人体 5 非机动车 6 机动车 4 画像
            feature: Object, // 数据feature
            hasCoordinate: Boolean, // 是否手动标点（只有人脸可以标注）
            coordinate: Object, // 当hasCoordinate为true时会有标注信息
            locator: {
                hint: Object, // 数据hint
                landmark: Object, // 数据landmark
                rect: Object // 数据rect
            },
            pass: Number // 质量 1高质量 0低质量
        }
    ],
    extra: Any, // 自定义字段
}]
```

##### 三、关于组件的拖拽接受文件

组件内部会从dataTransfer的draggingData中解构出photoData作为数据传入组件使用，photoData格式与dropFile相同 为对象

```javascript
const { photoData } = JSON.parse(e.dataTransfer.getData('draggingData'));
```

