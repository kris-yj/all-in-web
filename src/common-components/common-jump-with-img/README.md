# CommonJumpWithImg 携图跳转

## TargetList 下拉面板，用法与CommonJumpWithImg大体一致

目标页面需要调用common-switch-params里的getOriginalQuery方法来解析携带的参数，解析后的数据里的jumpWithImgInfo字段即是携图跳转带的数据

```js
import commonSwitchParams from '@/common-components/common-switch-params';

commonSwitchParams
.getOriginalQuery(this.$route.query)
.then((params) => {
  if (params.jumpWithImgInfo) {
    // 处理携图跳转带过来的参数
  }
});
```

### 基本用法

```html
<template>
<common-jump-with-img
  :params="params">
</common-jump-with-img>
</template>
```

params包括：

* id: 非必须，底库图必传，关联图、抓拍图可选，传coreid
* type: [], 非必须，抓拍图、全景图需调分析接口获取type，人脸：0/人体：1/机动车：5/非机动车：6
* genre: **必须**，图片类型，抓拍图：0/底库图：1/关联图：2/全景图：3/上传图：4
* source: **必须**，图片来源：报警:0/其他:1
* photo: **必须**，图片
* capturedTime, 非必须，全域追踪：抓拍、报警必传 抓拍时间
* cameraId 非必须，全域追踪：抓拍、报警必传 抓拍地点

### 一键布控、一键比对、加入底库

```html
<template>
<common-jump-with-img
  :params="params"
  :do-deploy="doDeploy"
  :append-album="appendAlbum"
  @handle-compare="handleCompare">
</common-jump-with-img>
</template>

<script>
export default {
  data() {
    return {
      params: {},
      doDeploy: {}, // 一键布控
      appendAlbum: {} // 加入底库
    }
  },
  methods: {
    handleCompare() {
      console.log('一键比对');
    }
  }
}
</script>
```

### 自定义选项

```html
<template>
<common-jump-with-img
  :params="params"
  :next-items="nextItems"
  >
</common-jump-with-img>
</template>

<script>
export default {
  data() {
    return {
      params: {},
      nextItems: [
        name: '这是自定义的',
        handle() {
          console.log('do sth...');
        }
      ]
    }
  }
}
</script>
```

### 携带额外的query参数

```html
<template>
<common-jump-with-img
  :params="params"
  :extraQuery="extraQuery"
  >
</common-jump-with-img>
</template>

<script>
export default {
  data() {
    return {
      params: {}
    }
  },
  methods: {
    extraQuery(alias) {
      if (alias === 'peer') {
        return {
          a: 1,
          b: 2
        };
      }
    }
  }
}
</script>
```

### 自定义每一项的处理方法

```html
<template>
<common-jump-with-img
  :params="params"
  :handleJumpMap="handleJumpMap"
  >
</common-jump-with-img>
</template>

<script>
export default {
  data() {
    return {
      params: {},
      handleJumpMap: {
        perr() {
          console.log('跳转到perr模块');
        },
        'path-trace': () => {
          console.log('跳转到全域追踪');
        }
      }
    }
  }
}
</script>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| params | 请求下拉列表和跳转携带的参数 | object | - | {} |
| iconWidth | 显示的图标的宽 | string | - | 16 |
| iconHeight | 显示的图标的高 | string | - | 16 |
| triggerIcon | 自定义显示的图标 | string | - | - |
| trigger | 触发事件类型 | string | hover, click | hover |
| prevItems | 前置的自定义选项 | object | - | [] |
| nextItems | 后置的自定义选项 | object | - | [] |
| extraQuery | 跳转时额外携带的参数 | function: alias => object | - | null |
| handleJumpMap | 自定义跳转 | object | - | {} |
| doDeploy | 透传一键布控的[props](https://git-pd.megvii-inc.com/ai-guardians/sst-fe/all-in/all-in-web/tree/dev/src/common-components/common-one-key-monitor) | object | - | {} |
| appendAlbum | 透传加入底库的[props](https://git-pd.megvii-inc.com/ai-guardians/sst-fe/all-in/all-in-web/tree/dev/src/common-components/common-append-album) | object | - | {} |

### Events

| 名称    | 说明          |
|-------- |--------------|
| handle-compare | 一键比对 |
| size-change | 下拉面板尺寸变化，回调{width, height} |
| on-list-show | 下拉列表显示或隐藏的回调 |
