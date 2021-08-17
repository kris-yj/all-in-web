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
    canvName: { // textLayer
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
      text: '',
      pX: 240,
      pY: 280,
      fontSize: 12,
      fontWeight: 'normal',
      textFont: 'Arial',
      color: '',
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
    // 绘制文字
    this.eventBus.$on('drawText', (text, fontSize, color, fontWeight, textFont) => {
      if ((this.text === text && this.fontSize === fontSize && this.color === color && this.fontWeight === fontWeight && this.textFont === textFont) || (this.text === '' && text === '')) { // 条件是一样的，就不绘制了
        return false;
      }
      this.text = text;
      this.fontSize = fontSize;
      this.color = color;
      this.fontWeight = fontWeight;
      this.textFont = textFont;
      this.update();
      this.eventBus.$emit('saveHistory_textLayer');
      return false;
    });

    // 判断坐标是否在文字上
    this.eventBus.$on('inTextarea', (px, py, resolve) => {
      px -= (global.canvasOffset.left - 5); // 因为画框向左上角提了5px，所以这里得减掉
      py -= (global.canvasOffset.top - 5);
      if ((px > this.pX && px < (this.pX + this.textWidth)) && (py > this.pY && py < (this.pY + this.textHeight))) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    // 移动文字
    this.eventBus.$on('moveText', (dx, dy) => {
      if (this.text) {
        this.pX += dx;
        this.pY += dy;
        this.update();
      }
    });

    // 将文字绘制到paint层
    this.eventBus.$on('paintText', () => {
      const canv = this.$refs[this.canvName];
      let ctx = document.getElementById('paintLayer').getContext('2d');
      ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.textFont}`;
      ctx.fillStyle = this.color || '#000';
      ctx.fillText(this.text, this.pX, this.pY + this.fontSize);

      ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      this.pX = 240;
      this.pY = 280;
      const newText = this.text; // 保存下来后续作判断
      this.text = '';
      // 清除文字的历史记录，因为这个对整个编辑已经无用，并且容易造成历史记录混乱
      const totleHistory = this.historyIndex + 1;
      this.historyIndex = -1; // 先将index置为 -1放在退回历史记录的时候再操作
      this.historyArr = [];
      // 历史记录全部退回
      for (let i = 0; i < totleHistory; i += 1) {
        this.eventBus.$emit('cancelHistory');
      }
      if (newText !== '') { // 如果什么文字都没有，就不记录历史记录
        this.eventBus.$emit('saveHistory_paintLayer');
      }
    });

    // 保存历史记录
    this.eventBus.$on(`saveHistory_${this.canvName}`, () => {
      this.eventBus.$emit('resetAllHistory'); // 如果有后退的情况，需要先清除后面无用的记录

      const historyItem = {
        text: this.text,
        pX: this.pX,
        pY: this.pY,
        color: this.color,
        fontSize: this.fontSize
      };
      this.historyArr.push(historyItem);
      this.historyIndex += 1;
      this.eventBus.$emit('allHistoryChange', this.canvName);
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
  },
  methods: {
    /**
     *
     * 更新数据
    */
    update() {
      console.log(this.text);
      const canv = document.getElementById('textLayer');
      const ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      if (this.text === '') {
        return false;
      }
      ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.textFont}`;
      ctx.fillStyle = this.color || '#000';
      ctx.fillText(this.text, this.pX, this.pY + this.fontSize);

      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.translate(0.5, 0.5);
      this.textWidth = ctx.measureText(this.text).width + 10;
      this.textHeight = (this.fontSize + 10) + (this.fontSize / 5);

      ctx.strokeRect(this.pX - 5, this.pY - 5, this.textWidth, this.textHeight);
      ctx.translate(-0.5, -0.5);
      return false;
    },
    /**
     *
     * 根据历史记录重新绘制图像
    */
    drawHistory() {
      const historyItem = this.historyArr[this.historyIndex];
      this.text = historyItem.text;
      this.fontSize = historyItem.fontSize;
      this.color = historyItem.color;
      this.pX = historyItem.pX;
      this.pY = historyItem.pY;
      this.update();
      console.log(historyItem.ifPaintText);
    }
  }
};
</script>

<style scoped lang="scss">

</style>
