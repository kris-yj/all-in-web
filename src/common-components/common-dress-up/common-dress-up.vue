<template>
  <div class="dress-wrap">
    <!-- 选择模板 -->
    <my-template
      v-show="selcetTemplate"
      :add-templates="addTemplates"
      :event-bus="eventBus">
    </my-template>
    <!-- 编辑界面 -->
    <div
      v-show="!selcetTemplate"
      class="dress-main">
      <!-- 返回 -->
      <div
        class="exict-btn">
        <meg-button
          type="text"
          class="save-btn"
          @click="exictDraw">
          <meg-icon
            name="arrow_hollow"
            width="12"
            :dir="'right'">
          </meg-icon>
          <span class="text">{{ $t('退出') }}</span>
          <!-- i18n: 退出 -->
        </meg-button>
        <!-- i18n: 暂存退出 -->
        <meg-button
          type="text"
          @click="exictDraw('save')">
          {{ $t('暂存退出') }}
        </meg-button>
      </div>

      <!-- 历史记录 -->
      <canv-wrap-history
        :event-bus="eventBus"
        class="dress-up-history">
      </canv-wrap-history>

      <!-- 中间的主要画布 -->
      <div
        class="canvas-wrap"
        @mousedown="mouseDownFn"
        @mousemove="mouseMoveFn"
        @mouseup="mouseUpFn"
        @mouseout="mouseOutFn">
        <canv-wrap
          v-for="(item, index) in layerNames"
          :event-bus="eventBus"
          :key="index"
          :canv-name="item"></canv-wrap>
        <canv-wrap-paint
          :event-bus="eventBus"
          canv-name="paintLayer"></canv-wrap-paint>
        <canv-wrap-text
          :event-bus="eventBus"
          canv-name="textLayer"></canv-wrap-text>
        <canvas
          id="opLayer"
          className="scene"
          width="600"
          height="800"></canvas>
        <canvas
          id="pointerLayer"
          className="scene"
          width="600"
          height="800"></canvas>
      </div>
    </div>
    <!-- 侧边栏 -->
    <div
      v-show="!selcetTemplate"
      class="dress-aside">
      <!-- 对外操作按钮 导出 及 slot -->
      <div class="export">
        <!-- 导出和使用 -->
        <download-template
          :event-bus="eventBus">
        </download-template>
        <slot name="btns">
          <!-- 下载 -->
          <meg-button
            type="primary"
            @click="download()">
            {{ $t('下载') }}
          </meg-button><!-- i18n: 下载 -->
        </slot>
      </div>
      <div class="aside-left">
        <!-- 素材 -->
        <image-box
          :event-bus="eventBus"
          :mode="mode"></image-box>
      </div>
      <!-- 工具栏 操作区 -->
      <div class="aside-right">
        <div>
          <meg-radio-group
            v-model="mode"
            size="small"
            @change="changeMode">
            <!-- 选取工具 -->
            <meg-tooltip
              :content="$t('选取工具')"
              placement="top"
              effect="dark">
              <meg-radio-button
                label="hand">
                <meg-icon
                  name="arrow_hand"
                  width="20"
                  height="20"></meg-icon>
              </meg-radio-button>
            </meg-tooltip>
            <!-- 画笔工具 -->
            <meg-tooltip
              :content="$t('画笔工具')"
              placement="top"
              effect="dark">
              <meg-radio-button
                label="pen">
                <meg-icon
                  name="pen"
                  width="20"
                  height="20"></meg-icon>
              </meg-radio-button>
            </meg-tooltip>
            <!-- 橡皮擦 -->
            <meg-tooltip
              :content="$t('橡皮擦')"
              placement="top"
              effect="dark">
              <meg-radio-button
                label="eraser">
                <meg-icon
                  name="eraser"
                  width="20"
                  height="20"></meg-icon>
              </meg-radio-button>
            </meg-tooltip>
            <!-- 文字工具 -->
            <meg-tooltip
              :content="$t('文字工具')"
              placement="top"
              effect="dark">
              <meg-radio-button
                label="text">
                <meg-icon
                  name="text"
                  width="20"
                  height="20"></meg-icon>
              </meg-radio-button>
            </meg-tooltip>
          </meg-radio-group>
        </div>
        <!-- 条件设置框 -->
        <div class="info-box">
          <color-settings
            ref="colorSet"
            :event-bus="eventBus"
            :mode="mode">
          </color-settings>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// /* eslint-disable */
