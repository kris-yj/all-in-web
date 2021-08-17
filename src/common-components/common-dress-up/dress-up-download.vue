<template>
  <span></span>
</template>

<script>

export default {
  props: {
    eventBus: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
    };
  },
  computed: {
  },
  watch: {
  },
  beforeMount() {
  },
  mounted() {
    // 获取当前信息 (当前的一帧历史记录)
    this.eventBus.$on('getDownloadImageData', (fn) => {
      if (fn) { fn(this.getImageData()); }
    });
    // 下载传入的base64图片
    this.eventBus.$on('base64Img', (base64Data) => {
      this.download(base64Data);
    });
  },
  methods: {
    /**
     *
     * 下载图片
    */
    download(base64Data) {
      const canvData = base64Data || this.getImageData(); // 这里注意，我们@click调用download的时候，加上括号，这样保证默认的event不会当做参数传过来影响这个判断。
      this.filename = `image${Math.ceil(Math.random() * 1000000000)}`;
      this.downloadFile(this.filename, canvData);
    },
    /**
     *
     * 获取canvas数据
    */
    getImageData() {
      const canv = document.createElement('canvas');
      canv.width = 600;
      canv.height = 800;
      const ctx = canv.getContext('2d');

      for (let i = 0; i < global.layerNames.length; i += 1) {
        const img = document.getElementById(global.layerNames[i]);
        ctx.drawImage(img, 0, 0);
      }

      this.eventBus.$emit('paintText');
      const img = document.getElementById('paintLayer');
      ctx.drawImage(img, 0, 0);
      // 遍历发现黑色点rgb替换成 10,10,10,  并发现边界
      const imgData = ctx.getImageData(0, 0, canv.width, canv.height);
      let pos = 0;
      let lOffset = canv.width;
      let rOffset = 0;
      let tOffset = canv.height;
      let bOffset = 0;
      for (let i = 0; i < imgData.height; i += 1) {
        for (let j = 0; j < imgData.width; j += 1, pos += 4) {
          // 黑色
          if (imgData.data[pos] === 0 && imgData.data[pos + 1] === 0 && imgData.data[pos + 2] === 0 && imgData.data[pos + 3] !== 0) {
            imgData.data[pos] = 10;
            imgData.data[pos + 1] = 10;
            imgData.data[pos + 2] = 10;
          }
          // 有效像素
          if (imgData.data[pos] > 0 || imgData.data[pos + 1] > 0 || imgData.data[pos + 2] > 0 || imgData.data[pos + 3] > 0) {
            bOffset = Math.max(i, bOffset); // 找到有色彩的最底部的纵坐标
            rOffset = Math.max(j, rOffset); // 找到有色彩的最右端

            tOffset = Math.min(i, tOffset); // 找到有色彩的最上端
            lOffset = Math.min(j, lOffset); // 找到有色彩的最左端
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      // 由于循环是从0开始的,而我们认为的行列是从1开始的,并且需要往外阔一个像素，所以 +2
      // lOffset += 1;
      rOffset += 2;
      // tOffset += 1;
      bOffset += 2;
      console.log(lOffset, rOffset, tOffset, bOffset);

      const w = rOffset - lOffset;
      const h = bOffset - tOffset;

      // 重新创建一个canvas来实现背景和裁剪
      const canv2 = document.createElement('canvas');
      canv2.width = w;
      canv2.height = h;
      const ctx2 = canv2.getContext('2d');
      ctx2.fillStyle = 'black';
      ctx2.fillRect(0, 0, w, h);
      ctx2.drawImage(canv, -lOffset, -tOffset);

      return canv2.toDataURL('image/png');
    },
    /**
     *
     * 利用 a标签实现下载
    */
    downloadFile(fileName, content) {
      const aLink = document.createElement('a');
      const blob = this.base64Img2Blob(content);

      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);
      const evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

      aLink.dispatchEvent(evt);
    },
    /**
     *
     * 将 canvas提取的 base64数据，转化为 Blob格式
    */
    base64Img2Blob(code) {
      const parts = code.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;

      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; i += 1) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      return new Blob([uInt8Array], { type: contentType });
    }
  }
};
</script>

<style scoped lang="scss">
  .meg-button{
    padding: 9px 16px;
  }
</style>
