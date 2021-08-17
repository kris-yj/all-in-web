## 暂存架


### 打开或关闭暂存架

```javascript
this.$store.dispatch('shelf/setShelfState',flag) // 传递参数类型为Boolean 
```

### 加入暂存架

如果需要通过点击加入暂存架，需要添加 `.stop` 修饰符。例如`@click.stop='openShelf'`

每次在成功加入暂存架后要发送一个全局的事件,需要传递的参数格式见下表

```javascript
this.$store.dispatch('shelf/manageShelf',{
  action: 'add',
  type: 'alarm',
  id: 123,
  x: e.clientX,
  y: e.clientY
})
```

|        |                    |               |                        |
| ------ | ------------------ | ------------- | ---------------------- |
| 参数   | 说明               | 类型          | 可选项                 |
| action | 加入或者移除暂存架 | String        | add/delete             |
| type   | 卡片类型           | String        | database/capture/alarm |
| id     | 卡片id             | String/Number | id                     |


## 加入事件

如果要监听是否加入事件，可以监听`this.$store.getters['shelf/eventAddData']`