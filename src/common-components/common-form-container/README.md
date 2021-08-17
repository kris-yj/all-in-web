# CommonFormContainer 公共左侧检索容器

符合UI规范的左侧检索区域容器，分为header, searchOperate, formOperate上中下3部分，每一部分可以自定义显隐；

### 基本用法

```html
<common-form-container>
  <template slot="header">
    <meg-icon name="search"></meg-icon>
    查询检索
  </template>
  <meg-form>
    <meg-form-item></meg-form-item>
  </meg-form>
</common-form-container>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| showHeader | 是否显示header | boolean | - | true |
| showSearchOperate | 是否显示查询控制 | boolean | - | true |
| headerText | 页面名称 | string | - | |
| prompt | 查询控制区的提示文案 | string | - | 检索条件 |
| buttonText | 查询按钮文案 | string | - | 检索 |
| contentStyle | 内容去样式 | object | - | { 'padding': '20px 25px 0px 25px' } |

### Slots
| 名称      | 说明         |
|---------- |-------------|
| header | 页面标题 |
| title  | 查询区域title |
| default | 表单项 |

### Events
| 名称      | 说明         |
|---------- |-------------|
| search | 检索事件 |
| reset  | 重置事件 |