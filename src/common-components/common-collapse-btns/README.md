# CommonCollapseBtns 收起按钮

当内部按钮个数超过n 个的时候，自动收起多余按钮为下拉展示

:::warning
组件值支持对 `v-if` 隐藏的动态个数判断，使用 `v-show` 无效。
:::

### 基础用法
通过`max`配置最多显示多少个按钮, 如果需要动态隐藏部分按钮，通过 `v-if` 显示隐藏内部按钮

```html
<div>
    <common-collapse-btns :max="3">
      <meg-button
        type="text"
        v-if="true">
        编辑
      </meg-button>
      <meg-button type="text">
        删除
      </meg-button>
      <meg-button type="text">
        解析
      </meg-button>
      <meg-button type="text">
        检索
      </meg-button>
    </common-collapse-btns>
</div>
```

### Attributes
| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| max | 最多显示多少个按钮 | number | — | 3 |