/*
画像工具 使用说明
<dressUp> </dressUp> 即可使用
设置props
  add-templates 在默认模板中添加的可供选择的模板

定制模板 slot
    btns 可以添加操作按钮， 位置在 下载 后面

监听状态变化
  deleteOneTemplate 删除模板事件

对外方法
  getDownloadImageData  获取base64图片
  getTemplateImageData   获取保存模板的图层数据
  saveHistoryInStorage 保存本地草稿
* */
import Vue from 'vue';
import CanvWrap from './dress-up-canvas-wrap';
import ImageBox from './dress-up-image-box';
import MyTemplate from './dress-up-template';
import DownloadTemplate from './dress-up-download';
import CanvWrapText from './dress-up-text';
import CanvWrapPaint from './dress-up-painter';
import CanvWrapHistory from './dress-up-history';
import ColorSettings from './dress-up-settings';
import { imgSizeInfo } from './image-data';

import pointerNormal from './pointer/normal.png';
import pointerResizeLr from './pointer/resize-lr.png';
import pointerResizeUr from './pointer/resize-ur.png';
import pointerResizeUd from './pointer/resize-ud.png';
import pointerResizeRd from './pointer/resize-rd.png';
import pointerColor from './pointer/color.png';
import pointerPen from './pointer/pen.png';
import pointerText from './pointer/text.png';

// 准备指针图片，避免多次重复载入
global.pointer = {
  normal: pointerNormal,
  resize_lr: pointerResizeLr,
  resize_ur: pointerResizeUr,
  resize_ud: pointerResizeUd,
  resize_rd: pointerResizeRd,
  color: pointerColor,
  pen: pointerPen,
  text: pointerText,
  img: {
    normal: new Image(),
    resize_ud: new Image(),
    resize_lr: new Image(),
    resize_ur: new Image(),
    resize_rd: new Image(),
    resize_ld: new Image(),
    resize_ul: new Image(),
    color: new Image(),
    pen: new Image(),
    text: new Image()
  }
};
function init() {
  global.pointer.img.normal.src = global.pointer.normal;
  global.pointer.img.resize_lr.src = global.pointer.resize_lr;
  global.pointer.img.resize_ud.src = global.pointer.resize_ud;

  global.pointer.img.resize_ur.src = global.pointer.resize_ur;
  global.pointer.img.resize_rd.src = global.pointer.resize_rd;
  global.pointer.img.resize_ld.src = global.pointer.resize_ur;
  global.pointer.img.resize_ul.src = global.pointer.resize_rd;

  global.pointer.img.color.src = global.pointer.color;
  global.pointer.img.pen.src = global.pointer.pen;
  global.pointer.img.text.src = global.pointer.text;
}
init();

// 确定图层顺序，越靠前越底层 预留自定义图层
global.layerNames = ['canvas_model', 'canvas_repair', 'canvas_pants', 'canvas_shirt', 'canvas_dress', 'canvas_scarf', 'canvas_coat',
  'canvas_waistcoat', 'canvas_mask', 'canvas_scarf2', 'canvas_glasses', 'canvas_hair', 'canvas_hat', 'canvas_bag', 'canvas_bag2',
  'canvas_bag3', 'canvas_box', 'canvas_shoesL', 'canvas_shoesR'];

// i18n: 这里的数据会在 beforeMount里作国际化的替换
global.layerNames_show = [];
// ['模特', '自定义', '裤子', '衬衫等', '吊带/连衣裙', '围巾/领带(内)', '外套', '马甲', '口罩/面罩', '围巾/领带(外)', '眼镜', '头发', '帽子', '包', '包2', '包3', '箱子', '左鞋', '右鞋'];

