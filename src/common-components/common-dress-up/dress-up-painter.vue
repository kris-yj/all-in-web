<template>
  <canvas
    :id="canvName"
    :ref="canvName"
    width="600"
    height="800"></canvas>
</template>

<script>

export default {
  props: {
    canvName: { // paintLayer
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
    // 画笔 或 橡皮
    this.eventBus.$on('paint', (mode, x2, y2, x1, y1, penRadius, color) => {
      this.paint(mode, x2, y2, x1, y1, penRadius, color);
    });

    // 保存历史记录
    this.eventBus.$on(`saveHistory_${this.canvName}`, () => {
      this.eventBus.$emit('resetAllHistory'); // 如果有后退的情况，需要先清除后面无用的记录

      const canv = this.$refs[this.canvName];
      const historyItem = canv.getContext('2d').getImageData(0, 0, canv.width, canv.height);

      this.historyArr.push(historyItem);
      this.historyIndex += 1;
      this.eventBus.$emit('allHistoryChange', this.canvName);
      console.log(this.historyArr, this.historyIndex, this.canvName);
    });

    // 撤销  返回历史记录
    this.eventBus.$on(`cancelHistory_${this.canvName}`, () => {
      if (this.historyIndex > 0) { // 可以后退
        this.historyIndex -= 1;
        this.drawHistory();
      } else if (this.historyIndex === 0 && !this.lastHistory) { // 清除！当第一步历史记录已经被删除的时候，就不要作任何处理了。
        this.historyIndex -= 1;
        const canv = this.$refs[this.canvName];
        const ctx = canv.getContext('2d');
        ctx.clearRect(0, 0, canv.width, canv.height);
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

    // 重做  返回当前撤销的操作
    this.eventBus.$on(`recoverHistory_${this.canvName}`, () => {
      if (this.historyIndex < (this.historyArr.length - 1)) { // 可以重做
        this.historyIndex += 1;
        this.drawHistory();
      }
    });

    // 获取当前信息 (当前的一帧历史记录)
    this.eventBus.$on(`getNowHistory_${this.canvName}`, (fn) => {
      const imgsrc = this.historyArr.slice(this.historyIndex, this.historyIndex + 1)[0];
      if (imgsrc) {
        const canv = document.createElement('canvas');
        canv.width = imgsrc.width;
        canv.height = imgsrc.height;
        canv.getContext('2d').putImageData(imgsrc, 0, 0);

        if (fn) {
          fn({
            imgsrc: canv.toDataURL('image/png'),
            layer: this.canvName,
            width: imgsrc.width,
            height: imgsrc.height
          });
        }
      }
    });
  },
  methods: {
    /**
     *
     * 画笔绘画 方法  画出画笔从(x1,y1)移动到(x2,y2)的效果，即两个实心圆和一个矩形
    */
    paint(mode, x2, y2, x1, y1, penRadius, color) {
      x2 -= global.canvasOffset.left;
      y2 -= global.canvasOffset.top;
      x1 -= global.canvasOffset.left;
      y1 -= global.canvasOffset.top;
      const asin = penRadius * Math.sin(Math.atan((y2 - y1) / (x2 - x1)));
      const acos = penRadius * Math.cos(Math.atan((y2 - y1) / (x2 - x1)));
      const x3 = x1 + asin;
      const y3 = y1 - acos;
      const x4 = x1 - asin;
      const y4 = y1 + acos;
      const x5 = x2 + asin;
      const y5 = y2 - acos;
      const x6 = x2 - asin;
      const y6 = y2 + acos;
      const canv = this.$refs[this.canvName];
      const ctx = canv.getContext('2d');
      if (mode === 'pen') {
        console.log(x2, y2, penRadius);
        ctx.beginPath();
        ctx.arc(x2, y2, penRadius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x3, y3);
        ctx.lineTo(x5, y5);
        ctx.lineTo(x6, y6);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.fill();
      } else if (mode === 'eraser') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x2, y2, penRadius, 0, 2 * Math.PI);
        ctx.clip();
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x3, y3);
        ctx.lineTo(x5, y5);
        ctx.lineTo(x6, y6);
        ctx.lineTo(x4, y4);
        ctx.closePath();
        ctx.clip();
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.restore();
      }
    },
    /**
     *
     * 根据历史记录重新绘制图像
    */
    drawHistory() {
      const historyItem = this.historyArr[this.historyIndex];
      const canv = this.$refs[this.canvName];
      const ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      ctx.putImageData(historyItem, 0, 0);
    }
  }
};
</script>

<style scoped lang="scss">

</style>
