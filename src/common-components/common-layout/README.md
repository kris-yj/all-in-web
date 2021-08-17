# CommonLayout 公共页面结构布局组件

常见的左右结构布局，按照UI规范，左侧固定320px，右侧自适应

### 基础用法

```html
<common-layout>
  <template slot="left">
    <div>
      left
    </div>
  </template>
  <template slot="right">
    <div>
      right
    </div>
  </template>
</common-layout>
```