global.modelName = '';// 当前模特名字
global.modelX = 0;// 当前模特位置
global.modelY = 0;// 当前模特位置
global.shiftKey = false; // 是否按下了shift 键

// 获取屏幕dpi
global.getPixelRatio = (context) => {
  // eslint-disable-next-line
  const backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio
        || context.mozBackingStorePixelRatio
        || context.msBackingStorePixelRatio
        || context.oBackingStorePixelRatio
        || context.backingStorePixelRatio || 1;
  // 根据分辨率处理貌似有bug，先不加分辨率了 。TODO:后期再细致的考虑这个问题
  return 1; // (window.devicePixelRatio || 1) / backingStore;
};

const dressUpVersion = '0003';

// 将项目预存的 图片位置大小信息，放到localstorage中  更新数据版本也一样重置
if (!localStorage.getItem('imgSizeInfo') || localStorage.getItem('dressUpVersion') !== dressUpVersion) {
  localStorage.setItem('imgSizeInfo', JSON.stringify(imgSizeInfo));
  localStorage.setItem('dressUpVersion', dressUpVersion);
}

export default {
  components: {
    CanvWrap,
    ImageBox,
    MyTemplate,
    DownloadTemplate,
    CanvWrapText,
    CanvWrapPaint,
    CanvWrapHistory,
    ColorSettings
  },
  props: {
    addTemplates: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      // 新建 选择模板
      selcetTemplate: true,
      eventBus: new Vue(),
      // 需要的canvas画布
      layerNames: global.layerNames,
      // 存储一些当前编辑 和 鼠标 的信息
      state: {},
      // 鼠标是否在移动
      moved: false,
      // 操作 模式 默认选择移动模式
      mode: 'hand',
      // 鼠标样式 默认箭头
      pointer: 'normal',
      selside: -1,
      // 画笔的半径和颜色
      penRValue: '',
      penColor: '',
      selcetTemplateItem: '' // 被选中的那个模板
    };
  },
  computed: {
  },
  watch: {
  },
  beforeMount() {
    global.layerNames_show = ['模特', '自定义', '裤子', '衬衫等', '吊带/连衣裙', '围巾/领带(内)', '外套', '马甲', '口罩/面罩', '围巾/领带(外)', '眼镜', '头发', '帽子', '包', '包2', '包3', '箱子', '左鞋', '右鞋']; // this.$t('DRESSUP.LAYER_NAMES_SHOW');
  },
  mounted() {
    // 监听键盘按下事件，删除当前素材
    document.addEventListener('keydown', this.keyDownFn);
    // 监听键盘抬起事件，删除当前素材
    document.addEventListener('keyup', this.keyUpFn);
    // 浏览器窗口大小发生变化
    window.addEventListener('resize', this.resizeFn);
    // 浏览器窗口滚动的时候
    window.addEventListener('scroll', this.scrollFn);

    this.eventBus.$on('changeLayer', this.changeActiveLayer);// 监听改变当前层事件

    // 当选中了某个模板的时候 隐藏模板页
    this.eventBus.$on('selcetOneTemplate', (templateItem) => {
      this.selcetTemplate = false;
      this.selcetTemplateItem = templateItem;
      this.$nextTick(() => {
        this.setCanvasOffset();
      });
    });

    // 清除某个canvas
    this.eventBus.$on('clearCanvas', (layer) => {
      this.clearCanvas(layer);
    });

    // 获取当前激活的图层
    this.eventBus.$on('getActiveLayer', (cb) => {
      cb(this.state.activeLayer);
    });

    // 删除模板
    this.eventBus.$on('deleteOneTemplate', (id) => {
      console.log(id);
      this.$emit('deleteOneTemplate', id);
    });

    // 检索模板
    this.eventBus.$on('searchOneTemplate', (item) => {
      this.$emit('searchOneTemplate', item);
    });

    // 画笔的 颜色和大小发生改变
    this.eventBus.$on('penChange', (penRValue, penColor) => {
      this.penRValue = penRValue;
      this.penColor = penColor;
    });

    // 删除当前激活canvas的图片
    this.eventBus.$on('deleteImage', (layerName) => {
      if (this.state.activeLayer === layerName) {
        this.deleteImage();
      }
    });
  },
  destroyed() {
    // 取消键盘事件
    document.removeEventListener('keydown', this.keyDownFn);
    document.removeEventListener('keyup', this.keyUpFn);
    window.removeEventListener('resize', this.resizeFn);
    window.removeEventListener('scroll', this.scrollFn);
  },
  methods: {
    /**
     * 改变操作方式
    */
    changeMode() {
      if (this.mode === 'pen' || this.mode === 'eraser' || this.mode === 'text') {
        // 在这些模式下清除边框
        const canv = document.getElementById('opLayer');
        const ctx = canv.getContext('2d');
        ctx.clearRect(0, 0, canv.width, canv.height);
      } else {
        this.eventBus.$emit(`paintRect_${this.state.activeLayer}`);
      }
      this.state.press = false;
      // 将文字绘制到 pinter层
      if (this.lastmode === 'text' && this.mode !== 'text') {
        this.eventBus.$emit('paintText');
      }
      this.lastmode = this.mode;
    },
    /**
     * 设置canvas相对浏览器边缘位置
    */
    setCanvasOffset() {
      global.canvasOffset = this.getPosition(document.querySelector('#pointerLayer')); // window.$('#pointerLayer').offset(); // canvas距离文档边界的距离（用于定位时公用计算）
    },
    /**
     * 浏览器窗口调整
    */
    resizeFn() {
      if (global.resizeTimer) { clearInterval(global.resizeTimer); } // 屏蔽掉连续调整窗口的情况
      global.resizeTimer = setTimeout(() => {
        this.setCanvasOffset();
      }, 50);
    },
    /**
     * 浏览器窗口滚动
    */
    scrollFn() {
      //
    },
    /**
     * 下载  给外部使用  内部也使用
    */
    download() {
      this.eventBus.$emit('base64Img');
    },
    /**
     * 键盘按下事件
    */
    keyDownFn(e) {
      // 按的shift键
      if (e.keyCode === 16) {
        global.shiftKey = true;
      }
      // 按的ctrl键
      if (e.keyCode === 17) {
        global.ctrlKey = true;
      }
      // 按的command键
      if (e.keyCode === 91) {
        global.commandKey = true;
      }
      // ctrl+z键  的时候阻止默认事件（输入框的回退 会影响历史记录）
      if (e.keyCode === 90 && (global.ctrlKey || global.commandKey) && !global.shiftKey) {
        e.preventDefault();
        window.event.returnValue = false;
      }
    },
    /**
     * 键盘抬起事件
    */
    keyUpFn(e) {
      // shift键抬起
      if (e.keyCode === 16) {
        global.shiftKey = false;
      }
      // ctrl键抬起
      if (e.keyCode === 17) {
        global.ctrlKey = false;
      }
      // command键抬起
      if (e.keyCode === 91) {
        global.commandKey = false;
      }

      // ctrl+z键  撤销
      if (e.keyCode === 90 && global.ctrlKey && !global.shiftKey && this.exceptInput(e)) {
        this.eventBus.$emit('cancelHistory');
      }

      // ctrl+shift+z键  重做
      if (e.keyCode === 90 && global.ctrlKey && global.shiftKey && this.exceptInput(e)) {
        this.eventBus.$emit('recoverHistory');
      }

      // 删除当前选中canvas的情况
      if ((e.keyCode === 46 || e.key === 'Backspace') && this.state.activeLayer && (['hand', 'color'].indexOf(this.mode) !== -1) && this.exceptInput(e)) {
        this.deleteImage();
      }
    },
    /**
     * 排除在输入框中输入的情况（比如点击删除，或者 ctrl+z 等会误触发图层的快捷键操作）
    */
    exceptInput(e = {}) {
      if (e.target && ['INPUT', 'TEXTAREA'].indexOf(e.target.nodeName) !== -1) {
        return false;
      }
      return true;
    },
    /**
     * 删除当前选中canvas的方法
    */
    deleteImage() {
      // 如果是模特图层，就不删了
      if (this.state.activeLayer !== global.layerNames[0]) {
        this.eventBus.$emit(`saveHistory_${this.state.activeLayer}`, 'deletHistory');
        this.eventBus.$emit('deleteTabImage', this.state.activeLayer);
        this.clearCanvas(this.state.activeLayer);
      }
    },
    /**
     * 清除 canvas数据
    */
    clearCanvas(layer) {
      if (layer !== global.layerNames[0]) {
        let canv = document.getElementById(layer);
        canv.getContext('2d').clearRect(0, 0, canv.width, canv.height);

        canv = document.getElementById('opLayer');
        canv.getContext('2d').clearRect(0, 0, canv.width, canv.height);

        this.state.activeLayer = null;
        this.selside = -1;
        this.pointer = 'normal';
        // 去清除 setting 中的选中项
        this.eventBus.$emit('resetImageInfo');
      }
    },
    /**
     * 获取元素距离页面 左上角的距离
    */
    getPosition(obj) {
      let l = 0;
      let t = 0;
      while (obj) {
        l += (obj.offsetLeft - obj.scrollLeft);
        t += (obj.offsetTop - obj.scrollTop);
        obj = obj.offsetParent;
      }
      return { left: l, top: t };
    },
    /**
     * 鼠标按下事件 方法（选中某个图层）
    */
    mouseDownFn(e) {
      if (e.which !== 1) return;// 不是左键则忽略
      let newLayerName = this.inborder(e.pageX, e.pageY);
      if (newLayerName !== -1) { //  在canvas内    -1表示在canvas外部
        if (this.mode === 'hand') {
          this.moved = false;
          this.state.press = true;
          this.state.mouseX = e.pageX;
          this.state.mouseY = e.pageY;
          if ((this.selside === -1 && newLayerName === 0) || newLayerName === global.layerNames[0]) {
            const canv = document.getElementById('opLayer');
            canv.getContext('2d').clearRect(0, 0, canv.width, canv.height);
            newLayerName = null;
            this.pointer = 'normal';
            // 去清除 setting 中的选中项
            this.eventBus.$emit('resetImageInfo');
          } else if (newLayerName === 0) {
            newLayerName = this.state.activeLayer;
          }
          this.changeActiveLayer(newLayerName, '', '', true); // 设置选中图层
        } else if (this.mode === 'pen') {
          this.penPress(e.pageX, e.pageY);
        } else if (this.mode === 'eraser') {
          this.penPress(e.pageX, e.pageY);
        } else if (this.mode === 'text') {
          this.state.press = true;
          this.state.mouseX = e.pageX;
          this.state.mouseY = e.pageY;
          new Promise((resolve) => { // 看看是否在 文字上按下鼠标
            this.eventBus.$emit('inTextarea', e.pageX, e.pageY, resolve);
          }).then((resoult) => {
            this.state.inTextarea = resoult;
          });
        }
      } else {
        this.state.press = false;
      }
    },
    /**
     * 鼠标抬起事件 方法
    */
    mouseUpFn(e) {
      if (e.which !== 1) return;// 不是左键则忽略

      // 拖动
      if (this.mode === 'hand' && this.moved) {
        this.eventBus.$emit(`saveData_${this.state.activeLayer}`);
        // 鼠标抬起的时候，保存历史记录。
        this.eventBus.$emit(`saveHistory_${this.state.activeLayer}`);
      } else if (this.mode === 'pen' || this.mode === 'eraser') { // 画笔或橡皮的情况
        this.eventBus.$emit('saveHistory_paintLayer');
      } else if (this.mode === 'text' && this.state.inTextarea) { // 文字的情况
        this.eventBus.$emit('saveHistory_textLayer');
      }

      this.state.press = false;
    },
    /**
     * 鼠标移出事件 方法
    */
    mouseOutFn(e) {
      this.drawPointer(e.pageX, e.pageY);
    },
    /**
     * 鼠标按移动事件 方法（拖动某个图层）
    */
    mouseMoveFn(e) {
      this.setCanvasOffset(); // 重置canvas距离视窗顶部的位置
      this.moved = true; // 鼠标开始移动
      switch (this.mode) {
        case 'hand':
          if (this.state.press) {
            if (this.selside !== -1) { // ${this.state.activeLayer}
              this.eventBus.$emit(`resizeTo_${this.state.activeLayer}`, e.pageX, e.pageY, this.selside);// 改变大小
              // 获取当前图层的信息，推送给 尺寸设置组件
              this.emitImageInfoFn();
            } else if (this.state.activeLayer !== global.layerNames[0]) {
              this.eventBus.$emit(`moveImg_${this.state.activeLayer}`, e.pageX - this.state.mouseX, e.pageY - this.state.mouseY);// 移动图片
              this.state.mouseX = e.pageX;
              this.state.mouseY = e.pageY;
            }
          } else {
            this.changePointer(e.pageX, e.pageY);
          }
          break;
        case 'pen':
        case 'eraser':
          if (this.state.press) {
            this.eventBus.$emit('paint', this.mode, e.pageX, e.pageY, this.state.mouseX, this.state.mouseY, this.penRValue, this.penColor);
            this.state.mouseX = e.pageX;
            this.state.mouseY = e.pageY;
          } else {
            this.changePointer(e.pageX, e.pageY);
          }
          break;
        case 'text':
          if (this.state.press) {
            if (this.state.inTextarea) {
              this.eventBus.$emit('moveText', e.pageX - this.state.mouseX, e.pageY - this.state.mouseY);
            }
            this.state.mouseX = e.pageX;
            this.state.mouseY = e.pageY;
          } else {
            this.changePointer(e.pageX, e.pageY);
          }
          break;
        default:
          this.changePointer(e.pageX, e.pageY);
          break;
      }
      // 绘制鼠标
      this.drawPointer(e.pageX, e.pageY);
    },
    /**
     * 判断点中的是哪个图层
     * 若给出坐标不在画板内，返回-1
     * 否则返回坐标处最上方非透明层的名字，全部透明则返回0
    */
    inborder(nowX, nowY) {
      const canv = document.getElementById('opLayer');
      nowX -= global.canvasOffset.left; // 由于canvas不一定靠浏览器边缘，所以需要对左边作一下位置转换，间距canvas到浏览器边缘的距离
      nowY -= global.canvasOffset.top;
      if (nowX < 0 || nowX > canv.width || nowY < 0 || nowY > canv.height) return -1;
      // 看是否在框上
      console.log(this.selside);
      if (this.selside !== -1) return 0;
      for (let i = global.layerNames.length - 1; i >= 0; i -= 1) {
        const canv2 = document.getElementById(global.layerNames[i]);
        const ctx = canv2.getContext('2d');
        const color = ctx.getImageData(nowX, nowY, 1, 1).data;
        if (color[3] !== 0) {
          return global.layerNames[i];
        }
      }
      return 0;
    },
    /**
     *更改当前层， 并绘制框 之后执行fn(args)
    */
    changeActiveLayer(newLayerName, fn, args, changeTab) {
      this.state.activeLayer = newLayerName;
      if (['hand', 'color'].indexOf(this.mode) !== -1) {
        this.eventBus.$emit(`paintRect_${newLayerName}`);// 画出新的层对象的边框
        // 切换当前选中的tab和服饰
        if (changeTab) {
          this.eventBus.$emit('changeTab', newLayerName);
        }
        // 获取当前图层的信息，推送给 尺寸设置组件
        this.emitImageInfoFn();
      }
      if (fn) { fn.apply(this, args); }
    },
    /**
     * 获取当前图层的信息，推送给 尺寸设置组件
    */
    emitImageInfoFn() {
      new Promise((resolve) => {
        this.eventBus.$emit(`getImageInfo_${this.state.activeLayer}`, resolve);
      }).then((resoult) => {
        resoult.canvName = this.state.activeLayer;
        this.eventBus.$emit('emitImageInfo', resoult);
      });
    },
    /**
     * 按下画笔绘画  或者 橡皮擦除
    */
    penPress(pX, pY) {
      this.state.press = true;
      this.state.mouseX = pX;
      this.state.mouseY = pY;
      this.eventBus.$emit('paint', this.mode, pX, pY, pX, pY, this.penRValue, this.penColor);
    },
    /**
     * 更改鼠标指针
    */
    changePointer(pX, pY) {
      const changeto = (pointer) => {
        this.pointer = pointer;
      };
      const changeselside = (selside) => {
        this.selside = selside;
      };
      if (this.mode === 'hand') {
        if (this.state.activeLayer === global.layerNames[0] || !this.state.activeLayer) {
          // 不允许更改模特的大小
          changeselside(-1);
          changeto('normal');
        } else {
          // 检查鼠标是否处于边框处，并调整指针和模式
          new Promise((resolve) => {
            this.eventBus.$emit(`getSelSide_${this.state.activeLayer}`, pX, pY, resolve);
          }).then((selside) => {
            changeselside(selside);
            switch (selside) {
              case 0:
                changeto('resize_ud');
                break;
              case 1:
                changeto('resize_lr');
                break;
              case 2:
                changeto('resize_ud');
                break;
              case 3:
                changeto('resize_lr');
                break;
              case 4:
                changeto('resize_ur');
                break;
              case 5:
                changeto('resize_rd');
                break;
              case 6:
                changeto('resize_ld');
                break;
              case 7:
                changeto('resize_ul');
                break;
              case -1: default:
                changeto('normal');
            }
          });
        }
      } else if (this.mode === 'color') {
        changeto('color');
      } else if (this.mode === 'text') {
        changeto('text');
      } else if (this.mode === 'pen' || this.mode === 'eraser') {
        changeto('pen');
      } else changeto('normal');
    },
    /**
     * 绘制指针
    */
    drawPointer(x, y) {
      x -= global.canvasOffset.left;
      y -= global.canvasOffset.top;
      const img = global.pointer.img[this.pointer];
      const canv = document.getElementById('pointerLayer');
      const ctx = canv.getContext('2d');
      ctx.clearRect(0, 0, canv.width, canv.height);
      if (this.pointer === 'pen') {
        ctx.beginPath();
        ctx.arc(x, y, this.penRValue, 0, 2 * Math.PI);
        ctx.stroke();
      }
      if (this.pointer === 'normal' || this.pointer === 'pen' || this.pointer === 'text') {
        ctx.drawImage(img, x, y);
      } else ctx.drawImage(img, x - 32, y - 32);
    },
    /**
     * 获取base64图片 给外部使用
    */
    getDownloadImageData() {
      let imgData = null;
      this.eventBus.$emit('getDownloadImageData', (item) => {
        imgData = item;
      });
      return imgData;
    },
    /**
     * 获取保存模板的图层数据 给外部使用
    */
    getTemplateImageData() {
      const images = [];
      const pushToImages = (item, canvName) => {
        if (item && item.oriImg) { // 重建需要 保存的对象 添加src，删除 img对象。
          item.layer = canvName;
          const { src } = item.oriImg;
          item.imgsrc = src.substring(src.indexOf('static/'));
          delete item.oriImg;
        }
        images.push(item);
      };
      for (let i = 0; i < global.layerNames.length; i += 1) {
        // 通过事件去 获取历史记的最后一帧
        this.eventBus.$emit(`getNowHistory_${global.layerNames[i]}`, pushToImages);
      }

      this.eventBus.$emit('getNowHistory_paintLayer', pushToImages);
      return images;
    },
    /**
     * 退出 （返回模板页）
     */
    exictDraw(ifSave) {
      //
      console.log(ifSave);
      if (ifSave === 'save') {
        this.saveHistoryInStorage();
      }
      this.$emit('exict', ifSave);
      // this.$store.dispatch('setRouterKey', +new Date());
    },
    /**
     * 保存最近草稿到本地storage 中
     */
    saveHistoryInStorage() {
      const canvData = this.getDownloadImageData();
      const images = this.getTemplateImageData();
      const params = {
        url: canvData,
        images,
        type: 'history',
      };
      if (this.selcetTemplateItem && this.selcetTemplateItem.indexId) {
        // 这个表示当前编辑的模板是来自于本地已经报错的模板，则更新模板即可
        params.indexId = this.selcetTemplateItem.indexId;
        localStorage.setItem(`dressUpHistory${this.selcetTemplateItem.indexId}`, JSON.stringify(params));
      } else { // 存新模板
        let index = 1; // 初始值为1
        let indexArr = JSON.parse(localStorage.getItem('dressUpHistoryIndexArr'));
        if (indexArr && indexArr.length >= 20) {
          this.$message.warning(this.$t('最近模板数量已达上限，当前更改保存失败！'));// i18n: '最近模板数量已达上限，当前更改保存失败！'
        } else {
          if (indexArr && indexArr.length !== 0) { // 已经存过
            index = indexArr[indexArr.length - 1] + 1;
          } else { // 没有存过
            indexArr = [];
          }
          params.indexId = index;
          indexArr.push(index);
          localStorage.setItem(`dressUpHistory${index}`, JSON.stringify(params));
          localStorage.setItem('dressUpHistoryIndexArr', JSON.stringify(indexArr));
        }
      }
    }
  }
};
</script>

