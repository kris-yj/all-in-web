# 跳转相关参数说明

只接收query传参

```javascript
{
  type: "camera" , // "file" "video" 这个参数必传！！
  timeArr: '["",""]' , // 数组内放时间戳,起止时间
  cameraIds: '[]', // 相机id 数组
  taskInfos: '[]', // 文件参数，无时间
  photoCardNo: '', // 身份证号码
  carNo: '', // 车牌号号码
}
```

## Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| type | 检索维度 `camera`相机,`file`文件,`video`录像,必传 | `String` | — | - |
| timeArr | 检索时间 `JSON.stringify` 转化一下数组 | `String` | — | - |
| cameraIds | 相机id集合 `JSON.stringify` 转化一下数组 | `String` | — | - |
| taskInfos | 文件及任务集合 `JSON.stringify` 转化一下数组 | `String` | — | - |
| photoCardNo | 身份证号 | `String` | — | - |
| carNo | 车牌号 | `String` | — | - |
