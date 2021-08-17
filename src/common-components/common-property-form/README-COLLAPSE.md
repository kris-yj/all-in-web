# CollapseProperty 可以收起的表单输入组件

可以收起的表单输入组件


### 基础用法
传入特定格式的选项数组，具体的字段请看下面示例中的注释，不明白的直接问苏天彬，表单内部会把每个表单的值绑定到对应的 item 的 value 字段上。

需要获取值的时候自己去遍历传入的 items 获取，没有事件，可以 watch items 里面的 item 获知改变

```html
<div>
    <collapse-property :items="items"></collapse-property>
</div>

<script>
import { CollapseProperty } from '@/common-components/common-property-form';

const items = [
  {
    attrKey: 'body_text', // 非必须
    name: '编号', // 必须 用于显示 label
    type: 0, // 必须 用于判断表单类型 ，暂时只支持基础表单类型   0-input(如车牌) 1-radio 2-select单选 3-mutiselect多选数组 4-mutitreeselct树形多选数组(还未实现) 5-checkBox 复选组数组 6-车辆品牌
    value: null, // 必须 多选 初始化绑定[] ，其它类型初始化绑定 null 或 ''
  },
  {
    attrKey: 'face_yanjing',
    name: '眼镜',
    type: 2,
    value: null,
    data: [ // 选项
      {
        name: '全部', //选项 label
        code: '', //选项对应的值
      },
      {
        name: '未知',
        code: '-1',
      },
      {
        name: '老花镜',
        code: '0',
      },
      {
        name: '墨镜',
        code: '1',
      },
    ],
    dataMap: { // 用于应对显示到左边，必须，和上面的选项对应
      '0': {
        name: '老花镜',
        code: '0',
      },
      '1': {
        name: '墨镜',
        code: '1',
      },
      '': {
        name: '全部',
        sort: -1,
      },
      '-1': {
        name: '未知',
        code: '-1',
      },
    },
  },
];

export default {
  data() {
    return {
      items,
    }
  }
}
</script>
```
### 升级用法，支持所有表单 slot 化
>使用于特殊表单定制，比如身份证输入框+类型选择、自定义树选择 等情况。
在 item 上增加slot字段，则此 item 在表单中的显示将会以具名 scopedSlot 处理，不会显示成预置表单。 
然后传入具名 slot 即可显示，左侧的选中值的显示还是和原来逻辑一致，对应 type 类型作对应处理，
如果显示逻辑和预置 type 不符，则定义 type:0，并在自定义表单值改变的时候更改此 item 的value值改变成希望显示的文本(自己处理完毕之后赋值)即可显示，此使用方式比较麻烦，有疑问可以咨询苏天彬。

```html
  <collapse-property
    :items="items">
    <!-- 这里的 slot 名称和 item 中定义的一致 -->
    <template v-slot:idCard={item}>
      自定义的组件写在这里
    </template>
  </collapse-property>
```

```js
  {
    slot: 'idCard',
    formItemClass: '自定义的该表单外层 class',
    attrKey: 'cardNo',
    name: '证件号',
    type: 0, 
    value: null, 
  }
```
### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
|  items | 选项 |   Array | — | [] |