<style scoped lang="scss">
.dress-wrap{
  flex: 1;
  height: 100%;
  // min-height: 800px;
  display: flex;
  background: #DCE1E5;
  box-sizing: border-box;
  .dress-main{
    flex: 1;
    position: relative;
    background: #fff;
  }
  .dress-aside{
    padding: 10px;
    overflow-y: auto;
    position: relative;
    display: flex;
    padding-top: 55px;
    .aside-left{
      background: #f3f3f3;
    }
    .aside-right{
      width: 290px;
      background: #f3f3f3;
      margin-left: 10px;
      max-height: 100%;
      overflow: auto;
    }
  }
  .info-box{
    padding-top: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    // border-bottom: 1px solid #ebeef5;
    white-space: nowrap;
  }
  .image-tabs{
    margin-top: 20px;
    .meg-tabs{
      margin-top: 10px;
    }
  }
  .canvas-wrap{
    // height: 800px;
    width: 600px;
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    margin-left: -300px;
    overflow: auto;
    overflow-x: hidden;
    // background: #fff;
    // box-shadow: 0 0 30px rgba(0,0,0,0.05);
    canvas{
      position: absolute;
      left: 0;
      top: 0;
      // margin-left: -300px;
      cursor: none;
    }
  }
  .info-box{
    > div{
      transition: all 0.2s ease-in;
      overflow: hidden;
    }
    .meg-tabs__item{
      padding: 0 10px;
    }
  }
  .use-text{
    padding: 9px 15px;
    margin-left: 20px;
  }
  .dress-up-history{
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 999;
  }
  .exict-btn{
    position: absolute;
    left: 10px;
    top: 6px;
    z-index: 999;
  }
  .export{
    display: flex;
    position: absolute;
    right: 0;
    top: 10px;
    button{
      margin: 0 10px 10px 0;
      padding: 9px 27px;
    }
  }
  .save-btn{
    margin-left: 5px;
    .meg-icon{
      margin-right: 5px;
    }
    .text{
      position: relative;
      top: 1px;
    }
  }
}

</style>
<style lang="scss">
.dress-wrap{
  font-family: "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Heiti SC", sans-serif;
  .info-box{
    .meg-tabs__item{
      // padding: 0 13px;
    }
  }
  .meg-tabs__nav{
    width: auto;
  }
  // 数字框
  .meg-input-number{
    line-height: 34px !important;
  }
  .meg-input-number.is-controls-right .meg-input-number__decrease, .meg-input-number.is-controls-right .meg-input-number__increase{
    line-height: 16px !important;
  }
  .meg-input-number .meg-input{
    width: auto !important;
  }
  .aside-right .meg-radio-group{
    .meg-radio-button{
      margin-left:23px;
      margin-top:20px;
      .meg-radio-button__inner{
        border: 1px solid #dcdfe6;
        padding: 10px 10px;
        border-radius: 0;
      }
      .meg-radio-button__orig-radio:checked + .meg-radio-button__inner{
        box-shadow: none;
      }
    }
  }
}
</style>
