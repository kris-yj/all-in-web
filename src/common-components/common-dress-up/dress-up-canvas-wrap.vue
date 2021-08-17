<template>
  <canvas
    :id="canvName"
    :ref="canvName"
    width="600"
    height="800"></canvas>
</template>

<script>

import Mypaint from './my-paint';

export default {
  props: {
    canvName: {
      type: String,
      default: ''
    },
    eventBus: {
      type: Object,
      default() {
        return null;
      }
    }
  },
  data() {
    return {
      // 缓存的当前的一些编辑信息
      state: {
        img: null,
        pX: 0,
        pY: 0
      },
      // 复制的 图片
      copy: null,
      // 编辑前的图片
      oriImg: null,
      color1: '',
      color2: '',
      type: '',
      sWidth: 10,
      distance: 30,
      dx: null,
      dy: null,
      width: 10,
      height: 10,
      imgname: '',
      historyArr: [],
      historyIndex: -1,
      lastHistory: null
    };
  },
  computed: {
  },
  watch: {
  },
  beforeMount() {
  },
  mounted() {
    this.state.img = document.createElement('canvas');
    this.state.img.width = this.width;
    this.state.img.height = this.height;

    // this.showImg(this.canvName, this.state.img, this.state.pX, this.state.pY); // 貌似没有用

    this.eventBus.$on(`changeImg_${this.canvName}`, (img, imgname) => {
      this.oriImg = img;
      this.imgname = imgname;

      const szinfo = {};

      const data = JSON.parse(localStorage.getItem('imgSizeInfo'));
      // 切换的素材为衣物等，此时dx,dy为相对模特的位置
      let key = `${global.modelName}&${imgname}`; // TODO: 素材逻辑需要再写 man.png
      if (imgname === global.modelName) {
        key = imgname;
      }
      if (typeof (data[key]) === 'undefined') {
        data[key] = {};
        data[key].dx = 0;
        data[key].dy = 0;
        data[key].width = img.width;
        data[key].height = img.height;
      }

      szinfo.dx = parseInt(data[key].dx, 10);
      szinfo.dy = parseInt(data[key].dy, 10);
      szinfo.width = parseInt(data[key].width, 10) || 100;
      szinfo.height = parseInt(data[key].height, 10) || 100;
      this.width = szinfo.width;
      this.height = szinfo.height;
      this.eventBus.$emit('changeSizeInfo', this.width, this.height);
      // 重置一些数据

      this.color1 = '';
      this.color2 = '';
      this.type = '';

      if (this.canvName === global.layerNames[0]) {
        global.modelX = szinfo.dx;
        global.modelY = szinfo.dy;
        this.state.pX = szinfo.dx;
        this.state.pY = szinfo.dy;
      } else {
        this.state.pX = szinfo.dx + global.modelX;
        this.state.pY = szinfo.dy + global.modelY;
      }
      this.updateImg(false);
      this.paintRect();
    });

    this.eventBus.$on(`paintRect_${this.canvName}`, () => {
      this.paintRect();
    });

    // 获取颜色大小等信息
    this.eventBus.$on(`getImageInfo_${this.canvName}`, (resolve) => {
      resolve({
        color1: this.color1,
        color2: this.color2,
        type: this.type,
        sWidth: this.sWidth,
        distance: this.distance,
        dx: this.dx,
        dy: this.dy,
        width: this.width,
        height: this.height,
      });
    });

    this.eventBus.$on(`moveImg_${this.canvName}`, (dx, dy) => {
      const canv = this.$refs[this.canvName];
      this.state.pX += dx;
      this.state.pY += dy;
      // 边界判断
      if (this.state.pX < 0) {
        this.state.pX = 0;
      } else if (this.state.pX > (canv.width - this.width - 1)) {
        this.state.pX = (canv.width - this.width) - 1;
      }
      if (this.state.pY < 0) {
        this.state.pY = 0;
      } else if (this.state.pY > (canv.height - this.height - 1)) {
        this.state.pY = (canv.height - this.height) - 1;
      }

      this.showImg(this.canvName, this.state.img, this.state.pX, this.state.pY);
      this.paintRect();
      // 移动的是模特
      if (this.canvName === global.layerNames[0]) {
        global.modelX = this.state.pX;
        global.modelY = this.state.pY;
      }
    });

    // 检测鼠标是否处于方框边沿，并返回处于哪个边沿
    this.eventBus.$on(`getSelSide_${this.canvName}`, (x, y, resolve) => {
      x -= global.canvasOffset.left;
      y -= global.canvasOffset.top;
      if (x > this.state.pX + this.width + 5 || x < this.state.pX - 5 || y < this.state.pY - 5 || y > this.state.pY + this.height + 5)resolve(-1);
      const disUp = Math.abs(y - this.state.pY);
      const disDown = Math.abs(y - (this.state.pY + this.height));
      const disLeft = Math.abs(x - this.state.pX);
      const disRight = Math.abs(x - (this.state.pX + this.width));
      let minval = Math.min(disUp, disDown, disLeft, disRight);
      if (minval > 5)resolve(-1);
      this.prepareCopy();

      /*
        几个方位的值
        7 0 4
        3   1
        6 2 5
      */
      minval = 5;
      if (disUp <= minval && disRight <= minval) {
        resolve(4);
      } else if (disRight <= minval && disDown <= minval) {
        resolve(5);
      } else if (disLeft <= minval && disDown <= minval) {
        resolve(6);
      } else if (disUp <= minval && disLeft <= minval) {
        resolve(7);
      } else if (disRight <= minval) {
        resolve(1);
      } else if (disDown <= minval) {
        resolve(2);
      } else if (disLeft <= minval) {
        resolve(3);
      } else {
        resolve(0);
      }
    });

    this.eventBus.$on(`changeSize_${this.canvName}`, (width, height) => {
      this.updateSize(parseInt(width, 10), parseInt(height, 10));
      this.paintRect();
    });

    // 通过拖动更改大小
    this.eventBus.$on(`resizeTo_${this.canvName}`, (x, y, selside) => {
      let newh;
      let neww;
      let averageVal;
      x -= global.canvasOffset.left;
      y -= global.canvasOffset.top;
      switch (selside) {
        case 0: // 上边
          if (y + 10 >= (this.state.pY + this.height)) break;
          newh = (this.state.pY + this.height) - y;
          this.state.pY = y;
          this.updateSize(this.width, newh);
          break;
        case 1: // 右边
          if (x - 10 <= this.state.pX) break;
          neww = x - this.state.pX;
          this.updateSize(neww, this.height);
          break;
        case 2: // 下边
          if (y - 10 <= this.state.pY) break;
          newh = y - this.state.pY;
          this.updateSize(this.width, newh);
          break;
        case 3: // 左边
          if (x + 10 >= this.state.pX + this.width) break;
          neww = (this.state.pX + this.width) - x;
          this.state.pX = x;
          this.updateSize(neww, this.height);
          break;
        case 4: // 右上
          if (y + 10 >= (this.state.pY + this.height) || x - 10 <= this.state.pX) break;
          newh = (this.state.pY + this.height) - y;
          neww = x - this.state.pX;
          if (global.shiftKey) {
            averageVal = ((neww - this.width) + (newh - this.height)) / 2;
            neww = averageVal + this.width;
            newh = averageVal + this.height;
            this.state.pY -= averageVal;
          } else {
            this.state.pY = y;
          }

          this.updateSize(neww, newh);
          break;
        case 5: // 右下
          console.log(x, this.state.pX, x - this.state.pX);
          if (y - 10 <= this.state.pY || x - 10 <= this.state.pX) break;
          neww = x - this.state.pX;
          newh = y - this.state.pY;

          if (global.shiftKey) {
            averageVal = ((neww - this.width) + (newh - this.height)) / 2;
            neww = averageVal + this.width;
            newh = averageVal + this.height;
          }
          this.updateSize(neww, newh);
          break;
        case 6: // 左下
          if (x + 10 >= this.state.pX + this.width || y - 10 <= this.state.pY) break;
          neww = (this.state.pX + this.width) - x;
          newh = y - this.state.pY;

          if (global.shiftKey) {
            averageVal = ((neww - this.width) + (newh - this.height)) / 2;
            neww = averageVal + this.width;
            newh = averageVal + this.height;
            this.state.pX -= averageVal;
          } else {
            this.state.pX = x;
          }
          this.updateSize(neww, newh);
          break;
        case 7: // 左上
          if (x + 10 >= this.state.pX + this.width || y + 10 >= (this.state.pY + this.height)) break;
          neww = (this.state.pX + this.width) - x;
          newh = (this.state.pY + this.height) - y;

          if (global.shiftKey) {
            averageVal = ((neww - this.width) + (newh - this.height)) / 2;
            neww = averageVal + this.width;
            newh = averageVal + this.height;
            this.state.pX -= averageVal;
            this.state.pY -= averageVal;
          } else {
            this.state.pX = x;
            this.state.pY = y;
          }
          this.updateSize(neww, newh);
          break;
        case -1:
          break;
        default:
          break;
      }
      if (selside !== -1) {
        this.paintRect();
        this.eventBus.$emit('changeSizeInfo', this.width, this.height);
      }
    });

    // 上色 各种上色
    this.eventBus.$on(`drawColor_${this.canvName}`, (type, color1, color2, sWidth, distance, dx, dy, flag) => {
      // 如果已经触发了最后一步历史记录，删除元素了，就不再上色

      console.log(type, color1, color2, sWidth, distance, dx, dy);
      if (this.historyIndex === -1) {
        console.log('文件已经删除了，不能再染色了');
        return;
      }
      dx -= global.canvasOffset.left;
      dy -= global.canvasOffset.top;
      this.type = type;
      this.color1 = color1;
      this.color2 = color2;
      this.sWidth = sWidth;
      this.distance = distance;
      if (flag === 'fromsetting') {
        this.dx = 1;
        this.dy = 1;
      } else {
        this.dx = dx - this.state.pX;
        this.dy = dy - this.state.pY;
      }
      console.log(type, color1, color2, sWidth, distance, dx, dy, flag === 'fromsetting', this.dx, this.dy);
      this.updateImg(true);
      this.paintRect();
      // 保存历史记录
      this.eventBus.$emit(`saveHistory_${this.canvName}`, 'reColor');
    });

    // 当移动或缩放过素材之后，改变localstorage中储存的值
    this.eventBus.$on(`saveData_${this.canvName}`, () => {
      if (this.canvName === global.layerNames[0]) {
        this.saveData({
          modelname: global.modelName, imgname: this.imgname, dx: this.state.pX, dy: this.state.pY, width: this.width, height: this.height
        });
      } else {
        this.saveData({
          modelname: global.modelName, imgname: this.imgname, dx: this.state.pX - global.modelX, dy: this.state.pY - global.modelY, width: this.width, height: this.height
        });
      }
    });
    // 清除颜色或纹理
    this.eventBus.$on(`clearColor_${this.canvName}`, () => {
      // 如果已经触发了最后一步历史记录，删除元素了，就不再重绘了
      if (this.historyIndex === -1) {
        console.log('最后一步，文件已经删除了');
        return;
      }
      // 利用重新选择的服饰的方法来实现 没有纹理的重绘
      this.eventBus.$emit(`changeImg_${this.canvName}`, this.oriImg, this.imgname);
      this.eventBus.$emit(`saveHistory_${this.canvName}`, 'rechooseDress');
      // 把样式重置了
      this.type = '';
    });

    // 保存历史记录 ()
    this.eventBus.$on(`saveHistory_${this.canvName}`, (argText) => {
      this.eventBus.$emit('resetAllHistory'); // 如果有后退的情况，需要先清除后面无用的记录
      const prevItem = this.historyArr[this.historyArr.length - 1];
      let historyItem = {};
      // 将上一次的信息重新复制一份（主要是上一次的上色信息）  重新切换衣物的时候，就不复制颜色信息了
      if (prevItem && (argText !== 'reColor') && (argText !== 'rechooseDress')) {
        Object.keys(prevItem).forEach((attr) => {
          historyItem[attr] = prevItem[attr];
        });
      }

      historyItem.px = this.state.pX;
      historyItem.py = this.state.pY;

      historyItem.width = this.width;
      historyItem.height = this.height;
      historyItem.modelname = global.modelName;
      historyItem.imgname = this.imgname;
      historyItem.oriImg = this.oriImg;

      if (argText === 'reColor') { // 上色的情况
        historyItem.paint = true; // 上色标记
        historyItem.type = this.type;
        historyItem.color1 = this.color1;
        historyItem.color2 = this.color2;
        historyItem.sWidth = this.sWidth;
        historyItem.distance = this.distance;
        historyItem.dx2 = this.dx;
        historyItem.dy2 = this.dy;
      }

      if (argText === 'deletHistory') { // 如果是删除元素的情况，就推一个空的历史记录
        historyItem = null;
      }
      this.historyArr.push(historyItem);
      this.historyIndex += 1;
      this.eventBus.$emit('allHistoryChange', this.canvName);
      // 如果是模特移动的话还需要让其他个图层的相对位置存一下
      for (let i = 1; i < global.layerNames.length; i += 1) {
        this.eventBus.$emit(`saveData_${global.layerNames[i]}`);
      }
      console.log(this.historyArr, this.historyIndex, this.canvName);
    });

    // 撤销  返回历史记录
    this.eventBus.$on(`cancelHistory_${this.canvName}`, () => {
      if (this.historyIndex > 0) { // 可以后退
        this.historyIndex -= 1;
        this.drawHistory();
        this.eventBus.$emit(`saveData_${this.canvName}`);

        // 清除！当第一步历史记录已经被删除的时候，就不要作任何处理了。  &&  模特的最后以不不允许后退
      } else if (this.historyIndex === 0 && !this.lastHistory && this.canvName !== global.layerNames[0]) {
        this.historyIndex -= 1;
        this.eventBus.$emit('clearCanvas', this.canvName);
        this.eventBus.$emit('changeImagesSelected', this.canvName, '');
        // this.eventBus.$emit(`saveData_${this.canvName}`);
      }
    });

    // 当有新操作的时候，重置已经被回滚的历史纪录
    this.eventBus.$on(`resetHistory_${this.canvName}`, () => {
      this.historyArr.splice(this.historyIndex + 1, this.historyArr.length - (this.historyIndex + 1));
    });

    // 删除第一条历史记录 （当总历史记录超过20的时候会执行）
    this.eventBus.$on(`deletFirstHistory_${this.canvName}`, () => {
      this.lastHistory = this.historyArr.shift();
      this.historyIndex -= 1;
    });

    // 强制添加一个虚拟历史记录
    this.eventBus.$on(`addVirtualHistory_${this.canvName}`, (item) => {
      this.historyArr.push(item);
      this.historyIndex += 1;
    });

    // 重做  返回当前撤销的操作
    this.eventBus.$on(`recoverHistory_${this.canvName}`, () => {
      if (this.historyIndex < (this.historyArr.length - 1)) { // 可以重做
        this.historyIndex += 1;
        this.drawHistory();
        this.eventBus.$emit(`saveData_${this.canvName}`);
      }
    });

    // 获取当前信息 (当前的一帧历史记录)
    this.eventBus.$on(`getNowHistory_${this.canvName}`, (fn) => {
      if (fn) {
      // 如果历史记录已经被清空，但又有数据被使用的情况（超过20步的情况）,就使用保存的 lasHistory来存模板数据
        if (this.historyIndex === -1 && this.lastHistory) {
          fn(this.lastHistory, this.canvName);
        } else {
          fn(this.historyArr.slice(this.historyIndex, this.historyIndex + 1)[0], this.canvName);
        }
      }
    });
  },
  methods: {
    /**
     *
     * 根据历史记录重新绘制图像
    */
    drawHistory(width, height) {
      const historyItem = this.historyArr[this.historyIndex];
      // 如果需要操作的这一步是删除的情况
      if (!historyItem) {
        this.eventBus.$emit('clearCanvas', this.canvName);
        this.eventBus.$emit('changeImagesSelected', this.canvName, '');
        return false;
      }

      // 借助历史记录绘制  服装 没有上色
      if (width) {
        this.width = width;
        this.height = height;
        this.updateImg(false);
      } else { // 真实历史记录操作的情况
        if (this.canvName === global.layerNames[0]) {
          global.modelX = historyItem.px;
          global.modelY = historyItem.py;
        }
        this.state.pX = historyItem.px;
        this.state.pY = historyItem.py;
        this.imgname = historyItem.imgname;
        this.width = historyItem.width;
        this.height = historyItem.height;
        this.oriImg = historyItem.oriImg;
        this.paintRect('clean'); // 清楚框
        this.updateImg(false);

        this.eventBus.$emit('changeImagesSelected', this.canvName, this.imgname);
      }

      if (historyItem.paint) { // 上色标记  有上色的情况
        this.type = historyItem.type;
        this.color1 = historyItem.color1;
        this.color2 = historyItem.color2;
        this.sWidth = historyItem.sWidth;
        this.distance = historyItem.distance;

        this.dx = historyItem.dx2 || 1; // TODO: 这个位置有问题，无法回退到完全一样的格子位置
        this.dy = historyItem.dy2 || 1;
        this.updateImg(true);
      }
      return false;
    },
    /**
     *
     * 保存数据到 localstorage中
    */
    saveData(myData) {
      if (!myData.imgname) return;
      const data = JSON.parse(localStorage.getItem('imgSizeInfo'));
      let key = `${myData.modelname}&${myData.imgname}`;
      if (myData.modelname === myData.imgname) {
        key = myData.modelname;
      }
      if (typeof (data[key]) === 'undefined') {
        data[key] = {};
      }
      data[key].width = myData.width;
      data[key].height = myData.height;
      data[key].dx = myData.dx;
      data[key].dy = myData.dy;
      localStorage.setItem('imgSizeInfo', JSON.stringify(data));
    },
    /**
     *
     * 更新图片 上色
    */
    updateImg(reColor) {
      const canvasBuffer = this.state.img;
      const contextBuffer = this.state.img.getContext('2d');
      canvasBuffer.width = this.width;
      canvasBuffer.height = this.height;
      contextBuffer.clearRect(0, 0, canvasBuffer.width, canvasBuffer.height);
      if (this.oriImg) { // TODO:这个判断貌似不怎么优美，有木有更好的方法？
        if (!this.oriImg.complete) { // 图片更新以后未加载完成的情况
          this.oriImg.onload = () => {
            contextBuffer.drawImage(this.oriImg, 0, 0, this.width, this.height);
            this.updateImgReColor(reColor, contextBuffer, canvasBuffer);
          };
        } else {
          contextBuffer.drawImage(this.oriImg, 0, 0, this.width, this.height);
          this.updateImgReColor(reColor, contextBuffer, canvasBuffer);
        }
      } else {
        this.updateImgReColor(reColor, contextBuffer, canvasBuffer);
      }
    },
    /**
     *
     * 更新图片 上色  ，判断是哪种上色情况
    */
    updateImgReColor(reColor, contextBuffer, canvasBuffer) {
      if (reColor && this.canvName !== global.layerNames[0]) {
        const imgData = contextBuffer.getImageData(0, 0, canvasBuffer.width, canvasBuffer.height);
        switch (this.type) {
          case 'pure':
            Mypaint.paint(imgData, this.color1, this.dx, this.dy);
            break;
          case 'horizontal':
            Mypaint.paint_horizontal(imgData, this.color1, this.color2, this.sWidth, this.dx, this.dy);
            break;
          case 'vertical':
            Mypaint.paint_vertical(imgData, this.color1, this.color2, this.sWidth, this.dx, this.dy);
            break;
          case 'plaid':
            Mypaint.paint_plaid(imgData, this.color1, this.color2, this.sWidth, this.dx, this.dy);
            break;
          case 'spot':
            Mypaint.paint_spot(imgData, this.color1, this.color2, this.sWidth, this.distance, this.dx, this.dy);
            break;
          default:
            Mypaint.paint(imgData, this.color1, this.dx, this.dy);
        }
        contextBuffer.putImageData(imgData, 0, 0);
      }
      this.showImg(this.canvName, this.state.img, this.state.pX, this.state.pY);
      this.dx = null;
      this.dy = null;
    },
    /**
     *
     * 显示图片
    */
    showImg(canvasName, img, pX, pY) {
      const canv = this.$refs[this.canvName];
      const ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      if (!img) return;
      const ratio = global.getPixelRatio(ctx);
      ctx.drawImage(img, pX * ratio, pY * ratio);
    },
    /**
     *
     * 画出边框
     * clear 是否清楚框
    */
    paintRect(clean) {
      const canv = document.getElementById('opLayer');
      const ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      if (clean) return; // 如果是清楚，就不往后面走了
      // ctx.setLineDash([2, 4]);
      ctx.strokeStyle = '#3a9bfa';
      ctx.fillStyle = '#3a9bfa';
      ctx.lineWidth = 1;
      ctx.translate(0.5, 0.5);
      ctx.strokeRect(this.state.pX, this.state.pY, this.width, this.height);
      ctx.translate(-0.5, -0.5);

      // 四个角的点
      const baseX = this.state.pX - 2;
      const baseY = this.state.pY - 2;
      console.log(baseX, baseY, this.width, this.height, baseX + this.width, baseY + this.height);
      ctx.fillRect(baseX, baseY, 5, 5);
      ctx.fillRect(baseX + this.width, baseY, 5, 5);
      ctx.fillRect(baseX, baseY + this.height, 5, 5);
      ctx.fillRect(baseX + this.width, baseY + this.height, 5, 5);

      // 中间的点
      ctx.fillRect(baseX + (this.width / 2), baseY, 5, 5);
      ctx.fillRect(baseX + this.width, baseY + (this.height / 2), 5, 5);
      ctx.fillRect(baseX + (this.width / 2), baseY + this.height, 5, 5);
      ctx.fillRect(baseX, baseY + (this.height / 2), 5, 5);
    },
    /**
     *
     *拷贝 一份canvas
    */
    prepareCopy() {
      const canv = document.createElement('canvas');
      canv.width = this.width;
      canv.height = this.height;
      const ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      const ratio = global.getPixelRatio(ctx);
      ctx.drawImage(this.state.img, 0, 0, this.width * ratio, this.height * ratio);
      this.copy = canv;
    },
    /**
     *
     * 更改大小
    */
    updateSize(width, height) {
      // 借助历史记录的回执方法实现 大小更改后的绘制
      this.drawHistory(width, height, this.state.pX, this.state.pY);
    }
  }
};
</script>

<style scoped lang="scss">

</style>
