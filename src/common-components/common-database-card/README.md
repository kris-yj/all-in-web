# database-card 底库卡片组件

## 基础用法

```html
  <div>
    <database-card
    :draggable="true"
    :card-data="cardData"
    ></database-card>
  </div>
```

## Attributes

|        参数         |      说明      |  类型   | 可选 | 默认值 |
| :-----------------: | :------------: | :-----: | :--: | :----: |
|      cardData       |    卡片数据    | Object  |  否  |        |
|      draggable      |   是否可拖拽   | Boolean |  是  |  true  |
|   showJumpButton    |  显示携图跳转  | Boolean |  是  |  true  |
| showTemporaryButton | 显示暂存架标识 | Boolean |  是  |  true  |
| showDeleteButton | 显示删除标识 | Boolean |  是  |  false  |

## Events

|    事件    |           说明           |   参数   |
| :--------: | :----------------------: | :------: |
| card-click |         点击卡片         | 卡片数据 |
| leave-card |       鼠标移出卡片       |  event   |
| enter-card |       鼠标移入卡片       |  event   |
|   delete   | 点击删除按钮 | cardData |

## 备注

drag的数据通过e.dataTransfer.getData('draggingData')可获取到拖拽的卡片的源数据(已转化为 String 类型) `{ type: 'database', data: this.cardData }`
