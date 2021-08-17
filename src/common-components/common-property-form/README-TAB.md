# PropertyTab 属性切换

切换属性类型的 tab,当前只用于 `common-property-form` 和 `common-property-setter`两个组件，其它地方如果有需要，可能需要定制样式


### 基础用法
通过`v-model`绑定值， 通过 `horizontal`设置 tab 横向排列 ，通过 `items` 传入 选项

```html
<div>
    <property-tab
      v-model="nowType"
      :items="allProperties"></property-tab>
</div>
<script>
import { PropertyTab } from '@/common-components/common-property-form';
</script>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| value / v-model  | 绑定值(数据字典对应的属性类型的code) | number | —      | 0      |
| horizontal | 设置 tab 横向排列 |  Boolean | — | false 纵向排列 |
| items | 选项 示例[{ code: 'ALL', id: 'ALL', name: '全部'}] code 对应v-model, id 对应 icon, name 显示文字 |  Array | — | [] |