### 抓拍详情

------

检索模块，实时报警跑马灯抓拍详情

#### 基础用法


```html
<capture-detail
    :visible="visible"
    :result-list="list"
    :index="index"
    :upload-list="uploadList"
    @close="visible=false"></capture-detail>
```

#### Attributes

| 参数        | 说明                                         | 类型    | 默认值 | 可选值     |
| ----------- | -------------------------------------------- | ------- | ------ | ---------- |
| upload-list | 以图搜图时的上传图片列表                     | Array   | ——     | ——         |
| result-list | 轮播列表 检索结果的records                   | Array   | ——     | ——         |
| index       | 当前选中项                                   | Number  | ——     | ——         |
| visible     | 详情dialog是否可见                           | Boolean | false  | true/false |
| id          | 实时报警使用时不需要轮播只需要传抓拍id即可   | Number  | ——     | ——         |
| hide-swiper | 是否隐藏轮播，隐藏时只显示加入移出暂存架按钮 | Boolean | false  | true/false |
| show-temporary | 是否显示 加入/移出暂存架标识 | Boolean | true  | true/false |
| feaker | 在线索库时使用假抓拍接口 | Boolean | false  | true/false |
| cascade | 级联检索定制 | Boolean | false  | true/false |
| searchId | 级联检索id | String | ''  | —— |
| cascadeNodeRegId | 多级节点ID | '' | false  | —— |

#### Events

移出暂存架时 触发remove-temporary 回调参数 index 为轮播图index