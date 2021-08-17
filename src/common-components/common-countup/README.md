### 数字动效

对传入的数字添加滚动效果
### 基础用法

按照vue组件的使用方法根据需求引入

```html
  <count-up></count-up>
```

```js
  import CountUp from 'CountUp'
  export default {
    components: {
      CountUp
    }
  }
```

### 参数

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| tag | 创建元素标签 | string | — | 'span' |
| duration | 动画时长 | number | — | 3 |
| autoStart | 是否开启自动开始动画 | boolean | — | true |
| startVal | 数字开始值 | Number | — | 0 |
| endVal | 数字的结束值 | Number | — | 'span' |
| separator | 千分位符号 | string | — | ',' |
| style | 元素样式 | object | — | { color: '#435068', 'font-size': '24px' } |
| options | 用户自定义配置 | Object | — | {} |

### 用户自定义配置

自定一配置可以参考countup.js的配置项：https://inorganik.github.io/countUp.js/
