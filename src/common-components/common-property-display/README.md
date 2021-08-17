### 属性显示组件

------

根据字典翻译传入的属性，并展示

#### 基本用法

```javascript
<common-property-display
    :detect-type="detectType"
    :properties="properties"></common-property-display>
```

#### Attributes

| 参数        | 说明                                      | 类型   | 默认值 | 可选值  |
| ----------- | ----------------------------------------- | ------ | ------ | ------- |
| detect-type | 目标类型（0人脸 1人体 5机动车 6非机动车） | Number | 0      | 0/1/5/6 |
| properties  | 要展示的属性                              | Object | ——     | ——      |

