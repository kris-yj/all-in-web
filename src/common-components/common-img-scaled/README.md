# CommonImgScaled 查看大图

查看大图，包括查看单张大图和两张比对、图片裁剪等功能；

## 基本用法

```html
<template>
<common-img-scaled
  v-model="visible"
  :imgs-src="imgsSrc"
  :left-img-rect="leftRect"
  :right-img-rect="rightRect">
</common-img-scaled>
</template>

<script>
export default {
  data() {
    return {
      visible: true,
      imgsSrc: [
        'img-src1',
        'img-src2',
      ],
      leftRect: {
        heightPixels: 93,
        leftPixels: 152,
        topPixels: 81,
        widthPixels: 93
      },
      rightRect: {
        heightPixels: 73,
        leftPixels: 152,
        topPixels: 81,
        widthPixels: 33
      }
    };
  }
};
</script>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| v-model | 是否可见 | boolean | - | false |
| compareScore | 比对得分 | number, string | - | 0 |
| imgsSrc | 图片地址 | array | - | [] |
| leftImgRect | 左边图片的裁切框 | object | - | {} |
| rightImgRect | 右边图片的裁切框 | object | - | {} |
| isAllScaledShow | 是否显示同时缩放 | boolean | - | true |
| isSingleScaledShow | 是否显示单独缩放 | boolean | - | true |

### Slots

| 名称     | 说明          |
|---------|---------------|
| comparePrompt | 比对结果 |
