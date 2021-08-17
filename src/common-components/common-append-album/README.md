# CommonAppendAlbum 加入底库

## 全局通用的加入底库

### 基础用法

外部传入报警详情所需信息`alarmId`,

```html
<div>
  <append-album
    v-if="show"
    @close="show = false"
    :image-data="imageData"></append-album>
</div>

<script>
import AppendAlbum from '@/common-components/common-append-album';
export default {
  components: {
    AppendAlbum,
  },
  data(){
    return {
      show: false,

      imageData: {
        originType: 'capture', // 图片来源 capture 抓拍 album 底库 upload 上传图(多目标识别出来的也传upload)
        photoUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1593416488640&di=400efa43554dd38fa6b1a3b48c681fdf&imgtype=0&src=http%3A%2F%2Ft9.baidu.com%2Fit%2Fu%3D3051724700%2C2878654523%26fm%3D193', // 图片url 必传

        cameraName: '北京市海淀区', // 相机名称 抓拍图必传 (展示用)
        captureTime: '2012-12-20 20:20:20', // 抓拍时间，已经处理好的。 抓拍图必传
        capturePhotoId: '12312312412415123123', // 抓拍图ID 如果有就传

        type: 0, // 图片类型 （0-人脸 1-人体 5-机动车 6-非机动车 ）必传

        photoId: '1231241241241', // 图片id 当是底库图时必传
        albumId: '1231215134242',// 底库id 当是底库图时必传
        rect: {
          leftPixels: 10,
          topPixels: 10,
          widthPixels: 10,
          heightPixels: 10,
        }, // rect 信息 具体传值，参考之前的用法 这个目前基本没用了。
      }
    }
  }
}
</script>
```

### Attributes

| 参数      | 说明          | 类型      | 可选值                | 默认值  |
|---------- |------------- |---------- |------------------  |-------- |
| imageData | 图片信息 | object | — | - |
| append-to-body | 是否插入body(遮罩层同步操作) | Boolean | — | true |

---

### Events

| 事件名           | 说明           | 参数  |
| ------------- |:-------------:| -----|
| close | 关闭时触发 |  |

---
