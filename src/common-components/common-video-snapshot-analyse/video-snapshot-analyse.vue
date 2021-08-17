<template>
  <div
    class="snapshot-container"
    :style="containerStyles">
    <target-list
      class="crop-menu"
      :style="menuDetectStyle"
      :next-items="detectTargetItems"
      :params="detectTargetParams"
      :visible="true"
      :key="detectRenderKey"
      v-if="showDetectMenu"
      @size-change="onTargetListSizeChange">
    </target-list>
    <meg-img-container
      v-if="canSnapshotContainerUse"
      :img-src="snapshotImg">
    </meg-img-container>
    <megvii-roi
      v-if="canSnapshotContainerUse"
      :style="{width:`${width}px`,height:`${height}px`}"
      :width="width"
      :height="height"
      :options="roiOptions"
      :clip-invert="true"
      @modify-start="onModifyStart"
      v-model="paths"
      @input="onRoiInput">
    </megvii-roi>
  </div>
</template>

<script>
import MegviiRoi from 'megvii-roi';
import { CommonTargetList as TargetList } from '@/common-components/common-jump-with-img';

const clipImage = (imgUrl, rect = {
  top: 0, left: 0, width: 0, height: 0
}) => new Promise((resolve) => {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  img.onload = function () {
    const top = rect.top * img.height;
    const left = rect.left * img.width;
    const width = rect.width * img.width;
    const height = rect.height * img.height;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
    img.onload = null;
    resolve(canvas.toDataURL('image/png', 1));
  };
  img.src = imgUrl;
});

export default {
  name: 'VideoSnapshotAnalyse',
  components: {
    MegviiRoi,
    TargetList
  },
  props: {
    snapshotImg: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      rect: null,
      paths: [],
      showDetectMenu: false,
      detectRenderKey: Date.now(),
      roiOptions: {
        autoFit: true,
        maxPath: 1,
        pathCanMove: false,
        allowTypes: ['rect'],
        invertFillStyles: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.1)']
      },
      detectTargetParams: {
        genre: 3,
        source: 1,
        photo: '',
        locator: null
      },
      detectTargetItems: [
        {
          name: '退出截屏',
          handle: this.onClickExitSnapshot
        }
      ],
      targetSize: {
        width: 0,
        height: 0
      }
    };
  },
  computed: {
    containerStyles() {
      const imgWidth = this.width;
      const imgHeight = this.height;
      if (imgWidth === 0 || imgHeight === 0) return {};
      if (!this.$el) return {};
      const selfSize = { width: this.$el.offsetWidth, height: this.$el.offsetHeight };
      const { width, height } = selfSize;
      const paneRatio = width / height;
      const imgRatio = imgWidth / imgHeight;
      const styles = imgRatio > paneRatio ? { width: '100%', height: `${width / imgRatio}px` } : { width: `${height * imgRatio}px`, height: '100%' };
      return styles;
    },
    menuDetectStyle() {
      if (!this.rect) return {};
      const size = { width: this.width, height: this.height };
      const startX = this.rect.start.x * size.width;
      const startY = this.rect.start.y * size.height;
      const offsetX = this.rect.width * size.width;
      let left = startX + offsetX + 10;
      if (left + this.targetSize.width > size.width) {
        left = startX - this.targetSize.width;
      }
      if (startY + this.targetSize.height + 35 > size.height) {
        return {
          left: `${left}px`,
          bottom: '35px',
          top: 'auto',
          right: 'auto',
          width: `${this.targetSize.width}px`,
          height: `${this.targetSize.height}px`
        };
      }
      return {
        left: `${left}px`,
        top: `${startY}px`,
        width: `${this.targetSize.width}px`,
        height: `${this.targetSize.height}px`
      };
    },
    canSnapshotContainerUse() {
      return this.snapshotImg;
    }
  },
  created() {
    document.addEventListener('keydown', this.handleKeydown, false);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown, false);
  },
  methods: {
    onRoiInput(path) {
      this.paths[0].inner = false;
      [this.rect] = path;
      clipImage(this.snapshotImg, {
        left: this.rect.start.x,
        top: this.rect.start.y,
        width: this.rect.width,
        height: this.rect.height
      }).then((url) => {
        this.detectTargetParams = {
          genre: 3,
          source: 1,
          photo: url,
          locator: null
        };
        this.detectRenderKey = Date.now();
        this.showDetectMenu = true;
      });
    },
    onClickExitSnapshot() {
      this.showDetectMenu = false;
      this.rect = null;
      this.paths = [];
      this.$emit('exit-snapshot');
    },
    onTargetListSizeChange(size) {
      this.targetSize = size;
    },
    handleKeydown(event) {
      // esc 按键退出截图
      if (event.keyCode === 27) {
        this.onClickExitSnapshot();
      }
    },
    onModifyStart() {
      this.showDetectMenu = false;
    }

    // onMouseDown() {
    //   if (this.isFirstDetect) return;
    //   this.mouseTap = true;
    //   document.addEventListener('mousemove', this.onMouseMove);
    //   document.addEventListener('mouseup', this.onMouseUp);
    // },
    // onMouseMove() {
    //   if (this.isFirstDetect) return;
    //   if (this.mouseTap) this.showDetectMenu = false;
    // },
    // onMouseUp() {
    //   if (this.isFirstDetect) return;
    //   if (this.mouseTap) {
    //     this.showDetectMenu = true;
    //     this.mouseTap = false;
    //   }
    //   document.removeEventListener('mousemove', this.onMouseMove);
    //   document.removeEventListener('mouseup', this.onMouseUp);
    // }
  }
};
</script>

<style lang="scss" scoped>
.snapshot-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.crop-menu {
  position: absolute;
  z-index: 2000;
}
</style>
