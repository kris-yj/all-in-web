### 抓拍详情

------

检索模块，实时报警跑马灯抓拍详情

#### 基础用法


```html
<common-database-detail
    :visible="visible"
    :result-list="list"
    :index="index"
    @close="visible=false"></common-database-detail>
```

#### Attributes

| 参数        | 说明                                         | 类型    | 默认值 | 可选值     |
| ----------- | -------------------------------------------- | ------- | ------ | ---------- |
| result-list | 轮播列表 检索结果的records                   | Array   | ——     | ——         |
| index       | 当前选中项                                   | Number  | ——     | ——         |
| visible     | 详情dialog是否可见                           | Boolean | false  | true/false |
| appenToBody     | 透传dialog属性modal-append-to-body，append-to-body | Boolean | false  | true/false |
| showTemporary     | 是否显示加入暂存架 | Boolean | true  | true/false |

